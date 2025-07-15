import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useParams } from "wouter";

export default function EditListing() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const isAuthenticated = !!currentUser;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    yearBuilt: '',
    parking: false,
    pool: false,
    gym: false,
    petFriendly: false,
    furnished: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]); // Track original images
  const [currentStep, setCurrentStep] = useState(1);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Fetch property data
  const { data: property = {}, isLoading: propertyLoading } = useQuery<any>({
    queryKey: ["/api/properties/" + id],
    enabled: !!id,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
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
  }, [isAuthenticated, loading, toast]);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '',
        location: property.location || '',
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        propertyType: property.propertyType || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        squareFootage: property.squareFootage?.toString() || '',
        yearBuilt: property.yearBuilt?.toString() || '',
        parking: !!property.parking,
        pool: !!property.pool,
        gym: !!property.gym,
        petFriendly: !!property.petFriendly,
        furnished: !!property.furnished,
      });
      const imgs = property.images?.map((img: any) => img.imageUrl) || [];
      setImages(imgs);
      setOriginalImages(imgs); // Set original images
    }
  }, [property]);

  const updatePropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const response = await apiRequest('PUT', `/api/properties/${id}`, propertyData);
      return response.json();
    },
    onSuccess: async (updatedProperty) => {
      // Always fetch latest property images before deleting
      let latestPropertyImages = [];
      try {
        const response = await apiRequest('GET', `/api/properties/${id}`);
        const latestProperty = await response.json();
        latestPropertyImages = latestProperty.images || [];
      } catch (err) {
        // fallback to local property.images if fetch fails
        latestPropertyImages = property.images || [];
      }
      const removeImageIds = latestPropertyImages.map((img: any) => img.id);
      // Remove all old images
      const removePromises = removeImageIds.map((imageId: number) =>
        apiRequest('DELETE', `/api/property-images/${imageId}`)
      );
      let imageUpdateError = false;
      try {
        await Promise.all(removePromises);
      } catch (err) {
        imageUpdateError = true;
      }
      // Add all current images
      try {
        await Promise.all(
          images.map((img, i) =>
            apiRequest('POST', `/api/properties/${id}/images`, {
              imageUrl: img,
              isPrimary: i === 0,
              altText: `${formData.title} - Image ${i + 1}`,
            })
          )
        );
      } catch (err) {
        imageUpdateError = true;
      }
      // Refetch property data to update local state
      let updatedPropertyWithImages = null;
      try {
        const response = await apiRequest('GET', `/api/properties/${id}`);
        updatedPropertyWithImages = await response.json();
        const imgs = updatedPropertyWithImages.images?.map((img: any) => img.imageUrl) || [];
        setImages(imgs);
        setOriginalImages(imgs);
      } catch (err) {
        // If refetch fails, proceed anyway
      }
      queryClient.invalidateQueries({ queryKey: ['/api/user/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: imageUpdateError ? "Property updated, but some images failed" : "Property updated successfully",
        description: imageUpdateError
          ? "Your property was updated, but some images may not have uploaded or been removed."
          : "Your property listing has been updated.",
        variant: imageUpdateError ? "destructive" : undefined,
      });
      // Add a short delay to allow backend propagation
      setTimeout(() => {
        navigate(`/property/${id}`);
      }, 400);
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
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageAdd = () => {
    setShowImageDialog(true);
  };

  const handleImageDialogConfirm = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
      setShowImageDialog(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateClick = async () => {
    if (currentStep !== 3) return;
    const requiredFields = ['title', 'price', 'location', 'city', 'state', 'propertyType', 'bedrooms', 'bathrooms'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    // Add images as required
    if (images.length === 0) {
      toast({
        title: "Missing required fields",
        description: `Please add at least one image for your listing`,
        variant: "destructive",
      });
      return;
    }
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    const propertyData = {
      ...formData,
      price: formData.price, // keep as string
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
    };

    // 1. Update property fields
    updatePropertyMutation.mutate(propertyData, {
      onSuccess: async (updatedProperty) => {
        // Always fetch latest property images before deleting
        let latestPropertyImages = [];
        try {
          const response = await apiRequest('GET', `/api/properties/${id}`);
          const latestProperty = await response.json();
          latestPropertyImages = latestProperty.images || [];
        } catch (err) {
          // fallback to local property.images if fetch fails
          latestPropertyImages = property.images || [];
        }
        const removeImageIds = latestPropertyImages.map((img: any) => img.id);
        // Remove all old images
        const removePromises = removeImageIds.map((imageId: number) =>
          apiRequest('DELETE', `/api/property-images/${imageId}`)
        );
        let imageUpdateError = false;
        try {
          await Promise.all(removePromises);
        } catch (err) {
          imageUpdateError = true;
        }
        // Add all current images
        try {
          await Promise.all(
            images.map((img, i) =>
              apiRequest('POST', `/api/properties/${id}/images`, {
                imageUrl: img,
                isPrimary: i === 0,
                altText: `${formData.title} - Image ${i + 1}`,
              })
            )
          );
        } catch (err) {
          imageUpdateError = true;
        }
        // Refetch property data to update local state
        let updatedPropertyWithImages = null;
        try {
          const response = await apiRequest('GET', `/api/properties/${id}`);
          updatedPropertyWithImages = await response.json();
          const imgs = updatedPropertyWithImages.images?.map((img: any) => img.imageUrl) || [];
          setImages(imgs);
          setOriginalImages(imgs);
        } catch (err) {
          // If refetch fails, proceed anyway
        }
        queryClient.invalidateQueries({ queryKey: ['/api/user/properties'] });
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
        toast({
          title: imageUpdateError ? "Property updated, but some images failed" : "Property updated successfully",
          description: imageUpdateError
            ? "Your property was updated, but some images may not have uploaded or been removed."
            : "Your property listing has been updated.",
          variant: imageUpdateError ? "destructive" : undefined,
        });
        // Add a short delay to allow backend propagation
        setTimeout(() => {
          navigate(`/property/${id}`);
        }, 400);
      },
    });
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading || propertyLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-gray-200 h-96 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
          <p className="text-gray-600">Update your property details below</p>
        </div>
        <form onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}>
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Basic Information"}
                {currentStep === 2 && "Property Details"}
                {currentStep === 3 && "Images & Review"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <>
                  <div>
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Luxury Downtown Apartment"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your property's key features and amenities..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Address *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="ZIP Code"
                      />
                    </div>
                  </div>
                </>
              )}
              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <>
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms *</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms *</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="squareFootage">Square Footage</Label>
                      <Input
                        id="squareFootage"
                        type="number"
                        min="0"
                        value={formData.squareFootage}
                        onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                        placeholder="e.g., 1200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={formData.yearBuilt}
                        onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base font-medium">Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                      {[
                        { key: 'parking', label: 'Parking' },
                        { key: 'pool', label: 'Pool' },
                        { key: 'gym', label: 'Gym' },
                        { key: 'petFriendly', label: 'Pet Friendly' },
                        { key: 'furnished', label: 'Furnished' },
                      ].map((amenity) => (
                        <div key={amenity.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity.key}
                            checked={formData[amenity.key as keyof typeof formData] as boolean}
                            onCheckedChange={(checked) => handleInputChange(amenity.key, checked)}
                          />
                          <Label htmlFor={amenity.key}>{amenity.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {/* Step 3: Images & Review */}
              {currentStep === 3 && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Button type="button" onClick={handleImageAdd}>
                        Add Image
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative w-32 h-32 border rounded overflow-hidden">
                          <img src={img} alt={`Property image ${idx + 1}`} className="object-cover w-full h-full" />
                          <button type="button" className="absolute top-1 right-1 bg-white rounded-full p-1" onClick={() => handleImageRemove(idx)}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enter Image URL</DialogTitle>
                      </DialogHeader>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 mt-2"
                        placeholder="https://example.com/image.jpg"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        autoFocus
                      />
                      <DialogFooter>
                        <Button type="button" onClick={handleImageDialogConfirm} disabled={!newImageUrl.trim()}>
                          Add
                        </Button>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Separator />
                </>
              )}
            </CardContent>
            <div className="flex justify-between p-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="button" disabled={updatePropertyMutation.isPending} onClick={handleUpdateClick}>
                  {updatePropertyMutation.isPending ? 'Updating...' : 'Update Listing'}
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
      <Footer />
    </div>
  );
} 