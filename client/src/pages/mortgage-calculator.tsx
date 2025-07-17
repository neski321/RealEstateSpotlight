import React from 'react';
import MortgageCalculator from '../components/mortgage-calculator';
import Navigation from '../components/navigation';
import Footer from '../components/footer';

const MortgageCalculatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Mortgage Calculator</h1>
        <MortgageCalculator />
      </main>
      <Footer />
    </div>
  );
};

export default MortgageCalculatorPage; 