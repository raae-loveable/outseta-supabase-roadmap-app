
import { getUserProfile } from '../supabase';

// Helper function to check if a user can perform an action
export const canPerformAction = async () => {
  try {
    const user = await getUserProfile();
    return !!user;
  } catch (error) {
    console.error('Error checking if user can perform action:', error);
    return false;
  }
};
