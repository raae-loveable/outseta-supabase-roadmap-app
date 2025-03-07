
import React from 'react';
import { FeatureStatus } from '@/utils/types';
import { cn } from '@/lib/utils';
import { Check, Clock } from 'lucide-react';

interface StatusFilterProps {
  featureCounts: Record<FeatureStatus, number>;
  filterStatus: FeatureStatus | 'all';
  setFilterStatus: (status: FeatureStatus | 'all') => void;
}

export function StatusFilter({ featureCounts, filterStatus, setFilterStatus }: StatusFilterProps) {
  return (
    <div className="flex items-center flex-wrap gap-2 animated-element">
      <button
        onClick={() => setFilterStatus('all')}
        className={cn(
          "chip transition-all",
          filterStatus === 'all' 
            ? "bg-foreground text-background" 
            : "bg-accent text-foreground/80 hover:bg-accent/80"
        )}
      >
        All
        <span className="ml-1 opacity-70">
          ({featureCounts.planned + (featureCounts.completed || 0) + (featureCounts['in-progress'] || 0)})
        </span>
      </button>
      
      <button
        onClick={() => setFilterStatus('planned')}
        className={cn(
          "chip transition-all flex items-center",
          filterStatus === 'planned' 
            ? "bg-blue-600 text-white" 
            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
        )}
      >
        <Clock className="mr-1 w-3 h-3" />
        Planned
        <span className="ml-1 opacity-70">({featureCounts.planned || 0})</span>
      </button>
      
      <button
        onClick={() => setFilterStatus('in-progress')}
        className={cn(
          "chip transition-all flex items-center",
          filterStatus === 'in-progress' 
            ? "bg-amber-600 text-white" 
            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
        )}
      >
        <Clock className="mr-1 w-3 h-3" />
        In Progress
        <span className="ml-1 opacity-70">({featureCounts['in-progress'] || 0})</span>
      </button>
      
      <button
        onClick={() => setFilterStatus('completed')}
        className={cn(
          "chip transition-all flex items-center",
          filterStatus === 'completed' 
            ? "bg-green-600 text-white" 
            : "bg-green-100 text-green-800 hover:bg-green-200"
        )}
      >
        <Check className="mr-1 w-3 h-3" />
        Completed
        <span className="ml-1 opacity-70">({featureCounts.completed || 0})</span>
      </button>
    </div>
  );
}
