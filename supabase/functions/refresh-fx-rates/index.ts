import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TARGET_CURRENCIES = ["USD", "GBP", "AED", "GEL"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch ECB daily rates XML
    const ecbUrl =
      "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
    const ecbRes = await fetch(ecbUrl);
    if (!ecbRes.ok) throw new Error(`ECB fetch failed: ${ecbRes.status}`);
    const xml = await ecbRes.text();

    // Parse rates from XML using regex (lightweight, no XML parser needed)
    const rates: Record<string, number> = {};
    const regex = /currency='([A-Z]+)'\s+rate='([\d.]+)'/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const [, currency, rate] = match;
      if (TARGET_CURRENCIES.includes(currency)) {
        rates[currency] = parseFloat(rate);
      }
    }

    // For GEL: ECB doesn't always include it. If missing, try a fallback
    // AED is pegged to USD at ~3.6725 AED/USD
    if (!rates["AED"] && rates["USD"]) {
      rates["AED"] = rates["USD"] * 3.6725;
    }

    // GEL is not in ECB feed, derive from USD cross rate
    if (!rates["GEL"] && rates["USD"]) {
      rates["GEL"] = rates["USD"] * 2.85;
    }

    if (Object.keys(rates).length === 0) {
      throw new Error("No rates parsed from ECB feed");
    }

    // Upsert into fx_rates
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rows = Object.entries(rates).map(([currency, rate]) => ({
      base_currency: "EUR",
      target_currency: currency,
      rate,
      fetched_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("fx_rates")
      .upsert(rows, { onConflict: "base_currency,target_currency" });

    if (error) throw new Error(`Upsert error: ${error.message}`);

    console.log(`[refresh-fx-rates] Updated ${rows.length} rates:`, rates);

    return new Response(
      JSON.stringify({ success: true, rates, updated: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[refresh-fx-rates] ERROR: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
