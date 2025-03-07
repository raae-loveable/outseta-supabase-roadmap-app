
import { useState, useCallback, useMemo } from 'react';
import { Feature, FeatureRequestInput, FeatureStatus } from '../utils/types';
import { initialFeatures } from '../utils/data';
import { toast } from '@/components/ui/use-toast';

// Helper function to filter features by status
const filterFeaturesByStatus = (features: Feature[], filterStatus: FeatureStatus | 'all') => {
  if (filterStatus === 'all') return features;
  return features.filter(feature => feature.status === filterStatus);
};

// Helper function to sort features by votes or date
const sortFeatures = (features: Feature[], sortBy: 'votes' | 'newest') => {
  if (sortBy === 'votes') {
    return [...features].sort((a, b) => b.votes - a.votes);
  } else {
    return [...features].sort((a, b) => {
      // Ensure we're comparing Date objects
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }
};

// Helper function to calculate counts by status
const calculateFeatureCounts = (features: Feature[]): Record<FeatureStatus, number> => {
  const counts: Record<FeatureStatus, number> = {
    'planned': 0,
    'in-progress': 0,
    'completed': 0
  };
  
  features.forEach(feature => {
    counts[feature.status] = (counts[feature.status] || 0) + 1;
  });
  
  return counts;
};

export function useFeatures() {
  // Initialize votedBy as empty Set for each feature
  const initialFeaturesWithVotedBy = initialFeatures.map(feature => ({
    ...feature,
    votedBy: new Set<string>()
  }));

  const [features, setFeatures] = useState<Feature[]>(initialFeaturesWithVotedBy);
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');

  // Add a new feature
  const addFeature = useCallback((input: FeatureRequestInput) => {
    const newFeature: Feature = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      status: 'planned',
      votes: 0,
      votedBy: new Set<string>(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setFeatures(prev => [newFeature, ...prev]);
    
    toast({
      title: "Feature Added",
      description: "Your feature request has been submitted successfully.",
    });
    
    return newFeature;
  }, []);

  // Update a feature's vote count, limiting one vote per user
  const updateVotes = useCallback((id: string, increment: boolean, userId: string) => {
    setFeatures(prev => 
      prev.map(feature => {
        if (feature.id === id) {
          const hasVoted = feature.votedBy.has(userId);
          
          // User has already voted, show a message
          if (hasVoted) {
            toast({
              title: "Already Voted",
              description: "You have already voted on this feature.",
              variant: "destructive",
            });
            return feature;
          }
          
          // User hasn't voted, add their vote
          const newVotedBy = new Set(feature.votedBy);
          newVotedBy.add(userId);
          
          return { 
            ...feature, 
            votes: increment 
              ? feature.votes + 1 
              : Math.max(0, feature.votes - 1),
            votedBy: newVotedBy,
            updatedAt: new Date()
          };
        }
        return feature;
      })
    );
  }, []);

  // Apply filtering and sorting
  const filteredAndSortedFeatures = useMemo(() => {
    const filtered = filterFeaturesByStatus(features, filterStatus);
    return sortFeatures(filtered, sortBy);
  }, [features, filterStatus, sortBy]);

  // Get counts by status
  const featureCounts = useMemo(() => {
    return calculateFeatureCounts(features);
  }, [features]);

  return {
    features: filteredAndSortedFeatures,
    featureCounts,
    addFeature,
    updateVotes,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
  };
}
