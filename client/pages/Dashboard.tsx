import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Zap,
  Plus,
  FileText,
  User,
  LogOut,
  Loader2,
  AlertCircle,
  Play,
  History,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { generateScript } from "@/lib/api";
import { toast } from "sonner";
import {
  Profile,
  GeneratedScript,
  GenerateScriptRequest,
  GenerateScriptResponse,
  GENERATION_STATUS_LABELS,
  GENERATION_STATUS_COLORS,
} from "@/types/database";

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // State for user profile and credits
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // State for script generation form
  const [formData, setFormData] = useState<GenerateScriptRequest>({
    topic: "",
    youtubeUrl: "",
    language: "English",
    videoLength: "Standard Video",
    projectName: "",
  });
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState("");

  // State for credit modal
  const [creditModal, setCreditModal] = useState({
    open: false,
    creditsNeeded: 0,
    creditsAvailable: 0,
  });

  // State for user scripts and projects
  const [scripts, setScripts] = useState<GeneratedScript[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [scriptsLoading, setScriptsLoading] = useState(true);

  // Fetch user profile and credits
  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) {
        console.log("Auth still loading, skipping profile fetch");
        return;
      }

      if (!user || !user.id) {
        console.log("No authenticated user, skipping profile fetch");
        setProfileLoading(false);
        return;
      }

      console.log("Fetching profile for user:", user.id);
      console.log("Supabase client config:", {
        url: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      });

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          console.log("Profile error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            fullError: JSON.stringify(error, null, 2),
          });

          // If table doesn't exist, create a default profile
          if (
            error.code === "PGRST116" ||
            error.message?.includes("does not exist")
          ) {
            console.log("Profiles table doesn't exist, using default profile");
            setProfile({
              id: user.id,
              subscription_tier: "free",
              credits: 15,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        console.log("Profile catch error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
          fullError: JSON.stringify(err, null, 2),
        });

        // Fallback to default profile
        setProfile({
          id: user.id,
          subscription_tier: "free",
          credits: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  // Fetch user scripts
  useEffect(() => {
    const fetchScripts = async () => {
      if (authLoading) {
        console.log("Auth still loading, skipping scripts fetch");
        return;
      }

      if (!user || !user.id) {
        console.log("No authenticated user, skipping scripts fetch");
        setScriptsLoading(false);
        return;
      }

      console.log("Fetching scripts for user:", user.id);

      try {
        const { data, error } = await supabase
          .from("generated_scripts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching scripts:", error.message || error);
          console.log("Scripts error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });

          // If table doesn't exist, use empty array
          if (
            error.code === "PGRST116" ||
            error.message?.includes("does not exist")
          ) {
            console.log(
              "Generated scripts table doesn't exist, using empty array",
            );
            setScripts([]);
          } else {
            // Show user-friendly error message
            toast.error("Failed to load scripts. Please try refreshing the page.");
          }
        } else {
          setScripts(data || []);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error fetching scripts:", errorMessage);
        console.log("Scripts catch error details:", {
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
        });

        // Show user-friendly error message
        toast.error("Failed to load scripts. Please try refreshing the page.");

        // Fallback to empty scripts array
        setScripts([]);
      } finally {
        setScriptsLoading(false);
      }
    };

    fetchScripts();
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleInputChange = (
    field: keyof GenerateScriptRequest,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError("");
  };

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setFormError("");

    if (!formData.topic.trim()) {
      setFormError("Topic is required");
      setGenerating(false);
      return;
    }

    if (!user) {
      setFormError("User not authenticated");
      setGenerating(false);
      return;
    }

    if (!profile) {
      setFormError("Profile not loaded");
      setGenerating(false);
      return;
    }

    // Script generation costs 3 credits
    const creditsNeeded = 3;

    // Check if user has sufficient credits
    if (profile.credits < creditsNeeded) {
      setCreditModal({
        open: true,
        creditsNeeded,
        creditsAvailable: profile.credits,
      });
      setGenerating(false);
      return;
    }

    try {
      // Prepare payload with userId included
      const payload = {
        userId: user.id,
        topic: formData.topic,
        youtubeUrl: formData.youtubeUrl || undefined,
        language: formData.language,
        videoLength: formData.videoLength,
      };

      console.log(
        "Attempting to call generate-script with payload:",
        payload,
      );

      const data = await generateScript(payload);

      if (data && data.scriptId) {
        const response = data as GenerateScriptResponse;

        // Reset form and navigate to editor
        setFormData({
          topic: "",
          youtubeUrl: "",
          language: "English",
          videoLength: "Standard Video",
          projectName: "",
        });

        // Show success toast
        toast.success("Script generation started!", {
          description:
            "Your script is being processed by AI. You'll be redirected to the editor.",
        });

        // Update local profile credits optimistically
        if (profile) {
          setProfile({ ...profile, credits: profile.credits - 3 });
        }

        // Small delay to show the toast before navigation
        setTimeout(() => {
          navigate(`/editor/${response.scriptId}`);
        }, 1000);
      } else {
        setFormError("Invalid response from server");
      }
    } catch (err) {
      console.error("Script generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setFormError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-heading">ScriptSlap</span>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              {/* User info - hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4 text-body" />
                <span className="text-body text-sm truncate max-w-32">{user?.email}</span>
              </div>

              {/* Credits display */}
              {profileLoading ? (
                <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs sm:text-sm">
                  <span className="hidden sm:inline">Credits: </span>
                  {profile?.credits || 0}
                </Badge>
              )}

              {/* Logout button */}
              <Button variant="outline" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-heading mb-2">
              Welcome to ScriptSlap
            </h1>
            <p className="text-body">
              Ready to create your next viral script? Start by generating a new
              script below.
            </p>
          </div>

          {/* Generate New Script Form */}
          <Card className="border-border bg-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-heading">
                <Plus className="h-5 w-5 mr-2 text-primary" />
                Generate New Script
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleGenerateScript} className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-heading">
                        Topic <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="topic"
                        placeholder="Enter your script topic..."
                        value={formData.topic}
                        onChange={(e) =>
                          handleInputChange("topic", e.target.value)
                        }
                        disabled={generating}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectName" className="text-heading">
                        Project Name (Optional)
                      </Label>
                      <Input
                        id="projectName"
                        placeholder="Name for this project..."
                        value={formData.projectName}
                        onChange={(e) =>
                          handleInputChange("projectName", e.target.value)
                        }
                        disabled={generating}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl" className="text-heading">
                      YouTube URL (Optional - for style analysis)
                    </Label>
                    <Input
                      id="youtubeUrl"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.youtubeUrl}
                      onChange={(e) =>
                        handleInputChange("youtubeUrl", e.target.value)
                      }
                      disabled={generating}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-heading">
                      Language
                    </Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        handleInputChange(
                          "language",
                          value as GenerateScriptRequest["language"],
                        )
                      }
                      disabled={generating}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Hinglish">Hinglish</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoLength" className="text-heading">
                      Video Length
                    </Label>
                    <Select
                      value={formData.videoLength}
                      onValueChange={(value) =>
                        handleInputChange(
                          "videoLength",
                          value as GenerateScriptRequest["videoLength"],
                        )
                      }
                      disabled={generating}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Short Form">Short Form</SelectItem>
                        <SelectItem value="Standard Video">
                          Standard Video
                        </SelectItem>
                        <SelectItem value="Long Form">Long Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          type="submit"
                          className="w-full md:w-auto"
                          disabled={
                            generating ||
                            !profile ||
                            (profile && profile.credits < 3)
                          }
                          size="lg"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating Script...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Generate Script (3 Credits)
                            </>
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {profile && profile.credits < 3 && (
                        <TooltipContent>
                          <p>
                            You need 3 credits for this action, but you only have {profile.credits}{" "}
                            remaining.
                          </p>
                        </TooltipContent>
                      )}
                  </Tooltip>
                </TooltipProvider>
              </form>
            </CardContent>
          </Card>

          {/* Recent Activity & Quick Access */}
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="recent" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Recent Scripts
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                View All History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-heading">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Recent Scripts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {scriptsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-16 bg-muted animate-pulse rounded-lg"
                        ></div>
                      ))}
                    </div>
                  ) : scripts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-body mb-2">No scripts generated yet</p>
                      <p className="text-sm text-muted-foreground">
                        Your generated scripts will appear here once you create
                        them.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scripts.slice(0, 5).map((script: any) => (
                        <Link
                          key={script.id}
                          to={`/editor/${script.id}`}
                          className="block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card/50 hover:bg-card"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-heading font-medium mb-1">
                                {script.script_title ||
                                  `Script ${script.id.slice(0, 8)}`}
                              </h3>
                              <p className="text-body text-sm">
                                {script.topic || "No topic"} • {script.language || "English"} • {new Date(script.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge
                                variant="secondary"
                                className={
                                  GENERATION_STATUS_COLORS[
                                    script.generation_status || "pending"
                                  ]
                                }
                              >
                                {
                                  GENERATION_STATUS_LABELS[
                                    script.generation_status || "pending"
                                  ]
                                }
                              </Badge>
                              <Play className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </Link>
                      ))}
                      {scripts.length > 5 && (
                        <div className="text-center pt-4 border-t border-border">
                          <Link to="/history">
                            <Button variant="outline">
                              <History className="h-4 w-4 mr-2" />
                              View All Scripts ({scripts.length})
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-border bg-card">
                <CardContent className="p-8 text-center">
                  <History className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-heading mb-2">
                    Manage Your Script History
                  </h3>
                  <p className="text-body mb-6">
                    View, edit, organize, and manage all your generated scripts with advanced features like
                    favorites, tags, and categorization.
                  </p>
                  <Link to="/history">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      <History className="h-5 w-5 mr-2" />
                      Open Script History
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
                </div>
      </div>

      {/* Get More Credits Modal */}
      <Dialog open={creditModal.open} onOpenChange={(open) => setCreditModal(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-heading">
              <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
              Insufficient Credits
            </DialogTitle>
            <DialogDescription>
              You need <strong>{creditModal.creditsNeeded} credits</strong> for this action,
              but you only have <strong>{creditModal.creditsAvailable} credits</strong> remaining.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setCreditModal(prev => ({ ...prev, open: false }))}
            >
              Close
            </Button>
            <Link to="/pricing">
              <Button className="w-full sm:w-auto">
                <Zap className="h-4 w-4 mr-2" />
                Get More Credits
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
