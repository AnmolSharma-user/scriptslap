import { supabase } from "./supabase";

// Simple test function to isolate Edge Function issues
export async function testEdgeFunctionBasic() {
  console.log("=== BASIC EDGE FUNCTION TEST ===");
  
  try {
    // Check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Session check:", { hasSession: !!session, sessionError });
    
    if (!session) {
      return { success: false, error: "No session found" };
    }

    console.log("User ID:", session.user.id);
    console.log("Token length:", session.access_token.length);

    // Try the simplest possible Edge Function call
    console.log("Attempting Edge Function call...");
    
    const result = await supabase.functions.invoke("generate-script", {
      body: {
        userId: session.user.id,
        topic: "Test Topic",
        language: "English",
        videoLength: "Standard Video"
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      }
    });

    console.log("Edge Function raw result:", result);
    console.log("Result data:", result.data);
    console.log("Result error:", result.error);

    if (result.error) {
      console.log("Error name:", result.error.name);
      console.log("Error message:", result.error.message);
      console.log("Error status:", result.error.status);
      console.log("Error context:", result.error.context);
      
      // Try to get more details
      const errorKeys = Object.keys(result.error);
      console.log("Available error keys:", errorKeys);
      
      errorKeys.forEach(key => {
        console.log(`Error.${key}:`, result.error[key]);
      });
    }

    return { 
      success: !result.error, 
      data: result.data, 
      error: result.error?.message || result.error 
    };

  } catch (error) {
    console.error("Test function caught error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Test raw fetch to Edge Function
export async function testEdgeFunctionRawFetch() {
  console.log("=== RAW FETCH TEST ===");
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: "No session" };
    }

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`;
    console.log("Fetch URL:", url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        userId: session.user.id,
        topic: "Test Topic",
        language: "English",
        videoLength: "Standard Video"
      })
    });

    console.log("Raw fetch response status:", response.status);
    console.log("Raw fetch response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Raw fetch response body:", responseText);

    return {
      success: response.ok,
      status: response.status,
      body: responseText
    };

  } catch (error) {
    console.error("Raw fetch error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
