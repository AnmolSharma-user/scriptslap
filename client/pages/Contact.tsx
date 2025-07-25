import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["scriptslap.com@gmail.com", "scriptslap.com@gmail.com"],
      description: "Get help or discuss your needs",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 8670033276", "+91 8670033276"],
      description: "Speak with our team directly",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["123 Innovation Drive", "San Francisco, CA 94105"],
      description: "Our headquarters location",
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: ["Monday - Friday: 9 AM - 6 PM PST", "Saturday: 10 AM - 4 PM PST"],
      description: "When we're available",
    },
  ];

  const supportOptions = [
    {
      title: "General Support",
      description: "Questions about using ScriptSlap",
      responseTime: "4 hours",
      icon: MessageCircle,
    },
    {
      title: "Technical Issues",
      description: "Bug reports and technical problems",
      responseTime: "2 hours",
      icon: Zap,
    },
    {
      title: "Sales Inquiries",
      description: "Pricing, plans, and enterprise solutions",
      responseTime: "1 hour",
      icon: Phone,
    },
    {
      title: "Partnership",
      description: "Integration and partnership opportunities",
      responseTime: "24 hours",
      icon: Mail,
    },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-heading mb-4">Message Sent!</h1>
          <p className="text-body mb-8">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <div className="space-y-4">
            <Button onClick={() => setIsSubmitted(false)} className="w-full">
              Send Another Message
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <MessageCircle className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Contact Us</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              touch
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-body mb-8 max-w-2xl mx-auto">
            Have questions about ScriptSlap? Need help with your account? Want to discuss enterprise solutions? We're here to help.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-heading">Send us a message</CardTitle>
                <p className="text-body">Fill out the form below and we'll get back to you soon.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Your company name (optional)"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Support</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="sales">Sales Inquiry</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="bg-background border-border min-h-[120px] resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-heading mb-6">Contact Information</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <Card key={index} className="border-border bg-card">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-heading mb-1">{info.title}</h3>
                              {info.details.map((detail, detailIndex) => (
                                <p key={detailIndex} className="text-sm text-body">{detail}</p>
                              ))}
                              <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Support Options */}
              <div>
                <h3 className="text-xl font-bold text-heading mb-4">Response Times</h3>
                <div className="space-y-4">
                  {supportOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-border bg-card/50">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-heading">{option.title}</h4>
                          <p className="text-sm text-body">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">~{option.responseTime}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
