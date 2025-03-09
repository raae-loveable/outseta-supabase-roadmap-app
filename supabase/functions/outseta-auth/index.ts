
// Edge function to exchange an Outseta JWT for a Supabase JWT
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Main function to handle the request
Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get the Outseta token from request
    const { outsetaToken } = await req.json();
    
    if (!outsetaToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: Outseta token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Decode the Outseta JWT payload
    const tokenPayload = decodeJwtPayload(outsetaToken);
    console.log('Decoded Outseta token payload:', tokenPayload);
    
    if (!tokenPayload || !tokenPayload.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid token: Could not extract user ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract user ID and other information
    const userId = tokenPayload.sub || tokenPayload.nameid;
    const email = tokenPayload.email;
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Invalid token: Missing user information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    let supabaseToken;
    
    // If user doesn't exist, create them
    if (userError || !userData?.user) {
      console.log(`User ${userId} not found in Supabase, creating new user`);
      
      // Create the user in Supabase auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          outseta_id: userId,
          full_name: tokenPayload.name,
          first_name: tokenPayload.given_name,
          last_name: tokenPayload.family_name,
        },
        id: userId, // Use the Outseta user ID as the Supabase user ID
      });
      
      if (createError) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Generate a Supabase JWT for the new user
      const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });
      
      if (tokenError) {
        console.error('Error generating token:', tokenError);
        return new Response(
          JSON.stringify({ error: `Failed to generate token: ${tokenError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      supabaseToken = tokenData.properties.hashed_token;
    } else {
      console.log(`User ${userId} found in Supabase, generating JWT`);
      
      // Generate a custom token for the existing user
      const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });
      
      if (tokenError) {
        console.error('Error generating token:', tokenError);
        return new Response(
          JSON.stringify({ error: `Failed to generate token: ${tokenError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      supabaseToken = tokenData.properties.hashed_token;
    }
    
    // Return the Supabase token
    return new Response(
      JSON.stringify({ 
        token: supabaseToken,
        user: {
          id: userId,
          email: email
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to decode JWT payload
function decodeJwtPayload(token: string): any {
  try {
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}
