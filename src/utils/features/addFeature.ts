
import { FeatureRequestInput } from '../types';
import { addFeature } from '../supabase';

// Add a new feature to Supabase
export const addFeatureToSupabase = async (input: FeatureRequestInput, userId: string) => {
  try {
    const newFeature = await addFeature(input.title, input.description, userId);
    
    if (!newFeature) {
      throw new Error('Failed to create feature');
    }
    
    return {
      feature: newFeature,
    };
  } catch (error) {
    console.error('Error adding feature to Supabase:', error);
    return { error };
  }
};
