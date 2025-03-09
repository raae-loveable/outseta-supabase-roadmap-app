
import { supabase } from '@/integrations/supabase/client';

// Vote for a feature in Supabase
export const voteForFeature = async (
  featureId: string,
  userId: string,
  increment: boolean
) => {
  try {
    console.log('Voting for feature in Supabase:', { featureId, userId, increment });
    
    // Check if user has already voted for this feature
    const { data: existingVote, error: checkError } = await supabase
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
      const { error: addError } = await supabase
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
      // Use both required type parameters for the RPC function
      const { error: updateError } = await supabase.rpc<number, { feature_id: string }>('increment_votes', { 
        feature_id: featureId 
      });
      
      if (updateError) {
        console.error('Error incrementing votes:', updateError);
        throw updateError;
      }

      return { action: 'added' };
    } else if (!increment && existingVote) {
      // Remove vote
      const { error: removeError } = await supabase
        .from('feature_votes')
        .delete()
        .eq('feature_id', featureId)
        .eq('user_id', userId);

      if (removeError) {
        console.error('Error removing vote:', removeError);
        throw removeError;
      }

      // Decrement the votes count in the features table
      // Use both required type parameters for the RPC function
      const { error: updateError } = await supabase.rpc<number, { feature_id: string }>('decrement_votes', { 
        feature_id: featureId 
      });
      
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
