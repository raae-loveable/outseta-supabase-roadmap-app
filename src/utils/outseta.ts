
// Types for the Outseta global object
declare global {
  interface Window {
    Outseta?: {
      getUser: () => Promise<any>;
      auth: {
        open: (options: { widgetMode: string }) => void;
      };
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
