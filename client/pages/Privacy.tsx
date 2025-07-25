import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Lock, Eye, FileText } from "lucide-react";
import Footer from "@/components/Footer";

export default function Privacy() {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, payment information, and the content you create using our platform."
    },
    {
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers."
    },
    {
      title: "Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with service providers who assist us in operating our platform."
    },
    {
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest."
    },
    {
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information. You may also object to or restrict certain processing of your data. Contact us to exercise these rights."
    },
    {
      title: "Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content. You can control cookie settings through your browser preferences."
    },
    {
      title: "International Transfers",
      content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers."
    },
    {
      title: "Retention",
      content: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law."
    }
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

      {/* Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 mb-6">
              <Shield className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Privacy Policy</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-heading mb-4">Privacy Policy</h1>
            <p className="text-lg text-body mb-4">Last updated: December 2024</p>
            <p className="text-body">
              This Privacy Policy describes how ScriptSlap collects, uses, and protects your information when you use our service.
            </p>
          </div>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none">
            <div className="mb-8 p-6 rounded-lg bg-muted/20 border border-border">
              <h2 className="text-xl font-semibold text-heading mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                Your Privacy Matters
              </h2>
              <p className="text-body">
                At ScriptSlap, we take your privacy seriously. This policy explains how we collect, use, store, and protect your personal information when you use our AI-powered script generation platform.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="border-l-4 border-primary pl-6">
                  <h2 className="text-2xl font-bold text-heading mb-4">{section.title}</h2>
                  <p className="text-body leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/20">
              <h2 className="text-xl font-semibold text-heading mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                Contact Us About Privacy
              </h2>
              <p className="text-body mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="text-body space-y-2">
                <li>• Email: scriptslap.com@gmail.com</li>
                <li>• Address: 123 Innovation Drive, San Francisco, CA 94105</li>
                <li>• Phone: +91 8670033276</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
