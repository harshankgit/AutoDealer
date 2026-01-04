// components/CarFinancing/CarFinancingCalculator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Car, Calculator, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const CarFinancingCalculator = () => {
  const [carPrice, setCarPrice] = useState<string>('1000000');
  const [downPayment, setDownPayment] = useState<string>('200000');
  const [loanTerm, setLoanTerm] = useState<string>('60');
  const [interestRate, setInterestRate] = useState<string>('8.5');
  const [results, setResults] = useState<{
    monthlyPayment: number;
    totalInterest: number;
    totalPayment: number;
    loanAmount: number;
  } | null>(null);

  const calculateLoan = () => {
    const price = parseFloat(carPrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const term = parseInt(loanTerm) || 60;
    const rate = parseFloat(interestRate) || 0;

    if (price <= 0 || down < 0 || term <= 0 || rate < 0) {
      return;
    }

    const loanAmount = price - down;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = 
      loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
      (Math.pow(1 + monthlyRate, term) - 1);

    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - loanAmount;

    setResults({
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      loanAmount
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
            <Calculator className="h-6 w-6" />
            Car Financing Calculator
          </CardTitle>
          <CardDescription>
            Calculate your monthly payments and total cost of financing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="carPrice">Car Price (₹)</Label>
                <Input
                  id="carPrice"
                  type="number"
                  value={carPrice}
                  onChange={(e) => setCarPrice(e.target.value)}
                  placeholder="Enter car price"
                />
              </div>

              <div>
                <Label htmlFor="downPayment">Down Payment (₹)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="Enter down payment"
                />
              </div>

              <div>
                <Label htmlFor="loanTerm">Loan Term (months)</Label>
                <Select value={loanTerm} onValueChange={setLoanTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 months (1 year)</SelectItem>
                    <SelectItem value="24">24 months (2 years)</SelectItem>
                    <SelectItem value="36">36 months (3 years)</SelectItem>
                    <SelectItem value="48">48 months (4 years)</SelectItem>
                    <SelectItem value="60">60 months (5 years)</SelectItem>
                    <SelectItem value="72">72 months (6 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="Enter interest rate"
                />
              </div>

              <Button 
                onClick={calculateLoan} 
                className="w-full"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate
              </Button>
            </div>

            <div className="space-y-4">
              {results ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <div className="h-5 w-5 text-green-500 flex items-center justify-center">₹</div>
                      Monthly Payment
                    </h3>
                    <div className="text-2xl font-bold text-primary">
                      ₹{results.monthlyPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-1">Loan Amount</h4>
                      <div className="text-lg font-semibold">
                        ₹{results.loanAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-1">Total Interest</h4>
                      <div className="text-lg font-semibold text-red-500">
                        ₹{results.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Total Payment
                    </h3>
                    <div className="text-xl font-bold text-primary">
                      ₹{results.totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Over {loanTerm} months
                    </p>
                  </Card>

                  <div className="pt-2">
                    <h4 className="font-medium mb-2">Payment Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Principal</span>
                        <span>₹{results.loanAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest</span>
                        <span className="text-red-500">₹{results.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>₹{results.totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Enter your loan details</h4>
                  <p className="text-muted-foreground">
                    Fill in the form to calculate your financing options
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarFinancingCalculator;