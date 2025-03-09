
import { supabase } from '@/integrations/supabase/client';

// Function to increment a vote count
export const incrementVoteCount = async (featureId: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'increment',
      { row_id: featureId, x: 1 }
    );
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error incrementing vote count:', error);
    return { success: false, error };
  }
};

// Function to decrement a vote count
export const decrementVoteCount = async (featureId: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'decrement',
      { row_id: featureId, x: 1 }
    );
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error decrementing vote count:', error);
    return { success: false, error };
  }
};
