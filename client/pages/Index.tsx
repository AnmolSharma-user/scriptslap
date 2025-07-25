import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import {
  Zap,
  Target,
  Edit3,
  Sparkles,
  Video,
  Clock,
  Check,
  Star,
  Quote,
  ArrowRight,
  Play,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xl font-bold text-heading">ScriptSlap</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-body hover:text-primary transition-colors font-medium"
              >
                Features
              </a>
              <Link
                to="/pricing"
                className="text-body hover:text-primary transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/docs"
                className="text-body hover:text-primary transition-colors font-medium"
              >
                Docs
              </Link>
              <a
                href="#testimonials"
                className="text-body hover:text-primary transition-colors font-medium"
              >
                Testimonials
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

        <div className="relative container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">AI-Powered Scriptwriting Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-heading mb-8">
              From Idea to{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Viral Script
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-full"></div>
              </span>{" "}
              in Minutes
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed text-body max-w-3xl mx-auto mb-12">
              Create compelling video scripts with AI that learns from your favorite content creators.
              Generate hooks, craft engaging narratives, and optimize CTAs with professional-grade tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started for Free
                </Button>
              </Link>
              <Link
                to="/demo"
                className="group inline-flex items-center text-lg font-semibold text-body hover:text-primary transition-colors"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span>Trusted by 50K+ creators</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Everything you need to create viral content
          </h2>
          <p className="mt-4 text-lg text-body">
            Powerful AI tools designed for serious content creators who value
            efficiency and quality.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-heading">
                  AI Script Generation
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body">
                Generate complete video scripts from just a topic or idea. Our
                AI understands what makes content engaging and viral.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary" />
                <CardTitle className="text-heading">
                  Competitor Style Emulation
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body">
                Analyze successful videos and generate scripts that capture the
                same engaging style and tone that works.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Edit3 className="h-6 w-6 text-primary" />
                <CardTitle className="text-heading">
                  Interactive Editing
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body">
                Refine hooks, optimize CTAs, and enhance paragraphs with AI
                assistance. Perfect your script with intelligent suggestions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Video className="h-6 w-6 text-primary" />
                <CardTitle className="text-heading">
                  B-Roll Suggestions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body">
                Get intelligent suggestions for visual elements and B-roll
                footage to enhance your video production.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-primary" />
                <CardTitle className="text-heading">
                  Multi-Format Support
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body">
                Create scripts optimized for short-form, standard, or long-form
                content across multiple languages.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle className="text-heading">
                  Real-time Collaboration
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body">
                Work with your team in real-time with live updates and
                collaborative editing features.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-body">
            Choose the plan that fits your content creation needs.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
          {/* Free Trial */}
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-heading">
                Free Trial
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-heading">15</span>
                <span className="text-lg text-body ml-1">credits</span>
              </div>
              <CardDescription className="text-body">
                One-time trial to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">1-2 complete scripts</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">AI script generation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">Basic editing tools</span>
                </li>
              </ul>
              <Link to="/signup" className="block">
                <Button className="w-full mt-6">Get Started Free</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Creator */}
          <Card className="border-primary bg-card relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-heading">Creator</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-heading">100</span>
                <span className="text-lg text-body ml-1">credits/month</span>
              </div>
              <CardDescription className="text-body">
                Perfect for regular creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">6-10 complete scripts</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">Style emulation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">Advanced editing tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">B-roll suggestions</span>
                </li>
              </ul>
              <Link to="/signup" className="block">
                <Button className="w-full mt-6">Start Creator Plan</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-heading">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-heading">300</span>
                <span className="text-lg text-body ml-1">credits/month</span>
              </div>
              <CardDescription className="text-body">
                For professional content teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">20-30 complete scripts</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">Priority generation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">Team collaboration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-3" />
                  <span className="text-body">Analytics dashboard</span>
                </li>
              </ul>
              <Link to="/signup" className="block">
                <Button className="w-full mt-6">Start Pro Plan</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Loved by content creators worldwide
          </h2>
          <p className="mt-4 text-lg text-body">
            See how ScriptSlap is helping creators generate millions of views with viral scripts.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Testimonial 1 */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="text-body mb-6 italic">
                "ScriptSlap helped me go from 10K to 100K subscribers in just 3 months.
                The AI understands my style perfectly and creates scripts that actually convert."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  SA
                </div>
                <div>
                  <p className="font-semibold text-heading">Sarah Anderson</p>
                  <p className="text-sm text-muted-foreground">Tech Reviewer • 150K subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial 2 */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="text-body mb-6 italic">
                "I was spending 4-5 hours per script. Now with ScriptSlap, I create better scripts
                in under 30 minutes. Game changer for productivity."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div>
                  <p className="font-semibold text-heading">Marcus Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Business Coach • 250K subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial 3 */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="text-body mb-6 italic">
                "The B-roll suggestions are incredible. My retention rate improved by 40%
                since I started using ScriptSlap for my educational content."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  EL
                </div>
                <div>
                  <p className="font-semibold text-heading">Emma Liu</p>
                  <p className="text-sm text-muted-foreground">Educational Creator • 500K subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Scripts Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10M+</div>
            <div className="text-sm text-muted-foreground">Views Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">AI Availability</div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-3xl p-12 border border-primary/20">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl mb-6">
              Ready to create your next viral script?
            </h2>
            <p className="text-lg text-body mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using ScriptSlap to generate millions of views.
              Start with 15 free credits and see the difference AI-powered scriptwriting makes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                  Start Creating for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>15 free credits</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>1-click setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
