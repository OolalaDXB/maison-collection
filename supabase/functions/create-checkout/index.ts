import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      booking_id,
      amount,
      currency,
      property_name,
      guest_email,
      success_url,
      cancel_url,
    } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: guest_email,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: `Reservation — ${property_name}`,
              description: `Booking ${booking_id.slice(0, 8).toUpperCase()}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { booking_id },
      success_url,
      cancel_url,
    });

    // Update booking with Stripe session ID
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("bookings")
      .update({
        stripe_session_id: session.id,
        payment_status: "checkout_started",
      } as any)
      .eq("id", booking_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
