import { Link } from "react-router-dom";
import { Zap, Twitter, Github, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-border/50">
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-heading">ScriptSlap</span>
            </Link>
            <p className="text-body text-sm mb-4 max-w-xs">
              Create viral YouTube scripts with AI-powered content generation and advanced editing tools.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/scriptslap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://github.com/scriptslap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/company/scriptslap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:scriptslap.com@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-heading mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-body hover:text-primary transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-body hover:text-primary transition-colors text-sm">
                  Script History
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-body hover:text-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#features" className="text-body hover:text-primary transition-colors text-sm">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-heading mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-body hover:text-primary transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-body hover:text-primary transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-body hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-body hover:text-primary transition-colors text-sm">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-heading mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-body hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-body hover:text-primary transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#" className="text-body hover:text-primary transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-body hover:text-primary transition-colors text-sm">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4 md:mb-0">
              <span>© 2024 ScriptSlap. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for content creators.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-muted-foreground">
                Status: <span className="text-green-500">All systems operational</span>
              </span>
              <div className="flex items-center space-x-4">
                <a href="/changelog" className="text-body hover:text-primary transition-colors">
                  Changelog
                </a>
                <a href="/blog" className="text-body hover:text-primary transition-colors">
                  Blog
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
