import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bed, Bath, Maximize, Camera, Heart } from "lucide-react";
import { Link } from "wouter";
import type { PropertyWithStats } from "@shared/schema";

interface PropertyCardProps {
  property: PropertyWithStats;
  showFeatured?: boolean;
}

export default function PropertyCard({ property, showFeatured = false }: PropertyCardProps) {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        <img 
          src={imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full">
          <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer" />
        </div>
        {showFeatured && property.featured && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-white">Featured</Badge>
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
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          {property.reviewCount > 0 && (
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm text-gray-600">
                {property.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-3 line-clamp-1">
          {property.location}
        </p>
        
        <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
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
      </CardContent>
    </Card>
  );
}
