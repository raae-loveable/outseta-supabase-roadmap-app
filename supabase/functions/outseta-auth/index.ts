
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// The URL for Outseta's JWKS endpoint
const JWKS_URL = "https://snippets.outseta.com/.well-known/jwks";

// Fetch the JWKS (JSON Web Key Set) from Outseta
async function fetchJwks() {
  try {
    const response = await fetch(JWKS_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`);
    }
    
    const jwks = await response.json();
    return jwks.keys || [];
  } catch (error) {
    console.error('Error fetching JWKS:', error);
    throw error;
  }
}

// Find the appropriate JWK (JSON Web Key) for the token
function findJwk(jwks, kid) {
  return jwks.find(key => key.kid === kid);
}

// Decode base64 URL safe string
function base64UrlDecode(str) {
  // Replace characters for base64url to standard base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if needed
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(base64 + padding);
}

// Parse and validate JWT without verification
function parseJwt(token) {
  try {
    const [headerB64, payloadB64] = token.split('.');
    
    if (!headerB64 || !payloadB64) {
      throw new Error('Invalid token format');
    }
    
    const headerJson = base64UrlDecode(headerB64);
    const payloadJson = base64UrlDecode(payloadB64);
    
    return {
      header: JSON.parse(headerJson),
      payload: JSON.parse(payloadJson)
    };
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Verify the JWT signature using the JWK
async function verifySignature(token, jwk) {
  try {
    // Extract parts of the token
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const signedContent = `${headerB64}.${payloadB64}`;
    
    // Convert JWK to CryptoKey
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' }
      },
      false,
      ['verify']
    );
    
    // Decode the signature
    const signature = new Uint8Array(
      Array.from(base64UrlDecode(signatureB64))
        .map(c => c.charCodeAt(0))
    );
    
    // Verify the signature
    const encoder = new TextEncoder();
    const data = encoder.encode(signedContent);
    const isValid = await crypto.subtle.verify(
      {
        name: 'RSASSA-PKCS1-v1_5'
      },
      key,
      signature,
      data
    );
    
    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Validate token claims
function validateClaims(payload) {
  const now = Math.floor(Date.now() / 1000);
  
  // Check if token is expired
  if (payload.exp && payload.exp < now) {
    console.error('Token expired');
    return false;
  }
  
  // Check if token is not yet valid
  if (payload.nbf && payload.nbf > now) {
    console.error('Token not yet valid');
    return false;
  }
  
  // Check issuer (optional)
  if (payload.iss && !payload.iss.includes('outseta.com')) {
    console.error('Invalid issuer');
    return false;
  }
  
  return true;
}

// Generate a Supabase compatible JWT
async function generateSupabaseJwt(outsetaPayload) {
  try {
    // Create a custom JWT payload for Supabase
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      sub: outsetaPayload.sub || outsetaPayload.nameid,
      email: outsetaPayload.email,
      app_metadata: {
        provider: 'outseta'
      },
      user_metadata: {
        full_name: outsetaPayload.name,
        outseta_uid: outsetaPayload.sub || outsetaPayload.nameid,
      },
      role: 'authenticated'
    }

    // For generating our own JWT, we still need a secret
    // This is different from verifying Outseta's JWT
    const JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET');
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not configured for token generation');
    }

    // Convert the secret to a format usable by the crypto library
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Create the header part of the JWT
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    
    // Create the signature
    const stringToSign = encodedHeader + '.' + encodedPayload
    const signature = await crypto.subtle.sign(
      { name: 'HMAC' },
      key,
      encoder.encode(stringToSign)
    )

    // Convert signature to base64
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    
    // Create the complete JWT
    return `${encodedHeader}.${encodedPayload}.${signatureBase64}`
  } catch (error) {
    console.error('Error generating Supabase JWT:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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

    console.log('Received Outseta token for exchange');

    // Parse the JWT to get header and payload without verification
    const parsedToken = parseJwt(outsetaToken);
    if (!parsedToken) {
      throw new Error('Invalid Outseta token format');
    }
    
    // Extract the key ID (kid) from the token header
    const { kid } = parsedToken.header;
    if (!kid) {
      throw new Error('Token header missing kid (Key ID)');
    }
    
    // Fetch the JWKS from Outseta
    const jwks = await fetchJwks();
    
    // Find the matching JWK for this token
    const jwk = findJwk(jwks, kid);
    if (!jwk) {
      throw new Error(`No matching JWK found for kid: ${kid}`);
    }
    
    // Verify the token signature
    const isSignatureValid = await verifySignature(outsetaToken, jwk);
    if (!isSignatureValid) {
      throw new Error('Invalid token signature');
    }
    
    // Validate token claims
    if (!validateClaims(parsedToken.payload)) {
      throw new Error('Invalid token claims');
    }
    
    // After verification, generate a Supabase compatible JWT
    const supabaseJwt = await generateSupabaseJwt(parsedToken.payload);

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
    console.error('Error in outseta-auth function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
