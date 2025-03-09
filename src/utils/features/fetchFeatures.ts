
import { Feature } from '../types';
import { getFeatures } from '../supabase';

// Track if a fetch is in progress
let fetchInProgress = false;

// Fetch features from Supabase
export const fetchFeaturesFromSupabase = async (userId?: string, customClient?: any) => {
  try {
    // Skip fetching if no customClient is provided
    if (!customClient) {
      console.log('Skipping fetch: No Supabase client provided');
      return { features: [], error: null };
    }
    
    // Prevent concurrent fetches
    if (fetchInProgress) {
      console.log('Fetch already in progress, skipping duplicate request');
      return { features: [], error: null };
    }
    
    fetchInProgress = true;
    
    const features = await getFeatures(userId, customClient);
    
    fetchInProgress = false;
    
    return {
      features,
    };
  } catch (error) {
    console.error('Error fetching features from Supabase:', error);
    fetchInProgress = false;
    return { error, features: [] };
  }
};
