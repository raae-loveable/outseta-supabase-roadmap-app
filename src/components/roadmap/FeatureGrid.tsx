
import React, { useRef, useEffect } from 'react';
import { Feature } from '@/utils/types';
import { FeatureCard } from '@/components/FeatureCard';
import { cn } from '@/lib/utils';

interface FeatureGridProps {
  features: Feature[];
  onVote: (id: string, increment: boolean) => void;
}

export function FeatureGrid({ features, onVote }: FeatureGridProps) {
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
  }, [features]);

  if (features.length === 0) {
    return (
      <div className="text-center py-20 bg-foreground/5 rounded-lg">
        <p className="text-foreground/70">No features match your filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div 
          key={feature.id} 
          ref={el => elementsRef.current[index] = el}
          className={cn(
            "animated-element",
            `animate-delay-${100 * (index % 3)}`
          )}
        >
          <FeatureCard
            feature={feature}
            onVote={onVote}
          />
        </div>
      ))}
    </div>
  );
}
