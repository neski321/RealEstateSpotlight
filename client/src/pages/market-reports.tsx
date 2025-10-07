import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Download, 
  Calendar,
  MapPin,
  DollarSign,
  Home,
  Building,
  Filter,
  RefreshCw
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const marketData = {
  overview: {
    averagePrice: 485000,
    priceChange: 5.2,
    daysOnMarket: 28,
    inventoryLevel: 2.1,
    newListings: 156,
    closedSales: 142
  },
  trends: [
    { month: "Jan", price: 465000, sales: 120, inventory: 2.3 },
    { month: "Feb", price: 472000, sales: 135, inventory: 2.1 },
    { month: "Mar", price: 478000, sales: 148, inventory: 1.9 },
    { month: "Apr", price: 481000, sales: 142, inventory: 2.0 },
    { month: "May", price: 485000, sales: 156, inventory: 2.1 },
    { month: "Jun", price: 489000, sales: 162, inventory: 1.8 }
  ],
  neighborhoods: [
    { name: "Downtown", avgPrice: 520000, priceChange: 6.1, sales: 45, daysOnMarket: 22 },
    { name: "Suburbs North", avgPrice: 445000, priceChange: 4.8, sales: 38, daysOnMarket: 31 },
    { name: "Suburbs South", avgPrice: 465000, priceChange: 5.5, sales: 42, daysOnMarket: 26 },
    { name: "Waterfront", avgPrice: 680000, priceChange: 7.2, sales: 28, daysOnMarket: 18 },
    { name: "Historic District", avgPrice: 395000, priceChange: 3.9, sales: 35, daysOnMarket: 35 }
  ],
  propertyTypes: [
    { type: "Single Family", avgPrice: 485000, priceChange: 5.2, sales: 98, marketShare: 69 },
    { type: "Condo", avgPrice: 365000, priceChange: 4.8, sales: 32, marketShare: 23 },
    { type: "Townhouse", avgPrice: 425000, priceChange: 5.8, sales: 12, marketShare: 8 }
  ]
};

const reports = [
  {
    id: 1,
    title: "Monthly Market Summary - June 2024",
    description: "Comprehensive analysis of market trends, pricing, and inventory levels for the current month.",
    type: "Monthly",
    date: "2024-06-15",
    pages: 12,
    downloads: 234,
    featured: true
  },
  {
    id: 2,
    title: "Neighborhood Spotlight: Downtown District",
    description: "Deep dive into the downtown market with detailed property analysis and investment opportunities.",
    type: "Neighborhood",
    date: "2024-06-10",
    pages: 8,
    downloads: 156,
    featured: true
  },
  {
    id: 3,
    title: "Investment Property Analysis Q2 2024",
    description: "Analysis of rental yields, cap rates, and investment potential across different property types.",
    type: "Investment",
    date: "2024-06-05",
    pages: 15,
    downloads: 189,
    featured: false
  },
  {
    id: 4,
    title: "First-Time Buyer Market Report",
    description: "Market conditions and opportunities specifically for first-time home buyers.",
    type: "Buyer Guide",
    date: "2024-05-28",
    pages: 10,
    downloads: 312,
    featured: false
  },
  {
    id: 5,
    title: "Luxury Market Trends",
    description: "Analysis of high-end properties and luxury market dynamics.",
    type: "Luxury",
    date: "2024-05-20",
    pages: 6,
    downloads: 98,
    featured: false
  },
  {
    id: 6,
    title: "Foreclosure and Distressed Properties",
    description: "Opportunities in the distressed property market and foreclosure trends.",
    type: "Investment",
    date: "2024-05-15",
    pages: 9,
    downloads: 145,
    featured: false
  }
];

const StatCard = ({ title, value, change, icon: Icon, format = "currency" }: {
  title: string;
  value: number;
  change: number;
  icon: any;
  format?: "currency" | "number" | "percentage";
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
      case "percentage":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
            <div className="flex items-center gap-1 mt-1">
              {change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MarketReports() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Market Reports</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive market analysis and data-driven insights to help you make informed real estate decisions
          </p>
        </div>

        {/* Market Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Average Home Price"
              value={marketData.overview.averagePrice}
              change={marketData.overview.priceChange}
              icon={DollarSign}
            />
            <StatCard
              title="Days on Market"
              value={marketData.overview.daysOnMarket}
              change={-8.2}
              icon={Calendar}
              format="number"
            />
            <StatCard
              title="Inventory Level"
              value={marketData.overview.inventoryLevel}
              change={-12.5}
              icon={Home}
              format="number"
            />
            <StatCard
              title="New Listings"
              value={marketData.overview.newListings}
              change={15.3}
              icon={TrendingUp}
              format="number"
            />
            <StatCard
              title="Closed Sales"
              value={marketData.overview.closedSales}
              change={8.7}
              icon={Building}
              format="number"
            />
            <StatCard
              title="Price Appreciation"
              value={marketData.overview.priceChange}
              change={marketData.overview.priceChange}
              icon={TrendingUp}
              format="percentage"
            />
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="reports" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Market Reports</TabsTrigger>
            <TabsTrigger value="neighborhoods">Neighborhoods</TabsTrigger>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="neighborhood">Neighborhood</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Featured Reports */}
            <div>
              <h3 className="text-xl font-bold mb-4">Featured Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.filter(report => report.featured).map((report) => (
                  <Card key={report.id} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {report.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{report.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Download className="h-4 w-4" />
                          {report.downloads}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {report.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {report.pages} pages
                        </span>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Reports */}
            <div>
              <h3 className="text-xl font-bold mb-4">All Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <Card key={report.id} className="group hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {report.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{report.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Download className="h-4 w-4" />
                          {report.downloads}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-sm">
                        {report.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {report.pages} pages
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Neighborhoods Tab */}
          <TabsContent value="neighborhoods" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.neighborhoods.map((neighborhood, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {neighborhood.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Price</span>
                      <span className="font-semibold">
                        ${neighborhood.avgPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price Change</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 font-semibold">+{neighborhood.priceChange}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sales</span>
                      <span className="font-semibold">{neighborhood.sales}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Days on Market</span>
                      <span className="font-semibold">{neighborhood.daysOnMarket}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Trends by Property Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData.propertyTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{type.type}</p>
                          <p className="text-sm text-muted-foreground">
                            ${type.avgPrice.toLocaleString()} avg
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 font-semibold">+{type.priceChange}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {type.marketShare}% market share
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData.trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{trend.month}</p>
                          <p className="text-sm text-muted-foreground">
                            ${trend.price.toLocaleString()} avg price
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{trend.sales} sales</p>
                          <p className="text-sm text-muted-foreground">
                            {trend.inventory} months inventory
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need Custom Market Analysis?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get personalized market reports for specific neighborhoods, property types, or investment opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Request Custom Report
                </Button>
                <Button variant="outline" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Subscribe to Updates
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
