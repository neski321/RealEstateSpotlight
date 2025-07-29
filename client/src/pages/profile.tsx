import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@/lib/api";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Heart, 
  Search, 
  Eye, 
  Settings, 
  Bell, 
  Shield, 
  Save,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  Briefcase,
  Clock,
  Star
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { UserWithDetails, FavoriteWithProperty, ViewingHistoryWithProperty, SearchHistory } from "../../../shared/schema";

export default function Profile() {
  const { currentUser, loading } = useAuth();
  const isAuthenticated = !!currentUser;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    occupation: '',
    company: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    timezone: '',
    language: 'en',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    propertyAlerts: true,
    priceChangeAlerts: true,
    newListingAlerts: true,
    searchHistoryEnabled: true,
    viewingHistoryEnabled: true,
    profileVisibility: 'public',
  });

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserWithDetails | undefined>({
    queryKey: ['/api/user/profile'],
    enabled: isAuthenticated,
  });

  // Fetch favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<FavoriteWithProperty[]>({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  // Fetch search history
  const { data: searchHistory = [], isLoading: searchHistoryLoading } = useQuery<SearchHistory[]>({
    queryKey: ['/api/search-history'],
    enabled: isAuthenticated,
  });

  // Fetch viewing history
  const { data: viewingHistory = [], isLoading: viewingHistoryLoading } = useQuery<ViewingHistoryWithProperty[]>({
    queryKey: ['/api/viewing-history'],
    enabled: isAuthenticated,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest('PUT', '/api/user/profile', profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: any) => {
      const response = await apiRequest('PUT', '/api/user/preferences', preferencesData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
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
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  // Clear history mutations
  const clearSearchHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/search-history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/search-history'] });
      toast({
        title: "Search history cleared",
        description: "Your search history has been cleared.",
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
        description: "Failed to clear search history. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearViewingHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/viewing-history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/viewing-history'] });
      toast({
        title: "Viewing history cleared",
        description: "Your viewing history has been cleared.",
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
        description: "Failed to clear viewing history. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile && !isEditing) {
      setProfileForm({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        phone: userProfile?.phone || '',
        bio: userProfile?.bio || '',
        occupation: userProfile?.occupation || '',
        company: userProfile?.company || '',
        website: userProfile?.website || '',
        address: userProfile?.address || '',
        city: userProfile?.city || '',
        state: userProfile?.state || '',
        zipCode: userProfile?.zipCode || '',
        country: userProfile?.country || '',
        timezone: userProfile?.timezone || '',
        language: userProfile?.language || 'en',
      });

      if (userProfile?.preferences) {
        setPreferences({ ...preferences, ...userProfile.preferences });
      }
    }
  }, [userProfile, isEditing]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePreferencesChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    updatePreferencesMutation.mutate(newPreferences);
  };

  const handleRemoveFavorite = (propertyId: number) => {
    removeFavoriteMutation.mutate(propertyId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account, preferences, and activity</p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={profileForm.occupation}
                        onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profileForm.company}
                        onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Separator />

                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={profileForm.zipCode}
                        onChange={(e) => setProfileForm({ ...profileForm, zipCode: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Favorites</h2>
              <Badge variant="secondary">{favorites.length} properties</Badge>
            </div>

            {favoritesLoading ? (
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
            ) : favorites.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start exploring properties and add them to your favorites to see them here.
                  </p>
                  <Button asChild>
                    <a href="/properties">Browse Properties</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite: FavoriteWithProperty) => (
                  <div key={favorite.id} className="relative">
                    <PropertyCard property={favorite.property} />
                    <div className="absolute top-4 right-4">
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
                    {favorite.notes && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{favorite.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Tabs defaultValue="viewing" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="viewing">Viewing History</TabsTrigger>
                <TabsTrigger value="search">Search History</TabsTrigger>
              </TabsList>

              <TabsContent value="viewing" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recently Viewed Properties</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearViewingHistoryMutation.mutate()}
                    disabled={clearViewingHistoryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </div>

                {viewingHistoryLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-white p-4 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : viewingHistory.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No viewing history yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {viewingHistory.map((record: ViewingHistoryWithProperty) => (
                      <Card key={record.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              {record.property.primaryImage && (
                                <img
                                  src={record.property.primaryImage.imageUrl}
                                  alt={record.property.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{record.property.title}</h4>
                              <p className="text-sm text-gray-600">{record.property.location}</p>
                              <p className="text-sm font-medium text-primary">
                                {formatPrice(record.property.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                Viewed {formatDate(record.viewedAt ? record.viewedAt.toString() : '')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="search" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Searches</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSearchHistoryMutation.mutate()}
                    disabled={clearSearchHistoryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </div>

                {searchHistoryLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-white p-4 rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchHistory.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No search history yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {searchHistory.map((record: SearchHistory) => (
                      <Card key={String(record.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{String(record.searchQuery)}</h4>
                              {typeof record.filters === 'object' && record.filters !== null && (
                                <p className="text-sm text-gray-600">
                                  Filters: {JSON.stringify(record.filters)}
                                </p>
                              )}
                              {typeof record.filters === 'string' && (
                                <p className="text-sm text-gray-600">
                                  Filters: {record.filters}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDate(record.createdAt ? record.createdAt.toString() : '')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => handlePreferencesChange('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => handlePreferencesChange('pushNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) => handlePreferencesChange('smsNotifications', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Property Alerts</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">New Listings</h5>
                        <p className="text-sm text-gray-600">Get notified about new properties</p>
                      </div>
                      <Switch
                        checked={preferences.newListingAlerts}
                        onCheckedChange={(checked) => handlePreferencesChange('newListingAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Price Changes</h5>
                        <p className="text-sm text-gray-600">Get notified when prices change</p>
                      </div>
                      <Switch
                        checked={preferences.priceChangeAlerts}
                        onCheckedChange={(checked) => handlePreferencesChange('priceChangeAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Privacy Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Search History</h5>
                        <p className="text-sm text-gray-600">Save your search history</p>
                      </div>
                      <Switch
                        checked={preferences.searchHistoryEnabled}
                        onCheckedChange={(checked) => handlePreferencesChange('searchHistoryEnabled', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Viewing History</h5>
                        <p className="text-sm text-gray-600">Save your viewing history</p>
                      </div>
                      <Switch
                        checked={preferences.viewingHistoryEnabled}
                        onCheckedChange={(checked) => handlePreferencesChange('viewingHistoryEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await api.delete('/api/user/account');
                                await useAuth().currentUser?.delete();
                                await useAuth().signOutUser();
                                window.location.href = '/';
                                // Optionally show a toast here
                              } catch (err) {
                                alert('Failed to delete account. Please re-authenticate and try again.');
                              }
                            }}
                          >
                            Yes, Delete
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p className="text-xs text-gray-500 mt-2">This will permanently delete your account and all associated data.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
} 