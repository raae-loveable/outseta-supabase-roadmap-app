
import { createSupabaseClientWithToken } from '@/integrations/supabase/authClient';

// Get user profile from Supabase using custom JWT token
export const getUserProfile = async (customClient?: any) => {
  try {
    if (!customClient) {
      console.log('No custom client provided');
      return null;
    }
    
    // Use the provided custom client with JWT token
    const { data, error } = await customClient.auth.getUser();
    
    if (error) {
      console.error('Error getting user with custom client:', error);
      return null;
    }
    
    if (data.user) {
      console.log('User profile retrieved with custom client:', data.user);
      return data.user;
    }
    
    console.log('No user found with custom client');
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Extract user info directly from JWT payload
export const getUserFromJWTPayload = (jwtPayload: any) => {
  if (!jwtPayload) {
    console.log('No JWT payload provided');
    return null;
  }
  
  try {
    const userId = jwtPayload.sub || jwtPayload.nameid;
    
    if (!userId) {
      console.log('No user ID found in JWT payload');
      return null;
    }
    
    // Create a user object from the JWT payload
    const user = {
      id: userId,
      email: jwtPayload.email,
      user_metadata: {
        firstName: jwtPayload.given_name,
        lastName: jwtPayload.family_name,
        fullName: jwtPayload.name
      }
    };
    
    console.log('User extracted from JWT payload:', user);
    return user;
  } catch (error) {
    console.error('Error extracting user from JWT payload:', error);
    return null;
  }
};

// Create a Supabase client with a custom JWT token
export const createClientWithToken = (token: string) => {
  if (!token) {
    console.error('No token provided to create client');
    return null;
  }
  
  try {
    const client = createSupabaseClientWithToken(token);
    console.log('Created Supabase client with token');
    return client;
  } catch (error) {
    console.error('Error creating client with token:', error);
    return null;
  }
};
