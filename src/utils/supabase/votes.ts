
import { supabase } from '@/integrations/supabase/client';

// Vote for a feature in Supabase
export const voteForFeature = async (
  featureId: string,
  userId: string,
  increment: boolean,
  customClient = supabase
) => {
  try {
    console.log('Voting for feature in Supabase:', { featureId, userId, increment });
    
    // Check if user has already voted for this feature
    const { data: existingVote, error: checkError } = await customClient
      .from('feature_votes')
      .select('*')
      .eq('feature_id', featureId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking vote:', checkError);
      throw checkError;
    }

    // Add or remove vote based on the increment flag
    if (increment && !existingVote) {
      // Add vote
      const { error: addError } = await customClient
        .from('feature_votes')
        .insert({
          feature_id: featureId,
          user_id: userId,
        });

      if (addError) {
        console.error('Error adding vote:', addError);
        throw addError;
      }

      // Increment the votes count in the features table
      const { data: feature, error: getError } = await customClient
        .from('features')
        .select('votes')
        .eq('id', featureId)
        .single();
      
      if (getError) {
        console.error('Error getting feature votes:', getError);
        throw getError;
      }
      
      const newVoteCount = (feature.votes || 0) + 1;
      
      const { error: updateError } = await customClient
        .from('features')
        .update({ votes: newVoteCount })
        .eq('id', featureId);
      
      if (updateError) {
        console.error('Error incrementing votes:', updateError);
        throw updateError;
      }

      return { action: 'added' };
    } else if (!increment && existingVote) {
      // Remove vote
      const { error: removeError } = await customClient
        .from('feature_votes')
        .delete()
        .eq('feature_id', featureId)
        .eq('user_id', userId);

      if (removeError) {
        console.error('Error removing vote:', removeError);
        throw removeError;
      }

      // Decrement the votes count in the features table
      const { data: feature, error: getError } = await customClient
        .from('features')
        .select('votes')
        .eq('id', featureId)
        .single();
      
      if (getError) {
        console.error('Error getting feature votes:', getError);
        throw getError;
      }
      
      const newVoteCount = Math.max((feature.votes || 0) - 1, 0); // Ensure we don't go below zero
      
      const { error: updateError } = await customClient
        .from('features')
        .update({ votes: newVoteCount })
        .eq('id', featureId);
      
      if (updateError) {
        console.error('Error decrementing votes:', updateError);
        throw updateError;
      }

      return { action: 'removed' };
    }

    // No change needed
    return { action: 'no_change' };
  } catch (error) {
    console.error('Error in voteForFeature:', error);
    throw error;
  }
};
