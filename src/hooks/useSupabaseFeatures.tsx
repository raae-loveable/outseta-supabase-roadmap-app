
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Feature, FeatureRequestInput, FeatureStatus } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import { useOutsetaAuth } from './useOutsetaAuth';

export function useSupabaseFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const { user } = useOutsetaAuth();

  // Helper function to calculate counts by status
  const calculateFeatureCounts = (features: Feature[]): Record<FeatureStatus, number> => {
    const counts: Record<FeatureStatus, number> = {
      'planned': 0,
      'in-progress': 0,
      'completed': 0
    };
    
    features.forEach(feature => {
      counts[feature.status as FeatureStatus] = (counts[feature.status as FeatureStatus] || 0) + 1;
    });
    
    return counts;
  };
  
  // Calculate feature counts
  const featureCounts = calculateFeatureCounts(features);

  // Fetch features from Supabase
  const fetchFeatures = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get all features
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*');
      
      if (featuresError) throw featuresError;
      
      // If user is logged in, get their votes
      let userVotes: Record<string, boolean> = {};
      
      if (user) {
        const { data: votesData, error: votesError } = await supabase
          .from('feature_votes')
          .select('feature_id')
          .eq('user_id', user.uid);
        
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
        status: feature.status as FeatureStatus, // Fix: Cast string to FeatureStatus
        votes: feature.votes,
        votedBy: new Set(userVotes[feature.id] ? [user?.uid || ''] : []),
        createdAt: new Date(feature.created_at),
        updatedAt: new Date(feature.updated_at)
      }));
      
      setFeatures(transformedFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast({
        title: "Error",
        description: "Failed to load features. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add a new feature
  const addFeature = useCallback(async (input: FeatureRequestInput) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a feature request.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
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
        status: data.status as FeatureStatus, // Fix: Cast string to FeatureStatus
        votes: data.votes,
        votedBy: new Set<string>(),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setFeatures(prev => [newFeature, ...prev]);
      
      toast({
        title: "Feature Added",
        description: "Your feature request has been submitted successfully.",
      });
      
      return newFeature;
    } catch (error) {
      console.error('Error adding feature:', error);
      toast({
        title: "Error",
        description: "Failed to add feature. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user]);

  // Update votes for a feature
  const updateVotes = useCallback(async (id: string, increment: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote for features.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('feature_votes')
        .select('id')
        .eq('feature_id', id)
        .eq('user_id', user.uid)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // If user has already voted and wants to vote again (toggle off)
      if (existingVote) {
        // Remove the vote from feature_votes table
        const { error: deleteError } = await supabase
          .from('feature_votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (deleteError) throw deleteError;
        
        // Decrement the votes count in features table
        // Fix: Use the correct RPC call with proper typing
        const { error: updateError } = await supabase.rpc('decrement', { 
          x: 1, 
          row_id: id 
        } as any); // Use type assertion to bypass TypeScript error
        
        if (updateError) throw updateError;
        
        // Update local state
        setFeatures(prev => 
          prev.map(feature => {
            if (feature.id === id) {
              const newVotedBy = new Set(feature.votedBy);
              newVotedBy.delete(user.uid);
              return {
                ...feature,
                votes: feature.votes - 1,
                votedBy: newVotedBy,
                updatedAt: new Date()
              };
            }
            return feature;
          })
        );
        
        toast({
          title: "Vote Removed",
          description: "Your vote has been removed from this feature.",
        });
      } else {
        // User hasn't voted, so add a vote
        // Add vote to feature_votes table
        const { error: insertError } = await supabase
          .from('feature_votes')
          .insert([{
            feature_id: id,
            user_id: user.uid
          }]);
        
        if (insertError) throw insertError;
        
        // Increment the votes count in features table
        // Fix: Use the correct RPC call with proper typing
        const { error: updateError } = await supabase.rpc('increment', { 
          x: 1, 
          row_id: id 
        } as any); // Use type assertion to bypass TypeScript error
        
        if (updateError) throw updateError;
        
        // Update local state
        setFeatures(prev => 
          prev.map(feature => {
            if (feature.id === id) {
              const newVotedBy = new Set(feature.votedBy);
              newVotedBy.add(user.uid);
              return {
                ...feature,
                votes: feature.votes + 1,
                votedBy: newVotedBy,
                updatedAt: new Date()
              };
            }
            return feature;
          })
        );
        
        toast({
          title: "Vote Recorded",
          description: "Your vote has been recorded for this feature.",
        });
      }
    } catch (error) {
      console.error('Error updating votes:', error);
      toast({
        title: "Error",
        description: "Failed to update votes. Please try again.",
        variant: "destructive",
      });
    }
  }, [user]);

  // Helper functions to filter and sort features
  const filterFeaturesByStatus = useCallback((features: Feature[], status: FeatureStatus | 'all') => {
    if (status === 'all') return features;
    return features.filter(feature => feature.status === status);
  }, []);

  const sortFeatures = useCallback((features: Feature[], sortBy: 'votes' | 'newest') => {
    if (sortBy === 'votes') {
      return [...features].sort((a, b) => b.votes - a.votes);
    } else {
      return [...features].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  }, []);

  // Get filtered and sorted features
  const filteredAndSortedFeatures = useCallback(() => {
    const filtered = filterFeaturesByStatus(features, filterStatus);
    return sortFeatures(filtered, sortBy);
  }, [features, filterStatus, sortBy, filterFeaturesByStatus, sortFeatures]);

  // Fetch features on component mount and when user changes
  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return {
    features: filteredAndSortedFeatures(),
    featureCounts,
    isLoading,
    addFeature,
    updateVotes,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    refreshFeatures: fetchFeatures
  };
}
