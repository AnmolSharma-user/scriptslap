import { Request, Response } from "express";

export interface GenerateScriptRequest {
  userId: string;
  topic: string;
  youtubeUrl?: string;
  language: string;
  videoLength: string;
  projectName?: string;
}

export interface GenerateScriptResponse {
  scriptId: string;
  message: string;
  developmentMode?: boolean;
}

export async function handleGenerateScript(req: Request, res: Response) {
  try {
    const { userId, topic, youtubeUrl, language, videoLength, projectName }: GenerateScriptRequest = req.body;

    // Validate required fields
    if (!userId || !topic) {
      return res.status(400).json({
        error: "Missing required fields: userId and topic are required"
      });
    }

    console.log("Generate script request:", { userId, topic, youtubeUrl, language, videoLength });

    const scriptId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare payload for N8N webhook
    const n8nPayload = {
      scriptId,
      userId,
      topic,
      youtubeUrl: youtubeUrl || null,
      language: language || "English",
      videoLength: videoLength || "Standard Video",
      projectName: projectName || null,
      timestamp: new Date().toISOString(),
    };

    console.log("Calling N8N webhook with payload:", n8nPayload);

    // Call N8N webhook for script generation
    const n8nWebhookUrl = "https://scriptslapv1.app.n8n.cloud/webhook/scriptslap-analysis-trigger";

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
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
          error: "Failed to trigger script generation via N8N webhook",
          details: errorText
        });
      }

      console.log("N8N webhook call successful!");
      const successResponse = await n8nResponse.text();
      console.log("N8N webhook response body:", successResponse);

      const response: GenerateScriptResponse = {
        scriptId,
        message: "Script generation started successfully via N8N",
        developmentMode: false
      };

      res.json(response);

    } catch (webhookError) {
      console.error("N8N webhook call failed:", webhookError);
      return res.status(500).json({
        error: "Failed to call N8N generation webhook",
        details: webhookError instanceof Error ? webhookError.message : "Unknown webhook error"
      });
    }

  } catch (error) {
    console.error("Generate script error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
