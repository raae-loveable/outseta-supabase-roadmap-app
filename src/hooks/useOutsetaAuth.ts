
import { useState, useEffect } from 'react';
import { OutsetaUser } from '@/utils/types';
import { getAccessToken } from '@/utils/outseta';
import { exchangeOutsetaToken, setSupabaseSession, clearSupabaseSession } from '@/integrations/supabase/authClient';

export function useOutsetaAuth() {
  const [user, setUser] = useState<OutsetaUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);
  const [tokenExchangeError, setTokenExchangeError] = useState<string | null>(null);

  // Function to directly get the current auth state and exchange tokens
  const refreshAuthState = async () => {
    if (window.Outseta) {
      try {
        const jwtPayload = window.Outseta.getJwtPayload();
        
        if (jwtPayload) {
          const userId = jwtPayload.sub || jwtPayload.nameid;
          
          // Set the user data from Outseta
          const outsetaUser = {
            uid: userId,
            email: jwtPayload.email,
            firstName: jwtPayload.given_name,
            lastName: jwtPayload.family_name,
            fullName: jwtPayload.name
          };
          
          setUser(outsetaUser);
          console.log("Auth state refreshed: User is logged in with ID:", userId);
          
          // Get the Outseta access token
          const outsetaToken = await getAccessToken();
          
          if (outsetaToken) {
            try {
              // Exchange the Outseta token for a Supabase token
              const exchangeResult = await exchangeOutsetaToken(outsetaToken);
              
              if (exchangeResult && exchangeResult.token) {
                // Set the Supabase token
                setSupabaseToken(exchangeResult.token);
                
                // Set the Supabase session with the token
                await setSupabaseSession(exchangeResult.token);
                
                console.log("Token exchange successful");
                setTokenExchangeError(null);
              } else {
                console.error("Token exchange failed: No token returned");
                setTokenExchangeError("Token exchange failed: No token returned");
              }
            } catch (error) {
              console.error("Token exchange error:", error);
              setTokenExchangeError(`Token exchange error: ${error.message}`);
            }
          } else {
            console.error("No Outseta token available");
            setTokenExchangeError("No Outseta token available");
          }
        } else {
          // User is not logged in
          setUser(null);
          setSupabaseToken(null);
          
          // Clear the Supabase session
          await clearSupabaseSession();
          
          console.log("Auth state refreshed: User is not logged in");
        }
      } catch (error) {
        console.error("Error refreshing auth state:", error);
        setUser(null);
        setSupabaseToken(null);
        setTokenExchangeError(`Error refreshing auth state: ${error.message}`);
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
    isLoggedIn: !!user, // Simplify - user exists means logged in
    user,
    loading,
    refreshAuthState,
    supabaseToken,
    tokenExchangeError
  };
}
