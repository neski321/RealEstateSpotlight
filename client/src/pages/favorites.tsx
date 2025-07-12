import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Trash2, 
  Edit, 
  Search,
  Filter,
  SortAsc,
  Calendar,
  MapPin
} from "lucide-react";
import { Link } from "wouter";

export default function Favorites() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState<{ id: number; notes: string } | null>(null);
  const [sortBy, setSortBy] = useState('date-added');

  // Fetch favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  }) as { data: any[], isLoading: boolean };

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await apiRequest('DELETE', `/api/favorites/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Property has been removed from your favorites.",
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
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update favorite notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ propertyId, notes }: { propertyId: number; notes: string }) => {
      await apiRequest('POST', `/api/favorites/${propertyId}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      setEditingNote(null);
      toast({
        title: "Notes updated",
        description: "Your notes have been saved.",
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
        description: "Failed to update notes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFavorite = (propertyId: number) => {
    removeFavoriteMutation.mutate(propertyId);
  };

  const handleUpdateNotes = () => {
    if (editingNote) {
      updateNotesMutation.mutate({
        propertyId: editingNote.id,
        notes: editingNote.notes,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  // Sort favorites based on selected option
  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'date-added':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price-low':
        return parseFloat(a.property.price) - parseFloat(b.property.price);
      case 'price-high':
        return parseFloat(b.property.price) - parseFloat(a.property.price);
      case 'name':
        return a.property.title.localeCompare(b.property.title);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view favorites</h1>
            <p className="text-gray-600 mb-8">You need to be signed in to view and manage your favorite properties.</p>
            <Button asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
              <p className="text-gray-600">Your saved properties and personal notes</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'}
            </Badge>
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date-added">Date Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/properties">
                <Search className="h-4 w-4 mr-2" />
                Browse More Properties
              </Link>
            </Button>
          </div>
        </div>

        {/* Favorites Grid */}
        {favoritesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-6">
                Start exploring properties and add them to your favorites to see them here.
              </p>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/properties">Browse Properties</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/profile">View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFavorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={favorite.property.primaryImage?.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'}
                    alt={favorite.property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-white bg-opacity-90 hover:bg-blue-50"
                          onClick={() => setEditingNote({ id: favorite.propertyId, notes: favorite.notes || '' })}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Notes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="notes">Personal Notes</Label>
                            <Textarea
                              id="notes"
                              value={editingNote?.notes || ''}
                              onChange={(e) => setEditingNote(prev => prev ? { ...prev, notes: e.target.value } : null)}
                              placeholder="Add your thoughts about this property..."
                              rows={4}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingNote(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateNotes}
                              disabled={updateNotesMutation.isPending}
                            >
                              {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white bg-opacity-90 hover:bg-red-50"
                      onClick={() => handleRemoveFavorite(favorite.propertyId)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-primary text-white">
                      Added {formatDate(favorite.createdAt)}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {favorite.property.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{favorite.property.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xl font-bold text-primary">
                      {formatPrice(favorite.property.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {favorite.property.bedrooms} bed, {favorite.property.bathrooms} bath
                    </div>
                  </div>
                  
                  {favorite.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{favorite.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href={`/property/${favorite.propertyId}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
} 