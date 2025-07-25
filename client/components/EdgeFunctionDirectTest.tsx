import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, Loader2, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { checkEdgeFunctionConnectivity } from "@/lib/edge-function-check";
import { testEdgeFunctionBasic, testEdgeFunctionRawFetch } from "@/lib/edge-function-test";
import { debugNetworkConnectivity, checkNetworkRestrictions } from "@/lib/network-debug";

export default function EdgeFunctionDirectTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [topic, setTopic] = useState("How to build a successful YouTube channel");
  const [userId] = useState("test-user-123");

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testAuth = async () => {
    addResult("=== Testing Authentication ===");

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addResult(`❌ Auth error: ${error.message}`);
        return false;
      }

      if (session) {
        addResult(`✓ Authenticated as: ${session.user.email}`);
        addResult(`✓ Access token available: ${session.access_token.slice(0, 20)}...`);
        return true;
      } else {
        addResult("❌ No active session - user not signed in");
        return false;
      }
    } catch (err) {
      addResult(`❌ Auth check failed: ${err}`);
      return false;
    }
  };

  const testNetworkDebug = async () => {
    setTesting(true);
    clearResults();

    try {
      addResult("=== COMPREHENSIVE NETWORK DEBUG ===");
      addResult(`Environment: ${window.location.origin}`);
      addResult(`Timestamp: ${new Date().toISOString()}`);

      // Check network restrictions
      const restrictions = checkNetworkRestrictions();
      addResult("\n=== Network Environment ===");
      addResult(`Online: ${restrictions.onLine ? '✓' : '❌'}`);
      addResult(`HTTPS: ${restrictions.isHTTPS ? '✓' : '❌'}`);
      addResult(`Cookies: ${restrictions.cookiesEnabled ? '✓' : '❌'}`);
      addResult(`Connection: ${restrictions.connectionType}`);
      addResult(`User Agent: ${restrictions.userAgent.slice(0, 80)}...`);

      // Run comprehensive connectivity tests
      addResult("\n=== Running Connectivity Tests ===");
      const debugResults = await debugNetworkConnectivity();

      debugResults.tests.forEach((test, index) => {
        addResult(`\n${index + 1}. ${test.name}: ${test.success ? '✓ PASS' : '❌ FAIL'}`);
        if (test.error) {
          addResult(`   Error: ${test.error}`);
        }
        if (test.details.status) {
          addResult(`   Status: ${test.details.status} ${test.details.statusText || ''}`);
        }
        if (test.details.url) {
          addResult(`   URL: ${test.details.url}`);
        }
      });

      // Summary and recommendations
      const failedTests = debugResults.tests.filter(t => !t.success);
      addResult(`\n=== SUMMARY ===`);
      addResult(`Total tests: ${debugResults.tests.length}`);
      addResult(`Passed: ${debugResults.tests.length - failedTests.length}`);
      addResult(`Failed: ${failedTests.length}`);

      if (failedTests.length > 0) {
        addResult(`\n=== RECOMMENDATIONS ===`);
        if (failedTests.some(t => t.name.includes('Internet Connectivity'))) {
          addResult(`❌ Basic internet connectivity failed - check your network connection`);
        }
        if (failedTests.some(t => t.name.includes('Supabase'))) {
          addResult(`❌ Supabase is unreachable - possible firewall or DNS issue`);
        }
        if (failedTests.some(t => t.name.includes('CORS'))) {
          addResult(`❌ CORS issues detected - check browser security settings`);
        }
      } else {
        addResult(`✓ All connectivity tests passed!`);
      }

    } catch (err) {
      addResult(`❌ Network debug failed: ${err}`);
      console.error("Network debug error:", err);
    } finally {
      setTesting(false);
    }
  };

  const testSimple = async () => {
    setTesting(true);
    clearResults();

    try {
      addResult("=== Simple Edge Function Test ===");

      // Test basic Edge Function call
      const basicResult = await testEdgeFunctionBasic();
      addResult(`Basic test result: ${basicResult.success ? '✓ Success' : '❌ Failed'}`);
      if (!basicResult.success) {
        addResult(`Error: ${basicResult.error}`);
      }

      addResult("\n=== Raw Fetch Test ===");

      // Test raw fetch
      const fetchResult = await testEdgeFunctionRawFetch();
      addResult(`Raw fetch result: ${fetchResult.success ? '✓ Success' : '❌ Failed'}`);
      addResult(`Status: ${fetchResult.status || 'No status'}`);
      if (fetchResult.body) {
        addResult(`Response: ${fetchResult.body.slice(0, 200)}${fetchResult.body.length > 200 ? '...' : ''}`);
      }

    } catch (err) {
      addResult(`❌ Simple test failed: ${err}`);
      console.error("Simple test error:", err);
    } finally {
      setTesting(false);
    }
  };

  const testConnectivity = async () => {
    setTesting(true);
    clearResults();

    try {
      addResult("=== Testing Edge Function Connectivity ===");
      addResult(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);

      const results = await checkEdgeFunctionConnectivity();

      addResult(`Generate Script reachable: ${results.generateScript ? '✓' : '❌'}`);
      addResult(`Refine Content reachable: ${results.refineContent ? '✓' : '❌'}`);

      addResult("\n=== Detailed Results ===");
      addResult(JSON.stringify(results.details, null, 2));

      if (!results.generateScript && !results.refineContent) {
        addResult("\n❌ No Edge Functions are reachable. They may not be deployed.");
      } else if (!results.generateScript || !results.refineContent) {
        addResult("\n⚠️ Some Edge Functions are not reachable.");
      } else {
        addResult("\n✓ Both Edge Functions are reachable!");
      }

    } catch (err) {
      addResult(`❌ Connectivity test failed: ${err}`);
      console.error("Connectivity test error:", err);
    } finally {
      setTesting(false);
    }
  };

  const testEdgeFunctionDirect = async () => {
    setTesting(true);
    clearResults();

    try {
      // Test authentication first
      const isAuthenticated = await testAuth();

      if (!isAuthenticated) {
        addResult("❌ Cannot test Edge Function without authentication");
        addResult("💡 Please sign in first to test the Edge Function");
        return;
      }

      addResult("=== Testing Edge Function Direct Call ===");
      addResult(`Using Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);

      const payload = {
        userId,
        topic,
        language: "English",
        videoLength: "Standard Video"
      };

      addResult(`Request payload: ${JSON.stringify(payload, null, 2)}`);

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession();

      // Test the Edge Function
      addResult("Calling supabase.functions.invoke...");

      const { data, error } = await supabase.functions.invoke("generate-script", {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (error) {
        addResult(`❌ Edge Function Error:`);
        addResult(`   Name: ${error.name || 'Unknown'}`);
        addResult(`   Message: ${error.message || 'No message'}`);
        addResult(`   Status: ${error.status || 'No status'}`);
        addResult(`   Context: ${JSON.stringify(error.context || {}, null, 2)}`);
      } else {
        addResult(`✓ Success! Response received:`);
        addResult(`   Data: ${JSON.stringify(data, null, 2)}`);
      }

    } catch (err) {
      addResult(`❌ Unexpected error: ${err}`);
      console.error("Edge Function test error:", err);
    } finally {
      setTesting(false);
    }
  };

  const testRawFetch = async () => {
    setTesting(true);
    clearResults();

    try {
      addResult("=== Testing Raw Fetch to Edge Function ===");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addResult("❌ No session found - user not authenticated");
        addResult("💡 Please sign in first to test with authentication");
        return;
      }

      const authHeader = `Bearer ${session.access_token}`;

      const payload = {
        userId,
        topic,
        language: "English",
        videoLength: "Standard Video"
      };

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`;
      addResult(`URL: ${url}`);
      addResult(`Auth header: Present (${session.access_token.slice(0, 20)}...)`);
      addResult(`User ID: ${session.user.id}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      addResult(`Response status: ${response.status} ${response.statusText}`);
      addResult(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);

      const responseText = await response.text();
      addResult(`Response body: ${responseText}`);

      if (response.ok) {
        addResult("✓ Raw fetch successful!");
      } else {
        addResult("❌ Raw fetch failed");
        if (response.status === 401) {
          addResult("💡 401 Unauthorized - Check authentication setup");
        }
      }

    } catch (err) {
      addResult(`❌ Raw fetch error: ${err}`);
      console.error("Raw fetch test error:", err);
    } finally {
      setTesting(false);
    }
  };

  const copyResults = () => {
    navigator.clipboard.writeText(results.join('\n'));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Edge Function Direct Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="topic">Test Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter test topic"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={testNetworkDebug}
              disabled={testing}
              variant="destructive"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Network Debug
            </Button>
            <Button
              onClick={testSimple}
              disabled={testing}
              variant="default"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simple Test
            </Button>
            <Button
              onClick={testConnectivity}
              disabled={testing}
              variant="secondary"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Connectivity
            </Button>
            <Button
              onClick={testEdgeFunctionDirect}
              disabled={testing}
              className="flex-1"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Edge Function (Supabase Client)
            </Button>
            <Button
              onClick={testRawFetch}
              disabled={testing}
              variant="outline"
              className="flex-1"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Raw Fetch
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Test Results</h4>
            {results.length > 0 && (
              <Button variant="ghost" size="sm" onClick={copyResults}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            )}
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[300px] max-h-[500px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-gray-400">Click a test button to start...</div>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1 whitespace-pre-wrap">{result}</div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
