import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Zap,
  Search,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Video,
  FileText,
  Settings,
  CreditCard,
  Shield,
  Mail,
  Phone,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics of ScriptSlap",
      articles: [
        "How to create your first script",
        "Understanding credits and pricing",
        "Setting up your account",
        "Navigating the dashboard",
      ],
    },
    {
      title: "Script Generation",
      icon: FileText,
      description: "Master AI script creation",
      articles: [
        "How to write effective prompts",
        "Using YouTube URL for style analysis",
        "Understanding script formats",
        "Best practices for viral content",
      ],
    },
    {
      title: "Editing & Refinement",
      icon: Video,
      description: "Perfect your scripts",
      articles: [
        "Using the script editor",
        "Refining hooks and CTAs",
        "Adding B-roll suggestions",
        "Collaborative editing features",
      ],
    },
    {
      title: "Account & Billing",
      icon: CreditCard,
      description: "Manage your subscription",
      articles: [
        "Upgrading your plan",
        "Managing payment methods",
        "Understanding billing cycles",
        "Canceling your subscription",
      ],
    },
    {
      title: "Security & Privacy",
      icon: Shield,
      description: "Your data protection",
      articles: [
        "Data privacy and security",
        "GDPR compliance",
        "Data retention policies",
        "Account security settings",
      ],
    },
    {
      title: "Troubleshooting",
      icon: Settings,
      description: "Common issues and fixes",
      articles: [
        "Script generation issues",
        "Payment problems",
        "Account access issues",
        "Performance optimization",
      ],
    },
  ];

  const faqs = [
    {
      question: "How does ScriptSlap work?",
      answer: "ScriptSlap uses advanced AI to generate viral video scripts. Simply provide a topic or YouTube URL, and our AI creates complete scripts with hooks, main content, and call-to-actions optimized for engagement.",
    },
    {
      question: "What are credits and how do they work?",
      answer: "Credits are used for AI operations. Script generation costs 3 credits, and each refinement (hook, CTA, paragraph) costs 1 credit. Credits reset monthly with your subscription and don't roll over.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with ScriptSlap, contact our support team for a full refund.",
    },
    {
      question: "Is my content private and secure?",
      answer: "Absolutely. All your scripts and data are encrypted and stored securely. We never share your content with third parties and comply with all major privacy regulations.",
    },
    {
      question: "Can I use ScriptSlap for commercial purposes?",
      answer: "Yes! All plans allow commercial use of generated scripts. You own the rights to all content created with ScriptSlap.",
    },
    {
      question: "What languages are supported?",
      answer: "ScriptSlap supports multiple languages including English, Hindi, Hinglish, Spanish, and more. Language support varies by plan level.",
    },
    {
      question: "How accurate is the AI-generated content?",
      answer: "Our AI is trained on millions of viral scripts and consistently produces high-quality content. However, we recommend reviewing and customizing scripts to match your unique style and brand voice.",
    },
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "scriptslap.com@gmail.com",
      responseTime: "Usually within 4 hours",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available 24/7",
      responseTime: "Instant response",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us directly",
      contact: "+91 8670033276",
      responseTime: "Business hours only",
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
            <HelpCircle className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Help Center</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading mb-6">
            How can we{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              help you?
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-body mb-8 max-w-2xl mx-auto">
            Find answers to your questions, learn how to use ScriptSlap, and get the most out of our AI-powered script generation.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-card border-border"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-8 text-center">Browse by Category</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="border-border bg-card hover:border-primary/50 transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-heading">{category.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <Link to="#" className="text-sm text-body hover:text-primary transition-colors block py-1">
                            {article}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-body">
              Quick answers to common questions about ScriptSlap
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-medium text-heading">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-body pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-4">
              Still need help?
            </h2>
            <p className="text-lg text-body">
              Our support team is here to help you succeed
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {contactOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <Card key={index} className="border-border bg-card text-center hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-heading">{option.title}</CardTitle>
                    <p className="text-body">{option.description}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-heading mb-2">{option.contact}</p>
                    <p className="text-sm text-muted-foreground mb-4">{option.responseTime}</p>
                    <Button className="w-full">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
