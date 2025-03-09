
// File: /functions/outseta-auth/index.ts

// Deploy as a Supabase function with --no-verify-jwt
// as we are providing an Outseta token, not a Supabase token
// command: supabase functions deploy outseta-auth --no-verify-jwt

import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";
import { v5 as uuidv5 } from "https://deno.land/std@0.177.0/uuid/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// UUID namespace for consistently generating UUIDs from Outseta IDs
// This is a random UUID that we'll use as our namespace
const OUTSETA_NAMESPACE = "a3fb08d7-9c92-4cab-a863-c55771939cf6";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  // Get the Outseta signed JWT from the Authorization header
  const authHeader = req.headers.get("Authorization");
  const outsetaJwtAccessToken = authHeader?.split(" ")[1] || "";

  try {
    // Fetch the JSON Web Key (JWK) set
    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://snippets.outseta.com/.well-known/jwks`)
    );

    // Use the JSON Web Key (JWK) to verify the token
    const { payload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS);

    console.log("JWT is valid");

    // Extract the Outseta user ID
    const outsetaUserId = payload.sub || payload.nameid;
    if (!outsetaUserId) {
      throw new Error("No user ID found in token");
    }

    // Generate a deterministic UUID v5 from the Outseta ID
    // This ensures the same Outseta ID always maps to the same UUID
    const uuidSub = uuidv5(outsetaUserId.toString(), OUTSETA_NAMESPACE);
    
    console.log(`Converted Outseta ID ${outsetaUserId} to UUID ${uuidSub}`);

    // Sanitize the payload - create a clean copy with only the fields we need
    // This avoids issues with malformed fields like 'amr' that cause parsing errors
    const sanitizedPayload = {
      sub: uuidSub, // Use the UUID-formatted subject
      email: payload.email,
      given_name: payload.given_name,
      family_name: payload.family_name,
      name: payload.name,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      jti: payload.jti,
      role: "authenticated" // Add the role for Supabase
    };

    // Log the sanitized payload for debugging
    console.log("Sanitized payload:", JSON.stringify(sanitizedPayload));

    const supabaseEncodedJwtSecret = new TextEncoder().encode(
      Deno.env.get("SUPA_JWT_SECRET")
    );
    const jwtAlg = "HS256";

    const supabaseJwt = await new jose.SignJWT(sanitizedPayload)
      .setProtectedHeader({ alg: jwtAlg, typ: "JWT" })
      .setIssuer("supabase")
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp || "")
      .sign(supabaseEncodedJwtSecret);

    // Respond with the new Supabase JWT
    return new Response(JSON.stringify({ supabaseJwt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Token exchange error:", error.message, {
      outsetaJwtAccessToken: outsetaJwtAccessToken ? "[TOKEN PRESENT]" : "[NO TOKEN]",
    });

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
});
