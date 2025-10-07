import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import CreateListing from "@/pages/create-listing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Favorites from "@/pages/favorites";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import EditListing from "@/pages/edit-listing";
import MortgageCalculatorPage from "@/pages/mortgage-calculator";
import ContactUs from "@/pages/contact";
import CookiePolicy from "@/pages/cookie-policy";
import TermsOfService from "@/pages/terms-of-service";
import HelpCenter from "@/pages/help-center";
import AdminPage from "@/pages/admin";
import AdminSignup from "@/pages/adminsu";
import Messages from "@/pages/messages";
import PropertyGuides from "@/pages/property-guides";
import MarketReports from "@/pages/market-reports";
import InvestmentTips from "@/pages/investment-tips";
import AgentDirectory from "@/pages/agent-directory";

function Router() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!currentUser ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/properties" component={Properties} />
          <Route path="/property/:id" component={PropertyDetail} />
          <Route path="/contact" component={ContactUs} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/help-center" component={HelpCenter} />
          <Route path="/help-center/:articleId" component={HelpCenter} />
          <Route path="/mortgage-calculator" component={MortgageCalculatorPage} />
          <Route path="/property-guides" component={PropertyGuides} />
          <Route path="/market-reports" component={MarketReports} />
          <Route path="/investment-tips" component={InvestmentTips} />
          <Route path="/agent-directory" component={AgentDirectory} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/adminsu" component={AdminSignup} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/properties" component={Properties} />
          <Route path="/property/:id" component={PropertyDetail} />
          <Route path="/mortgage-calculator" component={MortgageCalculatorPage} />
          <Route path="/create-listing" component={CreateListing} />
          <Route path="/edit-listing/:id" component={EditListing} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/messages" component={Messages} />
          <Route path="/contact" component={ContactUs} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/help-center" component={HelpCenter} />
          <Route path="/help-center/:articleId" component={HelpCenter} />
          <Route path="/property-guides" component={PropertyGuides} />
          <Route path="/market-reports" component={MarketReports} />
          <Route path="/investment-tips" component={InvestmentTips} />
          <Route path="/agent-directory" component={AgentDirectory} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/adminsu" component={AdminSignup} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
