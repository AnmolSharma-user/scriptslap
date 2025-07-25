export interface Profile {
  id: string;
  subscription_tier: "free" | "creator" | "pro";
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface GeneratedScript {
  id: string;
  project_id: string;
  user_id: string;
  style_fingerprint_id?: string;
  script_title?: string;
  script_body_markdown?: string;
  generation_status?:
    | "pending"
    | "analyzing_style"
    | "generating_script"
    | "complete"
    | "error";
  error_message?: string;
  version?: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name?: string;
  topic: string;
  created_at: string;
}

export interface SourceVideo {
  id: string;
  project_id: string;
  user_id: string;
  youtube_url: string;
  transcript_text?: string;
  raw_transcript_json?: any;
  analysis_status?: "pending" | "analyzing" | "complete" | "error";
  error_message?: string;
}

export interface StyleFingerprint {
  id: string;
  source_video_id?: string;
  user_id: string;
  fingerprint_name?: string;
  structure_analysis_json?: any;
  pacing_data_json?: any;
  tone_analysis_text?: string;
  rhetorical_devices_array?: string;
  created_at: string;
}

export interface ScriptRefinement {
  id: string;
  script_id: string;
  user_id: string;
  refinement_type: "hook" | "cta" | "paragraph" | "add_paragraph";
  generated_options?: any; // JSONB field
  created_at: string;
}

export interface ParsedScript {
  title: string;
  hook: string;
  main_body: string[];
  cta: string;
  b_roll_suggestions: string[];
}

export interface GenerateScriptRequest {
  topic: string;
  youtubeUrl?: string;
  language?: "English" | "Hindi" | "Hinglish" | "Spanish";
  videoLength?: "Short Form" | "Standard Video" | "Long Form";
  projectName?: string;
}

export interface GenerateScriptResponse {
  scriptId: string;
  message: string;
}

export interface RefineContentRequest {
  scriptId: string;
  userId: string;
  refinementType: "hook" | "cta" | "paragraph" | "add_paragraph";
  originalParagraph?: string;
  userMessage: string;
  userPrompt?: string; // For add_paragraph requests
  precedingParagraph?: string;
  followingParagraph?: string;
  paragraphPosition?: number;
}

export interface RefineContentResponse {
  refinementId: string;
  message: string;
}

export type GenerationStatus =
  | "pending"
  | "analyzing_style"
  | "generating_script"
  | "complete"
  | "error";

export const GENERATION_STATUS_LABELS: Record<GenerationStatus, string> = {
  pending: "Pending",
  analyzing_style: "Analyzing Style...",
  generating_script: "Generating Script...",
  complete: "Complete",
  error: "Error",
};

export const GENERATION_STATUS_COLORS: Record<GenerationStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  analyzing_style: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  generating_script: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  complete: "bg-green-500/10 text-green-500 border-green-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
};
