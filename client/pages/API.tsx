import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Code, Key, Book, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function API() {
  return (
    <div className="min-h-screen bg-background">
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
              <Link to="/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/signup"><Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-6">
              <Code className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">ScriptSlap API</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading mb-6">
              Build with{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                ScriptSlap API
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-body mb-8 max-w-3xl mx-auto">
              Integrate our AI-powered script generation into your applications. Create custom workflows and automate content creation at scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/docs">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600">
                  <Book className="mr-2 h-5 w-5" />
                  View Documentation
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Get API Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <Key className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-heading">Easy Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body">Simple API key authentication with secure token management and rate limiting built-in.</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-heading">High Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body">Fast response times with 99.9% uptime SLA. Built for production scale with global CDN.</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-heading">RESTful Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body">Clean, intuitive REST API with JSON responses and comprehensive error handling.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-heading">Quick Start Example</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST https://api.scriptslap.com/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "How to start a podcast",
    "language": "English",
    "videoLength": "Standard Video"
  }'`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
