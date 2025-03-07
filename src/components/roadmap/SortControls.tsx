
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown01, ArrowDownUp } from 'lucide-react';

interface SortControlsProps {
  sortBy: 'votes' | 'newest';
  setSortBy: (sort: 'votes' | 'newest') => void;
}

export function SortControls({ sortBy, setSortBy }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2 animated-element">
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
  );
}
