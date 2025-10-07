import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, DollarSign, Percent, Calendar, Calculator, X } from "lucide-react";

// Helper functions for property-specific calculations
const getInterestRateForProperty = (property?: Property): number => {
  if (!property) return 6.0;
  
  // Different interest rates based on property type and characteristics
  let baseRate = 6.0;
  
  // Adjust based on property type
  switch (property.propertyType.toLowerCase()) {
    case 'house':
    case 'single-family':
      baseRate = 5.8;
      break;
    case 'condo':
      baseRate = 6.2;
      break;
    case 'townhouse':
      baseRate = 6.0;
      break;
    case 'apartment':
      baseRate = 6.5;
      break;
    default:
      baseRate = 6.0;
  }
  
  // Adjust based on year built (newer = better rate)
  if (property.yearBuilt) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - property.yearBuilt;
    if (age < 5) baseRate -= 0.2;
    else if (age > 30) baseRate += 0.3;
  }
  
  // Adjust based on square footage (larger = slightly better rate)
  if (property.squareFootage && property.squareFootage > 2000) {
    baseRate -= 0.1;
  }
  
  return Math.round(baseRate * 10) / 10; // Round to 1 decimal place
};

const getSuggestedTerm = (property?: Property): number => {
  if (!property) return 30;
  
  // Different terms based on property type and price
  const price = Number(property.price.replace(/[^0-9.-]+/g, ""));
  
  // Higher value properties might benefit from longer terms
  if (price > 1000000) return 30; // Jumbo loans typically 30 years
  if (price > 500000) return 30;  // High-value properties
  if (price < 200000) return 15;  // Lower value properties can afford shorter terms
  
  return 30; // Default
};

const getPropertyTypeDisplay = (property?: Property): string => {
  if (!property) return "Property";
  
  const typeMap: { [key: string]: string } = {
    'house': 'Single Family Home',
    'single-family': 'Single Family Home',
    'condo': 'Condominium',
    'townhouse': 'Townhouse',
    'apartment': 'Apartment',
  };
  
  return typeMap[property.propertyType.toLowerCase()] || property.propertyType;
};

const getLocationDisplay = (property?: Property): string => {
  if (!property) return "Location";
  return property.location;
};

interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number | null;
  yearBuilt?: number | null;
  lotSize?: number | null;
}

interface MortgageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property;
  initialPrice?: number;
}

const MortgageCalculatorModal: React.FC<MortgageCalculatorModalProps> = ({ 
  isOpen, 
  onClose, 
  property,
  initialPrice = 300000 
}) => {
  // Calculate property-specific values
  const propertyPrice = property ? Number(property.price.replace(/[^0-9.-]+/g, "")) : initialPrice;
  const suggestedDownPayment = Math.round(propertyPrice * 0.2); // 20% down payment
  const suggestedInterestRate = getInterestRateForProperty(property);
  const suggestedTerm = getSuggestedTerm(property);
  
  const [price, setPrice] = useState(propertyPrice);
  const [downPayment, setDownPayment] = useState(suggestedDownPayment);
  const [interestRate, setInterestRate] = useState(suggestedInterestRate);
  const [term, setTerm] = useState(suggestedTerm);

  // Update values when property changes
  React.useEffect(() => {
    if (property) {
      const newPrice = Number(property.price.replace(/[^0-9.-]+/g, ""));
      setPrice(newPrice);
      setDownPayment(Math.round(newPrice * 0.2));
      setInterestRate(getInterestRateForProperty(property));
      setTerm(getSuggestedTerm(property));
    }
  }, [property]);

  const principal = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = term * 12;
  const monthlyPayment =
    monthlyRate === 0
      ? principal / numberOfPayments
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - principal;
  const downPaymentPercentage = (downPayment / price) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mortgage Calculator
            {property && (
              <Badge variant="secondary" className="ml-2">
                {getPropertyTypeDisplay(property)}
              </Badge>
            )}
          </DialogTitle>
          {property && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{property.title}</p>
              <p>{getLocationDisplay(property)} • {property.bedrooms} bed, {property.bathrooms} bath</p>
            </div>
          )}
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Enter the property price and your down payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Property Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="300000"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downPayment" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Down Payment
                  </Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    placeholder="60000"
                    className="text-lg"
                  />
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(downPayment)} ({downPaymentPercentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Loan Terms
              </CardTitle>
              <CardDescription>
                Set your interest rate and loan term
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate" className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Interest Rate (%)
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    placeholder="6.0"
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Loan Term (years)
                  </Label>
                  <Input
                    id="term"
                    type="number"
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    placeholder="30"
                    className="text-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Monthly Payment</CardTitle>
              <CardDescription>
                Your estimated monthly mortgage payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-4">
                {formatCurrencyDetailed(monthlyPayment)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Principal:</span>
                  <div className="font-semibold">{formatCurrency(principal)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Down Payment:</span>
                  <div className="font-semibold">{formatCurrency(downPayment)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Breakdown</CardTitle>
              <CardDescription>
                Total costs over the life of your loan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalPayment)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Payment</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalInterest)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Interest</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(price)}
                  </div>
                  <div className="text-sm text-muted-foreground">Property Value</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Interest to Principal Ratio:</span>
                  <Badge variant="secondary">
                    {((totalInterest / principal) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <span className="font-semibold">{formatCurrencyDetailed(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Payments:</span>
                  <span className="font-semibold">{numberOfPayments}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property-Specific Insights */}
          {property && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Property Insights</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Personalized recommendations for this {getPropertyTypeDisplay(property).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Interest Rate</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestedInterestRate}% rate based on {getPropertyTypeDisplay(property).toLowerCase()} type
                      {property.yearBuilt && ` and ${new Date().getFullYear() - property.yearBuilt}-year age`}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Loan Term</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestedTerm}-year term recommended for this price range
                    </p>
                  </div>
                </div>
                
                {property.squareFootage && (
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Property Details</h4>
                    <p className="text-sm text-muted-foreground">
                      {property.squareFootage.toLocaleString()} sq ft • Built in {property.yearBuilt || 'Unknown'}
                      {property.lotSize && ` • ${property.lotSize} sq ft lot`}
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Market Context</h4>
                  <p className="text-sm text-muted-foreground">
                    {property.propertyType.toLowerCase() === 'house' || property.propertyType.toLowerCase() === 'single-family' 
                      ? "Single-family homes typically have the best mortgage rates and terms."
                      : property.propertyType.toLowerCase() === 'condo'
                      ? "Condos may have slightly higher rates due to HOA considerations."
                      : "This property type offers competitive financing options."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MortgageCalculatorModal;
