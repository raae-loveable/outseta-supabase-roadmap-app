
import { useState, useCallback, useMemo } from 'react';
import { Feature, FeatureRequestInput, FeatureStatus } from '../utils/types';
import { initialFeatures } from '../utils/data';
import { toast } from '@/components/ui/use-toast';

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
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

  // Update a feature's vote count
  const updateVotes = useCallback((id: string, increment: boolean) => {
    setFeatures(prev => 
      prev.map(feature => 
        feature.id === id 
          ? { 
              ...feature, 
              votes: increment 
                ? feature.votes + 1 
                : Math.max(0, feature.votes - 1),
              updatedAt: new Date()
            } 
          : feature
      )
    );
  }, []);

  // Filter and sort features
  const filteredAndSortedFeatures = useMemo(() => {
    let result = [...features];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(feature => feature.status === filterStatus);
    }
    
    // Apply sorting
    if (sortBy === 'votes') {
      result.sort((a, b) => b.votes - a.votes);
    } else {
      result.sort((a, b) => {
        // Ensure we're comparing Date objects
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    return result;
  }, [features, filterStatus, sortBy]);

  // Get counts by status
  const featureCounts = useMemo(() => {
    const counts: Partial<Record<FeatureStatus, number>> = {
      'planned': 0,
      'in-progress': 0,
      'completed': 0
    };
    
    features.forEach(feature => {
      counts[feature.status] = (counts[feature.status] || 0) + 1;
    });
    
    return counts as Record<FeatureStatus, number>;
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
