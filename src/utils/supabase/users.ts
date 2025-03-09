
import { supabaseAuth } from '@/integrations/supabase/authClient';

// Get user profile from Supabase
export const getUserProfile = async () => {
  try {
    // Get the current user session
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
