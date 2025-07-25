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
    const { userId, topic, youtubeUrl, language, videoLength, projectName } =
      await req.json();

    // Validate required fields
    if (!userId || !topic) {
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

    // Check user credits - handle missing table gracefully
    let profile = null;
    let profileError = null;

    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      profile = data;
      profileError = error;
    } catch (err) {
      console.error("Error accessing profiles table:", err);
      profileError = err;
    }

    // If profiles table doesn't exist, create a default profile
    if (
      profileError &&
      (profileError.code === "PGRST116" ||
        profileError.message?.includes("does not exist"))
    ) {
      console.log("Profiles table doesn't exist, using default credits");
      profile = { credits: 15 }; // Default credits for new users
    } else if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          error: "User profile not found",
          details: profileError?.message || "Profile lookup failed",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Script generation costs 3 credits
    const creditCost = 3;

    if (profile.credits < creditCost) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct credits - this must be the first atomic operation
    console.log(
      `Attempting to deduct ${creditCost} credits from user ${userId}`,
    );
    console.log(`Current credits: ${profile.credits}`);

    // Always attempt credit deduction if we have a real profile (not using fallback defaults)
    if (profileError?.code !== "PGRST116" && profile) {
      const { error: creditError } = await supabaseClient
        .from("profiles")
        .update({ credits: profile.credits - creditCost })
        .eq("id", userId);

      if (creditError) {
        console.error("Credit deduction failed:", creditError);
        return new Response(
          JSON.stringify({
            error: "Failed to deduct credits",
            details: creditError.message,
            code: "CREDIT_DEDUCTION_FAILED",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      console.log(
        `Successfully deducted ${creditCost} credits. New balance: ${profile.credits - creditCost}`,
      );
    } else {
      console.log("Using fallback profile - credits not deducted from database");
    }

    // First, create or get project - handle missing table gracefully
    let projectId = null;
    const projectNameToUse = projectName || `${topic} Project`;

    try {
      // Try to find existing project or create new one
      const { data: existingProject } = await supabaseClient
        .from("projects")
        .select("id")
        .eq("user_id", userId)
        .eq("topic", topic)
        .single();

      if (existingProject) {
        projectId = existingProject.id;
      } else {
        const { data: newProject, error: projectError } = await supabaseClient
          .from("projects")
          .insert({
            user_id: userId,
            name: projectNameToUse,
            topic: topic,
          })
          .select()
          .single();

        if (projectError) {
          console.error("Project creation error:", projectError);
          return new Response(
            JSON.stringify({
              error: "Failed to create project",
              details: projectError.message,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        projectId = newProject?.id || null;
      }
    } catch (err) {
      console.error("Error with projects table:", err);
      // If projects table doesn't exist, continue without project ID
      if (err.code === "PGRST116" || err.message?.includes("does not exist")) {
        console.log("Projects table doesn't exist, continuing without project");
        projectId = null;
      } else {
        return new Response(
          JSON.stringify({
            error: "Project handling failed",
            details: err.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Handle source video if YouTube URL provided - handle missing tables gracefully
    let styleFingerprint = null;
    if (youtubeUrl) {
      try {
        // Create source video record
        const { data: sourceVideo, error: sourceVideoError } =
          await supabaseClient
            .from("source_videos")
            .insert({
              project_id: projectId,
              user_id: userId,
              youtube_url: youtubeUrl,
              analysis_status: "pending",
            })
            .select()
            .single();

        if (!sourceVideoError && sourceVideo) {
          try {
            // Create style fingerprint for this source video
            const { data: fingerprint } = await supabaseClient
              .from("style_fingerprints")
              .insert({
                source_video_id: sourceVideo.id,
                user_id: userId,
                fingerprint_name: `Style from ${youtubeUrl}`,
              })
              .select()
              .single();

            if (fingerprint) {
              styleFingerprint = fingerprint.id;
            }
          } catch (fingerprintErr) {
            console.log(
              "Style fingerprints table not available, continuing without fingerprint",
            );
          }
        }
      } catch (sourceVideoErr) {
        console.log(
          "Source videos table not available, continuing without source video tracking",
        );
      }
    }

    // Create script record - handle missing table gracefully
    const scriptTitle = `${topic}${language ? ` - ${language}` : ""}${videoLength ? ` ${videoLength}` : ""}`;
    let script = null;
    let scriptError = null;

    try {
      const { data, error } = await supabaseClient
        .from("generated_scripts")
        .insert({
          project_id: projectId,
          user_id: userId,
          style_fingerprint_id: styleFingerprint,
          script_title: scriptTitle,
          generation_status: "pending",
        })
        .select()
        .single();

      script = data;
      scriptError = error;
    } catch (err) {
      console.error("Error accessing generated_scripts table:", err);
      scriptError = err;
    }

    // If generated_scripts table doesn't exist, simulate a script record
    if (
      scriptError &&
      (scriptError.code === "PGRST116" ||
        scriptError.message?.includes("does not exist"))
    ) {
      console.log(
        "Generated scripts table doesn't exist, simulating script creation",
      );
      script = {
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        project_id: projectId,
        user_id: userId,
        style_fingerprint_id: styleFingerprint,
        script_title: scriptTitle,
        generation_status: "pending",
      };
    } else if (scriptError || !script) {
      // Refund credits if script creation failed and we're using real profiles
      if (profile.credits !== 15) {
        await supabaseClient
          .from("profiles")
          .update({ credits: profile.credits })
          .eq("id", userId);
      }

      return new Response(
        JSON.stringify({
          error: "Failed to create script record",
          details: scriptError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update status to analyzing_style (only if using real table)
    if (!script.id.startsWith("sim_")) {
      await supabaseClient
        .from("generated_scripts")
        .update({ generation_status: "analyzing_style" })
        .eq("id", script.id);
    }

    // Prepare payload for n8n webhook
    const n8nPayload = {
      scriptId: script.id,
      userId,
      topic,
      youtubeUrl: youtubeUrl || null,
      language,
      videoLength,
      timestamp: new Date().toISOString(),
    };

    // Call n8n webhook - use provided URL or fallback to default
    const n8nWebhookUrl = Deno.env.get("N8N_GENERATION_WEBHOOK_URL") ||
                          "https://scriptslapv1.app.n8n.cloud/webhook/scriptslap-analysis-trigger";
    console.log("N8N webhook URL:", n8nWebhookUrl);
    console.log("N8N payload being sent:", JSON.stringify(n8nPayload, null, 2));

    if (!n8nWebhookUrl || n8nWebhookUrl === "undefined") {
      console.log("N8N webhook URL not configured, using default");
      const defaultWebhookUrl = "https://scriptslapv1.app.n8n.cloud/webhook/scriptslap-analysis-trigger";
      console.log("Using default N8N webhook:", defaultWebhookUrl);
    }

    try {
      console.log("Calling n8n webhook:", n8nWebhookUrl);
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(n8nPayload),
      });

      console.log("N8N webhook response status:", n8nResponse.status);
      console.log(
        "N8N webhook response headers:",
        Object.fromEntries(n8nResponse.headers.entries()),
      );

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error("N8N webhook failed:", errorText);
        // Update script status to error (only if using real table)
        if (!script.id.startsWith("sim_")) {
          await supabaseClient
            .from("generated_scripts")
            .update({ generation_status: "error" })
            .eq("id", script.id);
        }

        return new Response(
          JSON.stringify({
            error: "Failed to trigger script generation via webhook",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      console.log("N8N webhook call successful!");
      const successResponse = await n8nResponse.text();
      console.log("N8N webhook response body:", successResponse);

      // Update status to generating_script (only if using real table)
      if (!script.id.startsWith("sim_")) {
        await supabaseClient
          .from("generated_scripts")
          .update({ generation_status: "generating_script" })
          .eq("id", script.id);
      }

      return new Response(
        JSON.stringify({
          scriptId: script.id,
          message: "Script generation started successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (webhookErr) {
      console.error("Webhook call failed:", webhookErr);
      return new Response(
        JSON.stringify({
          error: "Failed to call generation webhook",
          details: webhookErr.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error in generate-script function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
