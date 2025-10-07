import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Search, 
  DollarSign, 
  Home, 
  Building, 
  Calculator,
  Target,
  Shield,
  Lightbulb,
  BookOpen,
  Star,
  Clock,
  Users,
  MapPin,
  BarChart3
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const investmentTips = [
  {
    id: 1,
    title: "Location, Location, Location: The Golden Rule",
    description: "Why location is the most critical factor in real estate investment success and how to identify prime locations.",
    category: "Location Analysis",
    difficulty: "Beginner",
    readTime: "8 min",
    rating: 4.9,
    icon: MapPin,
    featured: true,
    keyPoints: [
      "Research neighborhood growth trends",
      "Check proximity to amenities and transportation",
      "Analyze local job market and demographics",
      "Consider future development plans"
    ]
  },
  {
    id: 2,
    title: "Cash Flow vs. Appreciation: Finding the Balance",
    description: "Understanding the difference between cash flow and appreciation strategies and when to use each approach.",
    category: "Strategy",
    difficulty: "Intermediate",
    readTime: "12 min",
    rating: 4.8,
    icon: BarChart3,
    featured: true,
    keyPoints: [
      "Calculate positive cash flow requirements",
      "Identify appreciation potential markets",
      "Balance short-term income with long-term growth",
      "Consider tax implications of each strategy"
    ]
  },
  {
    id: 3,
    title: "The 1% Rule: Quick Investment Screening",
    description: "Learn the 1% rule for quickly evaluating rental property investment potential and its limitations.",
    category: "Analysis",
    difficulty: "Beginner",
    readTime: "6 min",
    rating: 4.7,
    icon: Calculator,
    featured: false,
    keyPoints: [
      "Monthly rent should be 1% of purchase price",
      "Use as initial screening tool only",
      "Consider local market variations",
      "Factor in all expenses, not just mortgage"
    ]
  },
  {
    id: 4,
    title: "Leverage: The Double-Edged Sword",
    description: "How to use leverage effectively to maximize returns while managing risk in real estate investments.",
    category: "Financing",
    difficulty: "Advanced",
    readTime: "15 min",
    rating: 4.6,
    icon: DollarSign,
    featured: false,
    keyPoints: [
      "Understand loan-to-value ratios",
      "Calculate return on equity",
      "Manage interest rate risk",
      "Plan for refinancing opportunities"
    ]
  },
  {
    id: 5,
    title: "Property Management: DIY vs. Professional",
    description: "Weighing the pros and cons of self-managing rental properties versus hiring professional management.",
    category: "Management",
    difficulty: "Intermediate",
    readTime: "10 min",
    rating: 4.8,
    icon: Users,
    featured: false,
    keyPoints: [
      "Calculate management cost vs. time investment",
      "Consider your location and availability",
      "Evaluate property complexity and tenant base",
      "Plan for scaling your portfolio"
    ]
  },
  {
    id: 6,
    title: "Tax Strategies for Real Estate Investors",
    description: "Essential tax strategies, deductions, and structures to maximize your real estate investment returns.",
    category: "Tax Planning",
    difficulty: "Advanced",
    readTime: "18 min",
    rating: 4.9,
    icon: Shield,
    featured: false,
    keyPoints: [
      "Depreciation and cost segregation",
      "1031 exchanges for tax deferral",
      "Entity structure considerations",
      "Record keeping and documentation"
    ]
  }
];

const marketInsights = [
  {
    title: "Emerging Markets to Watch",
    description: "Identify up-and-coming neighborhoods with strong growth potential",
    icon: TrendingUp,
    color: "text-green-600"
  },
  {
    title: "Market Timing Strategies",
    description: "Learn when to buy, sell, or hold based on market cycles",
    icon: Clock,
    color: "text-blue-600"
  },
  {
    title: "Risk Management",
    description: "Protect your investments with proper insurance and diversification",
    icon: Shield,
    color: "text-red-600"
  },
  {
    title: "Exit Strategies",
    description: "Plan your exit strategy before you even buy your first property",
    icon: Target,
    color: "text-purple-600"
  }
];

const calculators = [
  {
    title: "Rental Property Calculator",
    description: "Calculate cash flow, cap rate, and ROI for rental properties",
    icon: Calculator,
    features: ["Cash flow analysis", "Cap rate calculation", "ROI projections", "Break-even analysis"]
  },
  {
    title: "Fix & Flip Calculator",
    description: "Analyze potential profits for fix and flip investments",
    icon: Home,
    features: ["Purchase analysis", "Renovation costs", "Holding costs", "Profit projections"]
  },
  {
    title: "BRRRR Calculator",
    description: "Calculate Buy, Rehab, Rent, Refinance, Repeat strategy returns",
    icon: Building,
    features: ["Initial investment", "Rehab costs", "Rental income", "Refinance analysis"]
  }
];

const categories = ["All", "Strategy", "Location Analysis", "Financing", "Management", "Tax Planning", "Analysis"];

export default function InvestmentTips() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Investment Tips</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert insights and proven strategies to help you build wealth through real estate investment
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search investment tips..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs for different content types */}
        <Tabs defaultValue="tips" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tips">Investment Tips</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="calculators">Calculators</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
          </TabsList>

          {/* Investment Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            {/* Featured Tips */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Featured Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {investmentTips.filter(tip => tip.featured).map((tip) => {
                  const IconComponent = tip.icon;
                  return (
                    <Card key={tip.id} className="group hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {tip.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{tip.category}</Badge>
                                <Badge variant="outline">{tip.difficulty}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {tip.rating}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base mb-4">
                          {tip.description}
                        </CardDescription>
                        <div className="space-y-2 mb-4">
                          <h4 className="font-semibold text-sm">Key Points:</h4>
                          <ul className="space-y-1">
                            {tip.keyPoints.slice(0, 3).map((point, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                            {tip.keyPoints.length > 3 && (
                              <li className="text-sm text-muted-foreground">
                                +{tip.keyPoints.length - 3} more key points
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {tip.readTime}
                            </div>
                          </div>
                          <Button>Read Full Tip</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* All Tips */}
            <div>
              <h2 className="text-2xl font-bold mb-6">All Investment Tips</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investmentTips.map((tip) => {
                  const IconComponent = tip.icon;
                  return (
                    <Card key={tip.id} className="group hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {tip.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{tip.category}</Badge>
                                <Badge variant="outline" className="text-xs">{tip.difficulty}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {tip.rating}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {tip.description}
                        </CardDescription>
                        <div className="space-y-2 mb-4">
                          <h4 className="font-semibold text-sm">Key Points:</h4>
                          <ul className="space-y-1">
                            {tip.keyPoints.slice(0, 2).map((point, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                            {tip.keyPoints.length > 2 && (
                              <li className="text-sm text-muted-foreground">
                                +{tip.keyPoints.length - 2} more points
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {tip.readTime}
                          </div>
                          <Button variant="outline" size="sm">Read More</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Market Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketInsights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <IconComponent className={`h-6 w-6 ${insight.color}`} />
                        {insight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {insight.description}
                      </CardDescription>
                      <Button variant="outline" className="w-full">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Calculators Tab */}
          <TabsContent value="calculators" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {calculators.map((calculator, index) => {
                const IconComponent = calculator.icon;
                return (
                  <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        {calculator.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {calculator.description}
                      </CardDescription>
                      <div className="space-y-2 mb-4">
                        <h4 className="font-semibold text-sm">Features:</h4>
                        <ul className="space-y-1">
                          {calculator.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button className="w-full">
                        Use Calculator
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100">Buy and Hold</CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    Long-term rental strategy for steady income and appreciation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant="secondary">Low-Medium</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Horizon:</span>
                      <span className="text-sm font-medium">5+ years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capital Required:</span>
                      <span className="text-sm font-medium">20-25% down</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Learn Strategy
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-900 dark:text-green-100">Fix and Flip</CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Short-term strategy for quick profits through renovation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant="destructive">High</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Horizon:</span>
                      <span className="text-sm font-medium">3-12 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capital Required:</span>
                      <span className="text-sm font-medium">All cash or hard money</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Learn Strategy
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-900 dark:text-purple-100">BRRRR Method</CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-300">
                    Buy, Rehab, Rent, Refinance, Repeat for portfolio growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant="secondary">Medium</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Horizon:</span>
                      <span className="text-sm font-medium">6-18 months per cycle</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capital Required:</span>
                      <span className="text-sm font-medium">Initial cash + rehab funds</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Learn Strategy
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-orange-900 dark:text-orange-100">Wholesaling</CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    Find deals and assign contracts to other investors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant="secondary">Low</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Time Horizon:</span>
                      <span className="text-sm font-medium">30-90 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capital Required:</span>
                      <span className="text-sm font-medium">Minimal (earnest money)</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Learn Strategy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-green-500/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Investing?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get personalized investment advice and access to exclusive off-market deals from our expert team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Get Investment Consultation
                </Button>
                <Button variant="outline" size="lg">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Download Investment Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
