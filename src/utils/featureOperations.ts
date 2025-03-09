
import { supabase } from '@/integrations/supabase/client';
import { Feature, FeatureRequestInput, FeatureStatus } from './types';
import { getUserProfile, getFeatures, addFeature, updateFeature, voteForFeature } from './supabase-utils';

// Fetch features from Supabase
export const fetchFeaturesFromSupabase = async (userId?: string) => {
  try {
    const features = await getFeatures(userId);
    
    return {
      features: features as Feature[],
    };
  } catch (error) {
    console.error('Error fetching features from Supabase:', error);
    return { error, features: [] };
  }
};

// Add a new feature to Supabase
export const addFeatureToSupabase = async (input: FeatureRequestInput, userId: string) => {
  try {
    const newFeature = await addFeature(input.title, input.description, userId);
    
    if (!newFeature) {
      throw new Error('Failed to create feature');
    }
    
    return {
      feature: newFeature as Feature,
    };
  } catch (error) {
    console.error('Error adding feature to Supabase:', error);
    return { error };
  }
};

// Update feature status in Supabase
export const updateFeatureStatusInSupabase = async (id: string, status: FeatureStatus) => {
  try {
    const updatedFeature = await updateFeature(id, { status });
    
    if (!updatedFeature) {
      throw new Error('Failed to update feature status');
    }
    
    return {
      feature: {
        ...updatedFeature,
        createdAt: new Date(updatedFeature.created_at as string),
        updatedAt: new Date(updatedFeature.updated_at as string),
        votedBy: new Set(), // Placeholder - we don't have vote info here
      } as Feature,
    };
  } catch (error) {
    console.error('Error updating feature status in Supabase:', error);
    return { error };
  }
};

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

// Helper function to check if a user can perform an action
export const canPerformAction = async () => {
  try {
    const user = await getUserProfile();
    return !!user;
  } catch (error) {
    console.error('Error checking if user can perform action:', error);
    return false;
  }
};
