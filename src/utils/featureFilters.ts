
import { Feature, FeatureStatus } from '@/utils/types';

// Filter features by status
export const filterFeaturesByStatus = (features: Feature[], status: FeatureStatus | 'all') => {
  if (status === 'all') return features;
  return features.filter(feature => feature.status === status);
};

// Sort features by votes or creation date
export const sortFeatures = (features: Feature[], sortBy: 'votes' | 'newest') => {
  if (sortBy === 'votes') {
    return [...features].sort((a, b) => b.votes - a.votes);
  } else {
    return [...features].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
};

// Calculate counts by status
export const calculateFeatureCounts = (features: Feature[]): Record<FeatureStatus, number> => {
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
