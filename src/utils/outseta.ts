
// Types for the Outseta global object
declare global {
  interface Window {
    Outseta?: {
      getUser: () => Promise<any>;
      getAccessToken: () => Promise<string | null>;
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

export const getCurrentUser = async () => {
  if (window.Outseta) {
    try {
      const user = await window.Outseta.getUser();
      console.log("Current user from Outseta:", user);
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
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
    // Listen for access token changes
    window.Outseta.on('accessToken.set', (token) => {
      console.log("Outseta accessToken.set event triggered", !!token);
      
      // Dispatch a custom event that our app can listen for
      const event = new CustomEvent('outseta:auth:updated', { 
        detail: { token, action: 'token_updated' } 
      });
      window.dispatchEvent(event);
    });
    
    // Listen for user login
    window.Outseta.on('login', (data) => {
      console.log("Outseta login event triggered", data);
      
      // Dispatch a custom event for login
      const event = new CustomEvent('outseta:auth:updated', { 
        detail: { action: 'login', data } 
      });
      window.dispatchEvent(event);
    });
    
    // Listen for user logout
    window.Outseta.on('logout', () => {
      console.log("Outseta logout event triggered");
      
      // Dispatch a custom event for logout
      const event = new CustomEvent('outseta:auth:updated', { 
        detail: { action: 'logout' } 
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
  console.log("Checking initial auth state...");
  
  try {
    const token = await getAccessToken();
    if (token) {
      const user = await getCurrentUser();
      console.log("Initial auth check: User is logged in", user?.uid);
      return { isLoggedIn: true, user };
    } else {
      console.log("Initial auth check: User is not logged in");
      return { isLoggedIn: false, user: null };
    }
  } catch (error) {
    console.error("Error in initial auth check:", error);
    return { isLoggedIn: false, user: null };
  }
};
