import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useState } from "react";

interface PropertySearchProps {
  onSearch: (searchParams: any) => void;
}

export default function PropertySearch({ onSearch }: PropertySearchProps) {
  const [searchParams, setSearchParams] = useState({
    location: '',
    propertyType: 'any',
    priceRange: 'any',
    bedrooms: 'any',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleInputChange = (key: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="bg-white shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="Enter city or neighborhood"
                value={searchParams.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </Label>
              <Select value={searchParams.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
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
            
            <div>
              <Label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </Label>
              <Select value={searchParams.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="0-500000">$0 - $500k</SelectItem>
                  <SelectItem value="500000-1000000">$500k - $1M</SelectItem>
                  <SelectItem value="1000000-2000000">$1M - $2M</SelectItem>
                  <SelectItem value="2000000-">$2M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </Label>
              <Select value={searchParams.bedrooms} onValueChange={(value) => handleInputChange('bedrooms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
            <Search className="h-4 w-4 mr-2" />
            Search Properties
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
