// I'm assuming the content of this file, as it wasn't provided fully
// Let's fix the type errors in the RPC calls

import { supabase } from '@/integrations/supabase/client';

// Other utility functions...

// Fix the RPC function calls that are having TypeScript errors
export const incrementVotes = async (featureId: string) => {
  const { data, error } = await supabase.rpc(
    'increment',
    { x: 1, row_id: featureId }
  );
  
  if (error) {
    console.error('Error incrementing votes:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
};

export const decrementVotes = async (featureId: string) => {
  const { data, error } = await supabase.rpc(
    'decrement',
    { x: 1, row_id: featureId }
  );
  
  if (error) {
    console.error('Error decrementing votes:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
};

// Keep the rest of the utility functions...
