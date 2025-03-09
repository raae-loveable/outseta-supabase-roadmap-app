
import { supabase } from '@/integrations/supabase/client';
import { supabaseAuth } from '@/integrations/supabase/authClient';
import { Feature, FeatureStatus } from './types';

// Fetch features from Supabase
export const getFeatures = async (userId?: string) => {
  try {
    console.log('Fetching features from Supabase');
    let { data: features, error } = await supabase
      .from('features')
      .select('*')
      .order('votes', { ascending: false });

    if (error) {
      console.error('Error fetching features:', error);
      throw error;
    }

    // If userId is provided, fetch the user's votes
    if (userId) {
      const { data: votes, error: votesError } = await supabase
        .from('feature_votes')
        .select('feature_id')
        .eq('user_id', userId);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
        throw votesError;
      }

      // Convert to a set of feature IDs for O(1) lookup
      const userVotedFeatureIds = new Set(votes?.map(vote => vote.feature_id) || []);

      // Enhance the features with votedBy information
      features = features?.map(feature => ({
        ...feature,
        votedBy: userVotedFeatureIds.has(feature.id) ? new Set([userId]) : new Set(),
      }));
    } else {
      // If no userId, initialize empty votedBy sets
      features = features?.map(feature => ({
        ...feature,
        votedBy: new Set(),
      }));
    }

    return features || [];
  } catch (error) {
    console.error('Error in getFeatures:', error);
    throw error;
  }
};

// Add a new feature to Supabase
export const addFeature = async (
  title: string,
  description: string,
  userId: string
) => {
  try {
    console.log('Adding feature to Supabase:', { title, description });
    
    const newFeature = {
      title,
      description,
      status: 'requested' as FeatureStatus,
      votes: 1,
    };

    const { data: feature, error } = await supabase
      .from('features')
      .insert(newFeature)
      .select()
      .single();

    if (error) {
      console.error('Error adding feature:', error);
      throw error;
    }

    // Add the user's vote for their own feature
    if (feature) {
      const { error: voteError } = await supabase
        .from('feature_votes')
        .insert({
          feature_id: feature.id,
          user_id: userId,
        });

      if (voteError) {
        console.error('Error adding vote:', voteError);
        throw voteError;
      }
    }

    // Return the newly created feature with the votedBy field
    return {
      ...feature,
      votedBy: new Set([userId]) as Set<string>, // The user who created the feature has voted for it
    };
  } catch (error) {
    console.error('Error in addFeature:', error);
    throw error;
  }
};

// Update a feature in Supabase
export const updateFeature = async (
  id: string,
  updates: { title?: string; description?: string; status?: FeatureStatus }
) => {
  try {
    console.log('Updating feature in Supabase:', { id, updates });
    
    const { data: feature, error } = await supabase
      .from('features')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feature:', error);
      throw error;
    }

    return feature;
  } catch (error) {
    console.error('Error in updateFeature:', error);
    throw error;
  }
};

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
      const { error: updateError } = await supabase.rpc('increment_votes', { feature_id: featureId });
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
      const { error: updateError } = await supabase.rpc('decrement_votes', { feature_id: featureId });
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
