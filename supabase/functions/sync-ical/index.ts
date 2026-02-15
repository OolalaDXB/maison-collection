import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ICalEvent {
  uid: string;
  dtstart: string;
  dtend: string;
  summary: string;
  description: string;
}

function parseICal(icalText: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const blocks = icalText.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    // Handle folded lines
    const unfolded = block.replace(/\r?\n[ \t]/g, "");

    const getField = (name: string): string => {
      // Match both DTSTART;VALUE=DATE:20260315 and DTSTART:20260315
      const regex = new RegExp(`^${name}[;:](.*)$`, "m");
      const match = unfolded.match(regex);
      if (!match) return "";
      let val = match[1];
      // Extract value after last colon for params like VALUE=DATE:20260315
      if (val.includes(":")) {
        val = val.substring(val.lastIndexOf(":") + 1);
      }
      return val.trim();
    };

    const uid = getField("UID");
    const dtstart = getField("DTSTART");
    const dtend = getField("DTEND");
    const summary = getField("SUMMARY");
    const description = getField("DESCRIPTION");

    if (uid && dtstart) {
      events.push({ uid, dtstart, dtend, summary, description });
    }
  }

  return events;
}

function toDateStr(ical: string): string {
  if (ical.length >= 8) {
    return `${ical.slice(0, 4)}-${ical.slice(4, 6)}-${ical.slice(6, 8)}`;
  }
  return ical;
}

function dateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startStr + "T00:00:00Z");
  const end = new Date(endStr + "T00:00:00Z");
  const current = new Date(start);
  while (current < end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { data: properties, error: propError } = await supabase
      .from("properties")
      .select("id, slug, name, airbnb_ical_url")
      .not("airbnb_ical_url", "is", null)
      .neq("airbnb_ical_url", "");

    if (propError) throw propError;
    if (!properties || properties.length === 0) {
      return new Response(JSON.stringify({ message: "No properties with iCal URLs" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const prop of properties) {
      let eventsFound = 0;
      let eventsCreated = 0;
      let eventsUpdated = 0;
      let errorMessage: string | null = null;

      try {
        const response = await fetch(prop.airbnb_ical_url, {
          headers: { "User-Agent": "Maisons-iCal-Sync/1.0" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const icalText = await response.text();
        const events = parseICal(icalText);
        eventsFound = events.length;

        for (const event of events) {
          const checkIn = toDateStr(event.dtstart);
          const checkOut = event.dtend ? toDateStr(event.dtend) : null;
          if (!checkOut) continue;

          const dates = dateRange(checkIn, checkOut);
          if (dates.length === 0) continue;

          // Detect if this is a real reservation or just a blocked/unavailable period
          const summaryLower = (event.summary || "").toLowerCase().trim();
          const isBlocked =
            summaryLower.includes("not available") ||
            summaryLower === "blocked" ||
            summaryLower === "" ||
            summaryLower.startsWith("airbnb (not available");

          // Real reservations have a guest name or "Reserved" summary
          const isReservation = !isBlocked && (
            summaryLower.includes("reserved") ||
            summaryLower.includes("airbnb") ||
            (event.description && event.description.length > 5) ||
            (!["reserved", "blocked", "not available", "airbnb"].includes(summaryLower) && summaryLower.length > 0)
          );

          let guestName = "Airbnb Guest";
          if (
            event.summary &&
            !["reserved", "not available", "blocked", "airbnb"].includes(summaryLower) &&
            !summaryLower.startsWith("airbnb (not available")
          ) {
            guestName = event.summary.trim();
          }

          // Determine source tag for availability
          const availSource = isBlocked ? "airbnb_block" : "airbnb";

          // Block availability dates
          for (const date of dates) {
            await supabase.from("availability").upsert(
              {
                property_id: prop.id,
                date,
                available: false,
                source: availSource,
                airbnb_uid: event.uid,
              },
              { onConflict: "property_id,date" }
            );
          }

          // Only create booking records for actual reservations (not blocks)
          if (isReservation) {
            // Deduplicate by UID first (most reliable)
            const { data: existingByUid } = await supabase
              .from("bookings")
              .select("id")
              .eq("property_id", prop.id)
              .eq("source", "airbnb")
              .ilike("internal_notes", `%${event.uid}%`)
              .maybeSingle();

            if (existingByUid) {
              eventsUpdated++;
            } else {
              // Fallback: check by dates
              const { data: existingByDates } = await supabase
                .from("bookings")
                .select("id")
                .eq("property_id", prop.id)
                .eq("check_in", checkIn)
                .eq("check_out", checkOut)
                .in("source", ["airbnb", "airbnb_csv"])
                .maybeSingle();

              if (existingByDates) {
                eventsUpdated++;
              } else {
                const { error: bookError } = await supabase.from("bookings").insert({
                  property_id: prop.id,
                  guest_name: guestName,
                  guest_email: "airbnb@placeholder.com",
                  check_in: checkIn,
                  check_out: checkOut,
                  base_price_per_night: 0,
                  total_price: 0,
                  status: "confirmed",
                  source: "airbnb",
                  internal_notes: `iCal sync — UID: ${event.uid}`,
                });

                if (!bookError) eventsCreated++;
              }
            }
          }
        }

        // Clean up expired Airbnb blocks (future dates no longer in feed)
        const activeUids = events.map((e) => e.uid).filter(Boolean);
        if (activeUids.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const quotedUids = activeUids.map((u) => `"${u}"`).join(",");
          await supabase
            .from("availability")
            .update({ available: true, source: "airbnb_expired" })
            .eq("property_id", prop.id)
            .eq("source", "airbnb")
            .gte("date", today)
            .not("airbnb_uid", "in", `(${quotedUids})`);
        }
      } catch (err: any) {
        errorMessage = err.message || "Unknown error";
        console.error(`Sync error for ${prop.slug}:`, err);
      }

      await supabase.from("ical_sync_log").insert({
        property_id: prop.id,
        events_found: eventsFound,
        events_created: eventsCreated,
        events_updated: eventsUpdated,
        status: errorMessage ? "error" : "success",
        error_message: errorMessage,
      });

      results.push({
        property: prop.slug,
        events_found: eventsFound,
        events_created: eventsCreated,
        events_updated: eventsUpdated,
        error: errorMessage,
      });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
