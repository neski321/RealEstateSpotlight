import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import PropertySearch from "@/components/property-search";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Eye, Heart, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { currentUser } = useAuth();

  const { data: featuredProperties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties/featured'],
  }) as { data: any[], isLoading: boolean };

  const { data: userProperties = [], isLoading: userPropertiesLoading } = useQuery({
    queryKey: ['/api/user/properties'],
  }) as { data: any[], isLoading: boolean };

  const handleSearch = (searchParams: any) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&h=800&fit=crop')`
          }}
        ></div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome back, {currentUser?.displayName || currentUser?.email || 'User'}!
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Find your next property or manage your listings
            </p>
            
            <div className="max-w-4xl mx-auto">
              <PropertySearch onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {userPropertiesLoading ? '...' : userProperties.length}
                    </h3>
                    <p className="text-blue-100">Your Listings</p>
                  </div>
                  <Plus className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-success to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {userPropertiesLoading ? '...' : userProperties.reduce((sum: number, p: any) => sum + (p.reviewCount || 0), 0)}
                    </h3>
                    <p className="text-green-100">Total Views</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">0</h3>
                    <p className="text-purple-100">Saved Properties</p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => navigate('/create-listing')}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    <span className="text-sm">Add New Listing</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => navigate('/dashboard')}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span className="text-sm">View Dashboard</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => navigate('/properties')}
                  >
                    <Eye className="h-6 w-6 mb-2" />
                    <span className="text-sm">Browse Properties</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center"
                  >
                    <Heart className="h-6 w-6 mb-2" />
                    <span className="text-sm">Saved Properties</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {userPropertiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't created any listings yet.</p>
                    <Button onClick={() => navigate('/create-listing')}>
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProperties.slice(0, 3).map((property: any) => (
                      <div key={property.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <img 
                          src={property.primaryImage?.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=100&fit=crop'} 
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{property.title}</h4>
                          <p className="text-sm text-gray-600">{property.location}</p>
                          <p className="text-sm text-primary font-semibold">${parseFloat(property.price).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">{property.reviewCount || 0} reviews</p>
                          <p className="text-xs text-gray-500">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Properties</h2>
            <p className="text-lg text-muted-foreground">Discover amazing properties from other users</p>
          </div>

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.slice(0, 3).map((property: any) => (
                <PropertyCard key={property.id} property={property} showFeatured />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/properties')}
            >
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
