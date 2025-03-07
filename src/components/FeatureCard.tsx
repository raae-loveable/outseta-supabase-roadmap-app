
import React from 'react';
import { Feature } from '@/utils/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface FeatureCardProps {
  feature: Feature;
  onVote: (id: string) => void;
  className?: string;
}

export function FeatureCard({ feature, onVote, className }: FeatureCardProps) {
  // Status badge config
  const statusConfig = {
    'planned': { color: 'bg-blue-100 text-blue-800', icon: Clock },
    'in-progress': { color: 'bg-amber-100 text-amber-800', icon: Clock },
    'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  };
  
  const statusColor = statusConfig[feature.status].color;
  const StatusIcon = statusConfig[feature.status].icon;
  
  return (
    <div 
      className={cn(
        "glass-card flex flex-col rounded-xl p-5 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-strong",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{feature.title}</h3>
        <div className={cn("chip flex items-center gap-1", statusColor)}>
          <StatusIcon className="w-3 h-3" />
          <span className="capitalize">{feature.status.replace('-', ' ')}</span>
        </div>
      </div>
      
      <p className="text-sm text-foreground/80 mb-6">{feature.description}</p>
      
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onVote(feature.id)}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Upvote"
          >
            <ArrowUpCircle className="w-5 h-5 text-primary" />
          </button>
          
          <span className="font-semibold text-sm">{feature.votes}</span>
          
          <button 
            onClick={() => onVote(feature.id)}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Downvote"
            disabled={feature.votes <= 0}
          >
            <ArrowDownCircle className="w-5 h-5 text-primary/70" />
          </button>
        </div>
        
        <span className="text-xs text-foreground/60">
          Updated {new Date(feature.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
