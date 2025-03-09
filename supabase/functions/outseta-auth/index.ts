
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log("OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Get the Outseta token from the request body
    const { outsetaToken } = await req.json();
    if (!outsetaToken) {
      throw new Error('Missing Outseta token');
    }

    console.log('Received Outseta token for verification');

    try {
      // Fetch the JSON Web Key (JWK) set
      const JWKS = jose.createRemoteJWKSet(
        new URL("https://snippets.outseta.com/.well-known/jwks")
      );

      // Use the JSON Web Key (JWK) to verify the token
      const { payload } = await jose.jwtVerify(outsetaToken, JWKS);
      
      console.log("JWT is valid");

      // Create a custom JWT payload for Supabase
      const supabasePayload = {
        aud: 'authenticated',
        exp: payload.exp,
        sub: payload.sub || payload.nameid,
        email: payload.email,
        app_metadata: {
          provider: 'outseta'
        },
        user_metadata: {
          full_name: payload.name,
          outseta_uid: payload.sub || payload.nameid,
        },
        role: 'authenticated'
      };

      // For signing our own JWT, we need the Supabase JWT secret
      const JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET');
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET not configured for token generation');
      }

      // Create and sign the JWT for Supabase
      const supabaseEncodedJwtSecret = new TextEncoder().encode(JWT_SECRET);
      const jwtAlg = "HS256";

      const supabaseJwt = await new jose.SignJWT(supabasePayload)
        .setProtectedHeader({ alg: jwtAlg, typ: "JWT" })
        .setIssuer("supabase")
        .setIssuedAt()
        .setExpirationTime(payload.exp || "1h")
        .sign(supabaseEncodedJwtSecret);

      return new Response(
        JSON.stringify({ token: supabaseJwt }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    } catch (error) {
      console.error("JWT verification error:", error.message, {
        outsetaToken: outsetaToken.substring(0, 10) + '...',
      });
      
      throw new Error(`Invalid token: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in outseta-auth function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 401,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
