import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Search,
  Home,
  Calculator,
  Users,
  FileText,
  Shield,
  Phone,
  ChevronRight,
  HelpCircle,
  ArrowLeft,
  BookOpen,
  Star,
  Clock,
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

// Types
interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  readTime: string;
  difficulty: string;
}

interface Category {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  articles: { id: string; title: string }[];
}

// Reusable components
const ArticleCard = ({ article, onClick, showBadge = false }: { 
  article: { id: string; title: string }; 
  onClick: (id: string) => void;
  showBadge?: boolean;
}) => (
  <div 
    className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer"
    onClick={() => onClick(article.id)}
  >
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm">{article.title}</span>
    {showBadge && (
      <Badge variant="secondary" className="ml-auto">
        Popular
      </Badge>
    )}
  </div>
);

const CategoryCard = ({ category, onArticleClick }: { 
  category: Category; 
  onArticleClick: (id: string) => void;
}) => (
  <Card className="hover:shadow-lg transition-shadow border-border bg-card">
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
        {category.articles.map((article) => (
          <div
            key={article.id}
            className="flex items-center gap-2 text-sm hover:text-primary cursor-pointer"
            onClick={() => onArticleClick(article.id)}
          >
            <ChevronRight className="h-3 w-3" />
            <span>{article.title}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SearchResultsSummary = ({ query, resultCount }: { query: string; resultCount: number }) => (
  <Card className="mb-6 border-border bg-card">
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">
        Found {resultCount} results for "{query}"
      </p>
    </CardContent>
  </Card>
);

const NoResults = ({ query, onClear }: { query: string; onClear: () => void }) => (
  <Card className="mb-8 border-border bg-card">
    <CardContent className="p-8 text-center">
      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2 text-foreground">No results found</h3>
      <p className="text-muted-foreground mb-4">
        We couldn't find any articles matching "{query}"
      </p>
      <Button onClick={onClear}>Clear Search</Button>
    </CardContent>
  </Card>
);

const ContactSupport = ({ onContactClick }: { onContactClick: () => void }) => (
  <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-border">
    <CardContent className="p-6 text-center">
      <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-foreground">Still need help?</h3>
      <p className="text-muted-foreground mb-4">
        Can't find what you're looking for? Our support team is here to help.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        {[
          { label: "Email Support", value: "support@propertyhub.com" },
          { label: "Phone Support", value: "1-800-PROPERTY" },
          { label: "Live Chat", value: "Available 24/7" }
        ].map((contact, index) => (
          <React.Fragment key={contact.label}>
            <div className="text-center">
              <p className="font-medium">{contact.label}</p>
              <p className="text-sm text-muted-foreground">{contact.value}</p>
            </div>
            {index < 2 && <Separator orientation="vertical" className="hidden sm:block" />}
          </React.Fragment>
        ))}
      </div>
      <Button onClick={onContactClick} className="bg-primary hover:bg-primary/90">
        Contact Us
      </Button>
    </CardContent>
  </Card>
);

// Article data
const articlesData: Record<string, Article> = {
  "how-to-search-properties": {
    id: "how-to-search-properties",
    title: "How to Search for Properties",
    category: "Property Search",
    content: `
      <h2>Finding Your Perfect Home</h2>
      <p>Our property search feature makes it easy to find homes that match your criteria. Here's how to get started:</p>
      
      <h3>Basic Search</h3>
      <ol>
        <li>Go to the Properties page from the main navigation</li>
        <li>Use the search bar to enter a location (city, zip code, or neighborhood)</li>
        <li>Browse through the available properties</li>
        <li>Click on any property to view detailed information</li>
      </ol>

      <h3>Advanced Filtering</h3>
      <p>Use our advanced filters to narrow down your search:</p>
      <ul>
        <li><strong>Price Range:</strong> Set minimum and maximum price limits</li>
        <li><strong>Property Type:</strong> Choose from houses, condos, townhouses, etc.</li>
        <li><strong>Bedrooms & Bathrooms:</strong> Specify the number of rooms you need</li>
        <li><strong>Square Footage:</strong> Filter by property size</li>
        <li><strong>Year Built:</strong> Find newer or older properties</li>
      </ul>

      <h3>Tips for Better Results</h3>
      <ul>
        <li>Start with a broad search and then apply filters</li>
        <li>Save your favorite searches for quick access</li>
        <li>Set up alerts to get notified of new listings</li>
        <li>Use the map view to explore neighborhoods</li>
      </ul>
    `,
    readTime: "3 min read",
    difficulty: "Beginner"
  },
  "understanding-property-filters": {
    id: "understanding-property-filters",
    title: "Understanding Property Filters",
    category: "Property Search",
    content: `
      <h2>Mastering Property Filters</h2>
      <p>Our comprehensive filtering system helps you find exactly what you're looking for. Here's a detailed guide to each filter option:</p>
      
      <h3>Location Filters</h3>
      <ul>
        <li><strong>City/Neighborhood:</strong> Search by specific areas</li>
        <li><strong>Zip Code:</strong> Target specific postal codes</li>
        <li><strong>School District:</strong> Find properties in preferred school zones</li>
        <li><strong>Commute Time:</strong> Filter by distance to work or amenities</li>
      </ul>

      <h3>Property Details</h3>
      <ul>
        <li><strong>Property Type:</strong> House, Condo, Townhouse, Multi-family</li>
        <li><strong>Square Footage:</strong> Range from small to large properties</li>
        <li><strong>Lot Size:</strong> Land area for outdoor space preferences</li>
        <li><strong>Year Built:</strong> New construction to historic homes</li>
      </ul>

      <h3>Price & Financial</h3>
      <ul>
        <li><strong>Price Range:</strong> Set your budget limits</li>
        <li><strong>Monthly Payment:</strong> Estimate based on your down payment</li>
        <li><strong>Property Tax:</strong> Annual tax estimates</li>
        <li><strong>HOA Fees:</strong> Monthly association fees if applicable</li>
      </ul>

      <h3>Advanced Features</h3>
      <ul>
        <li><strong>Amenities:</strong> Pool, garage, fireplace, etc.</li>
        <li><strong>Energy Efficiency:</strong> Solar panels, energy ratings</li>
        <li><strong>Accessibility:</strong> Wheelchair accessible, single-level</li>
        <li><strong>Pet Policy:</strong> Pet-friendly properties</li>
      </ul>
    `,
    readTime: "5 min read",
    difficulty: "Intermediate"
  },
  "saving-favorite-properties": {
    id: "saving-favorite-properties",
    title: "Saving Favorite Properties",
    category: "Property Search",
    content: `
      <h2>Managing Your Favorites</h2>
      <p>Keep track of properties you love with our favorites feature. Here's how to use it effectively:</p>
      
      <h3>Adding Properties to Favorites</h3>
      <ol>
        <li>Browse properties on the search page</li>
        <li>Click the heart icon on any property card</li>
        <li>The property will be added to your favorites list</li>
        <li>You can also add notes to remember why you liked it</li>
      </ol>

      <h3>Accessing Your Favorites</h3>
      <ul>
        <li>Go to your Dashboard and click "Favorites"</li>
        <li>Or use the quick access link in the navigation</li>
        <li>View all your saved properties in one place</li>
        <li>Sort and filter your favorites list</li>
      </ul>

      <h3>Managing Your List</h3>
      <ul>
        <li><strong>Add Notes:</strong> Remember specific details about each property</li>
        <li><strong>Remove Properties:</strong> Click the heart icon again to remove</li>
        <li><strong>Share Lists:</strong> Share your favorites with family or agents</li>
        <li><strong>Export:</strong> Download your favorites as a PDF or spreadsheet</li>
      </ul>

      <h3>Pro Tips</h3>
      <ul>
        <li>Use favorites to compare properties side by side</li>
        <li>Set up alerts for price changes on favorite properties</li>
        <li>Create different lists for different criteria (e.g., "Must See", "Maybe")</li>
        <li>Review your favorites regularly to keep the list current</li>
      </ul>
    `,
    readTime: "4 min read",
    difficulty: "Beginner"
  },
  "using-mortgage-calculator": {
    id: "using-mortgage-calculator",
    title: "Using the Mortgage Calculator",
    category: "Mortgage Calculator",
    content: `
      <h2>Calculate Your Mortgage Payments</h2>
      <p>Our mortgage calculator helps you understand the true cost of homeownership. Here's how to use it effectively:</p>
      
      <h3>Basic Inputs</h3>
      <ul>
        <li><strong>Home Price:</strong> The total cost of the property</li>
        <li><strong>Down Payment:</strong> Amount you'll pay upfront (typically 3-20%)</li>
        <li><strong>Interest Rate:</strong> Annual percentage rate (APR)</li>
        <li><strong>Loan Term:</strong> Length of the mortgage (15, 20, or 30 years)</li>
      </ul>

      <h3>Understanding the Results</h3>
      <ul>
        <li><strong>Monthly Payment:</strong> Principal and interest payment</li>
        <li><strong>Total Interest:</strong> Total interest paid over the loan term</li>
        <li><strong>Total Payment:</strong> Principal + interest over the full term</li>
        <li><strong>Amortization Schedule:</strong> Year-by-year breakdown</li>
      </ul>

      <h3>Additional Costs to Consider</h3>
      <ul>
        <li><strong>Property Taxes:</strong> Annual taxes (typically 1-2% of home value)</li>
        <li><strong>Homeowners Insurance:</strong> Annual insurance premiums</li>
        <li><strong>Private Mortgage Insurance (PMI):</strong> Required if down payment < 20%</li>
        <li><strong>HOA Fees:</strong> Monthly association fees if applicable</li>
      </ul>

      <h3>Tips for Better Calculations</h3>
      <ul>
        <li>Use current market rates for accurate estimates</li>
        <li>Consider different down payment scenarios</li>
        <li>Factor in closing costs (typically 2-5% of home price)</li>
        <li>Account for potential rate changes with adjustable-rate mortgages</li>
      </ul>
    `,
    readTime: "6 min read",
    difficulty: "Intermediate"
  },
  "understanding-interest-rates": {
    id: "understanding-interest-rates",
    title: "Understanding Interest Rates",
    category: "Mortgage Calculator",
    content: `
      <h2>How Interest Rates Affect Your Mortgage</h2>
      <p>Interest rates are one of the most important factors in determining your mortgage payment. Here's what you need to know:</p>
      
      <h3>Types of Interest Rates</h3>
      <ul>
        <li><strong>Fixed-Rate:</strong> Interest rate stays the same for the entire loan term</li>
        <li><strong>Adjustable-Rate (ARM):</strong> Rate can change periodically based on market conditions</li>
        <li><strong>Hybrid ARM:</strong> Fixed rate for initial period, then adjustable</li>
      </ul>

      <h3>Factors That Affect Rates</h3>
      <ul>
        <li><strong>Credit Score:</strong> Higher scores typically get lower rates</li>
        <li><strong>Down Payment:</strong> Larger down payments may qualify for better rates</li>
        <li><strong>Loan Term:</strong> Shorter terms often have lower rates</li>
        <li><strong>Market Conditions:</strong> Economic factors influence overall rates</li>
        <li><strong>Property Type:</strong> Investment properties may have higher rates</li>
      </ul>

      <h3>Rate vs. APR</h3>
      <ul>
        <li><strong>Interest Rate:</strong> Cost of borrowing the principal loan amount</li>
        <li><strong>APR (Annual Percentage Rate):</strong> Total cost including fees and other charges</li>
        <li>APR is typically higher than the interest rate</li>
        <li>Use APR to compare loans from different lenders</li>
      </ul>

      <h3>Getting the Best Rate</h3>
      <ul>
        <li>Improve your credit score before applying</li>
        <li>Shop around with multiple lenders</li>
        <li>Consider paying points to lower your rate</li>
        <li>Lock in your rate when you find a good offer</li>
        <li>Monitor market trends for optimal timing</li>
      </ul>
    `,
    readTime: "7 min read",
    difficulty: "Intermediate"
  },
  "creating-account": {
    id: "creating-account",
    title: "Creating an Account",
    category: "Account Management",
    content: `
      <h2>Getting Started with PropertyHub</h2>
      <p>Creating an account is quick and easy. Here's how to get started:</p>
      
      <h3>Sign Up Process</h3>
      <ol>
        <li>Click "Sign Up" in the top navigation</li>
        <li>Enter your email address</li>
        <li>Create a strong password (minimum 8 characters)</li>
        <li>Fill in your basic information (name, phone number)</li>
        <li>Verify your email address</li>
        <li>Complete your profile setup</li>
      </ol>

      <h3>Account Types</h3>
      <ul>
        <li><strong>Buyer Account:</strong> Search and save properties, get alerts</li>
        <li><strong>Seller Account:</strong> List properties, manage inquiries</li>
        <li><strong>Agent Account:</strong> Professional tools and client management</li>
      </ul>

      <h3>Profile Setup</h3>
      <ul>
        <li><strong>Personal Information:</strong> Name, contact details, preferences</li>
        <li><strong>Search Preferences:</strong> Location, price range, property type</li>
        <li><strong>Notification Settings:</strong> Email and push notification preferences</li>
        <li><strong>Privacy Settings:</strong> Control what information is shared</li>
      </ul>

      <h3>Account Security</h3>
      <ul>
        <li>Use a strong, unique password</li>
        <li>Enable two-factor authentication if available</li>
        <li>Keep your contact information updated</li>
        <li>Regularly review your account activity</li>
      </ul>
    `,
    readTime: "4 min read",
    difficulty: "Beginner"
  },
  "steps-to-buying-home": {
    id: "steps-to-buying-home",
    title: "Steps to Buying a Home",
    category: "Buying Process",
    content: `
      <h2>The Home Buying Journey</h2>
      <p>Buying a home is one of the biggest decisions you'll make. Here's a step-by-step guide to help you through the process:</p>
      
      <h3>1. Preparation Phase</h3>
      <ul>
        <li>Check your credit score and improve if needed</li>
        <li>Save for down payment and closing costs</li>
        <li>Get pre-approved for a mortgage</li>
        <li>Determine your budget and must-haves</li>
        <li>Research neighborhoods and school districts</li>
      </ul>

      <h3>2. House Hunting</h3>
      <ul>
        <li>Use our search tools to find properties</li>
        <li>Attend open houses and schedule viewings</li>
        <li>Take notes and photos during visits</li>
        <li>Compare properties and narrow down choices</li>
        <li>Consider resale value and future needs</li>
      </ul>

      <h3>3. Making an Offer</h3>
      <ul>
        <li>Work with a real estate agent</li>
        <li>Research comparable sales in the area</li>
        <li>Submit a competitive offer</li>
        <li>Include contingencies (inspection, financing)</li>
        <li>Be prepared for negotiations</li>
      </ul>

      <h3>4. Due Diligence</h3>
      <ul>
        <li>Schedule a home inspection</li>
        <li>Review inspection report thoroughly</li>
        <li>Request repairs or credits if needed</li>
        <li>Finalize your mortgage application</li>
        <li>Get homeowners insurance quotes</li>
      </ul>

      <h3>5. Closing</h3>
      <ul>
        <li>Review closing documents in advance</li>
        <li>Bring required funds and identification</li>
        <li>Sign all necessary paperwork</li>
        <li>Receive keys to your new home</li>
        <li>Update your address and utilities</li>
      </ul>
    `,
    readTime: "8 min read",
    difficulty: "Beginner"
  },
  "data-privacy-practices": {
    id: "data-privacy-practices",
    title: "Data Privacy Practices",
    category: "Privacy & Security",
    content: `
      <h2>Your Privacy Matters</h2>
      <p>We take your privacy seriously and are committed to protecting your personal information. Here's how we handle your data:</p>
      
      <h3>Information We Collect</h3>
      <ul>
        <li><strong>Account Information:</strong> Name, email, phone number</li>
        <li><strong>Search Preferences:</strong> Property criteria and saved searches</li>
        <li><strong>Property Interactions:</strong> Favorites, viewing history, inquiries</li>
        <li><strong>Usage Data:</strong> How you interact with our platform</li>
        <li><strong>Device Information:</strong> Browser type, IP address, cookies</li>
      </ul>

      <h3>How We Use Your Information</h3>
      <ul>
        <li>Provide personalized property recommendations</li>
        <li>Send relevant notifications and alerts</li>
        <li>Improve our services and user experience</li>
        <li>Connect you with real estate professionals</li>
        <li>Ensure platform security and prevent fraud</li>
      </ul>

      <h3>Information Sharing</h3>
      <ul>
        <li>We do not sell your personal information</li>
        <li>Share with your consent (e.g., connecting with agents)</li>
        <li>Service providers who help operate our platform</li>
        <li>Legal requirements and law enforcement</li>
        <li>Business transfers (with privacy protections)</li>
      </ul>

      <h3>Your Privacy Rights</h3>
      <ul>
        <li>Access and update your personal information</li>
        <li>Delete your account and associated data</li>
        <li>Opt out of marketing communications</li>
        <li>Control cookie preferences</li>
        <li>Request data portability</li>
      </ul>

      <h3>Data Security</h3>
      <ul>
        <li>Encryption of data in transit and at rest</li>
        <li>Regular security audits and updates</li>
        <li>Access controls and authentication</li>
        <li>Employee training on data protection</li>
        <li>Incident response procedures</li>
      </ul>
    `,
    readTime: "6 min read",
    difficulty: "Intermediate"
  }
};

// Categories and popular articles data
const categories: Category[] = [
  {
    icon: Home,
    title: "Property Search",
    description: "Find your perfect home",
    articles: [
      { id: "how-to-search-properties", title: "How to Search for Properties" },
      { id: "understanding-property-filters", title: "Understanding Property Filters" },
      { id: "saving-favorite-properties", title: "Saving Favorite Properties" },
    ],
  },
  {
    icon: Calculator,
    title: "Mortgage Calculator",
    description: "Calculate your payments",
    articles: [
      { id: "using-mortgage-calculator", title: "Using the Mortgage Calculator" },
      { id: "understanding-interest-rates", title: "Understanding Interest Rates" },
    ],
  },
  {
    icon: Users,
    title: "Account Management",
    description: "Manage your profile",
    articles: [
      { id: "creating-account", title: "Creating an Account" },
    ],
  },
  {
    icon: FileText,
    title: "Buying Process",
    description: "Navigate home buying",
    articles: [
      { id: "steps-to-buying-home", title: "Steps to Buying a Home" },
    ],
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Your data protection",
    articles: [
      { id: "data-privacy-practices", title: "Data Privacy Practices" },
    ],
  },
];

const popularArticles = [
  { id: "how-to-search-properties", title: "How to Search for Properties" },
  { id: "using-mortgage-calculator", title: "Using the Mortgage Calculator" },
  { id: "steps-to-buying-home", title: "Steps to Buying a Home" },
  { id: "understanding-interest-rates", title: "Understanding Interest Rates" },
  { id: "creating-account", title: "Creating an Account" },
];

// Main component
export default function HelpCenter() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if we're viewing a specific article
  const articleId = location.split('/')[2];
  const isViewingArticle = articleId && articlesData[articleId];

  // Filter articles based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.map(category => ({
      ...category,
      articles: category.articles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        articlesData[article.id]?.content.toLowerCase().includes(query)
      )
    })).filter(category => category.articles.length > 0);
  }, [searchQuery]);

  const filteredPopularArticles = useMemo(() => {
    if (!searchQuery.trim()) return popularArticles;

    const query = searchQuery.toLowerCase();
    return popularArticles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      articlesData[article.id]?.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const totalResults = filteredPopularArticles.length + filteredCategories.reduce((sum, cat) => sum + cat.articles.length, 0);

  const handleArticleClick = (articleId: string) => {
    setLocation(`/help-center/${articleId}`);
  };

  const handleBackToHelp = () => {
    setLocation('/help-center');
  };

  const handleContactClick = () => {
    setLocation('/contact');
  };

  // Article view
  if (isViewingArticle) {
    const article = articlesData[articleId];
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 max-w-4xl mx-auto p-6 w-full">
          <Button variant="ghost" onClick={handleBackToHelp} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Button>

          <Card className="mb-6 border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <Badge variant="secondary">{article.category}</Badge>
              </div>
              <CardTitle className="text-3xl text-foreground">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {article.difficulty}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Main help center view
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-6xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">PropertyHub Help Center</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">Find answers to your questions and get the help you need</p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-3 border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Search Results Summary */}
        {searchQuery.trim() && <SearchResultsSummary query={searchQuery} resultCount={totalResults} />}

        {/* Popular Articles */}
        {filteredPopularArticles.length > 0 && (
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5" />
                Popular Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredPopularArticles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onClick={handleArticleClick}
                    showBadge={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCategories.map((category, index) => (
            <CategoryCard 
              key={index} 
              category={category} 
              onArticleClick={handleArticleClick}
            />
          ))}
        </div>

        {/* No Results */}
        {searchQuery.trim() && filteredPopularArticles.length === 0 && filteredCategories.length === 0 && (
          <NoResults query={searchQuery} onClear={() => setSearchQuery("")} />
        )}

        {/* Contact Support */}
        <ContactSupport onContactClick={handleContactClick} />
      </div>
      <Footer />
    </div>
  );
} 