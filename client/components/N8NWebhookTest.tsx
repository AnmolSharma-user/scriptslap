import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface WebhookTest {
  name: string;
  url: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  response?: string;
  error?: string;
}

export default function N8NWebhookTest() {
  const [webhooks, setWebhooks] = useState<WebhookTest[]>([
    {
      name: "Generate Script",
      url: "https://scriptslapv1.app.n8n.cloud/webhook/scriptslap-analysis-trigger",
      status: 'idle'
    },
    {
      name: "Refine Hook", 
      url: "https://scriptslapv1.app.n8n.cloud/webhook/refine-hook-trigger",
      status: 'idle'
    },
    {
      name: "Refine CTA",
      url: "https://scriptslapv1.app.n8n.cloud/webhook/refine-cta-trigger", 
      status: 'idle'
    },
    {
      name: "Refine Paragraph",
      url: "https://scriptslapv1.app.n8n.cloud/webhook/refine-paragraph-trigger",
      status: 'idle'
    },
    {
      name: "Add Paragraph",
      url: "https://scriptslapv1.app.n8n.cloud/webhook/add-paragraph-trigger",
      status: 'idle'
    }
  ]);

  const testWebhook = async (index: number) => {
    const webhook = webhooks[index];
    setWebhooks(prev => prev.map((w, i) => 
      i === index ? { ...w, status: 'testing', response: undefined, error: undefined } : w
    ));

    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        // Add different payloads based on webhook type
        ...(webhook.name === "Generate Script" ? {
          scriptId: "test-script-id",
          userId: "test-user-id", 
          topic: "Test Topic",
          language: "English"
        } : {
          scriptId: "test-script-id",
          userId: "test-user-id",
          type: webhook.name.toLowerCase().replace('refine ', '').replace('add ', 'add_'),
          userMessage: "Test refinement request",
          originalText: "Test content to refine"
        })
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const responseText = await response.text();
      
      if (response.ok) {
        setWebhooks(prev => prev.map((w, i) => 
          i === index ? { 
            ...w, 
            status: 'success', 
            response: responseText.slice(0, 200) + (responseText.length > 200 ? '...' : '')
          } : w
        ));
      } else {
        setWebhooks(prev => prev.map((w, i) => 
          i === index ? { 
            ...w, 
            status: 'error', 
            error: `HTTP ${response.status}: ${responseText.slice(0, 200)}`
          } : w
        ));
      }
    } catch (error) {
      setWebhooks(prev => prev.map((w, i) => 
        i === index ? { 
          ...w, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : w
      ));
    }
  };

  const testAllWebhooks = async () => {
    for (let i = 0; i < webhooks.length; i++) {
      await testWebhook(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: WebhookTest['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: WebhookTest['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>N8N Webhook Status</CardTitle>
          <Button onClick={testAllWebhooks} disabled={webhooks.some(w => w.status === 'testing')}>
            Test All Webhooks
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {webhooks.map((webhook, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(webhook.status)}
              <div className="flex-1">
                <h4 className="font-medium">{webhook.name}</h4>
                <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                {webhook.response && (
                  <p className="text-xs text-green-600 mt-1 bg-green-50 p-2 rounded">
                    Response: {webhook.response}
                  </p>
                )}
                {webhook.error && (
                  <p className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
                    Error: {webhook.error}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(webhook.status)}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testWebhook(index)}
                disabled={webhook.status === 'testing'}
              >
                Test
              </Button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">N8N Integration Status</h4>
          <p className="text-sm text-blue-700">
            These webhooks connect ScriptSlap to your N8N workflows for AI-powered script generation and refinement.
            Successful tests indicate that the webhooks are reachable and accepting requests.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
