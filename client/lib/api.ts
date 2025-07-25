import { supabase } from "./supabase";

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

// Generate script using Supabase Edge Function
export async function generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResponse> {
  console.log("=== GENERATE SCRIPT DEBUG ===");
  console.log("Request:", request);

  // Get current session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Session status:", session ? "Active" : "None");
  console.log("User ID:", session?.user?.id);
  console.log("Access token length:", session?.access_token?.length);

  if (!session) {
    throw new Error("Please sign in to generate scripts");
  }

  console.log("Calling Edge Function with headers:", {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token.slice(0, 20)}...`,
  });

  try {
    // Use direct fetch instead of supabase.functions.invoke to avoid client issues
    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`;
    console.log("Direct fetch to Edge Function URL:", edgeFunctionUrl);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(request)
    });

    console.log("Direct fetch response status:", response.status);
    console.log("Direct fetch response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge Function HTTP error:", errorText);
      throw new Error(`Edge Function returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Edge Function success response:", data);
    return data;

  } catch (networkError) {
    console.error("Network error calling Edge Function:", networkError);
    console.error("Error details:", {
      name: networkError instanceof Error ? networkError.name : 'Unknown',
      message: networkError instanceof Error ? networkError.message : 'Unknown error',
      stack: networkError instanceof Error ? networkError.stack : 'No stack trace',
      type: typeof networkError
    });

    // Provide specific error messages based on error type
    if (networkError instanceof TypeError) {
      if (networkError.message.includes('fetch')) {
        throw new Error(`Network connectivity issue: Cannot reach Edge Function at ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script. This could be due to:\n- Internet connectivity issues\n- DNS resolution problems\n- Firewall blocking requests\n- CORS policy restrictions`);
      } else if (networkError.message.includes('NetworkError')) {
        throw new Error(`Network error: Please check your internet connection and try again.`);
      }
    }

    if (networkError instanceof Error && networkError.name === 'AbortError') {
      throw new Error(`Request timeout: The Edge Function request timed out. Please try again.`);
    }

    throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Unknown network error'}. Please check your connection and try again.`);
  }
}

// Refine content using Supabase Edge Function
export async function refineContent(request: RefineContentRequest): Promise<RefineContentResponse> {
  console.log("=== REFINE CONTENT DEBUG ===");
  console.log("Original request:", request);

  // Get current session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Session status:", session ? "Active" : "None");
  console.log("User ID:", session?.user?.id);

  if (!session) {
    throw new Error("Please sign in to refine content");
  }

  // Map frontend request to Edge Function expected format
  const edgeFunctionRequest = {
    scriptId: request.scriptId,
    userId: request.userId,
    refinementType: request.type, // Edge Function expects 'refinementType', not 'type'
    userMessage: request.userMessage,
    originalParagraph: request.originalText, // Edge Function expects 'originalParagraph'
    precedingParagraph: request.precedingParagraph,
    followingParagraph: request.followingParagraph,
    paragraphPosition: request.paragraphPosition,
  };

  console.log("Mapped Edge Function request:", edgeFunctionRequest);

  try {
    // Use direct fetch instead of supabase.functions.invoke
    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-content`;
    console.log("Direct fetch to refine Edge Function URL:", edgeFunctionUrl);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(edgeFunctionRequest)
    });

    console.log("Direct fetch response status:", response.status);
    console.log("Direct fetch response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Refine Edge Function HTTP error:", errorText);
      throw new Error(`Refine Edge Function returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Refine Edge Function success response:", data);
    return data;

  } catch (networkError) {
    console.error("Network error calling refine Edge Function:", networkError);
    console.error("Error details:", {
      name: networkError instanceof Error ? networkError.name : 'Unknown',
      message: networkError instanceof Error ? networkError.message : 'Unknown error',
      stack: networkError instanceof Error ? networkError.stack : 'No stack trace',
      type: typeof networkError
    });

    // Provide specific error messages based on error type
    if (networkError instanceof TypeError) {
      if (networkError.message.includes('fetch')) {
        throw new Error(`Network connectivity issue: Cannot reach refine Edge Function at ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-content. This could be due to:\n- Internet connectivity issues\n- DNS resolution problems\n- Firewall blocking requests\n- CORS policy restrictions`);
      } else if (networkError.message.includes('NetworkError')) {
        throw new Error(`Network error: Please check your internet connection and try again.`);
      }
    }

    if (networkError instanceof Error && networkError.name === 'AbortError') {
      throw new Error(`Request timeout: The refine Edge Function request timed out. Please try again.`);
    }

    throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Unknown network error'}. Please check your connection and try again.`);
  }
}
