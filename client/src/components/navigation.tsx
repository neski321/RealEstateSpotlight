import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Home, Search, Plus, User, Settings, LogOut, Heart } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { currentUser, signOutUser, logCurrentUserIdToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      window.location.href = "/";
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Home className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">PropertyHub</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search by location, property type, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </div>
            {currentUser ? (
              <>
                <Link href="/properties">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                    Browse
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
                <Link href="/create-listing">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    List Property
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.displayName || ""} />
                        <AvatarFallback>
                          {currentUser.displayName?.[0] || currentUser.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium hidden sm:block text-foreground">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/properties">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                    Browse
                  </Button>
                </Link>
                <Button asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
