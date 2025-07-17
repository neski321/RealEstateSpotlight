import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Home, DollarSign, Percent, Calendar, Calculator } from "lucide-react"

interface MortgageCalculatorProps {
  initialPrice?: number
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ initialPrice = 300000 }) => {
  const [price, setPrice] = useState(initialPrice)
  const [downPayment, setDownPayment] = useState(60000)
  const [interestRate, setInterestRate] = useState(6.0)
  const [term, setTerm] = useState(30)

  const principal = price - downPayment
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = term * 12
  const monthlyPayment =
    monthlyRate === 0
      ? principal / numberOfPayments
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments))

  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - principal
  const downPaymentPercentage = (downPayment / price) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Mortgage Calculator</CardTitle>
          </div>
          <CardDescription>Calculate your monthly mortgage payment and see the breakdown</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  min={0}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">{formatCurrency(price)}</p>
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
                  min={0}
                  max={price}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="text-lg"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(downPayment)}</span>
                  <Badge variant="secondary">{downPaymentPercentage.toFixed(1)}% of home price</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Interest Rate
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  min={0}
                  step={0.01}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">{interestRate}% APR</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Loan Term
                </Label>
                <Input
                  id="term"
                  type="number"
                  value={term}
                  min={1}
                  max={40}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  {term} years ({numberOfPayments} payments)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Monthly Payment</h3>
              <div className="text-4xl font-bold text-primary">{formatCurrencyDetailed(monthlyPayment)}</div>
              <p className="text-sm text-muted-foreground mt-1">Principal & Interest</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
                  <div className="text-xl font-semibold">{formatCurrency(principal)}</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Total Interest</div>
                  <div className="text-xl font-semibold text-orange-600">{formatCurrency(totalInterest)}</div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Total Payment</div>
                  <div className="text-xl font-semibold">{formatCurrency(totalPayment)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Payment Breakdown</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Principal & Interest:</span>
                  <span className="font-medium">{formatCurrencyDetailed(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Down Payment:</span>
                  <span className="font-medium">{formatCurrency(downPayment)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * This calculation does not include taxes, insurance, HOA fees, or PMI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MortgageCalculator
