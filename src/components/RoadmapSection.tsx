
import React, { useRef } from 'react';
import { Feature, FeatureStatus } from '@/utils/types';
import { cn } from '@/lib/utils';
import { StatusFilter } from './roadmap/StatusFilter';
import { SortControls } from './roadmap/SortControls';
import { FeatureGrid } from './roadmap/FeatureGrid';
import { Loader2 } from 'lucide-react';

interface RoadmapSectionProps {
  features: Feature[];
  featureCounts: Record<FeatureStatus, number>;
  onVote: (id: string, increment: boolean) => void;
  filterStatus: FeatureStatus | 'all';
  setFilterStatus: (status: FeatureStatus | 'all') => void;
  sortBy: 'votes' | 'newest';
  setSortBy: (sort: 'votes' | 'newest') => void;
  isLoggedIn?: boolean;
  userId?: string;
  isLoading?: boolean;
  className?: string;
}

export function RoadmapSection({ 
  features, 
  featureCounts,
  onVote,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  isLoggedIn,
  userId,
  isLoading = false,
  className 
}: RoadmapSectionProps) {
  const elementsRef = useRef<(HTMLElement | null)[]>([]);

  return (
    <section
      id="features"
      className={cn(
        "py-24 px-4",
        className
      )}
    >
      <div className="container mx-auto max-w-6xl">
        <div 
          ref={el => elementsRef.current[0] = el}
          className="text-center mb-16 animated-element"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Feature Roadmap</h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Vote on features to help us prioritize our development efforts. 
            The most requested features will be moved up in our roadmap.
          </p>
        </div>
        
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div ref={el => elementsRef.current[1] = el}>
            <StatusFilter 
              featureCounts={featureCounts} 
              filterStatus={filterStatus} 
              setFilterStatus={setFilterStatus} 
            />
          </div>
          
          <div ref={el => elementsRef.current[2] = el}>
            <SortControls 
              sortBy={sortBy} 
              setSortBy={setSortBy} 
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading features...</span>
          </div>
        ) : (
          <FeatureGrid 
            features={features} 
            onVote={onVote} 
            userId={userId} 
          />
        )}
      </div>
    </section>
  );
}
