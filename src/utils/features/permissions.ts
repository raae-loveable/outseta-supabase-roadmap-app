
import { getUserProfile } from '../supabase';

// Helper function to check if a user can perform an action
export const canPerformAction = async () => {
  try {
    const user = await getUserProfile();
    
    if (!user) {
      console.log('No user found, action not permitted');
      return false;
    }
    
    console.log('User authenticated, action permitted for:', user.id);
    return true;
  } catch (error) {
    console.error('Error checking if user can perform action:', error);
    return false;
  }
};
