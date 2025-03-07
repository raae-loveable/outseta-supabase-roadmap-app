
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { openOutsetaSignIn, openOutsetaSignUp, logoutUser } from '@/utils/outseta';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Menu, User, UserPlus } from 'lucide-react';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function Header({ className, ...props }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 glass animate-fade-in",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-subtle animate-pulse-subtle">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5 text-white"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" x2="8" y1="13" y2="13"/>
              <line x1="16" x2="8" y1="17" y2="17"/>
              <line x1="10" x2="8" y1="9" y2="9"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium tracking-tight">Roadmap</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#submit" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Submit Idea
          </a>
          
          <div data-o-authenticated>
            <div className="flex items-center gap-2">
              <button 
                data-o-profile="1" 
                data-mode="popup" 
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium shadow-subtle hover:opacity-90 transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
          
          <div data-o-anonymous className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={openOutsetaSignIn}
              className="flex items-center gap-1"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
            <Button 
              onClick={openOutsetaSignUp}
              className="flex items-center gap-1"
              size="sm"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Button>
          </div>
        </nav>
        
        <button 
          className="block md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          onClick={toggleMobileMenu}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-background/95 backdrop-blur-sm border-b border-border/30 animate-slide-down">
          <nav className="flex flex-col space-y-4">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#submit" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Submit Idea
            </a>
            
            <div data-o-authenticated>
              <div className="flex flex-col space-y-2">
                <button 
                  data-o-profile="1" 
                  data-mode="popup" 
                  className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium shadow-subtle hover:opacity-90 transition-all w-full cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
            
            <div data-o-anonymous>
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  onClick={openOutsetaSignIn}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
                <Button 
                  onClick={openOutsetaSignUp}
                  className="flex items-center justify-center gap-1 w-full"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
