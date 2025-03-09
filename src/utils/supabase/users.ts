
import { supabaseAuth } from '@/integrations/supabase/authClient';
import { useOutsetaAuth } from '@/hooks/useOutsetaAuth';

// Get user profile from Supabase
export const getUserProfile = async (customClient?: any) => {
  try {
    if (customClient) {
      // If a custom client with JWT token is provided, use it to get user info
      const { data, error } = await customClient.auth.getUser();
      
      if (error) {
        console.error('Error getting user with custom client:', error);
        return null;
      }
      
      if (data.user) {
        console.log('User profile retrieved with custom client:', data.user);
        return data.user;
      }
      
      console.log('No user found with custom client');
      return null;
    }
    
    // Fallback to session method
    const { data: { session } } = await supabaseAuth.auth.getSession();
    
    if (!session) {
      console.log('No active session found');
      return null;
    }
    
    // Get the user from the session
    const user = session.user;
    
    // Log the user data for debugging
    console.log('User profile retrieved:', user);
    
    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Get user metadata from JWT
export const getUserFromJWT = async () => {
  try {
    // Get the user data by awaiting the promise
    const { data: { user } } = await supabaseAuth.auth.getUser();
    
    if (!user) {
      console.log('No user found in JWT');
      return null;
    }
    
    console.log('User from JWT:', user);
    return user;
  } catch (error) {
    console.error('Error getting user from JWT:', error);
    return null;
  }
};
