
import React, { useRef, useEffect } from 'react';
import { Feature, FeatureStatus } from '@/utils/types';
import { FeatureCard } from './FeatureCard';
import { cn } from '@/lib/utils';
import { Check, Clock, ArrowDown01, ArrowDownUp } from 'lucide-react';

interface RoadmapSectionProps {
  features: Feature[];
  featureCounts: Record<FeatureStatus, number>;
  onVote: (id: string) => void;
  filterStatus: FeatureStatus | 'all';
  setFilterStatus: (status: FeatureStatus | 'all') => void;
  sortBy: 'votes' | 'newest';
  setSortBy: (sort: 'votes' | 'newest') => void;
  isLoggedIn?: boolean;
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
  className 
}: RoadmapSectionProps) {
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      elementsRef.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

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
          <div 
            ref={el => elementsRef.current[1] = el}
            className="flex items-center flex-wrap gap-2 animated-element"
          >
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
          
          <div 
            ref={el => elementsRef.current[2] = el}
            className="flex items-center gap-2 animated-element"
          >
            <span className="text-sm text-foreground/70">Sort by:</span>
            <button
              onClick={() => setSortBy('votes')}
              className={cn(
                "chip flex items-center transition-all",
                sortBy === 'votes' 
                  ? "bg-foreground/10 text-foreground" 
                  : "bg-transparent text-foreground/70 hover:bg-foreground/5"
              )}
            >
              <ArrowDownUp className="mr-1 w-3 h-3" />
              Votes
            </button>
            
            <button
              onClick={() => setSortBy('newest')}
              className={cn(
                "chip flex items-center transition-all",
                sortBy === 'newest' 
                  ? "bg-foreground/10 text-foreground" 
                  : "bg-transparent text-foreground/70 hover:bg-foreground/5"
              )}
            >
              <ArrowDown01 className="mr-1 w-3 h-3" />
              Newest
            </button>
          </div>
        </div>
        
        {features.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.id} 
                ref={el => elementsRef.current[index + 3] = el}
                className={cn(
                  "animated-element",
                  `animate-delay-${100 * (index % 3)}`
                )}
              >
                <FeatureCard
                  feature={feature}
                  onVote={() => onVote(feature.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-foreground/5 rounded-lg">
            <p className="text-foreground/70">No features match your filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}
