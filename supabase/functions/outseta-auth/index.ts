// File: /functions/exchange/index.ts

// Deploy as a Supabase function with --no-verify-jwt
// as we are providing an Outseta token, not a Supabase token
// command: supabase functions deploy exchange --no-verify-jwt

import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  // Get the Outseta signed JWT from the Authorization header
  const authHeader = req.headers.get("Authorization");
  const outsetaJwtAccessToken = authHeader?.split(" ")[1] || "";

  try {
    const JWKS = jose.createRemoteJWKSet(
      new URL(`https://${Deno.env.get("OUTSETA_DOMAIN")}/.well-known/jwks`)
    );

    // Use the JSON Web Key (JWK) to verify the token
    const { payload } = await jose.jwtVerify(outsetaJwtAccessToken, JWKS);

    console.log("JWT is valid");

    // Update the JWT for Supabase and sign with the Supabase secret
    payload.role = "authenticated";

    const supabaseEncodedJwtSecret = new TextEncoder().encode(
      Deno.env.get("SUPA_JWT_SECRET")
    );
    const jwtAlg = "HS256";

    const supabaseJwt = await new jose.SignJWT(payload)
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
    console.error(error.message, {
      outsetaJwtAccessToken,
    });

    return new Response(JSON.stringify({ error: "Invalid" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
});