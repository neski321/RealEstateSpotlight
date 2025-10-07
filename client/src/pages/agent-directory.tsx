import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  MessageCircle,
  Award,
  Calendar,
  Filter,
  SortAsc,
  Building,
  Home,
  TrendingUp
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const agents = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Real Estate Agent",
    company: "Premier Realty Group",
    location: "Downtown District",
    specialties: ["Luxury Homes", "First-Time Buyers", "Investment Properties"],
    experience: "8 years",
    rating: 4.9,
    reviews: 127,
    sales: 89,
    priceRange: "$200K - $2M",
    languages: ["English", "Spanish"],
    image: "/api/placeholder/100/100",
    phone: "(555) 123-4567",
    email: "sarah.johnson@premierrealty.com",
    bio: "Specializing in luxury properties and first-time home buyers with over 8 years of experience in the downtown market.",
    featured: true,
    verified: true,
    responseTime: "Within 2 hours",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Real Estate Broker",
    company: "Metro Properties",
    location: "Suburbs North",
    specialties: ["Commercial", "New Construction", "Relocation"],
    experience: "12 years",
    rating: 4.8,
    reviews: 203,
    sales: 156,
    priceRange: "$150K - $5M",
    languages: ["English", "Mandarin"],
    image: "/api/placeholder/100/100",
    phone: "(555) 234-5678",
    email: "michael.chen@metroproperties.com",
    bio: "Expert in commercial real estate and new construction with extensive knowledge of the northern suburbs.",
    featured: true,
    verified: true,
    responseTime: "Within 1 hour",
    lastActive: "1 hour ago"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Associate Broker",
    company: "Coastal Real Estate",
    location: "Waterfront District",
    specialties: ["Waterfront Properties", "Luxury Condos", "Vacation Rentals"],
    experience: "6 years",
    rating: 4.7,
    reviews: 89,
    sales: 67,
    priceRange: "$300K - $3M",
    languages: ["English", "Spanish", "French"],
    image: "/api/placeholder/100/100",
    phone: "(555) 345-6789",
    email: "emily.rodriguez@coastalrealestate.com",
    bio: "Waterfront property specialist with expertise in luxury condos and vacation rental investments.",
    featured: false,
    verified: true,
    responseTime: "Within 3 hours",
    lastActive: "4 hours ago"
  },
  {
    id: 4,
    name: "David Thompson",
    title: "Real Estate Agent",
    company: "Heritage Properties",
    location: "Historic District",
    specialties: ["Historic Homes", "Fix & Flip", "Investment Properties"],
    experience: "5 years",
    rating: 4.6,
    reviews: 76,
    sales: 54,
    priceRange: "$100K - $800K",
    languages: ["English"],
    image: "/api/placeholder/100/100",
    phone: "(555) 456-7890",
    email: "david.thompson@heritageproperties.com",
    bio: "Historic home specialist with experience in restoration projects and investment property acquisitions.",
    featured: false,
    verified: true,
    responseTime: "Within 4 hours",
    lastActive: "6 hours ago"
  },
  {
    id: 5,
    name: "Lisa Park",
    title: "Senior Associate",
    company: "Urban Realty",
    location: "City Center",
    specialties: ["Condos", "Lofts", "First-Time Buyers"],
    experience: "4 years",
    rating: 4.8,
    reviews: 95,
    sales: 72,
    priceRange: "$200K - $1.5M",
    languages: ["English", "Korean"],
    image: "/api/placeholder/100/100",
    phone: "(555) 567-8901",
    email: "lisa.park@urbanrealty.com",
    bio: "City living expert specializing in condos and lofts, helping young professionals find their perfect urban home.",
    featured: false,
    verified: true,
    responseTime: "Within 2 hours",
    lastActive: "3 hours ago"
  },
  {
    id: 6,
    name: "Robert Martinez",
    title: "Real Estate Broker",
    company: "Family First Realty",
    location: "Suburbs South",
    specialties: ["Family Homes", "Schools", "Relocation"],
    experience: "15 years",
    rating: 4.9,
    reviews: 312,
    sales: 234,
    priceRange: "$250K - $1.2M",
    languages: ["English", "Spanish"],
    image: "/api/placeholder/100/100",
    phone: "(555) 678-9012",
    email: "robert.martinez@familyfirstrealty.com",
    bio: "Family-focused agent with deep knowledge of school districts and family-friendly neighborhoods.",
    featured: false,
    verified: true,
    responseTime: "Within 1 hour",
    lastActive: "1 hour ago"
  }
];

const specialties = [
  "All Specialties",
  "Luxury Homes",
  "First-Time Buyers",
  "Investment Properties",
  "Commercial",
  "New Construction",
  "Relocation",
  "Waterfront Properties",
  "Luxury Condos",
  "Vacation Rentals",
  "Historic Homes",
  "Fix & Flip",
  "Condos",
  "Lofts",
  "Family Homes",
  "Schools"
];

const locations = [
  "All Locations",
  "Downtown District",
  "Suburbs North",
  "Waterfront District",
  "Historic District",
  "City Center",
  "Suburbs South"
];

const AgentCard = ({ agent }: { agent: typeof agents[0] }) => (
  <Card className="group hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={agent.image} alt={agent.name} />
            <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {agent.name}
              </CardTitle>
              {agent.verified && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {agent.title} • {agent.company}
            </CardDescription>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{agent.location}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{agent.rating}</span>
            <span className="text-sm text-muted-foreground">({agent.reviews})</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {agent.sales} sales
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">Specialties:</h4>
          <div className="flex flex-wrap gap-1">
            {agent.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {agent.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Experience:</span>
            <span className="ml-2 font-medium">{agent.experience}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Price Range:</span>
            <span className="ml-2 font-medium">{agent.priceRange}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Response Time:</span>
            <span className="ml-2 font-medium">{agent.responseTime}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Languages:</span>
            <span className="ml-2 font-medium">{agent.languages.join(", ")}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {agent.bio}
        </p>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AgentDirectory() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Agent Directory</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with experienced real estate professionals who can help you buy, sell, or invest in properties
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search agents by name, company, or specialty..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {agents.length} agents found
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select defaultValue="rating">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
        </div>

        {/* Featured Agents */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.filter(agent => agent.featured).map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* All Agents */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Agents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground">Expert Agents</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
                  <div className="text-muted-foreground">Properties Sold</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">4.8</div>
                  <div className="text-muted-foreground">Average Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <div className="text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-200 dark:border-green-800">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Work with an Agent?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get matched with the perfect agent for your needs. Our team will connect you with a verified professional who specializes in your area and property type.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <Users className="h-4 w-4 mr-2" />
                  Find My Agent
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Consultation
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
