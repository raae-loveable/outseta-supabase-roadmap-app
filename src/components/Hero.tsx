
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface HeroProps extends React.HTMLAttributes<HTMLElement> {}

export function Hero({ className, ...props }: HeroProps) {
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
      className={cn(
        "min-h-[85vh] flex flex-col items-center justify-center px-4 pt-20 relative",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-4xl mx-auto text-center">
        <div 
          ref={el => elementsRef.current[0] = el}
          className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium animated-element"
        >
          <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
          The future of our product
        </div>
        
        <h1 
          ref={el => elementsRef.current[1] = el}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animated-element animate-delay-100"
        >
          Help shape what's coming next
        </h1>
        
        <p 
          ref={el => elementsRef.current[2] = el}
          className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 animated-element animate-delay-200"
        >
          Vote on feature requests, submit your ideas, and help us prioritize our roadmap.
          Your feedback directly influences our development decisions.
        </p>
        
        <div 
          ref={el => elementsRef.current[3] = el}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animated-element animate-delay-300"
        >
          <a 
            href="#features" 
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white text-base font-medium shadow-medium hover:opacity-90 transition-all"
          >
            View Features
          </a>
          <a 
            href="#submit" 
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-border text-foreground hover:bg-accent transition-all"
          >
            Submit Idea
          </a>
        </div>
      </div>
      
      <div
        ref={el => elementsRef.current[4] = el} 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animated-element animate-delay-400 mt-8"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-primary/60 rounded-full animate-float"></div>
        </div>
      </div>
    </section>
  );
}
