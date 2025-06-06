import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan

        if (!userId || !plan) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Update user subscription
        await supabaseClient
          .from('users')
          .update({
            role: plan,
            stripe_subscription_id: session.subscription,
            subscription_status: 'active'
          })
          .eq('id', userId)

        // Award subscription badges
        if (plan === 'Premium') {
          const { data: badge } = await supabaseClient
            .from('badges')
            .select('id')
            .eq('nom_badge', 'Contributeur Premium')
            .single()

          if (badge) {
            await supabaseClient
              .from('user_badges')
              .insert({
                user_id: userId,
                badge_id: badge.id,
                awarded_at: new Date().toISOString()
              })
              .onConflict('user_id, badge_id')
              .ignore()
          }
        } else if (plan === 'Pro') {
          const { data: badge } = await supabaseClient
            .from('badges')
            .select('id')
            .eq('nom_badge', 'Expert Pro')
            .single()

          if (badge) {
            await supabaseClient
              .from('user_badges')
              .insert({
                user_id: userId,
                badge_id: badge.id,
                awarded_at: new Date().toISOString()
              })
              .onConflict('user_id, badge_id')
              .ignore()
          }
        }

        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          console.error('Missing user_id in subscription metadata')
          break
        }

        let newStatus = 'inactive'
        let newRole = 'Free'

        if (subscription.status === 'active') {
          newStatus = 'active'
          newRole = subscription.metadata?.plan || 'Premium'
        } else if (subscription.status === 'canceled') {
          newStatus = 'canceled'
        } else if (subscription.status === 'past_due') {
          newStatus = 'past_due'
        }

        // Update user subscription status
        await supabaseClient
          .from('users')
          .update({
            role: newRole,
            subscription_status: newStatus
          })
          .eq('id', userId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          console.error('Missing user_id in subscription metadata')
          break
        }

        // Update user subscription status
        await supabaseClient
          .from('users')
          .update({
            subscription_status: 'payment_failed'
          })
          .eq('id', userId)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
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
