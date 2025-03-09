
// Edge function to exchange an Outseta JWT for a Supabase JWT
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

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
    
    // Extract user information from Outseta claims
    const userId = tokenPayload.sub || tokenPayload.nameid;
    const email = tokenPayload.email;
    const name = tokenPayload.name || '';
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Invalid token: Missing user information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Service role key and JWT secret from environment
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    
    if (!serviceRoleKey || !jwtSecret) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Construct the Supabase JWT claims
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiryInSeconds = nowInSeconds + 3600; // 1 hour expiry
    
    const payload = {
      aud: 'authenticated',
      exp: expiryInSeconds,
      iat: nowInSeconds,
      iss: 'supabase',
      sub: userId,
      email: email,
      role: 'authenticated',
      user_metadata: {
        outseta_id: userId,
        full_name: name,
        email: email
      }
    };
    
    console.log('Creating Supabase JWT with payload:', payload);
    
    // Sign the JWT with the Supabase JWT secret
    const privateKey = new TextEncoder().encode(jwtSecret);
    
    // Create the JWT
    const supabaseToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(privateKey);
    
    // Return the Supabase token
    return new Response(
      JSON.stringify({ 
        token: supabaseToken,
        user: {
          id: userId,
          email: email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message || "Unknown error"}` }),
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
