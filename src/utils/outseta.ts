
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
    // Dispatch a custom event that our app is listening for
    const event = new CustomEvent('outseta:auth:updated', { detail: null });
    window.dispatchEvent(event);
  } else {
    console.error("Outseta is not available");
  }
};

// Register custom event handlers
export const registerOutsetaEvents = () => {
  if (window.OutsetaEventRegister) {
    // Auth:updated event
    window.OutsetaEventRegister("auth:updated", function(auth: any) {
      console.log("Outseta auth updated", auth);
      // Dispatch a custom event that our app is listening for
      const event = new CustomEvent('outseta:auth:updated', { detail: auth });
      window.dispatchEvent(event);
    });
  }
};
