import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, FileText, AlertTriangle } from "lucide-react";
import Footer from "@/components/Footer";

export default function Terms() {
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

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-6">
              <FileText className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Terms of Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-heading mb-4">Terms of Service</h1>
            <p className="text-lg text-body mb-4">Last updated: December 2024</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <div className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold text-heading mb-4">Acceptance of Terms</h2>
              <p className="text-body">By accessing and using ScriptSlap, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold text-heading mb-4">Use License</h2>
              <p className="text-body">Permission is granted to temporarily access ScriptSlap for personal, commercial use. This license shall automatically terminate if you violate any of these restrictions.</p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold text-heading mb-4">Content Ownership</h2>
              <p className="text-body">You retain all rights to the scripts and content you create using ScriptSlap. We claim no ownership over your generated content.</p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-bold text-heading mb-4">Prohibited Uses</h2>
              <p className="text-body">You may not use ScriptSlap for any unlawful purpose or to generate content that violates our community guidelines, including hate speech, harassment, or illegal activities.</p>
            </div>

            <div className="mt-12 p-6 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <h2 className="text-xl font-semibold text-heading mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Questions About Terms
              </h2>
              <p className="text-body">If you have questions about these Terms of Service, contact us at scriptslap.com@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
