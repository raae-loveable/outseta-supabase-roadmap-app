
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

// Enhanced Outseta event handling
export const registerOutsetaEvents = () => {
  console.log("Registering Outseta events...");
  
  if (window.Outseta) {
    // Listen for access token changes - this includes the JWT payload
    window.Outseta.on('accessToken.set', (jwtPayload) => {
      console.log("Outseta accessToken.set event triggered with JWT payload:", jwtPayload);
      
      // The JWT payload contains user information directly
      const userId = jwtPayload?.uid;
      
      // Dispatch a custom event that our app can listen for
      const event = new CustomEvent('outseta:auth:updated', { 
        detail: { jwtPayload, action: 'token_updated', isLoggedIn: !!userId, userId }
      });
      window.dispatchEvent(event);
    });
    
    // Listen for user login - redundant with accessToken.set but kept for completeness
    window.Outseta.on('login', (data) => {
      console.log("Outseta login event triggered", data);
      
      // Dispatch a custom event for login
      const event = new CustomEvent('outseta:auth:updated', { 
        detail: { action: 'login', data, isLoggedIn: true }
      });
      window.dispatchEvent(event);
    });
    
    // Listen for user logout
    window.Outseta.on('logout', () => {
      console.log("Outseta logout event triggered");
      
      // Dispatch a custom event for logout
      const event = new CustomEvent('outseta:auth:updated', { 
        detail: { action: 'logout', isLoggedIn: false, userId: null }
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
