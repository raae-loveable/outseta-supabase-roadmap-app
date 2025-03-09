import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RoadmapSection } from '@/components/RoadmapSection';
import { SubmitFeatureForm } from '@/components/SubmitFeatureForm';
import { useFeatures } from '@/hooks/useFeatures';
import { registerOutsetaEvents, checkInitialAuthState } from '@/utils/outseta';
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
  const [userId, setUserId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Outseta events and check initial auth state
  useEffect(() => {
    const initializeOutseta = async () => {
      // Check if Outseta is available in the window object
      if (typeof window !== 'undefined') {
        // Register event listeners for auth changes
        registerOutsetaEvents();
        
        // Check initial authentication state using JWT payload
        const { isLoggedIn, userId } = await checkInitialAuthState();
        setIsLoggedIn(isLoggedIn);
        
        if (userId) {
          setUserId(userId);
          console.log("User is logged in with ID:", userId);
        }
        
        setIsInitialized(true);
      }
    };
    
    initializeOutseta();
  }, []);
  
  // Listen for auth events
  useEffect(() => {
    const handleAuthUpdate = (event: CustomEvent) => {
      console.log("Auth event received:", event.detail);
      
      const action = event.detail?.action;
      const isLoggedIn = event.detail?.isLoggedIn;
      const userId = event.detail?.userId || event.detail?.jwtPayload?.uid;
      
      // Update authentication state
      setIsLoggedIn(!!isLoggedIn);
      
      if (action === 'logout') {
        setIsLoggedIn(false);
        setUserId('');
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
        return;
      }
      
      if (isLoggedIn && userId) {
        setUserId(userId);
        console.log("Updated user ID after auth event:", userId);
        
        toast({
          title: "Authentication updated",
          description: "You are now logged in.",
        });
      }
    };
    
    window.addEventListener('outseta:auth:updated', handleAuthUpdate as EventListener);
    
    return () => {
      window.removeEventListener('outseta:auth:updated', handleAuthUpdate as EventListener);
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

  const handleVote = async (featureId: string, increment: boolean) => {
    // Check if we've fully initialized
    if (!isInitialized) {
      toast({
        title: "Please wait",
        description: "System is still initializing.",
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
    if (!userId) {
      toast({
        title: "User data error",
        description: "Could not retrieve your user information. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // We have the user ID, proceed with vote
    console.log("Voting with user ID:", userId);
    updateVotes(featureId, increment, userId);
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
          userId={userId}
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
