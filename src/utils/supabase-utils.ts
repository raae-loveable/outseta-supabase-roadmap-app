import { supabase } from '@/lib/supabaseClient';

export const incrementVotes = (featureId: string) => {
  return supabase.rpc("increment", { feature_id: featureId } as any);
};

export const decrementVotes = (featureId: string) => {
  return supabase.rpc("decrement", { feature_id: featureId } as any);
};
