import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Zap,
  Check,
  Star,
  ArrowRight,
  Sparkles,
  Crown,
  Rocket,
  Shield,
  HeadphonesIcon,
  Users,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = {
    monthly: [
      {
        name: "Free Trial",
        price: "0",
        period: "15 credits",
        description: "Perfect for trying out ScriptSlap",
        popular: false,
        features: [
          "15 free credits",
          "1-2 complete scripts",
          "AI script generation",
          "Basic editing tools",
          "Standard video formats",
          "Email support",
        ],
        buttonText: "Start Free Trial",
        buttonVariant: "outline" as const,
        icon: Sparkles,
        gradient: "from-gray-500 to-gray-600",
      },
      {
        name: "Creator",
        price: "29",
        period: "month",
        description: "For serious content creators",
        popular: true,
        features: [
          "300 credits per month",
          "30+ complete scripts",
          "Advanced AI features",
          "Style emulation from URLs",
          "B-roll suggestions",
          "Multi-language support",
          "Priority generation",
          "Advanced editing tools",
          "Export options",
          "Priority support",
        ],
        buttonText: "Start Creating",
        buttonVariant: "default" as const,
        icon: Crown,
        gradient: "from-primary to-purple-600",
      },
      {
        name: "Pro",
        price: "99",
        period: "month",
        description: "For teams and agencies",
        popular: false,
        features: [
          "1000 credits per month",
          "100+ complete scripts",
          "Everything in Creator",
          "Team collaboration",
          "Custom templates",
          "Analytics dashboard",
          "API access",
          "White-label options",
          "Dedicated support",
          "Custom integrations",
        ],
        buttonText: "Go Pro",
        buttonVariant: "outline" as const,
        icon: Rocket,
        gradient: "from-purple-600 to-blue-600",
      },
    ],
    yearly: [
      {
        name: "Free Trial",
        price: "0",
        period: "15 credits",
        description: "Perfect for trying out ScriptSlap",
        popular: false,
        features: [
          "15 free credits",
          "1-2 complete scripts",
          "AI script generation",
          "Basic editing tools",
          "Standard video formats",
          "Email support",
        ],
        buttonText: "Start Free Trial",
        buttonVariant: "outline" as const,
        icon: Sparkles,
        gradient: "from-gray-500 to-gray-600",
      },
      {
        name: "Creator",
        price: "290",
        period: "year",
        originalPrice: "348",
        description: "For serious content creators",
        popular: true,
        features: [
          "300 credits per month",
          "30+ complete scripts",
          "Advanced AI features",
          "Style emulation from URLs",
          "B-roll suggestions",
          "Multi-language support",
          "Priority generation",
          "Advanced editing tools",
          "Export options",
          "Priority support",
        ],
        buttonText: "Start Creating",
        buttonVariant: "default" as const,
        icon: Crown,
        gradient: "from-primary to-purple-600",
      },
      {
        name: "Pro",
        price: "990",
        period: "year",
        originalPrice: "1188",
        description: "For teams and agencies",
        popular: false,
        features: [
          "1000 credits per month",
          "100+ complete scripts",
          "Everything in Creator",
          "Team collaboration",
          "Custom templates",
          "Analytics dashboard",
          "API access",
          "White-label options",
          "Dedicated support",
          "Custom integrations",
        ],
        buttonText: "Go Pro",
        buttonVariant: "outline" as const,
        icon: Rocket,
        gradient: "from-purple-600 to-blue-600",
      },
    ],
  };

  const faqs = [
    {
      question: "What are credits and how do they work?",
      answer: "Credits are used for AI operations. Script generation costs 3 credits, and each refinement (hook, CTA, paragraph) costs 1 credit. Credits reset monthly with your subscription.",
    },
    {
      question: "Can I change my plan anytime?",
      answer: "Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at your next billing cycle, and unused credits don't roll over.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
    },
    {
      question: "Is there a team plan?",
      answer: "Yes! Our Pro plan includes team collaboration features. For larger teams (10+ users), contact us for custom enterprise pricing.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and UPI payments through Razorpay. All transactions are secure and encrypted.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
            <Star className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-heading mb-6">
            Choose the{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              perfect plan
            </span>{" "}
            for your needs
          </h1>
          
          <p className="text-lg sm:text-xl text-body leading-relaxed max-w-2xl mx-auto mb-12">
            Start free and scale as you grow. All plans include our core AI features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <Tabs value={billingCycle} onValueChange={(value: "monthly" | "yearly") => setBillingCycle(value)} className="mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-muted/50">
              <TabsTrigger value="monthly" className="font-medium">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="font-medium">
                Yearly
                <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600 border-0">
                  Save 17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans[billingCycle].map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.name} 
                  className={`relative border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 ${
                    plan.popular ? 'border-primary bg-card shadow-lg shadow-primary/25' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white border-0">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <CardTitle className="text-2xl text-heading mb-2">{plan.name}</CardTitle>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-heading">
                          {plan.price === "0" ? "Free" : `$${plan.price}`}
                        </span>
                        {plan.price !== "0" && (
                          <span className="text-lg text-muted-foreground ml-1">/{plan.period}</span>
                        )}
                      </div>
                      {plan.originalPrice && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="line-through">${plan.originalPrice}</span>
                          <span className="ml-2 text-green-600 font-medium">Save ${parseInt(plan.originalPrice) - parseInt(plan.price)}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-body">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-body text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link to="/signup" className="block">
                      <Button 
                        variant={plan.buttonVariant} 
                        size="lg" 
                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90' : ''}`}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
              Why choose ScriptSlap?
            </h2>
            <p className="text-lg text-body">
              Powerful features that help you create viral content faster
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">Secure & Private</h3>
              <p className="text-body text-sm">Your scripts and data are encrypted and never shared with third parties.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <HeadphonesIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">24/7 Support</h3>
              <p className="text-body text-sm">Get help whenever you need it with our responsive support team.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">Team Collaboration</h3>
              <p className="text-body text-sm">Work together with your team in real-time on script projects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-body">
              Everything you need to know about ScriptSlap pricing
            </p>
          </div>
          
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border pb-8 last:border-b-0">
                <h3 className="text-lg font-semibold text-heading mb-3">{faq.question}</h3>
                <p className="text-body">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-6">
            Ready to create viral scripts?
          </h2>
          <p className="text-lg text-body mb-8 max-w-2xl mx-auto">
            Join thousands of creators who trust ScriptSlap to generate millions of views. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
