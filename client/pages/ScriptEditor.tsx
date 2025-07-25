import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Zap,
  ArrowLeft,
  Wand2,
  Plus,
  Loader2,
  AlertCircle,
  Save,
  Eye,
  Lightbulb,
  Edit3,
  Trash2,
  Check,
  X,
  RotateCcw,
  Copy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { refineContent } from "@/lib/api";
import { toast } from "sonner";
import {
  GeneratedScript,
  ParsedScript,
  ScriptRefinement,
  RefineContentRequest,
  RefineContentResponse,
  GENERATION_STATUS_LABELS,
  GENERATION_STATUS_COLORS,
} from "@/types/database";

export default function ScriptEditor() {
  const { scriptId } = useParams<{ scriptId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Advanced parser for YouTube script structure
  const parseYouTubeScript = (mainBody: any) => {
    if (typeof mainBody === "string") {
      // Split by numbered sections (1., 2., etc.) and double line breaks
      const sections = mainBody.split(/(?=\n\n\d+\.)|(?=\n\d+\.)/);
      return sections.filter(section => section.trim()).map(section => {
        const trimmedSection = section.trim();

        // Extract on-screen text annotations
        const onScreenRegex = /\[On-screen text: "([^"]+)"\]/g;
        const onScreenTexts = [];
        let match;
        while ((match = onScreenRegex.exec(trimmedSection)) !== null) {
          onScreenTexts.push(match[1]);
        }

        // Remove on-screen text from main content
        const cleanContent = trimmedSection.replace(onScreenRegex, '').trim();

        // Detect if this is a numbered section
        const numberedMatch = cleanContent.match(/^(\d+)\.\s*(.+)/s);

        return {
          type: numberedMatch ? 'numbered_section' : 'paragraph',
          number: numberedMatch ? parseInt(numberedMatch[1]) : null,
          title: numberedMatch ? numberedMatch[2].split('\n')[0] : null,
          content: numberedMatch ? numberedMatch[2] : cleanContent,
          onScreenTexts,
          bulletPoints: extractBulletPoints(cleanContent)
        };
      });
    }
    return [];
  };

  // Extract bullet points from content
  const extractBulletPoints = (content: string) => {
    const bulletRegex = /^\s*[*•]\s*(.+)$/gm;
    const bullets = [];
    let match;
    while ((match = bulletRegex.exec(content)) !== null) {
      bullets.push(match[1].trim());
    }
    return bullets;
  };

  // Helper function for backward compatibility
  const extractMainBodyText = (mainBody: any): string => {
    if (typeof mainBody === "string") {
      return mainBody;
    }
    if (Array.isArray(mainBody)) {
      return mainBody
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const parts = [];
            if (item.narrator) parts.push(item.narrator);
            if (item.on_screen_text) parts.push(`[${item.on_screen_text}]`);
            return parts.join(" ");
          }
          return String(item);
        })
        .join("\n\n");
    }
    if (mainBody && typeof mainBody === "object") {
      const parts = [];
      if (mainBody.narrator) parts.push(mainBody.narrator);
      if (mainBody.on_screen_text) parts.push(`[${mainBody.on_screen_text}]`);
      return parts.join(" ");
    }
    return String(mainBody);
  };

  // State for script data
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [parsedScript, setParsedScript] = useState<ParsedScript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for user profile and credits
  const [profile, setProfile] = useState<any | null>(null);

  // State for refinement modal
  const [refinementModal, setRefinementModal] = useState<{
    open: boolean;
    type: "hook" | "cta" | "paragraph" | "add_paragraph";
    title: string;
    originalText?: string;
    paragraphIndex?: number;
    precedingParagraph?: string;
    followingParagraph?: string;
  }>({
    open: false,
    type: "hook",
    title: "",
  });

  // State for add paragraph modal
  const [addParagraphModal, setAddParagraphModal] = useState<{
    open: boolean;
    insertIndex: number;
  }>({
    open: false,
    insertIndex: 0,
  });

  const [refinementInput, setRefinementInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [refinementError, setRefinementError] = useState("");

  // State for pending refinements
  const [pendingRefinements, setPendingRefinements] = useState<
    ScriptRefinement[]
  >([]);

  // State for active refinement options to display
  const [activeRefinement, setActiveRefinement] =
    useState<ScriptRefinement | null>(null);

  // State for interactive paragraph editing
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [editingParagraph, setEditingParagraph] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // State for parsed YouTube script sections
  const [scriptSections, setScriptSections] = useState<any[]>([]);
  const [bRollSuggestions, setBRollSuggestions] = useState<string[]>([]);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingSectionData, setEditingSectionData] = useState<any>(null);

  // State for refinement options (3 choices)
  const [refinementOptions, setRefinementOptions] = useState<{
    open: boolean;
    type: "hook" | "cta" | "paragraph" | "section";
    options: string[];
    originalText: string;
    paragraphIndex?: number;
    sectionIndex?: number;
  }>({
    open: false,
    type: "hook",
    options: [],
    originalText: "",
  });

  // Fetch user profile and credits
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchProfile();
  }, [user]);

  // Function to check credits before refining
  const checkCreditsForRefine = (): boolean => {
    if (!profile || profile.credits < 1) {
      // Redirect to pricing page with insufficient credits message
      navigate("/pricing?reason=insufficient_credits&action=refine");
      return false;
    }
    return true;
  };

  // Fetch script data
  useEffect(() => {
    const fetchScript = async () => {
      if (!scriptId) {
        setError("Invalid script ID");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("generated_scripts")
          .select("*")
          .eq("id", scriptId)
          .single();

        if (error) {
          console.error("Error fetching script:", error);
          console.log(
            "Script error details:",
            error.message,
            error.code,
            error.details,
          );

          if (
            error.code === "PGRST116" ||
            error.message?.includes("does not exist")
          ) {
            setError(
              "Database tables not yet configured. Please set up the Supabase database first.",
            );
          } else {
            setError("Script not found");
          }
        } else {
          setScript(data);
          console.log("Script data loaded:", {
            status: data.generation_status,
            hasMarkdown: !!data.script_body_markdown,
            markdownLength: data.script_body_markdown?.length || 0,
            markdownPreview:
              data.script_body_markdown?.substring(0, 200) || "null/empty",
          });

          // Parse script body if complete
          if (
            data.generation_status === "complete" &&
            data.script_body_markdown
          ) {
            try {
              console.log("Parsing script JSON with single parse...");
              console.log(
                "Raw script_body_markdown:",
                data.script_body_markdown,
              );

              // Single JSON.parse() to convert the JSON string to object
              const parsedData = JSON.parse(data.script_body_markdown);
              console.log("Parsed data:", parsedData);

              // Extract the actual script content from the output property
              const scriptData = parsedData.output;
              console.log("Script data from output:", scriptData);

              if (!scriptData) {
                throw new Error("No output property found in parsed data");
              }

              setParsedScript(scriptData);

              // Parse main body using advanced YouTube structure
              if (scriptData.main_body) {
                const sections = parseYouTubeScript(scriptData.main_body);
                setScriptSections(sections);

                // Also maintain backward compatibility with simple paragraphs
                const bodyText =
                  typeof scriptData.main_body === "string"
                    ? scriptData.main_body
                    : extractMainBodyText(scriptData.main_body);
                const parsedParagraphs = bodyText
                  .split(/\n\s*\n/)
                  .filter((p) => p.trim())
                  .map((p) => p.trim());
                setParagraphs(parsedParagraphs);
              }

              // Parse B-roll suggestions
              if (scriptData.b_roll_suggestions) {
                setBRollSuggestions(Array.isArray(scriptData.b_roll_suggestions)
                  ? scriptData.b_roll_suggestions
                  : []);
              }
            } catch (err) {
              console.error("Error parsing script body:", err);
              console.log(
                "Raw script_body_markdown:",
                data.script_body_markdown,
              );
              setError(`Error parsing script content: ${err.message}`);
            }
          } else if (data.generation_status === "complete") {
            console.log(
              "Script marked complete but no script_body_markdown found",
            );
            setError("Script content not available");
          }
        }
      } catch (err) {
        setError("Error loading script");
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [scriptId]);

  // Set up real-time subscriptions for script updates
  useEffect(() => {
    if (!scriptId) return;

    const scriptSubscription = supabase
      .channel(`script_${scriptId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "generated_scripts",
          filter: `id=eq.${scriptId}`,
        },
        (payload) => {
          const updatedScript = payload.new as GeneratedScript;
          setScript(updatedScript);

          // Parse script body if complete (robust data handling)
          if (
            updatedScript.generation_status === "complete" &&
            updatedScript.script_body_markdown
          ) {
            try {
              console.log("Real-time update: parsing script JSON...");

              // Single JSON.parse() to convert the JSON string to object
              const parsedData = JSON.parse(updatedScript.script_body_markdown);
              console.log("Real-time parsed data:", parsedData);

              // Extract the actual script content from the output property
              const scriptData = parsedData.output;
              console.log("Real-time script data from output:", scriptData);

              if (!scriptData) {
                throw new Error(
                  "No output property found in real-time parsed data",
                );
              }

              setParsedScript(scriptData);

              // Update using advanced YouTube structure
              if (scriptData.main_body) {
                const sections = parseYouTubeScript(scriptData.main_body);
                setScriptSections(sections);

                // Also maintain backward compatibility
                const bodyText =
                  typeof scriptData.main_body === "string"
                    ? scriptData.main_body
                    : extractMainBodyText(scriptData.main_body);
                const parsedParagraphs = bodyText
                  .split(/\n\s*\n/)
                  .filter((p) => p.trim())
                  .map((p) => p.trim());
                setParagraphs(parsedParagraphs);
              }

              // Update B-roll suggestions
              if (scriptData.b_roll_suggestions) {
                setBRollSuggestions(Array.isArray(scriptData.b_roll_suggestions)
                  ? scriptData.b_roll_suggestions
                  : []);
              }

              console.log("Real-time update: script processed successfully");
            } catch (err) {
              console.error("Error processing real-time script update:", err);
            }
          }
        },
      )
      .subscribe();

    const refinementSubscription = supabase
      .channel(`refinements_${scriptId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "script_refinements",
          filter: `script_id=eq.${scriptId}`,
        },
        (payload) => {
          const newRefinement = payload.new as ScriptRefinement;
          console.log("New refinement received:", newRefinement);

          // Add to pending refinements
          setPendingRefinements((prev) => [...prev, newRefinement]);

          // Show the refinement options to the user
          if (
            newRefinement.generated_options &&
            newRefinement.generated_options.length > 0
          ) {
            setActiveRefinement(newRefinement);

            // Show notification that new options are available
            toast.success("New options available!", {
              description: `${newRefinement.generated_options.length} new ${newRefinement.refinement_type} options are ready for review.`,
            });
          }
        },
      )
      .subscribe();

    return () => {
      scriptSubscription.unsubscribe();
      refinementSubscription.unsubscribe();
    };
  }, [scriptId]);

  const openRefinementModal = (
    type: "hook" | "cta" | "paragraph",
    originalText?: string,
    paragraphIndex?: number,
  ) => {
    const titles = {
      hook: "Refine Hook",
      cta: "Refine Call-to-Action",
      paragraph: "Refine Paragraph",
    };

    setRefinementModal({
      open: true,
      type,
      title: titles[type],
      originalText,
      paragraphIndex,
    });
    setRefinementInput("");
    setRefinementError("");
  };

  const openAddParagraphModal = (insertIndex: number) => {
    setAddParagraphModal({
      open: true,
      insertIndex,
    });
  };

  const handleAddParagraphWithAI = (insertIndex: number) => {
    if (!paragraphs) return;

    const precedingParagraph = paragraphs[insertIndex - 1] || "";
    const followingParagraph = paragraphs[insertIndex] || "";

    setRefinementModal({
      open: true,
      type: "add_paragraph",
      title: "Add Paragraph with AI",
      paragraphIndex: insertIndex,
      precedingParagraph,
      followingParagraph,
    });
    setAddParagraphModal({ open: false, insertIndex: 0 });
    setRefinementInput("");
    setRefinementError("");
  };

  // Functions for interactive paragraph editing
  const startEditingParagraph = (index: number) => {
    setEditingParagraph(index);
    setEditingText(paragraphs[index]);
  };

  const saveEditedParagraph = () => {
    if (editingParagraph !== null) {
      const newParagraphs = [...paragraphs];
      newParagraphs[editingParagraph] = editingText;
      setParagraphs(newParagraphs);
      setEditingParagraph(null);
      setEditingText("");
    }
  };

  const cancelEditingParagraph = () => {
    setEditingParagraph(null);
    setEditingText("");
  };

  const deleteParagraph = (index: number) => {
    const newParagraphs = paragraphs.filter((_, i) => i !== index);
    setParagraphs(newParagraphs);
  };

  const addNewParagraph = (index: number) => {
    const newParagraphs = [...paragraphs];
    newParagraphs.splice(index, 0, "");
    setParagraphs(newParagraphs);
    startEditingParagraph(index);
  };

  // Function to request refinement options (3 choices)
  const requestRefinementOptions = async (
    type: "hook" | "cta" | "paragraph" | "section",
    originalText: string,
    paragraphIndex?: number,
    sectionIndex?: number,
  ) => {
    // Check credits before proceeding
    if (!checkCreditsForRefine()) {
      return;
    }

    try {
      setRefining(true);

      const requestBody = {
        scriptId,
        userId: user?.id,
        type,
        originalText,
        paragraphPosition: paragraphIndex,
        sectionIndex,
        generateMultiple: true, // Request 3 options
        userMessage: `Please provide 3 refined versions of this ${type}`,
      };

      console.log("Sending refinement request:", requestBody);

      const data = await refineContent(requestBody);

      console.log("Refinement response:", data);

      // Check if we got a proper response from the Edge Function
      if (data && data.refinementId) {
        // Edge Function returned successfully, show mock options for now
        // In a real implementation, you'd wait for the real-time update with refined content
        setRefinementOptions({
          open: true,
          type: type,
          options: [
            `${originalText} - Enhanced Option 1`,
            `${originalText} - Enhanced Option 2`,
            `${originalText} - Enhanced Option 3`,
          ],
          originalText: originalText || "",
          paragraphIndex: paragraphIndex,
          sectionIndex: sectionIndex
        });

        // Show success message
        toast.success(`${type} refinement started!`, {
          description: "AI is processing your request. Options will be generated shortly.",
        });

      } else {
        throw new Error("Invalid response from refinement service");
      }
    } catch (err) {
      console.error("Refinement error:", err);
      setRefinementError("An unexpected error occurred");
    } finally {
      setRefining(false);
    }
  };

  // Function to apply selected refinement option
  const applyRefinementOption = (selectedOption: string) => {
    const { type, paragraphIndex, sectionIndex } = refinementOptions;

    if (type === "hook" && parsedScript) {
      setParsedScript({ ...parsedScript, hook: selectedOption });
    } else if (type === "cta" && parsedScript) {
      setParsedScript({ ...parsedScript, call_to_action: selectedOption });
    } else if (type === "paragraph" && paragraphIndex !== undefined) {
      const newParagraphs = [...paragraphs];
      newParagraphs[paragraphIndex] = selectedOption;
      setParagraphs(newParagraphs);
    } else if (type === "section" && sectionIndex !== undefined) {
      const newSections = [...scriptSections];
      newSections[sectionIndex] = { ...newSections[sectionIndex], content: selectedOption };
      setScriptSections(newSections);
    }

    setRefinementOptions({
      open: false,
      type: "hook",
      options: [],
      originalText: "",
    });
  };

  const handleSelectRefinementOption = async (
    refinement: ScriptRefinement,
    selectedOption: string,
  ) => {
    try {
      // Update the refinement record with the selected option
      const { error } = await supabase
        .from("script_refinements")
        .update({ selected_option: selectedOption })
        .eq("id", refinement.id);

      if (error) {
        console.error("Error updating refinement selection:", error);
        return;
      }

      // Update the script content locally
      if (parsedScript) {
        const updatedScript = { ...parsedScript };

        switch (refinement.refinement_type) {
          case "hook":
            updatedScript.hook = selectedOption;
            break;
          case "cta":
            updatedScript.cta = selectedOption;
            break;
          case "paragraph":
            if (refinement.paragraph_position !== undefined) {
              updatedScript.main_body[refinement.paragraph_position] =
                selectedOption;
            }
            break;
          case "add_paragraph":
            if (refinement.paragraph_position !== undefined) {
              updatedScript.main_body.splice(
                refinement.paragraph_position,
                0,
                selectedOption,
              );
            }
            break;
        }

        setParsedScript(updatedScript);
      }

      // Show success toast
      toast.success("Content updated!", {
        description: `${
          refinement.refinement_type === "add_paragraph"
            ? "New paragraph added"
            : refinement.refinement_type === "hook"
              ? "Hook updated"
              : refinement.refinement_type === "cta"
                ? "Call-to-action updated"
                : "Paragraph updated"
        } successfully.`,
      });

      // Clear the active refinement
      setActiveRefinement(null);

      // Remove from pending refinements
      setPendingRefinements((prev) =>
        prev.filter((r) => r.id !== refinement.id),
      );
    } catch (err) {
      console.error("Error selecting refinement option:", err);
    }
  };

  const handleDismissRefinement = (refinement: ScriptRefinement) => {
    setActiveRefinement(null);
    setPendingRefinements((prev) => prev.filter((r) => r.id !== refinement.id));
  };

  const handleRefinement = async () => {
    if (!refinementInput.trim()) {
      setRefinementError("Please provide refinement instructions");
      return;
    }

    if (!user || !scriptId) {
      setRefinementError("Authentication or script ID missing");
      return;
    }

    // Check credits before proceeding
    if (!checkCreditsForRefine()) {
      return;
    }

    setRefining(true);
    setRefinementError("");

    try {
      // Prepare payload based on refinement type - use consistent parameter names
      const basePayload = {
        scriptId: scriptId,
        userId: user.id,
        type: refinementModal.type, // Use 'type' instead of 'refinementType'
        userMessage: refinementInput,
      };

      let payload: RefineContentRequest;

      switch (refinementModal.type) {
        case "hook":
        case "cta":
          payload = basePayload;
          break;

        case "paragraph":
          payload = {
            ...basePayload,
            originalText: refinementModal.originalText || "",
            paragraphPosition: refinementModal.paragraphIndex,
          };
          break;

        case "add_paragraph":
          payload = {
            ...basePayload,
            userMessage: refinementInput,
            precedingParagraph: refinementModal.precedingParagraph || "",
            followingParagraph: refinementModal.followingParagraph || "",
            paragraphPosition: refinementModal.paragraphIndex,
          };
          break;

        default:
          throw new Error("Invalid refinement type");
      }

      console.log(
        "Attempting to call refine-content with payload:",
        payload,
      );

      const data = await refineContent(payload);

      if (data && data.refinementId) {
        console.log("Refinement started successfully:", data);

        // Update local credits optimistically
        if (profile) {
          setProfile({ ...profile, credits: profile.credits - 1 });
        }

        // Show success toast
        toast.success(
          refinementModal.type === "add_paragraph"
            ? "New paragraph being generated..."
            : `${refinementModal.type} being refined by AI...`,
          {
            description:
              "Your request has been sent to our AI system.",
          },
        );

        // Close modal and reset state
        setRefinementModal({ open: false, type: "hook", title: "" });
        setRefinementInput("");

        // Show mock refinements for now
        if (data.refinements && data.refinements.length > 0) {
          console.log("Generated refinement options:", data.refinements);
        }
      } else {
        setRefinementError("Invalid response from refinement service");
      }
    } catch (err) {
      console.error("Refinement error:", err);
      setRefinementError("An unexpected error occurred. Please try again.");
    } finally {
      setRefining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-body">Loading script...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-heading mb-2">Error</h1>
          <p className="text-body mb-4">{error}</p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!script) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="font-bold text-heading text-sm sm:text-base">ScriptSlap</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Badge
                variant="secondary"
                className={`text-xs ${GENERATION_STATUS_COLORS[script.generation_status]}`}
              >
                {GENERATION_STATUS_LABELS[script.generation_status]}
              </Badge>
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <Eye className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {script.generation_status !== "complete" ? (
            // Loading state for script generation
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-heading mb-2">
                  {GENERATION_STATUS_LABELS[script.generation_status]}
                </h2>
                <p className="text-body">
                  Your script is being generated. This page will update
                  automatically when it's ready.
                </p>
              </CardContent>
            </Card>
          ) : parsedScript ? (
            // Script editor interface
            <div className="space-y-8">
              {/* Script Title */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading mb-2 leading-tight">
                  {parsedScript.title}
                </h1>
                <p className="text-body">
                  {script.topic} �� {script.language} • {script.video_length}
                </p>
              </div>

              {/* Hook Section */}
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="text-heading text-lg sm:text-xl">Hook</CardTitle>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Enable editing
                        setEditingSection(-1); // Use -1 for hook
                        setEditingSectionData({ content: parsedScript.hook });
                      }}
                      className="px-3 py-2 flex-1 sm:flex-none"
                    >
                      <Edit3 className="h-4 w-4 sm:mr-2" />
                      <span className="sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        requestRefinementOptions("hook", parsedScript.hook)
                      }
                      disabled={refining}
                      className="px-3 py-2 flex-1 sm:flex-none"
                    >
                      {refining ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 sm:mr-2" />
                      )}
                      <span className="sm:inline">{refining ? "Generating..." : "Refine"}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === -1 ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editingSectionData?.content || parsedScript.hook}
                        onChange={(e) => setEditingSectionData({
                          ...editingSectionData,
                          content: e.target.value
                        })}
                        className="min-h-[100px] bg-background border-border text-foreground resize-none"
                        placeholder="Enter hook content..."
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            // Save hook changes
                            setParsedScript(prev => ({ ...prev, hook: editingSectionData.content }));
                            setEditingSection(null);
                            setEditingSectionData(null);
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection(null);
                            setEditingSectionData(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-foreground leading-relaxed text-sm sm:text-base" dangerouslySetInnerHTML={{
                        __html: parsedScript.hook
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-yellow-400">$1</strong>')
                          .replace(/\[On-screen text: "([^"]+)"\]/g, '<span class="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded px-2 py-1 text-sm font-medium mx-1">📺 $1</span>')
                          .replace(/\n/g, '<br />')
                      }}>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Main Body Editor */}
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="text-heading flex items-center text-lg sm:text-xl">
                    <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                    Main Body
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Add new section
                        const newSection = {
                          type: 'numbered_section',
                          number: scriptSections.length + 1,
                          title: 'New Section Title',
                          content: '',
                          onScreenTexts: [],
                          bulletPoints: []
                        };
                        setScriptSections([...scriptSections, newSection]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {scriptSections.length > 0 ? (
                    <div className="space-y-8">
                      {scriptSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="group relative">
                          {editingSection === sectionIndex ? (
                            // Section edit mode
                            <div className="space-y-4 p-6 border-2 border-primary rounded-lg bg-primary/5">
                              <div className="flex items-center space-x-2 mb-4">
                                <Badge variant="outline" className="text-primary border-primary">
                                  {section.type === 'numbered_section' ? `Section ${section.number}` : 'Paragraph'}
                                </Badge>
                              </div>

                              {section.title && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Section Title</Label>
                                  <Input
                                    value={editingSectionData?.title || section.title}
                                    onChange={(e) => setEditingSectionData({
                                      ...editingSectionData,
                                      title: e.target.value
                                    })}
                                    className="bg-background border-border"
                                  />
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Content</Label>
                                <Textarea
                                  value={editingSectionData?.content || section.content}
                                  onChange={(e) => setEditingSectionData({
                                    ...editingSectionData,
                                    content: e.target.value
                                  })}
                                  className="min-h-[200px] bg-background border-border text-foreground resize-none"
                                  placeholder="Enter section content..."
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    // Save section changes
                                    const newSections = [...scriptSections];
                                    newSections[sectionIndex] = { ...section, ...editingSectionData };
                                    setScriptSections(newSections);
                                    setEditingSection(null);
                                    setEditingSectionData(null);
                                  }}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Save Section
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingSection(null);
                                    setEditingSectionData(null);
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Section view mode
                            <div className="relative border border-border rounded-lg hover:border-primary/50 transition-all bg-gradient-to-r from-card/50 to-card/30 overflow-hidden">
                              {/* Section header */}
                              {section.type === 'numbered_section' && (
                                <div className="bg-primary/10 border-b border-border p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-primary text-primary-foreground text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                        {section.number}
                                      </div>
                                      <h3 className="text-lg font-semibold text-heading">
                                        {section.title}
                                      </h3>
                                    </div>

                                    {/* Section action buttons */}
                                    <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingSection(sectionIndex);
                                          setEditingSectionData(section);
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          requestRefinementOptions("section", section.content, undefined, sectionIndex)
                                        }
                                        className="h-8 w-8 p-0"
                                        disabled={refining}
                                      >
                                        <Wand2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newSections = scriptSections.filter((_, i) => i !== sectionIndex);
                                          setScriptSections(newSections);
                                        }}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Section content */}
                              <div className="p-6">
                                <div className="prose prose-invert max-w-none">
                                  <div className="text-foreground leading-relaxed text-sm sm:text-base"
                                       dangerouslySetInnerHTML={{
                                         __html: section.content
                                           .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-yellow-400">$1</strong>')
                                           .replace(/\[On-screen text: "([^"]+)"\]/g, '<span class="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded px-2 py-1 text-sm font-medium mx-1">📺 $1</span>')
                                           .replace(/\n/g, '<br />')
                                       }}>
                                  </div>
                                </div>

                                {/* Bullet points */}
                                {section.bulletPoints && section.bulletPoints.length > 0 && (
                                  <div className="mt-4 pl-6 border-l-2 border-primary/30">
                                    <h4 className="text-sm font-medium text-primary mb-2">Key Points:</h4>
                                    <ul className="space-y-1">
                                      {section.bulletPoints.map((bullet, bulletIndex) => (
                                        <li key={bulletIndex} className="text-sm text-muted-foreground flex items-start">
                                          <span className="text-primary mr-2">•</span>
                                          {bullet}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* On-screen text annotations */}
                                {section.onScreenTexts && section.onScreenTexts.length > 0 && (
                                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center">
                                      <Eye className="h-4 w-4 mr-2" />
                                      On-Screen Text:
                                    </h4>
                                    <div className="space-y-1">
                                      {section.onScreenTexts.map((text, textIndex) => (
                                        <div key={textIndex} className="text-sm text-blue-300 italic">
                                          "{text}"
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Add section button */}
                          <div className="flex justify-center mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newSection = {
                                  type: 'numbered_section',
                                  number: sectionIndex + 2,
                                  title: `New Section ${sectionIndex + 2}`,
                                  content: '',
                                  onScreenTexts: [],
                                  bulletPoints: []
                                };
                                const newSections = [...scriptSections];
                                newSections.splice(sectionIndex + 1, 0, newSection);
                                setScriptSections(newSections);
                              }}
                              className="text-muted-foreground hover:text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add section below
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-4">
                        <Edit3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No paragraphs yet</p>
                        <p className="text-sm">
                          Start building your script by adding paragraphs
                        </p>
                      </div>
                      <Button onClick={() => addNewParagraph(0)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Paragraph
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* B-Roll Suggestions Section */}
              {bRollSuggestions.length > 0 && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-heading flex flex-col sm:flex-row items-start sm:items-center text-lg sm:text-xl">
                      <div className="flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-primary" />
                        B-Roll Suggestions
                      </div>
                      <Badge variant="secondary" className="ml-0 sm:ml-2 mt-2 sm:mt-0">
                        {bRollSuggestions.length} suggestions
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {bRollSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="group relative p-4 border border-border rounded-lg hover:border-primary/50 transition-all bg-card/30"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium flex-shrink-0 mt-1">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground leading-relaxed">
                                {suggestion}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(suggestion)}
                              className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Call to Action Section */}
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="text-heading text-lg sm:text-xl">Call to Action</CardTitle>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Enable editing
                        setEditingSection(-2); // Use -2 for CTA
                        setEditingSectionData({ content: parsedScript.call_to_action });
                      }}
                      className="px-3 py-2 flex-1 sm:flex-none"
                    >
                      <Edit3 className="h-4 w-4 sm:mr-2" />
                      <span className="sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        requestRefinementOptions(
                          "cta",
                          parsedScript.call_to_action,
                        )
                      }
                      disabled={refining}
                      className="px-3 py-2 flex-1 sm:flex-none"
                    >
                      {refining ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 sm:mr-2" />
                      )}
                      <span className="sm:inline">{refining ? "Generating..." : "Refine"}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === -2 ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editingSectionData?.content || parsedScript.call_to_action}
                        onChange={(e) => setEditingSectionData({
                          ...editingSectionData,
                          content: e.target.value
                        })}
                        className="min-h-[100px] bg-background border-border text-foreground resize-none"
                        placeholder="Enter call to action content..."
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            // Save CTA changes
                            setParsedScript(prev => ({ ...prev, call_to_action: editingSectionData.content }));
                            setEditingSection(null);
                            setEditingSectionData(null);
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSection(null);
                            setEditingSectionData(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-foreground leading-relaxed text-sm sm:text-base" dangerouslySetInnerHTML={{
                        __html: parsedScript.call_to_action
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-yellow-400">$1</strong>')
                          .replace(/\[On-screen text: "([^"]+)"\]/g, '<span class="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded px-2 py-1 text-sm font-medium mx-1">📺 $1</span>')
                          .replace(/\n/g, '<br />')
                      }}>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            // Error state - script complete but no content
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-heading mb-2">
                  Script Content Not Available
                </h2>
                <p className="text-body mb-4">
                  The script generation completed, but the content could not be
                  loaded. This might be a temporary issue.
                </p>
                <div className="space-x-2">
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Refinement Options Display */}
      {activeRefinement && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-md w-full sm:w-auto bg-card border border-border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-heading">
              New{" "}
              {activeRefinement.refinement_type === "add_paragraph"
                ? "Paragraph"
                : activeRefinement.refinement_type === "hook"
                  ? "Hook"
                  : activeRefinement.refinement_type === "cta"
                    ? "CTA"
                    : "Paragraph"}{" "}
              Options
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismissRefinement(activeRefinement)}
            >
              ��
            </Button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activeRefinement.generated_options?.length > 0 ? (
              activeRefinement.generated_options.map((option, index) => (
                <div
                  key={index}
                  className="border border-border rounded p-3 hover:bg-accent/50 transition-colors"
                >
                  <p className="text-sm text-foreground mb-2">{option}</p>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSelectRefinementOption(activeRefinement, option)
                    }
                    className="w-full"
                  >
                    Use This Option
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No options generated yet. Options will appear here once
                  processing is complete.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Paragraph Modal */}
      <Dialog
        open={addParagraphModal.open}
        onOpenChange={(open) =>
          setAddParagraphModal((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Add New Paragraph</DialogTitle>
            <DialogDescription>
              Choose how you'd like to add a new paragraph to your script.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => {
                  // Handle manual addition (placeholder for now)
                  setAddParagraphModal({ open: false, insertIndex: 0 });
                }}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">Add Manually</span>
              </Button>
              <Button
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() =>
                  handleAddParagraphWithAI(addParagraphModal.insertIndex)
                }
              >
                <Wand2 className="h-6 w-6" />
                <span className="text-sm">Add with AI</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refinement Modal */}
      <Dialog
        open={refinementModal.open}
        onOpenChange={(open) =>
          setRefinementModal((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>{refinementModal.title}</DialogTitle>
            <DialogDescription>
              {refinementModal.type === "add_paragraph"
                ? "Describe the new paragraph you'd like to add."
                : "Provide instructions for how you'd like to refine this content."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {refinementError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{refinementError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="refinement-input">
                {refinementModal.type === "add_paragraph"
                  ? "Paragraph Description"
                  : "Instructions"}
              </Label>
              <Textarea
                id="refinement-input"
                placeholder={
                  refinementModal.type === "add_paragraph"
                    ? "e.g., add a paragraph about the benefits of this approach..."
                    : "e.g., make this funnier, more engaging, shorter..."
                }
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                disabled={refining}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  setRefinementModal((prev) => ({ ...prev, open: false }))
                }
                disabled={refining}
              >
                Cancel
              </Button>
              <Button onClick={handleRefinement} disabled={refining}>
                {refining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {refinementModal.type === "add_paragraph"
                      ? "Adding..."
                      : "Refining..."}
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refinement Options Modal - Choose from 3 AI options */}
      <Dialog
        open={refinementOptions.open}
        onOpenChange={(open) =>
          setRefinementOptions((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-primary" />
              Choose Your Preferred{" "}
              {refinementOptions.type === "hook"
                ? "Hook"
                : refinementOptions.type === "cta"
                  ? "Call to Action"
                  : refinementOptions.type === "section"
                    ? "Section"
                    : "Paragraph"}
            </DialogTitle>
            <DialogDescription>
              AI has generated 3 refined versions. Select the one you prefer, or
              go back to make changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Original content */}
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  ORIGINAL
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setRefinementOptions((prev) => ({ ...prev, open: false }))
                  }
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Keep Original
                </Button>
              </div>
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{refinementOptions.originalText}</ReactMarkdown>
              </div>
            </div>

            {/* AI Generated Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                AI GENERATED OPTIONS
              </h4>
              {refinementOptions.options.map((option, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer bg-card"
                  onClick={() => applyRefinementOption(option)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm">
                        Option {index + 1}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRefinementOption(option);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Select This
                    </Button>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{option}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() =>
                setRefinementOptions((prev) => ({ ...prev, open: false }))
              }
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Request new options
                const { type, originalText, paragraphIndex, sectionIndex } =
                  refinementOptions;
                setRefinementOptions((prev) => ({ ...prev, open: false }));
                requestRefinementOptions(type, originalText, paragraphIndex, sectionIndex);
              }}
              disabled={refining}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Generate New Options
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
