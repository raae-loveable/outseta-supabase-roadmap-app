
import { supabase } from '@/integrations/supabase/client';
import { supabaseAuth } from '@/integrations/supabase/authClient';
import { Feature, FeatureStatus, FeatureRequestInput } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';

// Get the appropriate Supabase client based on authentication status
const getSupabaseClient = () => {
  // Check if we have a valid session in the auth client
  if (supabaseAuth.auth.getSession()) {
    console.log("Using authenticated Supabase client");
    return supabaseAuth;
  }
  
  // Otherwise, use the default client
  console.log("Using default Supabase client");
  return supabase;
};

// Fetch features from Supabase
export const fetchFeaturesFromSupabase = async (userId?: string) => {
  try {
    const client = getSupabaseClient();
    
    // Get all features
    const { data: featuresData, error: featuresError } = await client
      .from('features')
      .select('*');
    
    if (featuresError) throw featuresError;
    
    // If user is logged in, get their votes
    let userVotes: Record<string, boolean> = {};
    
    if (userId) {
      const { data: votesData, error: votesError } = await client
        .from('feature_votes')
        .select('feature_id')
        .eq('user_id', userId);
      
      if (!votesError && votesData) {
        userVotes = votesData.reduce((acc: Record<string, boolean>, vote) => {
          acc[vote.feature_id] = true;
          return acc;
        }, {});
      }
    }
    
    // Transform the data to match our Feature type
    const transformedFeatures: Feature[] = featuresData.map(feature => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      status: feature.status as FeatureStatus,
      votes: feature.votes,
      votedBy: new Set(userVotes[feature.id] ? [userId || ''] : []),
      createdAt: new Date(feature.created_at),
      updatedAt: new Date(feature.updated_at)
    }));
    
    return { features: transformedFeatures, error: null };
  } catch (error) {
    console.error('Error fetching features:', error);
    return { features: [], error };
  }
};

// Add a new feature to Supabase
export const addFeatureToSupabase = async (input: FeatureRequestInput, userId: string) => {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('features')
      .insert([{
        title: input.title,
        description: input.description,
        status: 'planned',
        votes: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    const newFeature: Feature = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as FeatureStatus,
      votes: data.votes,
      votedBy: new Set<string>(),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    return { feature: newFeature, error: null };
  } catch (error) {
    console.error('Error adding feature:', error);
    return { feature: null, error };
  }
};

// Update votes for a feature
export const updateFeatureVotes = async (id: string, userId: string, increment: boolean) => {
  try {
    const client = getSupabaseClient();
    
    // Check if user has already voted
    const { data: existingVote, error: checkError } = await client
      .from('feature_votes')
      .select('id')
      .eq('feature_id', id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // If user has already voted and wants to remove vote
    if (existingVote) {
      // Remove the vote from feature_votes table
      const { error: deleteError } = await client
        .from('feature_votes')
        .delete()
        .eq('id', existingVote.id);
      
      if (deleteError) throw deleteError;
      
      // Decrement the votes count in features table
      const { error: updateError } = await client.rpc(
        'decrement', 
        { row_id: id, x: 1 } as any
      );
      
      if (updateError) throw updateError;
      
      return { action: 'removed', error: null };
    } else {
      // User hasn't voted, so add a vote
      const { error: insertError } = await client
        .from('feature_votes')
        .insert([{
          feature_id: id,
          user_id: userId
        }]);
      
      if (insertError) throw insertError;
      
      // Increment the votes count in features table
      const { error: updateError } = await client.rpc(
        'increment', 
        { row_id: id, x: 1 } as any
      );
      
      if (updateError) throw updateError;
      
      return { action: 'added', error: null };
    }
  } catch (error) {
    console.error('Error updating votes:', error);
    return { action: null, error };
  }
};
