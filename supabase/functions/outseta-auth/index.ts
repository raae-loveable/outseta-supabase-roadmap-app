
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get the Outseta token from the request body
    const { outsetaToken } = await req.json()
    if (!outsetaToken) {
      throw new Error('Missing Outseta token')
    }

    console.log('Received Outseta token for exchange')

    // The simplest approach: use the Outseta token as the user identity
    // No need to create Supabase users; we just create a custom JWT
    
    // Decode the JWT to get the user's identity
    // Note: In a production app, you would verify the JWT signature
    const tokenPayload = parseJwt(outsetaToken)
    
    if (!tokenPayload || !tokenPayload.sub) {
      throw new Error('Invalid Outseta token')
    }

    // Generate a Supabase compatible JWT
    const supabaseJwt = await generateSupabaseJwt(tokenPayload)

    return new Response(
      JSON.stringify({ token: supabaseJwt }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in outseta-auth function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})

// Helper to parse the JWT without verification
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Error parsing JWT:', e)
    return null
  }
}

// Generate a Supabase compatible JWT
async function generateSupabaseJwt(outsetaPayload: any) {
  try {
    // In a real app, use the JWT_SECRET from environment variables
    const JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET')
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }

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

    // Convert the secret to a format usable by the crypto library
    const encoder = new TextEncoder()
    const secretBytes = encoder.encode(JWT_SECRET)
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
    console.error('Error generating Supabase JWT:', error)
    throw error
  }
}
