
import React from 'react';
import { Feature } from '@/utils/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, ThumbsUp, Inbox } from 'lucide-react';

interface FeatureCardProps {
  feature: Feature;
  onVote: (id: string, increment: boolean) => void;
  className?: string;
  userId?: string;
}

export function FeatureCard({ feature, onVote, className, userId }: FeatureCardProps) {
  // Status badge config
  const statusConfig = {
    'requested': { color: 'bg-blue-100 text-blue-800', icon: Inbox },
    'planned': { color: 'bg-blue-100 text-blue-800', icon: Clock },
    'in-progress': { color: 'bg-amber-100 text-amber-800', icon: Clock },
    'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  };
  
  // Default config in case the status is not found in the map
  const defaultStatusConfig = { color: 'bg-gray-100 text-gray-800', icon: Clock };
  
  // Get status config or use default if not found
  const config = statusConfig[feature.status] || defaultStatusConfig;
  const statusColor = config.color;
  const StatusIcon = config.icon;
  
  // Check if the current user has voted on this feature
  const hasVoted = userId && feature.votedBy && feature.votedBy.has(userId);
  
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
            onClick={() => onVote(feature.id, !hasVoted)}
            className={cn(
              "p-2 rounded-full transition-colors duration-200",
              hasVoted 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-primary/10 text-primary/70"
            )}
            aria-label={hasVoted ? "Remove vote" : "Vote for this feature"}
            title={hasVoted ? "Remove vote" : "Vote for this feature"}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          
          <span className="font-semibold text-sm">{feature.votes}</span>
        </div>
        
        <span className="text-xs text-foreground/60">
          Updated {new Date(feature.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
