
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
    // Check for window.Outseta before using it
    if (typeof window !== 'undefined' && window.Outseta) {
      // Add event listener for Outseta auth changes
      window.Outseta.on('accessToken.set', (decodedToken) => {
        setIsLoggedIn(Boolean(decodedToken));
        toast({
          title: "Authentication status updated",
          description: "Your login status has been updated.",
        });
      });
      
      // Check current authentication status on load
      checkAuthStatus();
    } else {
      console.warn('Outseta is not initialized yet. Authentication features may not work properly.');
    }
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      if (window.Outseta) {
        const accessToken = await window.Outseta.getAccessToken();
        setIsLoggedIn(Boolean(accessToken));
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setIsLoggedIn(false);
    }
  };

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

  const handleVote = async (featureId: string) => {
    // Double-check authentication status before allowing vote
    if (window.Outseta) {
      const accessToken = await window.Outseta.getAccessToken();
      
      if (!accessToken) {
        toast({
          title: "Authentication required",
          description: "Please sign in to vote for features.",
          variant: "destructive",
        });
        return;
      }
      
      // User is confirmed to be logged in, proceed with vote
      updateVotes(featureId, true);
    } else {
      toast({
        title: "Authentication error",
        description: "Unable to verify authentication. Please try again later.",
        variant: "destructive",
      });
    }
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
