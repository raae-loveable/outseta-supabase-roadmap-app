// Types for the Outseta global object
declare global {
  interface Window {
    Outseta?: {
      getUser: () => Promise<any>;
      getAccessToken: () => Promise<string | null>;
      getJwtPayload: () => any; // Changed to non-async since it's synchronous
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

// Get the decoded JWT payload directly - now synchronous
export const getAuthPayload = () => {
  if (window.Outseta) {
    try {
      const payload = window.Outseta.getJwtPayload();
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
    // Listen only for access token changes - this handles both login and logout
    window.Outseta.on('accessToken.set', (jwtPayload) => {
      console.log("Outseta accessToken.set event triggered with JWT payload:", jwtPayload);
      
      // Check if jwtPayload exists (login) or is undefined (logout)
      const isLoggedIn = !!jwtPayload;
      const userId = jwtPayload?.sub || jwtPayload?.nameid || null;
      
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

// No longer needed as we check auth state in the hook
export const checkInitialAuthState = async () => {
  console.log("DEPRECATED: Use useOutsetaAuth hook instead");
  return { isLoggedIn: false, user: null, userId: null };
};
