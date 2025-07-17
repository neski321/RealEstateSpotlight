import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, AlertTriangle, Shield, CreditCard, Users } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function TermsOfService() {
  const sections = [
    {
      icon: Users,
      title: "User Accounts and Responsibilities",
      content: [
        "You must be at least 18 years old to create an account",
        "Provide accurate and complete information during registration",
        "Maintain the security of your account credentials",
        "You are responsible for all activities under your account",
        "Notify us immediately of any unauthorized account access",
        "One account per person; multiple accounts are prohibited",
      ],
    },
    {
      icon: Shield,
      title: "Acceptable Use Policy",
      content: [
        "Use the Service only for lawful purposes",
        "Do not attempt to gain unauthorized access to our systems",
        "Respect intellectual property rights of PropertyHub and others",
        "Do not post false, misleading, or fraudulent property information",
        "Refrain from harassment, spam, or abusive behavior",
        "Do not use automated tools to scrape or collect data",
      ],
    },
    {
      icon: FileText,
      title: "Property Listings and Information",
      content: [
        "Property information is provided for informational purposes only",
        "We do not guarantee accuracy of all property details",
        "Listings may be subject to errors, omissions, or changes",
        "Property availability and pricing may change without notice",
        "Users should verify all information independently",
        "We are not responsible for decisions based on our listings",
      ],
    },
    {
      icon: CreditCard,
      title: "Subscription and Payment Terms",
      content: [
        "Premium subscriptions are billed monthly or annually",
        "All fees are non-refundable unless required by law",
        "Automatic renewal unless cancelled before billing cycle",
        "Price changes will be communicated 30 days in advance",
        "Failed payments may result in service suspension",
        "Cancellation takes effect at the end of current billing period",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers and Limitations",
      content: [
        "Service provided 'as is' without warranties of any kind",
        "We do not guarantee uninterrupted or error-free service",
        "PropertyHub is not a licensed real estate broker",
        "We do not provide legal, financial, or investment advice",
        "Users assume all risks associated with property transactions",
        "Our liability is limited to the amount paid for services",
      ],
    },
    {
      icon: Scale,
      title: "Dispute Resolution",
      content: [
        "Disputes will be resolved through binding arbitration",
        "Arbitration will be conducted under American Arbitration Association rules",
        "Class action lawsuits are waived",
        "New York law governs these terms",
        "Any legal proceedings must be filed in New York courts",
        "30-day notice required before initiating legal action",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-4xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            Please read these terms carefully before using PropertyHub's services.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: January 15, 2024 | Effective date: January 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your use of PropertyHub's website, mobile applications, and
              related services (collectively, the "Service") operated by PropertyHub Inc. ("PropertyHub," "we," "us," or
              "our").
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of
              these terms, then you may not access the Service. These Terms apply to all visitors, users, and others who
              access or use the Service.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Important Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                The Service and its original content, features, and functionality are and will remain the exclusive
                property of PropertyHub and its licensors.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Trademarks and logos are protected</li>
                <li>• User-generated content remains yours</li>
                <li>• Limited license granted for personal use</li>
                <li>• Respect third-party intellectual property</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                We reserve the right to modify or discontinue the Service at any time:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Features may be added or removed</li>
                <li>• Service availability may change</li>
                <li>• 30-day notice for major changes</li>
                <li>• No liability for modifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                We may terminate or suspend your account and access to the Service:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• For violations of these Terms</li>
                <li>• For fraudulent or illegal activity</li>
                <li>• At our sole discretion</li>
                <li>• With or without prior notice</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Our Service may contain links to third-party websites or services. We are not responsible for the
                content, privacy policies, or practices of any third-party websites or services. You acknowledge and
                agree that PropertyHub shall not be liable for any damage or loss caused by your use of any third-party
                content or services.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Questions About These Terms?</h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Email:</strong> legal@propertyhub.com
              </p>
              <p>
                <strong>Phone:</strong> 1-800-PROPERTY
              </p>
              <p>
                <strong>Mail:</strong> PropertyHub Legal Team, 123 Real Estate Ave, Suite 100, New York, NY 10001
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 