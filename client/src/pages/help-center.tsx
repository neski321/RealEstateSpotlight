import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Home,
  Calculator,
  Users,
  FileText,
  CreditCard,
  Shield,
  Phone,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: Home,
      title: "Property Search",
      description: "Find your perfect home",
      articles: [
        "How to search for properties",
        "Understanding property filters",
        "Saving favorite properties",
        "Setting up property alerts",
      ],
    },
    {
      icon: Calculator,
      title: "Mortgage Calculator",
      description: "Calculate your payments",
      articles: [
        "Using the mortgage calculator",
        "Understanding interest rates",
        "Down payment requirements",
        "Loan term options",
      ],
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Manage your profile",
      articles: [
        "Creating an account",
        "Updating profile information",
        "Managing notifications",
        "Deleting your account",
      ],
    },
    {
      icon: FileText,
      title: "Buying Process",
      description: "Navigate home buying",
      articles: ["Steps to buying a home", "Making an offer", "Home inspection process", "Closing procedures"],
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Subscription and payments",
      articles: ["Premium subscription benefits", "Payment methods", "Billing cycles", "Refund policy"],
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your data protection",
      articles: [
        "Data privacy practices",
        "Account security tips",
        "Two-factor authentication",
        "Reporting security issues",
      ],
    },
  ];

  const popularArticles = [
    "How to get pre-approved for a mortgage",
    "Understanding property market trends",
    "First-time home buyer guide",
    "Property valuation methods",
    "Real estate agent selection",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-6xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">PropertyHub Help Center</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">Find answers to your questions and get the help you need</p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-3"
            />
          </div>
        </div>

        {/* Popular Articles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Popular Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularArticles.map((article, index) => (
                <div key={index} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span>{article}</span>
                  <Badge variant="secondary" className="ml-auto">
                    Popular
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <div
                      key={articleIndex}
                      className="flex items-center gap-2 text-sm hover:text-primary cursor-pointer"
                    >
                      <ChevronRight className="h-3 w-3" />
                      <span>{article}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@propertyhub.com</p>
              </div>
              <Separator orientation="vertical" className="hidden sm:block" />
              <div className="text-center">
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">1-800-PROPERTY</p>
              </div>
              <Separator orientation="vertical" className="hidden sm:block" />
              <div className="text-center">
                <p className="font-medium">Live Chat</p>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 