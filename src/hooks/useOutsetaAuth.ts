
import { useState, useEffect, useRef } from 'react';
import { OutsetaUser } from '@/utils/types';
import { getAccessToken, getAuthPayload } from '@/utils/outseta';
import { exchangeOutsetaToken, createSupabaseClientWithToken, clearSupabaseSession } from '@/integrations/supabase/authClient';
import { getUserFromJWTPayload } from '@/utils/supabase';

// Create a singleton pattern to prevent multiple instances
let authInstance = null;
let initializationInProgress = false;

export function useOutsetaAuth() {
  const [user, setUser] = useState<OutsetaUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [tokenExchangeError, setTokenExchangeError] = useState<string | null>(null);
  const [jwtPayload, setJwtPayload] = useState<any>(null);
  
  // Use a ref to track if this instance has been initialized
  const initialized = useRef(false);

  // Function to directly get the current auth state and exchange tokens
  const refreshAuthState = async () => {
    if (window.Outseta) {
      try {
        // Get JWT payload directly from Outseta
        const payload = window.Outseta.getJwtPayload();
        setJwtPayload(payload);
        
        if (payload) {
          const userId = payload.sub || payload.nameid;
          
          // Set the user data from Outseta
          const outsetaUser = {
            uid: userId,
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            fullName: payload.name
          };
          
          setUser(outsetaUser);
          console.log("Auth state refreshed: User is logged in with ID:", userId);
          
          // Get the Outseta access token
          const outsetaToken = await getAccessToken();
          
          if (outsetaToken) {
            try {
              // Exchange the Outseta token for a Supabase token
              const exchangeResult = await exchangeOutsetaToken(outsetaToken);
              
              if (exchangeResult && exchangeResult.supabaseJwt) {
                // Set the Supabase token
                const token = exchangeResult.supabaseJwt;
                setSupabaseToken(token);
                
                // Create a new Supabase client with the token
                const client = createSupabaseClientWithToken(token);
                setSupabaseClient(client);
                
                console.log("Token exchange successful and Supabase client created");
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
          setSupabaseClient(null);
          setJwtPayload(null);
          
          // Clear the Supabase session
          await clearSupabaseSession();
          
          console.log("Auth state refreshed: User is not logged in");
        }
      } catch (error) {
        console.error("Error refreshing auth state:", error);
        setUser(null);
        setSupabaseToken(null);
        setSupabaseClient(null);
        setJwtPayload(null);
        setTokenExchangeError(`Error refreshing auth state: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  // Initial check when component mounts
  useEffect(() => {
    // Only initialize once
    if (initialized.current) {
      console.log("useOutsetaAuth: Already initialized, skipping");
      return;
    }

    // Set this instance as initialized
    initialized.current = true;
    
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
    isLoggedIn: !!user, 
    user,
    loading,
    refreshAuthState,
    supabaseToken,
    supabaseClient,
    tokenExchangeError,
    jwtPayload
  };
}
