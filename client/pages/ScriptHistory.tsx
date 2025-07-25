import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Search,
  Heart,
  HeartOff,
  Edit3,
  Trash2,
  MoreVertical,
  Tag,
  Filter,
  Calendar,
  FileText,
  Star,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  GeneratedScript,
  GENERATION_STATUS_LABELS,
  GENERATION_STATUS_COLORS,
} from "@/types/database";

interface ScriptWithMeta extends GeneratedScript {
  is_favorite?: boolean;
  tags?: string[];
  category?: string;
}

export default function ScriptHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for scripts
  const [scripts, setScripts] = useState<ScriptWithMeta[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<ScriptWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "title" | "status">("date");

  // State for modals
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    script: ScriptWithMeta | null;
  }>({ open: false, script: null });

  const [tagModal, setTagModal] = useState<{
    open: boolean;
    script: ScriptWithMeta | null;
    newTag: string;
  }>({ open: false, script: null, newTag: "" });

  // Available categories
  const categories = [
    "Educational",
    "Entertainment", 
    "Marketing",
    "Tutorial",
    "Review",
    "Vlog",
    "Gaming",
    "Business",
    "Other"
  ];

  // Fetch scripts
  useEffect(() => {
    const fetchScripts = async () => {
      if (!user) return;

      try {
        // Fetch scripts first
        const { data: scriptsData, error: scriptsError } = await supabase
          .from("generated_scripts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (scriptsError) {
          console.error("Error fetching scripts:", scriptsError);
          const errorMessage = scriptsError.message || scriptsError.details || "Unknown error";
          toast.error(`Failed to load scripts: ${errorMessage}`);
          return;
        }

        if (!scriptsData) {
          setScripts([]);
          setFilteredScripts([]);
          return;
        }

        // Try to fetch metadata separately
        let metadataMap = new Map();

        try {
          const { data: metadataData, error: metadataError } = await supabase
            .from("script_metadata")
            .select("script_id, is_favorite, tags, category")
            .eq("user_id", user.id);

          if (metadataError) {
            console.log("Metadata table not available:", metadataError.message || metadataError.details || "Unknown error");
          } else if (metadataData) {
            // Create a map for quick lookup
            metadataData.forEach(meta => {
              metadataMap.set(meta.script_id, meta);
            });
          }
        } catch (metadataError) {
          console.log("Metadata table not available, using defaults");
        }

        // Combine scripts with metadata
        const scriptsWithMeta = scriptsData.map(script => {
          const metadata = metadataMap.get(script.id);
          return {
            ...script,
            is_favorite: metadata?.is_favorite || false,
            tags: metadata?.tags || [],
            category: metadata?.category || "Other"
          };
        });

        setScripts(scriptsWithMeta);
        setFilteredScripts(scriptsWithMeta);
      } catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
        toast.error("Failed to load scripts");
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, [user]);

  // Filter and search scripts
  useEffect(() => {
    let filtered = [...scripts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(script =>
        script.script_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(script => script.generation_status === filterStatus);
    }

    // Favorites filter
    if (filterFavorites) {
      filtered = filtered.filter(script => script.is_favorite);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.script_title || "").localeCompare(b.script_title || "");
        case "status":
          return (a.generation_status || "").localeCompare(b.generation_status || "");
        case "date":
        default:
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      }
    });

    setFilteredScripts(filtered);
  }, [scripts, searchQuery, filterStatus, filterFavorites, sortBy]);

  // Toggle favorite
  const toggleFavorite = async (script: ScriptWithMeta) => {
    try {
      // Validate user is authenticated
      if (!user?.id) {
        toast.error("Please sign in to update favorites");
        return;
      }

      const newFavoriteStatus = !script.is_favorite;

      // Try to update in database (create metadata table if needed)
      try {
        const { error } = await supabase
          .from("script_metadata")
          .upsert({
            script_id: script.id,
            user_id: user?.id,
            is_favorite: newFavoriteStatus,
            tags: script.tags || [],
            category: script.category || "Other"
          });

        if (error) {
          console.error("Error updating favorite:", error);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });

          // If table doesn't exist, just update local state
          if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
            console.log("Metadata table doesn't exist, updating locally only");
          } else {
            const errorMessage = error.message || error.details || "Unknown database error";
            toast.error(`Failed to update favorite: ${errorMessage}`);
            return;
          }
        }
      } catch (metadataError) {
        console.log("Metadata table not available, updating locally only");
      }

      // Update local state
      setScripts(prev => prev.map(s =>
        s.id === script.id ? { ...s, is_favorite: newFavoriteStatus } : s
      ));

      toast.success(newFavoriteStatus ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      toast.error("Failed to update favorite");
    }
  };

  // Delete script
  const deleteScript = async () => {
    if (!deleteModal.script) return;

    try {
      const { error } = await supabase
        .from("generated_scripts")
        .delete()
        .eq("id", deleteModal.script.id);

      if (error) {
        console.error("Error deleting script:", error);
        toast.error("Failed to delete script");
        return;
      }

      // Update local state
      setScripts(prev => prev.filter(s => s.id !== deleteModal.script?.id));
      setDeleteModal({ open: false, script: null });
      
      toast.success("Script deleted successfully");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to delete script");
    }
  };

  // Add tag
  const addTag = async () => {
    if (!tagModal.script || !tagModal.newTag.trim()) return;

    // Validate user is authenticated
    if (!user?.id) {
      toast.error("Please sign in to add tags");
      return;
    }

    try {
      const newTags = [...(tagModal.script.tags || []), tagModal.newTag.trim()];

      // Try to update in database
      try {
        const { error } = await supabase
          .from("script_metadata")
          .upsert({
            script_id: tagModal.script.id,
            user_id: user?.id,
            is_favorite: tagModal.script.is_favorite || false,
            tags: newTags,
            category: tagModal.script.category || "Other"
          });

        if (error) {
          console.error("Error adding tag:", error);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });

          // If table doesn't exist, just update local state
          if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
            console.log("Metadata table doesn't exist, updating locally only");
          } else {
            const errorMessage = error.message || error.details || "Unknown database error";
            toast.error(`Failed to add tag: ${errorMessage}`);
            return;
          }
        }
      } catch (metadataError) {
        console.log("Metadata table not available, updating locally only");
      }

      // Update local state
      setScripts(prev => prev.map(s =>
        s.id === tagModal.script?.id ? { ...s, tags: newTags } : s
      ));

      setTagModal({ open: false, script: null, newTag: "" });
      toast.success("Tag added successfully");
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : err);
      toast.error("Failed to add tag");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="font-bold text-heading text-sm sm:text-base">Script History</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading mb-2">
              Script History
            </h1>
            <p className="text-body text-sm sm:text-base">
              Manage, organize, and edit all your generated scripts
            </p>
          </div>

          {/* Filters and Search */}
          <Card className="border-border bg-card mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search scripts, topics, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background border-border"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Status: {filterStatus === "all" ? "All" : GENERATION_STATUS_LABELS[filterStatus]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                        All Statuses
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {Object.entries(GENERATION_STATUS_LABELS).map(([key, label]) => (
                        <DropdownMenuItem key={key} onClick={() => setFilterStatus(key)}>
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant={filterFavorites ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterFavorites(!filterFavorites)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Sort: {sortBy === "date" ? "Date" : sortBy === "title" ? "Title" : "Status"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy("date")}>
                        Date Created
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("title")}>
                        Title
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("status")}>
                        Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scripts Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredScripts.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-heading mb-2">
                  {searchQuery || filterStatus !== "all" || filterFavorites
                    ? "No scripts match your filters"
                    : "No scripts created yet"}
                </h3>
                <p className="text-body mb-4">
                  {searchQuery || filterStatus !== "all" || filterFavorites
                    ? "Try adjusting your search or filters to find scripts."
                    : "Start creating your first script from the dashboard."}
                </p>
                <Link to="/dashboard">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredScripts.map((script) => (
                <Card key={script.id} className="border-border bg-card hover:border-primary/50 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-heading mb-1 line-clamp-2">
                          {script.script_title || `Script ${script.id.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {script.topic}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => navigate(`/editor/${script.id}`)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Script
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFavorite(script)}>
                            {script.is_favorite ? (
                              <>
                                <HeartOff className="h-4 w-4 mr-2" />
                                Remove from Favorites
                              </>
                            ) : (
                              <>
                                <Heart className="h-4 w-4 mr-2" />
                                Add to Favorites
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setTagModal({ open: true, script, newTag: "" })}
                          >
                            <Tag className="h-4 w-4 mr-2" />
                            Add Tag
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteModal({ open: true, script })}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Script
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status and Favorite */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${GENERATION_STATUS_COLORS[script.generation_status || "pending"]}`}
                      >
                        {GENERATION_STATUS_LABELS[script.generation_status || "pending"]}
                      </Badge>
                      {script.is_favorite && (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      )}
                    </div>

                    {/* Tags */}
                    {script.tags && script.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {script.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {script.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{script.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Date and Actions */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(script.created_at || "").toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(script)}
                          className="h-8 w-8 p-0"
                        >
                          {script.is_favorite ? (
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          ) : (
                            <Heart className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/editor/${script.id}`)}
                          className="h-8 px-3"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Script
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteModal.script?.script_title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, script: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteScript}
            >
              Delete Script
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Modal */}
      <Dialog open={tagModal.open} onOpenChange={(open) => setTagModal(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-primary" />
              Add Tag
            </DialogTitle>
            <DialogDescription>
              Add a tag to help organize and find "{tagModal.script?.script_title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter tag name..."
              value={tagModal.newTag}
              onChange={(e) => setTagModal(prev => ({ ...prev, newTag: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTagModal({ open: false, script: null, newTag: "" })}
            >
              Cancel
            </Button>
            <Button onClick={addTag} disabled={!tagModal.newTag.trim()}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
