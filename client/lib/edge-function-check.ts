// Simple connectivity test for Edge Functions
export async function checkEdgeFunctionConnectivity(): Promise<{
  generateScript: boolean;
  refineContent: boolean;
  details: Record<string, any>;
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const results = {
    generateScript: false,
    refineContent: false,
    details: {} as Record<string, any>
  };

  // Test generate-script function
  try {
    const generateScriptUrl = `${supabaseUrl}/functions/v1/generate-script`;
    console.log("Testing generate-script at:", generateScriptUrl);
    
    const response = await fetch(generateScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ test: true })
    });
    
    results.details.generateScript = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    // Any response (even error) means the function is reachable
    results.generateScript = response.status !== 0;
    
  } catch (error) {
    results.details.generateScript = {
      error: error instanceof Error ? error.message : 'Unknown error',
      reachable: false
    };
  }

  // Test refine-content function
  try {
    const refineContentUrl = `${supabaseUrl}/functions/v1/refine-content`;
    console.log("Testing refine-content at:", refineContentUrl);
    
    const response = await fetch(refineContentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ test: true })
    });
    
    results.details.refineContent = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    // Any response (even error) means the function is reachable
    results.refineContent = response.status !== 0;
    
  } catch (error) {
    results.details.refineContent = {
      error: error instanceof Error ? error.message : 'Unknown error',
      reachable: false
    };
  }

  return results;
}
