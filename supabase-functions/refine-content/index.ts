import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const {
      scriptId,
      userId,
      type,
      refinementType,
      userMessage,
      userPrompt,
      originalText,
      originalParagraph,
      precedingParagraph,
      followingParagraph,
      paragraphPosition,
      paragraphIndex,
      sectionIndex,
      generateMultiple,
    } = await req.json();

    // Support both old and new parameter names for backward compatibility
    const finalRefinementType = type || refinementType;
    const finalOriginalText = originalText || originalParagraph;
    const finalUserMessage = userMessage || userPrompt;

    // Validate required fields
    if (
      !scriptId ||
      !userId ||
      !finalRefinementType ||
      (!finalUserMessage && !finalOriginalText)
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user matches authenticated user
    if (userId !== user.id) {
      return new Response(JSON.stringify({ error: "User ID mismatch" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate refinement type
    const validRefinementTypes = ["hook", "cta", "paragraph", "section", "add_paragraph"];
    if (!validRefinementTypes.includes(finalRefinementType)) {
      return new Response(
        JSON.stringify({ error: "Invalid refinement type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check user credits
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All refinement operations cost 1 credit each
    const creditCosts: Record<string, number> = {
      hook: 1,
      cta: 1,
      paragraph: 1,
      section: 1,
      add_paragraph: 1,
    };

    const creditCost = creditCosts[finalRefinementType];

    if (profile.credits < creditCost) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify script exists and belongs to user
    const { data: script, error: scriptError } = await supabaseClient
      .from("generated_scripts")
      .select("id, generation_status")
      .eq("id", scriptId)
      .eq("user_id", userId)
      .single();

    if (scriptError || !script) {
      return new Response(JSON.stringify({ error: "Script not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct credits
    const { error: creditError } = await supabaseClient
      .from("profiles")
      .update({ credits: profile.credits - creditCost })
      .eq("id", userId);

    if (creditError) {
      return new Response(
        JSON.stringify({ error: "Failed to deduct credits" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // If generateMultiple is true, return mock options for now
    // In production, this would call the AI service
    if (generateMultiple) {
      const mockOptions = [
        `${finalOriginalText} - Enhanced Version 1`,
        `${finalOriginalText} - Enhanced Version 2`,
        `${finalOriginalText} - Enhanced Version 3`
      ];

      return new Response(
        JSON.stringify({
          options: mockOptions,
          message: "Multiple refinement options generated successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create refinement record for single refinement
    const { data: refinement, error: refinementError } = await supabaseClient
      .from("script_refinements")
      .insert({
        script_id: scriptId,
        user_id: userId,
        refinement_type: finalRefinementType,
        generated_options: {
          user_message: finalUserMessage,
          original_text: finalOriginalText,
          paragraph_position: paragraphPosition || paragraphIndex || null,
          section_index: sectionIndex || null,
          preceding_paragraph: precedingParagraph || null,
          following_paragraph: followingParagraph || null,
          status: "pending",
        },
      })
      .select()
      .single();

    if (refinementError || !refinement) {
      // Refund credits if refinement creation failed
      await supabaseClient
        .from("profiles")
        .update({ credits: profile.credits })
        .eq("id", userId);

      return new Response(
        JSON.stringify({ error: "Failed to create refinement record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare payload for n8n webhook
    const n8nPayload = {
      refinementId: refinement.id,
      scriptId,
      userId,
      refinementType: finalRefinementType,
      userMessage: finalUserMessage,
      originalText: finalOriginalText,
      originalParagraph: finalOriginalText, // backward compatibility
      precedingParagraph: precedingParagraph || null,
      followingParagraph: followingParagraph || null,
      paragraphPosition: paragraphPosition || paragraphIndex || null,
      sectionIndex: sectionIndex || null,
      timestamp: new Date().toISOString(),
    };

    // Determine which n8n webhook to call based on refinement type
    const webhookUrls: Record<string, string> = {
      hook: "https://scriptslapv1.app.n8n.cloud/webhook/refine-hook-trigger",
      cta: "https://scriptslapv1.app.n8n.cloud/webhook/refine-cta-trigger",
      paragraph: "https://scriptslapv1.app.n8n.cloud/webhook/refine-paragraph-trigger",
      section: "https://scriptslapv1.app.n8n.cloud/webhook/refine-paragraph-trigger", // Use paragraph endpoint for sections
      add_paragraph: "https://scriptslapv1.app.n8n.cloud/webhook/add-paragraph-trigger",
    };

    // Check environment variables first, then fall back to default URLs
    const webhookEnvVars: Record<string, string> = {
      hook: "N8N_REFINE_HOOK_URL",
      cta: "N8N_REFINE_CTA_URL",
      paragraph: "N8N_REFINE_PARAGRAPH_URL",
      section: "N8N_REFINE_PARAGRAPH_URL",
      add_paragraph: "N8N_ADD_PARAGRAPH_URL",
    };

    const webhookEnvVar = webhookEnvVars[finalRefinementType];
    const envWebhookUrl = Deno.env.get(webhookEnvVar);
    const n8nWebhookUrl = envWebhookUrl && envWebhookUrl !== "undefined"
      ? envWebhookUrl
      : webhookUrls[finalRefinementType];

    if (!n8nWebhookUrl) {
      return new Response(
        JSON.stringify({
          error: `N8N webhook URL not found for ${finalRefinementType}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`Using N8N webhook for ${finalRefinementType}:`, n8nWebhookUrl);
    console.log(`Environment variable ${webhookEnvVar}:`, envWebhookUrl || "not set");

    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      console.error(
        `N8N webhook failed for ${finalRefinementType}:`,
        await n8nResponse.text(),
      );

      return new Response(
        JSON.stringify({ error: "Failed to trigger content refinement" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        refinementId: refinement.id,
        message: "Content refinement started successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in refine-content function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
