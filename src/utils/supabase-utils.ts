
import { supabaseAuth } from "@/integrations/supabase/authClient";

// Increment a feature's vote count
export const incrementFeatureVotes = async (featureId: string) => {
  try {
    const { error } = await supabaseAuth.rpc(
      'increment',
      { row_id: featureId, x: 1 } as any
    );
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error incrementing votes:', error);
    return { success: false, error };
  }
};

// Decrement a feature's vote count
export const decrementFeatureVotes = async (featureId: string) => {
  try {
    const { error } = await supabaseAuth.rpc(
      'decrement',
      { row_id: featureId, x: 1 } as any
    );
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error decrementing votes:', error);
    return { success: false, error };
  }
};
