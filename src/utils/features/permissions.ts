
import { getUserProfile, getUserFromJWTPayload } from '../supabase';

// Helper function to check if a user can perform an action
export const canPerformAction = async (customClient?: any, jwtPayload?: any) => {
  try {
    // If we have a custom client, use it
    if (customClient) {
      const user = await getUserProfile(customClient);
      
      if (!user) {
        console.log('No user found with custom client, action not permitted');
        return false;
      }
      
      console.log('User authenticated with custom client, action permitted for:', user.id);
      return true;
    }
    
    // If we have a JWT payload but no client, extract user info from payload
    if (jwtPayload) {
      const user = getUserFromJWTPayload(jwtPayload);
      
      if (!user) {
        console.log('No user extracted from JWT payload, action not permitted');
        return false;
      }
      
      console.log('User extracted from JWT payload, action permitted for:', user.id);
      return true;
    }
    
    console.log('No authentication method provided, action not permitted');
    return false;
  } catch (error) {
    console.error('Error checking if user can perform action:', error);
    return false;
  }
};
