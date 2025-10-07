import { Home, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Home className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold">PropertyHub</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Your trusted partner in finding the perfect property. Connect with verified agents and explore premium listings.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Browse</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/properties" className="hover:text-primary">All Properties</a></li>
              <li><a href="/properties?type=apartment" className="hover:text-primary">Apartments</a></li>
              <li><a href="/properties?type=house" className="hover:text-primary">Houses</a></li>
              <li><a href="/properties?type=condo" className="hover:text-primary">Condos</a></li>
              <li><a href="/properties?featured=true" className="hover:text-primary">Luxury Properties</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/property-guides" className="hover:text-primary">Property Guides</a></li>
              <li><a href="/market-reports" className="hover:text-primary">Market Reports</a></li>
              <li><a href="/investment-tips" className="hover:text-primary">Investment Tips</a></li>
              <li><a href="/agent-directory" className="hover:text-primary">Agent Directory</a></li>
              <li><a href="/mortgage-calculator" className="hover:text-primary">Mortgage Calculator</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/help-center" className="hover:text-primary">Help Center</a></li>
              <li><a href="/contact" className="hover:text-primary">Contact Us</a></li>
              <li><a href="/privacy-policy" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="/cookie-policy" className="hover:text-primary">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 PropertyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
