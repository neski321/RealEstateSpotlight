import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
}

export default function PropertyFilters({ onFiltersChange, currentFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState(currentFilters);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Property Type</Label>
          <Select value={filters.propertyType || 'any'} onValueChange={(value) => handleFilterChange('propertyType', value === 'any' ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Type</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bedrooms */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Bedrooms</Label>
          <div className="grid grid-cols-4 gap-2">
            {['', '1', '2', '3', '4'].map((value) => (
              <Button
                key={value}
                variant={filters.bedrooms === (value ? Number(value) : undefined) ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('bedrooms', value ? Number(value) : undefined)}
              >
                {value || 'Any'}
              </Button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Bathrooms</Label>
          <div className="grid grid-cols-4 gap-2">
            {['', '1', '2', '3', '4'].map((value) => (
              <Button
                key={value}
                variant={filters.bathrooms === (value ? Number(value) : undefined) ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('bathrooms', value ? Number(value) : undefined)}
              >
                {value || 'Any'}
              </Button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Amenities</Label>
          <div className="space-y-2">
            {[
              { key: 'parking', label: 'Parking' },
              { key: 'pool', label: 'Pool' },
              { key: 'gym', label: 'Gym' },
              { key: 'petFriendly', label: 'Pet Friendly' },
            ].map((amenity) => (
              <div key={amenity.key} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.key}
                  checked={filters.amenities?.includes(amenity.key) || false}
                  onCheckedChange={(checked) => {
                    const currentAmenities = filters.amenities || [];
                    const newAmenities = checked
                      ? [...currentAmenities, amenity.key]
                      : currentAmenities.filter((a: string) => a !== amenity.key);
                    handleFilterChange('amenities', newAmenities.length > 0 ? newAmenities : undefined);
                  }}
                />
                <Label htmlFor={amenity.key} className="text-sm">
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
