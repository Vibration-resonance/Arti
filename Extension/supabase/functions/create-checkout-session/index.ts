import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { plan, return_url } = await req.json()

    if (!plan || !['Premium', 'Pro'].includes(plan)) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Get user data
    const { data: userData } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Define pricing based on plan
    const prices = {
      Premium: {
        monthly: Deno.env.get('STRIPE_PREMIUM_MONTHLY_PRICE_ID'),
        yearly: Deno.env.get('STRIPE_PREMIUM_YEARLY_PRICE_ID')
      },
      Pro: {
        monthly: Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID'),
        yearly: Deno.env.get('STRIPE_PRO_YEARLY_PRICE_ID')
      }
    }

    // Create or get Stripe customer
    let customer
    if (userData.stripe_customer_id) {
      customer = await stripe.customers.retrieve(userData.stripe_customer_id)
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: userData.pseudo,
        metadata: {
          supabase_user_id: user.id
        }
      })

      // Update user with Stripe customer ID
      await supabaseClient
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id)
    }

    // Create checkout session (default to monthly)
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[plan].monthly,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${return_url || 'chrome-extension://'}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${return_url || 'chrome-extension://'}?success=false`,
      metadata: {
        supabase_user_id: user.id,
        plan: plan
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: plan
        }
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          checkout_url: session.url,
          session_id: session.id
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
