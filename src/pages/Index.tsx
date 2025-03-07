
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RoadmapSection } from '@/components/RoadmapSection';
import { SubmitFeatureForm } from '@/components/SubmitFeatureForm';
import { useFeatures } from '@/hooks/useFeatures';
import { getCurrentUser } from '@/utils/outseta';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const {
    features,
    featureCounts,
    addFeature,
    updateVotes,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
  } = useFeatures();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
    };

    checkAuthStatus();

    // Add event listener for Outseta auth changes
    window.addEventListener('outseta:auth:updated', () => {
      checkAuthStatus();
      toast({
        title: "Authentication status updated",
        description: "Your login status has been updated.",
      });
    });
    
    return () => {
      window.removeEventListener('outseta:auth:updated', checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    // Observer for the animation of elements as they appear in the viewport
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

    // Select all elements with the 'animated-element' class
    const animatedElements = document.querySelectorAll('.animated-element');
    animatedElements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleFeatureSubmit = (data: any) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a feature request.",
        variant: "destructive",
      });
      return;
    }
    
    addFeature(data);
  };

  const handleVote = (featureId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote for features.",
        variant: "destructive",
      });
      return;
    }
    
    updateVotes(featureId, true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <Hero />
        
        <RoadmapSection
          features={features}
          featureCounts={featureCounts}
          onVote={handleVote}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          isLoggedIn={isLoggedIn}
        />
        
        <SubmitFeatureForm onSubmit={handleFeatureSubmit} isLoggedIn={isLoggedIn} />
      </main>
      
      <footer className="py-8 px-4 text-center text-sm text-foreground/60">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Roadmap App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
