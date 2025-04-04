
import { useState, useCallback, useEffect } from 'react';
import { Feature, FeatureRequestInput, FeatureStatus } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import { useOutsetaAuth } from './useOutsetaAuth';
import { 
  fetchFeaturesFromSupabase, 
  addFeatureToSupabase, 
  updateFeatureVotes 
} from '@/utils/features';
import {
  filterFeaturesByStatus,
  sortFeatures,
  calculateFeatureCounts
} from '@/utils/featureFilters';

export function useSupabaseFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const { user, supabaseClient, loading: authLoading } = useOutsetaAuth();
  
  // Calculate feature counts
  const featureCounts = calculateFeatureCounts(features);

  // Fetch features from Supabase
  const fetchFeatures = useCallback(async () => {
    // Skip fetching if auth is still loading or if supabaseClient isn't available
    if (authLoading || !supabaseClient) {
      console.log('Skipping feature fetch - auth loading or no supabase client');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching features with user ID:', user?.uid);
      const { features: fetchedFeatures, error } = await fetchFeaturesFromSupabase(
        user?.uid, 
        supabaseClient
      );
      
      if (error) throw error;
      if (fetchedFeatures) {
        setFeatures(fetchedFeatures as Feature[]);
      }
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
  }, [user, supabaseClient, authLoading]);

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
      const { feature, error } = await addFeatureToSupabase(
        input, 
        user.uid, 
        supabaseClient
      );
      
      if (error) throw error;
      if (feature) {
        setFeatures(prev => [feature, ...prev]);
        
        toast({
          title: "Feature Added",
          description: "Your feature request has been submitted successfully.",
        });
      }
      
      return feature;
    } catch (error) {
      console.error('Error adding feature:', error);
      toast({
        title: "Error",
        description: "Failed to add feature. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, supabaseClient]);

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
      const result = await updateFeatureVotes(
        id, 
        user.uid, 
        increment, 
        supabaseClient
      );
      
      if ('error' in result && result.error) {
        throw result.error;
      }
      
      const action = 'action' in result ? result.action : null;
      
      // Update local state based on the action
      if (action === 'removed') {
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
      } else if (action === 'added') {
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
  }, [user, supabaseClient]);

  // Get filtered and sorted features
  const filteredAndSortedFeatures = useCallback(() => {
    const filtered = filterFeaturesByStatus(features, filterStatus);
    return sortFeatures(filtered, sortBy);
  }, [features, filterStatus, sortBy]);

  // Fetch features when authentication is ready and when user or supabaseClient changes
  useEffect(() => {
    if (!authLoading) {
      console.log('Auth state ready, fetching features');
      fetchFeatures();
    }
  }, [fetchFeatures, authLoading]);

  return {
    features: filteredAndSortedFeatures(),
    featureCounts,
    isLoading: isLoading || authLoading, // Consider auth loading as part of feature loading
    addFeature,
    updateVotes,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    refreshFeatures: fetchFeatures
  };
}
