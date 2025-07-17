import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Settings, BarChart3, Target, Shield, Globe } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function CookiePolicy() {
  const [cookieSettings, setCookieSettings] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    marketing: false,
    preferences: true,
  });

  const cookieTypes = [
    {
      icon: Shield,
      title: "Essential Cookies",
      description: "Required for basic website functionality",
      required: true,
      examples: [
        "User authentication and session management",
        "Security and fraud prevention",
        "Load balancing and performance optimization",
        "Form submission and error handling",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies",
      description: "Help us understand how visitors use our website",
      required: false,
      examples: [
        "Google Analytics for website traffic analysis",
        "User behavior tracking and heatmaps",
        "Performance monitoring and optimization",
        "A/B testing and feature usage statistics",
      ],
    },
    {
      icon: Target,
      title: "Marketing Cookies",
      description: "Used to deliver personalized advertisements",
      required: false,
      examples: [
        "Targeted advertising based on interests",
        "Social media integration and sharing",
        "Retargeting campaigns and conversion tracking",
        "Third-party advertising networks",
      ],
    },
    {
      icon: Settings,
      title: "Preference Cookies",
      description: "Remember your settings and preferences",
      required: false,
      examples: [
        "Language and region preferences",
        "Theme and display settings",
        "Saved search filters and favorites",
        "Notification preferences",
      ],
    },
  ];

  const handleSaveSettings = () => {
    // Save cookie preferences
    console.log("Cookie settings saved:", cookieSettings);
    // In a real app, this would update the user's cookie preferences
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-4xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cookie className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            Learn about how PropertyHub uses cookies and similar technologies to enhance your experience.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: January 15, 2024 | Effective date: January 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files that are stored on your device when you visit our website. They help us
              provide you with a better experience by remembering your preferences, analyzing how you use our site, and
              personalizing content and advertisements.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, and how you
              can control your cookie preferences. By using PropertyHub, you consent to the use of cookies in accordance
              with this policy.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Manage your cookie preferences below. Essential cookies cannot be disabled as they are necessary for the
              website to function properly.
            </p>

            <div className="space-y-6">
              {cookieTypes.map((type, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <type.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={type.title.toLowerCase().replace(" ", "-")}
                        checked={
                          type.required ||
                          cookieSettings[type.title.toLowerCase().split(" ")[0] as keyof typeof cookieSettings]
                        }
                        onCheckedChange={(checked) => {
                          if (!type.required) {
                            setCookieSettings((prev) => ({
                              ...prev,
                              [type.title.toLowerCase().split(" ")[0]]: checked,
                            }));
                          }
                        }}
                        disabled={type.required}
                      />
                      <Label htmlFor={type.title.toLowerCase().replace(" ", "-")}> 
                        {type.required ? "Required" : "Optional"}
                      </Label>
                    </div>
                  </div>

                  <div className="ml-11">
                    <p className="text-sm font-medium mb-2">Examples:</p>
                    <ul className="space-y-1">
                      {type.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={handleSaveSettings} className="flex-1">
                Save Preferences
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCookieSettings({
                    essential: true,
                    analytics: false,
                    marketing: false,
                    preferences: false,
                  })
                }
              >
                Reject All Optional
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCookieSettings({
                    essential: true,
                    analytics: true,
                    marketing: true,
                    preferences: true,
                  })
                }
              >
                Accept All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Third-Party Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Google Analytics for website analytics</li>
                <li>• Google Maps for property location services</li>
                <li>• Social media platforms for sharing features</li>
                <li>• Payment processors for secure transactions</li>
                <li>• Customer support chat services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">You can control cookies through various methods:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Browser settings and preferences</li>
                <li>• Our cookie preference center (above)</li>
                <li>• Third-party opt-out tools</li>
                <li>• Private/incognito browsing mode</li>
                <li>• Browser extensions and plugins</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">Different cookies have different lifespans:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Session cookies: Deleted when you close your browser</li>
                <li>• Persistent cookies: Remain until expiration or deletion</li>
                <li>• Analytics cookies: Typically expire after 2 years</li>
                <li>• Marketing cookies: Usually expire after 30-90 days</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
                updated policy on our website and updating the "Last updated" date.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Questions About Cookies?</h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Email:</strong> privacy@propertyhub.com
              </p>
              <p>
                <strong>Phone:</strong> 1-800-PROPERTY
              </p>
              <p>
                <strong>Mail:</strong> PropertyHub Privacy Team, 123 Real Estate Ave, Suite 100, New York, NY 10001
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 