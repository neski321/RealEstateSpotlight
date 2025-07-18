import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function CreateListing() {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

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

  const createPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      const response = await apiRequest('POST', '/api/properties', propertyData);
      return response.json();
    },
    onSuccess: async (property) => {
      // Add images if any
      let imageUploadError = false;
      if (images.length > 0) {
        try {
          await Promise.all(
            images.map((img, i) =>
              apiRequest('POST', `/api/properties/${property.id}/images`, {
                imageUrl: img,
                isPrimary: i === 0,
                altText: `${formData.title} - Image ${i + 1}`,
              })
            )
          );
        } catch (error) {
          imageUploadError = true;
          console.error('Error adding images:', error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['/api/user/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      toast({
        title: imageUploadError ? "Property listed, but some images failed" : "Property listed successfully",
        description: imageUploadError
          ? "Your property was added, but some images may not have uploaded."
          : "Your property has been added to the marketplace.",
        variant: imageUploadError ? "destructive" : undefined,
      });
      
      navigate(`/property/${property.id}`);
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
        description: "Failed to create property listing. Please try again.",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3) return; // Only submit on last step
    
    // Validate required fields
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

    createPropertyMutation.mutate(propertyData);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
          <p className="text-gray-600">Add your property to reach thousands of potential buyers</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Images</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={e => {
          if (e.key === 'Enter' && currentStep !== 3) {
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

                  <div>
                    <Label className="text-base font-medium">Review Your Listing</Label>
                    <div className="bg-gray-50 p-4 rounded-lg mt-3 space-y-2">
                      <div><strong>Title:</strong> {formData.title}</div>
                      <div><strong>Price:</strong> ${parseFloat(formData.price || '0').toLocaleString()}</div>
                      <div><strong>Location:</strong> {formData.location}, {formData.city}, {formData.state}</div>
                      <div><strong>Type:</strong> {formData.propertyType}</div>
                      <div><strong>Bed/Bath:</strong> {formData.bedrooms} bed, {formData.bathrooms} bath</div>
                      {formData.squareFootage && <div><strong>Size:</strong> {formData.squareFootage} sq ft</div>}
                      <div><strong>Images:</strong> {images.length} photo{images.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createPropertyMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createPropertyMutation.isPending ? 'Creating...' : 'Create Listing'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
