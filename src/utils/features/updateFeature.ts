
import { FeatureStatus } from '../types';
import { updateFeature } from '../supabase';

// Update feature status in Supabase
export const updateFeatureStatusInSupabase = async (id: string, status: FeatureStatus) => {
  try {
    const updatedFeature = await updateFeature(id, { status });
    
    if (!updatedFeature) {
      throw new Error('Failed to update feature status');
    }
    
    return {
      feature: updatedFeature,
    };
  } catch (error) {
    console.error('Error updating feature status in Supabase:', error);
    return { error };
  }
};
