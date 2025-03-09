import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RoadmapSection } from '@/components/RoadmapSection';
import { SubmitFeatureForm } from '@/components/SubmitFeatureForm';
import { registerOutsetaEvents } from '@/utils/outseta';
import { useOutsetaAuth } from '@/hooks/useOutsetaAuth';
import { useSupabaseFeatures } from '@/hooks/useSupabaseFeatures';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Index = () => {
  const {
    features,
    featureCounts,
    isLoading,
    addFeature,
    updateVotes,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
  } = useSupabaseFeatures();
  
  const { user, loading: authLoading, tokenExchangeError, supabaseToken } = useOutsetaAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    registerOutsetaEvents();
  }, []);

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

    const animatedElements = document.querySelectorAll('.animated-element');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    if (user && supabaseToken) {
      toast({
        title: "Authentication Complete",
        description: "Your Outseta account is now connected to Supabase.",
      });
    } else if (tokenExchangeError) {
      toast({
        title: "Authentication Error",
        description: tokenExchangeError,
        variant: "destructive",
      });
    }
  }, [user, supabaseToken, tokenExchangeError]);

  const handleFeatureSubmit = (data: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a feature request.",
        variant: "destructive",
      });
      return;
    }
    
    if (!supabaseToken) {
      toast({
        title: "Authentication incomplete",
        description: "Your Supabase authentication is not complete. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    addFeature(data);
  };

  const handleVote = async (featureId: string, increment: boolean) => {
    if (authLoading) {
      toast({
        title: "Please wait",
        description: "Checking your authentication status...",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote for features.",
        variant: "destructive",
      });
      return;
    }
    
    if (!supabaseToken) {
      toast({
        title: "Authentication incomplete",
        description: "Your Supabase authentication is not complete. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Voting with user ID:", user.uid);
    updateVotes(featureId, increment);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <Hero />
        
        {tokenExchangeError && isLoggedIn && (
          <div className="container mx-auto mt-4 px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                There was an error connecting your Outseta account to Supabase: {tokenExchangeError}
                <br />
                Some features may not work properly. Please try logging out and back in.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
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
          isLoading={isLoading}
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
