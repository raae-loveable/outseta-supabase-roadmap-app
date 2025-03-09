
import { supabaseAuth } from '@/integrations/supabase/authClient';

// Get user profile from Supabase
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabaseAuth.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
