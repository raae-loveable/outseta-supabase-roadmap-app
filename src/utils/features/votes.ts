
import { voteForFeature } from '../supabase/votes';

// Update votes for a feature in Supabase
export const updateFeatureVotes = async (
  featureId: string,
  userId: string,
  increment: boolean
) => {
  try {
    console.log('Updating votes for feature:', { featureId, userId, increment });
    
    const result = await voteForFeature(featureId, userId, increment);
    
    if ('error' in result) {
      console.error('Error updating votes:', result.error);
      return { error: result.error };
    }
    
    return { action: result.action };
  } catch (error) {
    console.error('Error in updateFeatureVotes:', error);
    return { error };
  }
};
