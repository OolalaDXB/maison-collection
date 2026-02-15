import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("property");
  const token = url.searchParams.get("token");

  if (!slug || !token) {
    return new Response("Missing property or token", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: property } = await supabase
    .from("properties")
    .select("id, name, ical_export_token")
    .eq("slug", slug)
    .single();

  if (!property || property.ical_export_token !== token) {
    return new Response("Invalid token", { status: 403 });
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, guest_name, status")
    .eq("property_id", property.id)
    .in("source", ["direct"])
    .in("status", ["confirmed", "pending"]);

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  let ical = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Maisons.co//Direct Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:${property.name} — Direct Bookings\r\n`;

  for (const booking of bookings || []) {
    const dtstart = booking.check_in.replace(/-/g, "");
    const dtend = booking.check_out.replace(/-/g, "");
    ical += `BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:${dtstart}\r\nDTEND;VALUE=DATE:${dtend}\r\nDTSTAMP:${now}\r\nUID:maisons-${booking.id}@maisons.co\r\nSUMMARY:Reserved — ${booking.guest_name}\r\nSTATUS:CONFIRMED\r\nEND:VEVENT\r\n`;
  }

  ical += "END:VCALENDAR";

  return new Response(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-bookings.ics"`,
    },
  });
});
