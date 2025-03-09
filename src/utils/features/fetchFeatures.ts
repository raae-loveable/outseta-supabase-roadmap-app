
import { Feature } from '../types';
import { getFeatures } from '../supabase';

// Fetch features from Supabase
export const fetchFeaturesFromSupabase = async (userId?: string, customClient?: any) => {
  try {
    const features = await getFeatures(userId, customClient);
    
    return {
      features,
    };
  } catch (error) {
    console.error('Error fetching features from Supabase:', error);
    return { error, features: [] };
  }
};
