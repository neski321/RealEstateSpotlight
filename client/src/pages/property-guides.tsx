import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  Home, 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp,
  Shield,
  Calculator,
  MapPin,
  Clock,
  Star
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const guides = [
  {
    id: 1,
    title: "First-Time Home Buyer's Complete Guide",
    description: "Everything you need to know about buying your first home, from pre-approval to closing day.",
    category: "Buying",
    difficulty: "Beginner",
    readTime: "15 min",
    rating: 4.9,
    icon: Home,
    featured: true,
    topics: ["Pre-approval", "Down payments", "Closing costs", "Home inspection"]
  },
  {
    id: 2,
    title: "Real Estate Investment Strategies",
    description: "Learn proven strategies for building wealth through real estate investments.",
    category: "Investing",
    difficulty: "Intermediate",
    readTime: "20 min",
    rating: 4.8,
    icon: TrendingUp,
    featured: true,
    topics: ["Rental properties", "Fix and flip", "REITs", "Market analysis"]
  },
  {
    id: 3,
    title: "Selling Your Home: A Step-by-Step Guide",
    description: "Maximize your home's value and navigate the selling process with confidence.",
    category: "Selling",
    difficulty: "Intermediate",
    readTime: "18 min",
    rating: 4.7,
    icon: DollarSign,
    featured: false,
    topics: ["Pricing strategy", "Staging", "Marketing", "Negotiation"]
  },
  {
    id: 4,
    title: "Mortgage and Financing Options",
    description: "Understand different loan types, rates, and financing strategies for your property purchase.",
    category: "Financing",
    difficulty: "Beginner",
    readTime: "12 min",
    rating: 4.6,
    icon: Calculator,
    featured: false,
    topics: ["Loan types", "Interest rates", "Credit scores", "Down payments"]
  },
  {
    id: 5,
    title: "Property Management Best Practices",
    description: "Essential tips for managing rental properties and maximizing returns.",
    category: "Management",
    difficulty: "Advanced",
    readTime: "25 min",
    rating: 4.8,
    icon: Users,
    featured: false,
    topics: ["Tenant screening", "Maintenance", "Legal compliance", "Financial tracking"]
  },
  {
    id: 6,
    title: "Market Analysis and Trends",
    description: "How to analyze local markets and identify investment opportunities.",
    category: "Analysis",
    difficulty: "Advanced",
    readTime: "22 min",
    rating: 4.7,
    icon: FileText,
    featured: false,
    topics: ["Market indicators", "Location analysis", "Price trends", "Forecasting"]
  }
];

const categories = ["All", "Buying", "Selling", "Investing", "Financing", "Management", "Analysis"];

export default function PropertyGuides() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Property Guides</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert insights and comprehensive guides to help you navigate every aspect of real estate
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search guides..."
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

        {/* Featured Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.filter(guide => guide.featured).map((guide) => {
              const IconComponent = guide.icon;
              return (
                <Card key={guide.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {guide.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{guide.category}</Badge>
                            <Badge variant="outline">{guide.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {guide.rating}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {guide.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {guide.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {guide.topics.length} topics
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {guide.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {guide.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{guide.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button className="w-full">
                      Read Guide
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* All Guides */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const IconComponent = guide.icon;
              return (
                <Card key={guide.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {guide.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{guide.category}</Badge>
                            <Badge variant="outline" className="text-xs">{guide.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {guide.rating}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {guide.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {guide.readTime}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {guide.topics.slice(0, 2).map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {guide.topics.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{guide.topics.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" className="w-full">
                      Read Guide
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need Personalized Advice?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our expert agents are here to help you with specific questions about buying, selling, or investing in real estate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <Users className="h-4 w-4 mr-2" />
                  Find an Agent
                </Button>
                <Button variant="outline" size="lg">
                  <FileText className="h-4 w-4 mr-2" />
                  Get Market Report
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
