import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import EdgeFunctionStatus from "@/components/EdgeFunctionStatus";
import N8NWebhookTest from "@/components/N8NWebhookTest";
import EdgeFunctionDirectTest from "@/components/EdgeFunctionDirectTest";

export default function TestSupabase() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setTestResults([]);
    addResult("Starting Supabase connection test...");

    try {
      // Test 1: Basic client creation
      addResult("✓ Supabase client created successfully");

      // Test 2: Test auth endpoint
      addResult("Testing auth.getSession()...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`);
      } else {
        addResult("✓ Session check successful");
      }

      // Test 3: Test auth.getUser()
      addResult("Testing auth.getUser()...");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        addResult(`❌ User error: ${userError.message}`);
      } else {
        addResult("✓ User check successful");
      }

      // Test 4: Test database connection
      addResult("Testing database connection...");
      const { data: dbData, error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (dbError) {
        addResult(`❌ Database error: ${dbError.message}`);
      } else {
        addResult("✓ Database connection successful");
      }

    } catch (error: any) {
      addResult(`❌ Network error: ${error.message}`);
      addResult(`Error details: ${error.toString()}`);
      console.error("Full error:", error);
    }
  };

  const testEdgeFunctions = async () => {
    setTestResults([]);
    addResult("Starting Edge Functions test...");

    try {
      // Test Edge Function connectivity
      addResult("Testing generate-script Edge Function...");

      const testPayload = {
        userId: "test-user-id",
        topic: "Test Topic",
        language: "en"
      };

      const { data, error } = await supabase.functions.invoke(
        "generate-script",
        {
          body: testPayload,
        }
      );

      if (error) {
        addResult(`❌ Edge Function error: ${error.name || 'Unknown'}`);
        addResult(`   Message: ${error.message || 'No message'}`);
        addResult(`   Status: ${error.status || 'No status'}`);
        addResult(`   Details: ${JSON.stringify(error, null, 2)}`);
      } else {
        addResult("✓ Edge Function call successful");
        addResult(`   Response: ${JSON.stringify(data, null, 2)}`);
      }

      // Test refine-content function
      addResult("Testing refine-content Edge Function...");

      const refinePayload = {
        scriptId: "test-script-id",
        userId: "test-user-id",
        type: "hook",
        userMessage: "Make it more engaging"
      };

      const { data: refineData, error: refineError } = await supabase.functions.invoke(
        "refine-content",
        {
          body: refinePayload,
        }
      );

      if (refineError) {
        addResult(`❌ Refine function error: ${refineError.name || 'Unknown'}`);
        addResult(`   Message: ${refineError.message || 'No message'}`);
        addResult(`   Status: ${refineError.status || 'No status'}`);
      } else {
        addResult("✓ Refine function call successful");
      }

    } catch (error: any) {
      addResult(`❌ Edge Function test failed: ${error.message}`);
      addResult(`Error details: ${error.toString()}`);
      console.error("Edge Function test error:", error);
    }
  };

  const testEnvironment = () => {
    setTestResults([]);
    addResult("Testing environment variables...");
    
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addResult(`URL: ${url ? '✓ Set' : '❌ Missing'} (${url?.slice(0, 30)}...)`);
    addResult(`Key: ${key ? '✓ Set' : '❌ Missing'} (${key?.slice(0, 30)}...)`);
    
    if (url) {
      try {
        const urlObj = new URL(url);
        addResult(`✓ URL is valid: ${urlObj.origin}`);
      } catch (e) {
        addResult(`❌ URL is invalid: ${e}`);
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <EdgeFunctionStatus />
        <EdgeFunctionDirectTest />
        <N8NWebhookTest />
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button onClick={testEnvironment}>Test Environment</Button>
              <Button onClick={testConnection}>Test Connection</Button>
              <Button onClick={testEdgeFunctions}>Test Edge Functions</Button>
              <Button variant="outline" onClick={clearResults}>Clear</Button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[300px] max-h-[500px] overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-400">Click a test button to start...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">{result}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
