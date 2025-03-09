
import { supabase } from '@/integrations/supabase/client';
import { Feature, FeatureStatus } from '../types';

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
        createdAt: new Date(feature.created_at as string),
        updatedAt: new Date(feature.updated_at as string),
      }));
    } else {
      // If no userId, initialize empty votedBy sets
      features = features?.map(feature => ({
        ...feature,
        votedBy: new Set(),
        createdAt: new Date(feature.created_at as string),
        updatedAt: new Date(feature.updated_at as string),
      }));
    }

    return features as Feature[] || [];
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
      createdAt: new Date(feature.created_at as string),
      updatedAt: new Date(feature.updated_at as string),
    } as Feature;
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

    return {
      ...feature,
      createdAt: new Date(feature.created_at as string),
      updatedAt: new Date(feature.updated_at as string),
      votedBy: new Set(), // Placeholder - we don't have vote info here
    } as Feature;
  } catch (error) {
    console.error('Error in updateFeature:', error);
    throw error;
  }
};
