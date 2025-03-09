
import { voteForFeature } from '../supabase';

// Update feature votes in Supabase
export const updateFeatureVotes = async (id: string, userId: string, increment: boolean) => {
  try {
    const result = await voteForFeature(id, userId, increment);
    return result;
  } catch (error) {
    console.error('Error updating feature votes in Supabase:', error);
    return { error };
  }
};
