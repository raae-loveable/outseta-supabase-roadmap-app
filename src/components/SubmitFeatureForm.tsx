
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FeatureRequestInput } from '@/utils/types';
import { Lightbulb } from 'lucide-react';

interface SubmitFeatureFormProps {
  onSubmit: (input: FeatureRequestInput) => void;
  isLoggedIn?: boolean;
  className?: string;
}

export function SubmitFeatureForm({ onSubmit, isLoggedIn, className }: SubmitFeatureFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate a delay for the submission
    setTimeout(() => {
      onSubmit({ title, description });
      setTitle('');
      setDescription('');
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <section
      id="submit"
      className={cn(
        "py-24 px-4 bg-gradient-to-b from-purple-50 to-yellow-50",
        className
      )}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Submit Your Idea</h2>
          <p className="text-foreground/80 max-w-xl mx-auto">
            Have a feature idea that would make our product better? 
            Let us know, and the community will help us prioritize it.
            {!isLoggedIn && (
              <span className="block mt-2 text-primary font-medium">
                Please sign in to submit a feature request.
              </span>
            )}
          </p>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="glass-card rounded-xl p-6 md:p-8"
        >
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Feature Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Integration with Google Calendar"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
              maxLength={100}
              disabled={!isLoggedIn}
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your feature idea in detail. What problem does it solve?"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[120px]"
              required
              maxLength={500}
              disabled={!isLoggedIn}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim() || !isLoggedIn}
              className={cn(
                "px-6 py-3 rounded-lg bg-primary text-white font-medium transition-all",
                (isSubmitting || !title.trim() || !description.trim() || !isLoggedIn)
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:opacity-90"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Feature Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
