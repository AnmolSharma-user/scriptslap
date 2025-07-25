import { Request, Response } from "express";

export interface RefineContentRequest {
  scriptId: string;
  userId: string;
  type: "hook" | "cta" | "paragraph" | "add_paragraph";
  userMessage: string;
  originalText?: string;
  precedingParagraph?: string;
  followingParagraph?: string;
  paragraphPosition?: number;
}

export interface RefineContentResponse {
  refinements: string[];
  success: boolean;
  message: string;
  developmentMode?: boolean;
}

export async function handleRefineContent(req: Request, res: Response) {
  try {
    const { scriptId, userId, type, userMessage, originalText, precedingParagraph, followingParagraph, paragraphPosition }: RefineContentRequest = req.body;

    // Validate required fields
    if (!scriptId || !userId || !type || !userMessage) {
      return res.status(400).json({
        error: "Missing required fields: scriptId, userId, type, and userMessage are required"
      });
    }

    console.log("Refine content request:", { scriptId, userId, type, userMessage, originalText });

    // Map refinement type to N8N webhook URL
    const webhookUrls = {
      "hook": "https://scriptslapv1.app.n8n.cloud/webhook/refine-hook-trigger",
      "cta": "https://scriptslapv1.app.n8n.cloud/webhook/refine-cta-trigger",
      "paragraph": "https://scriptslapv1.app.n8n.cloud/webhook/refine-paragraph-trigger",
      "add_paragraph": "https://scriptslapv1.app.n8n.cloud/webhook/add-paragraph-trigger"
    };

    const webhookUrl = webhookUrls[type];
    if (!webhookUrl) {
      return res.status(400).json({
        error: `Invalid refinement type: ${type}. Must be one of: hook, cta, paragraph, add_paragraph`
      });
    }

    // Prepare payload for N8N webhook
    const n8nPayload = {
      scriptId,
      userId,
      type,
      userMessage,
      originalText: originalText || "",
      precedingParagraph: precedingParagraph || "",
      followingParagraph: followingParagraph || "",
      paragraphPosition: paragraphPosition || 0,
      timestamp: new Date().toISOString(),
    };

    console.log(`Calling N8N ${type} webhook:`, webhookUrl);
    console.log("N8N payload:", n8nPayload);

    try {
      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(n8nPayload),
      });

      console.log("N8N webhook response status:", n8nResponse.status);

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error("N8N webhook failed:", errorText);

        return res.status(500).json({
          error: `Failed to trigger ${type} refinement via N8N webhook`,
          details: errorText
        });
      }

      const n8nResponseData = await n8nResponse.json();
      console.log("N8N webhook response:", n8nResponseData);

      // For now, return mock refinements until we implement the full N8N response handling
      // In a complete implementation, N8N would process and return the actual refinements
      const mockRefinements = generateMockRefinements(type, userMessage, originalText);

      const response: RefineContentResponse = {
        refinements: mockRefinements,
        success: true,
        message: `${type} refinement request sent to N8N successfully`,
        developmentMode: false
      };

      res.json(response);

    } catch (webhookError) {
      console.error("N8N webhook call failed:", webhookError);
      return res.status(500).json({
        error: `Failed to call N8N ${type} webhook`,
        details: webhookError instanceof Error ? webhookError.message : "Unknown webhook error"
      });
    }

  } catch (error) {
    console.error("Refine content error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

function generateMockRefinements(type: string, userMessage: string, originalText?: string): string[] {
  const baseText = originalText || "Your content here";
  
  switch (type) {
    case "hook":
      return [
        `🔥 Are you ready to discover the secret that changed everything? ${userMessage.toLowerCase().includes('engaging') ? 'This hook will grab attention instantly!' : baseText}`,
        `⚡ What if I told you there's a simple trick that 99% of people don't know about? ${baseText}`,
        `🚀 In the next 60 seconds, you'll learn something that could transform your entire approach to ${userMessage}...`
      ];
    
    case "cta":
      return [
        `Don't forget to SMASH that like button if this helped you, subscribe for more amazing content, and let me know in the comments what you want to see next!`,
        `If you found this valuable, give this video a thumbs up and subscribe for weekly tips that'll change your game!`,
        `Hit that subscribe button right now - trust me, you don't want to miss what's coming next! And drop a comment below with your biggest takeaway.`
      ];
    
    case "paragraph":
      return [
        `Here's an enhanced version: ${baseText} - but with more engaging language and clearer examples that really drive the point home.`,
        `Let me break this down for you: ${baseText} - this is crucial because it directly impacts your success in ways you might not expect.`,
        `The truth is: ${baseText} - and once you understand this fundamental principle, everything else starts to make perfect sense.`
      ];
    
    case "add_paragraph":
      return [
        `Here's what most people get wrong: they think ${userMessage} is optional, but it's actually the foundation of everything else.`,
        `Let me share a quick story that illustrates this perfectly: ${userMessage} - this changed everything for me and it can for you too.`,
        `Now, you might be wondering about ${userMessage}. Well, let me explain why this is absolutely critical to understand...`
      ];
    
    default:
      return [
        `Enhanced content based on your request: "${userMessage}" - with improved clarity and engagement.`,
        `Refined version: ${baseText} - optimized for better audience connection and understanding.`,
        `Alternative approach: Here's a fresh take on your content that addresses "${userMessage}" more effectively.`
      ];
  }
}
