import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Zap,
  Search,
  BookOpen,
  Code,
  Cpu,
  ArrowRight,
  FileText,
  Settings,
  Palette,
  Play,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      description: "Quick start guide and basic concepts",
    },
    {
      id: "script-generation",
      title: "Script Generation",
      icon: FileText,
      description: "Master AI-powered script creation",
    },
    {
      id: "editing-refinement",
      title: "Editing & Refinement",
      icon: Palette,
      description: "Perfect your scripts with AI assistance",
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: Code,
      description: "Integrate ScriptSlap into your workflow",
    },
    {
      id: "advanced-features",
      title: "Advanced Features",
      icon: Cpu,
      description: "Power user features and customization",
    },
  ];

  const quickStartSteps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up for ScriptSlap and get 15 free credits to start generating scripts.",
    },
    {
      number: "02",
      title: "Generate Script",
      description: "Enter your topic or YouTube URL and let AI create your viral script.",
    },
    {
      number: "03",
      title: "Refine & Edit",
      description: "Use our intelligent editing tools to perfect your script.",
    },
    {
      number: "04",
      title: "Export & Use",
      description: "Download your script and start creating engaging content.",
    },
  ];

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/api/generate-script",
      description: "Generate a new script from topic or URL",
      example: `{
  "prompt": "How to start a YouTube channel",
  "url": "https://youtube.com/watch?v=example",
  "language": "en"
}`,
    },
    {
      method: "POST",
      endpoint: "/api/refine-content",
      description: "Refine existing script content",
      example: `{
  "content": "Your script content here",
  "type": "hook",
  "instruction": "Make it more engaging"
}`,
    },
    {
      method: "GET",
      endpoint: "/api/scripts",
      description: "Retrieve user's scripts",
      example: "GET /api/scripts?page=1&limit=10",
    },
    {
      method: "DELETE",
      endpoint: "/api/scripts/:id",
      description: "Delete a specific script",
      example: "DELETE /api/scripts/123e4567-e89b-12d3-a456-426614174000",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xl font-bold text-heading">ScriptSlap</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-6">
            <BookOpen className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Documentation</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading mb-6">
            ScriptSlap{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-body mb-8 max-w-2xl mx-auto">
            Master AI-powered script generation with our comprehensive guides, tutorials, and API reference.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-card border-border"
            />
          </div>
        </div>
      </section>

      {/* Documentation Navigation */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 md:grid-cols-5">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    activeSection === section.id
                      ? "bg-primary/10 border-primary/50 text-primary"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <IconComponent className="h-5 w-5 mb-2" />
                  <h3 className="font-medium text-sm">{section.title}</h3>
                  <p className="text-xs opacity-70 mt-1">{section.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Documentation Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary"
                        : "text-body hover:bg-muted/50"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeSection === "getting-started" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-heading mb-4">Getting Started</h2>
                    <p className="text-lg text-body mb-8">
                      Welcome to ScriptSlap! This guide will help you get up and running with AI-powered script generation in minutes.
                    </p>
                  </div>

                  {/* Quick Start Steps */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-heading">
                        <Play className="h-5 w-5 mr-2 text-primary" />
                        Quick Start Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        {quickStartSteps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-white">{step.number}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-heading mb-1">{step.title}</h3>
                              <p className="text-sm text-body">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* What You'll Learn */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-heading">What You'll Learn</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="border-border bg-card p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-heading mb-1">Account Setup</h4>
                            <p className="text-sm text-body">Create your account and understand the credit system</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="border-border bg-card p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-heading mb-1">Dashboard Navigation</h4>
                            <p className="text-sm text-body">Master the dashboard interface and features</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="border-border bg-card p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-heading mb-1">First Script</h4>
                            <p className="text-sm text-body">Generate your first AI-powered script</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="border-border bg-card p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-heading mb-1">Basic Editing</h4>
                            <p className="text-sm text-body">Learn fundamental editing and refinement tools</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-heading">
                        <Info className="h-5 w-5 mr-2 text-blue-500" />
                        Prerequisites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-body">
                        <li>• A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
                        <li>• Stable internet connection</li>
                        <li>• Basic understanding of video content creation</li>
                        <li>• No technical knowledge required</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "script-generation" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-heading mb-4">Script Generation</h2>
                    <p className="text-lg text-body mb-8">
                      Learn how to create viral scripts using our AI-powered generation system.
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="how-it-works">
                      <AccordionTrigger className="text-left">How AI Script Generation Works</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-body">
                          Our AI analyzes millions of viral videos and successful scripts to understand what makes content engaging. Here's how the process works:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-body pl-4">
                          <li>Input Analysis: The AI processes your topic or YouTube URL</li>
                          <li>Content Research: Gathers relevant information and trending topics</li>
                          <li>Structure Planning: Creates an optimal script structure for engagement</li>
                          <li>Content Generation: Writes compelling hooks, body, and call-to-actions</li>
                          <li>Optimization: Refines the script for maximum viral potential</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="prompt-writing">
                      <AccordionTrigger className="text-left">Writing Effective Prompts</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-body">
                          The quality of your script depends on how well you describe your content. Follow these best practices:
                        </p>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h4 className="font-medium text-heading mb-2">Good Prompt Examples:</h4>
                          <ul className="space-y-1 text-sm text-body">
                            <li>• "How to start a profitable YouTube channel in 2024 with zero budget"</li>
                            <li>• "5 simple morning habits that changed my life completely"</li>
                            <li>• "Why 99% of people fail at learning guitar (and how to be the 1%)"</li>
                          </ul>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-800 mb-2">Avoid These:</h4>
                          <ul className="space-y-1 text-sm text-red-700">
                            <li>• Vague topics: "Make a video about cooking"</li>
                            <li>• Too broad: "Everything about fitness"</li>
                            <li>• No hook potential: "Basic introduction to math"</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="url-analysis">
                      <AccordionTrigger className="text-left">YouTube URL Analysis</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-body">
                          Analyze successful videos to create similar engaging content:
                        </p>
                        <div className="space-y-4">
                          <div className="bg-card border border-border p-4 rounded-lg">
                            <h4 className="font-medium text-heading mb-2">What Gets Analyzed:</h4>
                            <ul className="space-y-1 text-sm text-body">
                              <li>• Video title and description</li>
                              <li>• Engagement metrics (likes, comments, views)</li>
                              <li>• Content structure and pacing</li>
                              <li>• Hook techniques used</li>
                              <li>• Call-to-action effectiveness</li>
                            </ul>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2">Pro Tip:</h4>
                            <p className="text-sm text-green-700">
                              Use URLs from videos with high engagement rates in your niche for best results.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="languages">
                      <AccordionTrigger className="text-left">Multi-Language Support</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-body">
                          Generate scripts in multiple languages with native-level quality:
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-card border border-border p-4 rounded-lg">
                            <h4 className="font-medium text-heading mb-2">Supported Languages:</h4>
                            <ul className="text-sm text-body space-y-1">
                              <li>• English</li>
                              <li>• Spanish</li>
                              <li>• French</li>
                              <li>• German</li>
                              <li>• Italian</li>
                              <li>• Portuguese</li>
                              <li>• Hindi</li>
                              <li>• And 20+ more...</li>
                            </ul>
                          </div>
                          <div className="bg-card border border-border p-4 rounded-lg">
                            <h4 className="font-medium text-heading mb-2">Features:</h4>
                            <ul className="text-sm text-body space-y-1">
                              <li>• Cultural adaptation</li>
                              <li>• Native idioms and expressions</li>
                              <li>• Localized humor and references</li>
                              <li>• Regional content preferences</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {activeSection === "editing-refinement" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-heading mb-4">Editing & Refinement</h2>
                    <p className="text-lg text-body mb-8">
                      Master the art of perfecting your scripts with AI-powered editing tools.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center text-heading">
                          <Palette className="h-5 w-5 mr-2 text-primary" />
                          Visual Editor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">Interactive paragraph-by-paragraph editing with AI assistance.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• Click any paragraph to edit</li>
                          <li>• AI-powered refinement suggestions</li>
                          <li>• Real-time engagement scoring</li>
                          <li>• Collaborative editing features</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center text-heading">
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                          Hook Refinement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">Generate multiple hook variations and choose the most engaging one.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• 3 AI-generated hook options</li>
                          <li>• Engagement prediction scores</li>
                          <li>• A/B testing recommendations</li>
                          <li>• Viral pattern analysis</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center text-heading">
                          <Settings className="h-5 w-5 mr-2 text-primary" />
                          CTA Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">Optimize your call-to-actions for maximum conversion.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• Multiple CTA variations</li>
                          <li>• Conversion rate optimization</li>
                          <li>• Platform-specific recommendations</li>
                          <li>• Action-oriented language</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center text-heading">
                          <Play className="h-5 w-5 mr-2 text-primary" />
                          B-roll Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">AI-generated visual suggestions to enhance your video content.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• Scene-by-scene suggestions</li>
                          <li>• Stock footage recommendations</li>
                          <li>• Animation ideas</li>
                          <li>• Visual storytelling tips</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-heading">Editing Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-heading mb-1">Review Generated Script</h4>
                            <p className="text-sm text-body">Read through the initial AI-generated script and identify areas for improvement.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-heading mb-1">Select and Edit Sections</h4>
                            <p className="text-sm text-body">Click on specific paragraphs, hooks, or CTAs to refine them with AI assistance.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-heading mb-1">Apply Refinements</h4>
                            <p className="text-sm text-body">Choose from AI-generated variations or provide custom instructions for refinement.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-primary">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-heading mb-1">Final Review and Export</h4>
                            <p className="text-sm text-body">Review the complete script, make final adjustments, and export for production.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "api-reference" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-heading mb-4">API Reference</h2>
                    <p className="text-lg text-body mb-8">
                      Integrate ScriptSlap's AI-powered script generation into your applications with our REST API.
                    </p>
                  </div>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-heading">
                        <Code className="h-5 w-5 mr-2 text-primary" />
                        Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-body">All API requests require authentication using your API key in the Authorization header:</p>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Authorization Header</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <code>Authorization: Bearer your_api_key_here</code>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-heading">Endpoints</h3>
                    {apiEndpoints.map((endpoint, index) => (
                      <Card key={index} className="border-border bg-card">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant={endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : 'destructive'}
                                className="min-w-[60px] justify-center"
                              >
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono text-heading">{endpoint.endpoint}</code>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-body mt-2">{endpoint.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <h4 className="font-medium text-heading">Example Request:</h4>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                              <pre>{endpoint.example}</pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-heading">Rate Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <h4 className="font-medium text-heading mb-1">Free Plan</h4>
                          <p className="text-sm text-body">5 requests per minute</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <h4 className="font-medium text-heading mb-1">Pro Plan</h4>
                          <p className="text-sm text-body">100 requests per minute</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "advanced-features" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-heading mb-4">Advanced Features</h2>
                    <p className="text-lg text-body mb-8">
                      Unlock the full potential of ScriptSlap with advanced features and customization options.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-heading">Custom Templates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">Create and save custom script templates for consistent branding.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• Brand voice consistency</li>
                          <li>• Custom formatting rules</li>
                          <li>• Reusable script structures</li>
                          <li>• Team template sharing</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-heading">Analytics Dashboard</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">Track script performance and engagement metrics.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• Script performance analytics</li>
                          <li>• Engagement prediction accuracy</li>
                          <li>• Usage statistics</li>
                          <li>• ROI tracking</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-heading">Team Collaboration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">Collaborate with team members on script creation and editing.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• Real-time collaboration</li>
                          <li>• Comment and review system</li>
                          <li>• Role-based permissions</li>
                          <li>• Version history</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-heading">White-label Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-body text-sm">Customize ScriptSlap with your own branding for client work.</p>
                        <ul className="text-sm text-body space-y-1">
                          <li>• Custom domain and branding</li>
                          <li>• Logo and color customization</li>
                          <li>• Client dashboard access</li>
                          <li>• Agency reseller program</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-heading">Batch Processing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-body">Process multiple scripts simultaneously for large-scale content creation:</p>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                        <div className="mb-2 text-gray-400">Batch API Example:</div>
                        <pre>{`{
  "batch": [
    {"prompt": "Topic 1", "language": "en"},
    {"prompt": "Topic 2", "language": "es"},
    {"prompt": "Topic 3", "language": "fr"}
  ]
}`}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center text-heading">
                        <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                        Best Practices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-body">
                        <li>• Use specific, detailed prompts for better results</li>
                        <li>• Analyze successful videos in your niche for insights</li>
                        <li>• Test multiple hook variations for optimal engagement</li>
                        <li>• Regularly update your templates based on performance data</li>
                        <li>• Leverage batch processing for consistent content calendars</li>
                        <li>• Monitor API rate limits to avoid throttling</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-4">
            Ready to Create Viral Scripts?
          </h2>
          <p className="text-lg text-body mb-8">
            Join thousands of creators using ScriptSlap to generate engaging content that converts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600">
                Start Creating Scripts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
