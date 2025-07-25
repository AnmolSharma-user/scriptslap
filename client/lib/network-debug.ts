// Comprehensive network debugging utility
export async function debugNetworkConnectivity() {
  const results = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    tests: [] as Array<{
      name: string;
      success: boolean;
      details: any;
      error?: string;
    }>
  };

  // Test 1: Basic fetch to a known working endpoint
  try {
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    results.tests.push({
      name: 'Basic Internet Connectivity',
      success: response.ok,
      details: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Basic Internet Connectivity',
      success: false,
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Direct Supabase API test
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json'
      }
    });
    
    results.tests.push({
      name: 'Supabase API Connectivity',
      success: true, // Even 401 means it's reachable
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: `${supabaseUrl}/rest/v1/`
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Supabase API Connectivity',
      success: false,
      details: { url: `${supabaseUrl}/rest/v1/` },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: Edge Function connectivity
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-script`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    results.tests.push({
      name: 'Edge Function Connectivity',
      success: true, // Even 401 means it's reachable
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: `${supabaseUrl}/functions/v1/generate-script`
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Edge Function Connectivity',
      success: false,
      details: { url: `${supabaseUrl}/functions/v1/generate-script` },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 4: CORS preflight test
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-script`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, apikey'
      }
    });
    
    results.tests.push({
      name: 'CORS Preflight Test',
      success: response.ok,
      details: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        origin: window.location.origin
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'CORS Preflight Test',
      success: false,
      details: { origin: window.location.origin },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 5: N8N webhook connectivity
  try {
    const response = await fetch('https://scriptslapv1.app.n8n.cloud/webhook/scriptslap-analysis-trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    results.tests.push({
      name: 'N8N Webhook Connectivity',
      success: true, // Any response means it's reachable
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'N8N Webhook Connectivity',
      success: false,
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return results;
}

// Check if we're in a restricted network environment
export function checkNetworkRestrictions() {
  const restrictions = {
    isLocalhost: window.location.hostname === 'localhost',
    isHTTPS: window.location.protocol === 'https:',
    isCrossOrigin: window.location.origin !== `https://${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]}`,
    userAgent: navigator.userAgent,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown'
  };

  return restrictions;
}
