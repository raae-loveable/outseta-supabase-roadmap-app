
import { Feature } from '../types';
import { getFeatures } from '../supabase';

// Fetch features from Supabase
export const fetchFeaturesFromSupabase = async (userId?: string, customClient?: any) => {
  try {
    // Skip fetching if no customClient is provided
    if (!customClient) {
      console.log('Skipping fetch: No Supabase client provided');
      return { features: [], error: null };
    }
    
    const features = await getFeatures(userId, customClient);
    
    return {
      features,
    };
  } catch (error) {
    console.error('Error fetching features from Supabase:', error);
    return { error, features: [] };
  }
};
