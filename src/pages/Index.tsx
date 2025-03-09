
import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RoadmapSection } from '@/components/RoadmapSection';
import { SubmitFeatureForm } from '@/components/SubmitFeatureForm';
import { useFeatures } from '@/hooks/useFeatures';
import { registerOutsetaEvents } from '@/utils/outseta';
import { useOutsetaAuth } from '@/hooks/useOutsetaAuth';
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
  
  // Use our new hook instead of managing auth state manually
  const { isLoggedIn, user, loading } = useOutsetaAuth();

  // Register Outseta events when component mounts
  useEffect(() => {
    registerOutsetaEvents();
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

  const handleVote = async (featureId: string, increment: boolean) => {
    // Check if auth state is still loading
    if (loading) {
      toast({
        title: "Please wait",
        description: "Checking your authentication status...",
      });
      return;
    }
    
    // Check authentication
    if (!isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote for features.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if we have a user ID
    if (!user?.uid) {
      toast({
        title: "User data error",
        description: "Could not retrieve your user information. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // We have the user ID, proceed with vote
    console.log("Voting with user ID:", user.uid);
    updateVotes(featureId, increment, user.uid);
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
          userId={user?.uid}
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
