
import { useState, useEffect } from 'react';
import { OutsetaUser } from '@/utils/types';

export function useOutsetaAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<OutsetaUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to directly get the current auth state
  const refreshAuthState = () => {
    if (window.Outseta) {
      try {
        const jwtPayload = window.Outseta.getJwtPayload();
        
        if (jwtPayload) {
          const userId = jwtPayload.sub || jwtPayload.nameid;
          setUser({
            uid: userId,
            email: jwtPayload.email,
            firstName: jwtPayload.given_name,
            lastName: jwtPayload.family_name,
            fullName: jwtPayload.name
          });
          setIsLoggedIn(true);
          console.log("Auth state refreshed: User is logged in with ID:", userId);
        } else {
          setUser(null);
          setIsLoggedIn(false);
          console.log("Auth state refreshed: User is not logged in");
        }
      } catch (error) {
        console.error("Error refreshing auth state:", error);
        setUser(null);
        setIsLoggedIn(false);
      }
      
      setLoading(false);
    }
  };

  // Initial check when component mounts
  useEffect(() => {
    console.log("useOutsetaAuth: Initializing");
    refreshAuthState();
    
    // Listen for Outseta auth changes
    const handleAuthUpdate = (event: CustomEvent) => {
      console.log("Auth event received in hook:", event.detail);
      refreshAuthState();
    };
    
    window.addEventListener('outseta:auth:updated', handleAuthUpdate as EventListener);
    
    return () => {
      window.removeEventListener('outseta:auth:updated', handleAuthUpdate as EventListener);
    };
  }, []);

  return {
    isLoggedIn,
    user,
    loading,
    refreshAuthState
  };
}
