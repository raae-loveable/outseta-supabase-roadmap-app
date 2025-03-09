
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zdamhserdloguqftisiz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW1oc2VyZGxvZ3VxZnRpc2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTI2NzMsImV4cCI6MjA1NzA4ODY3M30.wxBuir_93S70G_F_OYPwo897pXMW-y9VESvzw1Up-9c";

// This client is used for authentication with custom JWT tokens
export const supabaseAuth = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Function to exchange an Outseta JWT for a Supabase JWT
export const exchangeOutsetaToken = async (outsetaToken: string) => {
  try {
    console.log("Exchanging Outseta token for Supabase token");
    
    // Using the supabase.functions.invoke method instead of direct fetch
    const { data, error } = await supabaseAuth.functions.invoke('outseta-auth', {
      headers: {
        'Authorization': `Bearer ${outsetaToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (error) {
      console.error("Token exchange failed:", error);
      throw new Error(`Token exchange failed: ${error.message}`);
    }
    
    console.log("Token exchange response:", data);
    return data;
  } catch (error) {
    console.error("Token exchange error:", error);
    throw error;
  }
};

// Function to set the Supabase auth session with the exchanged token
export const setSupabaseSession = async (token: string) => {
  try {
    console.log("Setting Supabase session with token:", token ? "Token exists" : "No token");
    
    // Set auth session directly using the JWT
    const { data, error } = await supabaseAuth.auth.setSession({
      access_token: token,
      refresh_token: token, // Using the same token as refresh token
    });
    
    if (error) {
      console.error("Error setting Supabase session:", error);
      throw error;
    }
    
    // Verify the session was set by checking if we can get the user
    const { data: userData } = await supabaseAuth.auth.getUser();
    console.log("Supabase session set successfully, user:", userData?.user?.id);
    
    return data;
  } catch (error) {
    console.error("Error setting Supabase session:", error);
    throw error;
  }
};

// Function to clear the Supabase session on logout
export const clearSupabaseSession = async () => {
  try {
    console.log("Clearing Supabase session");
    const { error } = await supabaseAuth.auth.signOut();
    
    if (error) {
      console.error("Error clearing Supabase session:", error);
      throw error;
    }
    
    console.log("Supabase session cleared");
  } catch (error) {
    console.error("Error clearing Supabase session:", error);
    throw error;
  }
};
