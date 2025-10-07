import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bed, Bath, Maximize, Camera, Heart, MessageCircle, Calculator } from "lucide-react";
import { Link } from "wouter";
import type { PropertyWithStats } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import MortgageCalculatorModal from "@/components/mortgage-calculator-modal";
import MessagesModal from "@/components/messages-modal";

interface PropertyCardProps {
  property: PropertyWithStats;
  showFeatured?: boolean;
}

export default function PropertyCard({ property, showFeatured = false }: PropertyCardProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Check if property is favorited
  const { data: favoriteStatus } = useQuery({
    queryKey: [`/api/favorites/${property.id}/check`],
    enabled: currentUser !== null,
  });

  // Update local state when favorite status changes
  useEffect(() => {
    if (favoriteStatus && typeof favoriteStatus === 'object' && 'isFavorited' in favoriteStatus) {
      setIsFavorited((favoriteStatus as any).isFavorited);
    }
  }, [favoriteStatus]);

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/favorites/${property.id}`, {});
    },
    onSuccess: () => {
      setIsFavorited(true);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${property.id}/check`] });
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
      await apiRequest('DELETE', `/api/favorites/${property.id}`);
    },
    onSuccess: () => {
      setIsFavorited(false);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${property.id}/check`] });
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

  // Contact seller mutation
  const contactSellerMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/conversations', { propertyId: property.id });
    },
    onSuccess: () => {
      toast({
        title: "Conversation started",
        description: "You can now message the seller about this property.",
      });
      // Open messages modal
      setShowMessagesModal(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to contact the seller.",
          variant: "destructive",
        });
        setShowAuthDialog(true);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentUser === null) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add properties to favorites.",
        variant: "destructive",
      });
      setAuthTab("login");
      setShowAuthDialog(true);
      return;
    }

    if (!property.id || isNaN(Number(property.id))) {
      toast({
        title: "Invalid property",
        description: "Cannot add to favorites: property ID is invalid.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
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

  const primaryImage = property.primaryImage || property.images[0];
  const imageUrl = primaryImage?.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 bg-muted">
          <img 
            src={imageUrl} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-4 right-4 bg-card bg-opacity-90 p-2 rounded-full transition-colors duration-200 ${
              isFavorited ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
            disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          {showFeatured && property.featured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground">Featured</Badge>
            </div>
          )}
          {property.images.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center">
              <Camera className="h-3 w-3 mr-1" />
              {property.images.length} photos
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">
              {property.title}
            </h3>
            {property.reviewCount > 0 && (
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm text-muted-foreground">
                  {property.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground mb-3 line-clamp-1">
            {property.location}
          </p>
          
          <div className="flex items-center text-muted-foreground text-sm mb-4 space-x-4">
            <span className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
            </span>
            {property.squareFootage && (
              <span className="flex items-center">
                <Maximize className="h-4 w-4 mr-1" />
                {property.squareFootage.toLocaleString()} sq ft
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-primary">
                {formatPrice(property.price)}
              </div>
              <Button asChild>
                <Link href={`/property/${property.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {currentUser?.uid !== property.ownerId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    contactSellerMutation.mutate();
                  }}
                  disabled={contactSellerMutation.isPending}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
              {property.propertyType !== 'apartment' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMortgageCalculator(true);
                  }}
                  className="flex-1"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome</DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
            <TabsList className="w-full flex mb-4">
              <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
              <TabsTrigger value="forgot-password" className="flex-1">Reset Password</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm 
                onSwitchToSignup={() => setAuthTab("signup")}
                onSwitchToForgotPassword={() => setAuthTab("forgot-password")}
                onSuccess={() => setShowAuthDialog(false)} 
              />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm onSwitchToLogin={() => setAuthTab("login")}
                onSuccess={() => setShowAuthDialog(false)} />
            </TabsContent>
            <TabsContent value="forgot-password">
              <ForgotPasswordForm 
                onBackToLogin={() => setAuthTab("login")}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Mortgage Calculator Modal */}
      <MortgageCalculatorModal
        isOpen={showMortgageCalculator}
        onClose={() => setShowMortgageCalculator(false)}
        property={{
          id: property.id,
          title: property.title,
          price: property.price,
          location: property.location,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareFootage: property.squareFootage || undefined,
          yearBuilt: property.yearBuilt || undefined,
          lotSize: (property as any).lotSize || undefined,
        }}
      />

      {/* Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
      />
    </>
  );
}
