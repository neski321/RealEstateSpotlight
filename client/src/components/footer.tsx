import { Home, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Home className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold">PropertyHub</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in finding the perfect property. Connect with verified agents and explore premium listings.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Browse</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/properties" className="hover:text-white">All Properties</a></li>
              <li><a href="/properties?type=apartment" className="hover:text-white">Apartments</a></li>
              <li><a href="/properties?type=house" className="hover:text-white">Houses</a></li>
              <li><a href="/properties?type=condo" className="hover:text-white">Condos</a></li>
              <li><a href="/properties?featured=true" className="hover:text-white">Luxury Properties</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Property Guides</a></li>
              <li><a href="#" className="hover:text-white">Market Reports</a></li>
              <li><a href="#" className="hover:text-white">Investment Tips</a></li>
              <li><a href="#" className="hover:text-white">Agent Directory</a></li>
              <li><a href="#" className="hover:text-white">Mortgage Calculator</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PropertyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
