import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ImageGallery from "@/components/image-gallery";
import ReviewSection from "@/components/review-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Calendar,
  Car,
  Waves,
  Dumbbell,
  Heart,
  Share2,
  Phone,
  Mail,
  Star,
  User
} from "lucide-react";
import { useState } from "react";
import type { PropertyWithDetails } from "../../../shared/schema";
import { useTheme } from "@/contexts/ThemeContext";
import "../index.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    visitDate: '',
  });

  const { data: property, isLoading, error } = useQuery<PropertyWithDetails | undefined>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });

  // Add viewing history when property loads
  const addViewingHistoryMutation = useMutation({
    mutationFn: async () => {
      if (id && currentUser) {
        await apiRequest('POST', `/api/viewing-history/${id}`, {});
      }
    },
  });

  // Check if property is favorited
  const { data: favoriteStatus } = useQuery({
    queryKey: [`/api/favorites/${id}/check`],
    enabled: !!currentUser && !!id,
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/favorites/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}/check`] });
      toast({
        title: "Added to favorites",
        description: "Property has been added to your favorites.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to add properties to favorites.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/favorites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}/check`] });
      toast({
        title: "Removed from favorites",
        description: "Property has been removed from your favorites.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to manage favorites.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add viewing history when property loads
  useEffect(() => {
    if (property && currentUser && id) {
      addViewingHistoryMutation.mutate();
    }
  }, [property, currentUser, id]);

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add properties to favorites.",
        variant: "destructive",
      });
      setAuthTab("login");
      setShowAuthDialog(true);
      return;
    }

    if (!id || isNaN(Number(id))) {
      toast({
        title: "Invalid property",
        description: "Cannot add to favorites: property ID is invalid.",
        variant: "destructive",
      });
      return;
    }

    const isFavorited = favoriteStatus && typeof favoriteStatus === 'object' && 'isFavorited' in favoriteStatus 
      ? (favoriteStatus as any).isFavorited 
      : false;
    
    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      await apiRequest('POST', `/api/properties/${id}/bookings`, bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking request sent",
        description: "Your inquiry has been sent to the property owner.",
      });
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        visitDate: '',
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Removed useEffect that redirected unauthenticated users to login

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to send a booking request.",
        variant: "destructive",
      });
      setAuthTab("login");
      setShowAuthDialog(true);
      return;
    }

    bookingMutation.mutate(bookingForm);
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'parking': return <Car className="h-4 w-4" />;
      case 'pool': return <Waves className="h-4 w-4" />;
      case 'gym': return <Dumbbell className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 bg-muted rounded-lg"></div>
                <div className="h-60 bg-muted rounded-lg"></div>
              </div>
              <div className="h-80 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-8">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/properties')}>
              Back to Properties
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const amenities = [];
  if (property.parking) amenities.push('parking');
  if (property.pool) amenities.push('pool');
  if (property.gym) amenities.push('gym');
  if (property.petFriendly) amenities.push('petFriendly');

  const reviewCount = property.reviews ? property.reviews.length : 0;
  const averageRating = property.reviews && property.reviews.length > 0
    ? property.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / property.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/properties')}>
              ← Back to Properties
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleFavoriteToggle}
                disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
              >
                <Heart className={`h-4 w-4 mr-2 ${favoriteStatus && typeof favoriteStatus === 'object' && 'isFavorited' in favoriteStatus && (favoriteStatus as any).isFavorited ? 'fill-current text-red-500' : ''}`} />
                {favoriteStatus && typeof favoriteStatus === 'object' && 'isFavorited' in favoriteStatus && (favoriteStatus as any).isFavorited ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.location}</span>
            {averageRating > 0 && (
              <>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                  <span>{averageRating.toFixed(1)} ({reviewCount} reviews)</span>
                </div>
              </>
            )}
          </div>
          <div className="text-3xl font-bold text-primary mb-6">
            {formatPrice(property.price)}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGallery images={property.images || []} title={property.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  {property.squareFootage && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Maximize className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="font-semibold">{property.squareFootage.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Sq Ft</div>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="font-semibold">{property.yearBuilt}</div>
                      <div className="text-sm text-muted-foreground">Year Built</div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold mb-3">Property Type</h3>
                  <Badge variant="secondary" className="capitalize">
                    {property.propertyType}
                  </Badge>
                </div>

                {amenities.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            {getAmenityIcon(amenity)}
                            <span className="capitalize">
                              {amenity === 'petFriendly' ? 'Pet Friendly' : amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {property.description && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-foreground whitespace-pre-line">{property.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <ReviewSection propertyId={property.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Agent */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Property Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {property.owner?.firstName || property.owner?.email || 'Property Owner'}
                      {property.owner?.lastName ? ` ${property.owner.lastName}` : ''}
                    </div>
                    {property.owner?.email && (
                      <div className="text-sm text-muted-foreground">{property.owner.email}</div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitDate">Preferred Visit Date</Label>
                    <Input
                      id="visitDate"
                      type="datetime-local"
                      value={bookingForm.visitDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, visitDate: e.target.value })}
                      className="pr-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder="I'm interested in this property..."
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Owner
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome</DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
            <TabsList className="w-full flex mb-4">
              <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSwitchToSignup={() => setAuthTab("signup")}
                onSuccess={() => setShowAuthDialog(false)} />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm onSwitchToLogin={() => setAuthTab("login")}
                onSuccess={() => setShowAuthDialog(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
