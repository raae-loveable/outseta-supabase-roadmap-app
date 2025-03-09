
// Types for the Outseta global object
declare global {
  interface Window {
    Outseta?: {
      getUser: () => Promise<any>;
      getAccessToken: () => Promise<string | null>;
      getJwtPayload: () => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      auth: {
        open: (options: { widgetMode: string }) => void;
      };
      logout: () => void;
    };
    OutsetaEventRegister?: any;
  }
}

export const openOutsetaSignIn = () => {
  if (window.Outseta) {
    window.Outseta.auth.open({ widgetMode: "login" });
  } else {
    console.error("Outseta is not available");
  }
};

export const openOutsetaSignUp = () => {
  if (window.Outseta) {
    window.Outseta.auth.open({ widgetMode: "signup" });
  } else {
    console.error("Outseta is not available");
  }
};

// Get the decoded JWT payload directly
export const getAuthPayload = async () => {
  if (window.Outseta) {
    try {
      const payload = await window.Outseta.getJwtPayload();
      console.log("JWT payload from Outseta:", payload);
      return payload;
    } catch (error) {
      console.error("Error getting JWT payload:", error);
      return null;
    }
  }
  return null;
};

export const getAccessToken = async (): Promise<string | null> => {
  if (window.Outseta) {
    try {
      const token = await window.Outseta.getAccessToken();
      console.log("Access token available:", !!token);
      return token;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }
  return null;
};

export const logoutUser = () => {
  if (window.Outseta) {
    window.Outseta.logout();
  } else {
    console.error("Outseta is not available");
  }
};

// Simplified Outseta event handling
export const registerOutsetaEvents = () => {
  console.log("Registering Outseta events...");
  
  if (window.Outseta) {
    // Listen only for access token changes - this includes the JWT payload
    // This event handles both login and logout scenarios
    window.Outseta.on('accessToken.set', (jwtPayload) => {
      console.log("Outseta accessToken.set event triggered with JWT payload:", jwtPayload);
      
      // Check if jwtPayload exists (login) or is undefined (logout)
      const isLoggedIn = !!jwtPayload;
      const userId = jwtPayload?.uid || null;
      
      // Dispatch a custom event that our app can listen for
      const event = new CustomEvent('outseta:auth:updated', { 
        detail: { 
          jwtPayload, 
          action: isLoggedIn ? 'login' : 'logout',
          isLoggedIn,
          userId
        }
      });
      window.dispatchEvent(event);
    });
  } else if (window.OutsetaEventRegister) {
    // Fallback to OutsetaEventRegister if available
    window.OutsetaEventRegister("auth:updated", function(auth: any) {
      console.log("OutsetaEventRegister auth:updated event", auth);
      
      // Dispatch a custom event that our app is listening for
      const event = new CustomEvent('outseta:auth:updated', { detail: auth });
      window.dispatchEvent(event);
    });
  } else {
    console.warn("Neither Outseta nor OutsetaEventRegister is available for event registration");
  }
};

// Helper to check authentication state on page load
export const checkInitialAuthState = async () => {
  console.log("Checking initial auth state using JWT payload...");
  
  try {
    const jwtPayload = await getAuthPayload();
    if (jwtPayload) {
      const userId = jwtPayload.uid;
      console.log("Initial auth check: User is logged in with ID:", userId);
      return { isLoggedIn: true, user: jwtPayload, userId };
    } else {
      console.log("Initial auth check: User is not logged in (no JWT payload)");
      return { isLoggedIn: false, user: null, userId: null };
    }
  } catch (error) {
    console.error("Error in initial auth check:", error);
    return { isLoggedIn: false, user: null, userId: null };
  }
};
