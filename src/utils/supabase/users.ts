
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
export const getUserFromJWT = () => {
  try {
    // Check if we have an active auth object
    const { data: authData } = supabaseAuth.auth.getUser();
    
    if (!authData) {
      return null;
    }
    
    console.log('User from JWT:', authData);
    return authData.user;
  } catch (error) {
    console.error('Error getting user from JWT:', error);
    return null;
  }
};
