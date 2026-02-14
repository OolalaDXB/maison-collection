import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Guest {
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  bookings_count: number;
  total_spent: number;
  last_stay: string;
  source: string | null;
}

interface GuestBooking {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  nights: number | null;
  total_price: number;
  status: string | null;
  source: string | null;
}

const AdminGuestsPage = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestBookings, setGuestBookings] = useState<GuestBooking[]>([]);
  const [properties, setProperties] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const [bRes, pRes] = await Promise.all([
        supabase.from("bookings").select("guest_name, guest_email, guest_phone, total_price, check_in, source"),
        supabase.from("properties").select("id, name"),
      ]);

      const propMap: Record<string, string> = {};
      (pRes.data || []).forEach((p: any) => { propMap[p.id] = p.name; });
      setProperties(propMap);

      const bookings = bRes.data || [];
      const guestMap = new Map<string, Guest>();
      bookings.forEach((b: any) => {
        const existing = guestMap.get(b.guest_email);
        if (existing) {
          existing.bookings_count++;
          existing.total_spent += Number(b.total_price) || 0;
          if (b.check_in > existing.last_stay) existing.last_stay = b.check_in;
          if (!existing.guest_phone && b.guest_phone) existing.guest_phone = b.guest_phone;
        } else {
          guestMap.set(b.guest_email, {
            guest_name: b.guest_name,
            guest_email: b.guest_email,
            guest_phone: b.guest_phone,
            bookings_count: 1,
            total_spent: Number(b.total_price) || 0,
            last_stay: b.check_in,
            source: b.source,
          });
        }
      });
      setGuests(Array.from(guestMap.values()).sort((a, b) => b.last_stay.localeCompare(a.last_stay)));
      setLoading(false);
    };
    load();
  }, []);

  const openGuest = async (guest: Guest) => {
    setSelectedGuest(guest);
    const { data } = await supabase.from("bookings").select("id, property_id, check_in, check_out, nights, total_price, status, source").eq("guest_email", guest.guest_email).order("check_in", { ascending: false });
    setGuestBookings(data || []);
  };

  const filtered = guests.filter((g) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return g.guest_name.toLowerCase().includes(s) || g.guest_email.toLowerCase().includes(s);
  });

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Guests</h1>

      <div className="relative mb-4 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="w-full pl-8 pr-3 py-2 border border-border bg-background text-sm" placeholder="Search guest…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Last Stay</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No guests found</TableCell></TableRow>
          ) : filtered.map((g) => (
            <TableRow key={g.guest_email} className="cursor-pointer hover:bg-muted/30" onClick={() => openGuest(g)}>
              <TableCell className="text-sm font-medium">{g.guest_name}</TableCell>
              <TableCell className="text-sm">{g.guest_email}</TableCell>
              <TableCell className="text-sm">{g.guest_phone || "—"}</TableCell>
              <TableCell className="text-sm">{g.bookings_count}</TableCell>
              <TableCell className="text-sm">€{g.total_spent.toLocaleString()}</TableCell>
              <TableCell className="text-sm">{g.last_stay}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{g.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedGuest} onOpenChange={(o) => { if (!o) setSelectedGuest(null); }}>
        <DialogContent className="max-w-lg">
          {selectedGuest && (
            <>
              <DialogHeader><DialogTitle className="font-display">{selectedGuest.guest_name}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> {selectedGuest.guest_email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedGuest.guest_phone || "—"}</div>
                  <div><span className="text-muted-foreground">Bookings:</span> {selectedGuest.bookings_count}</div>
                  <div><span className="text-muted-foreground">Total spent:</span> €{selectedGuest.total_spent.toLocaleString()}</div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Booking History</p>
                  <div className="space-y-2">
                    {guestBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-3 border border-border text-sm">
                        <div>
                          <p className="font-medium">{properties[b.property_id] || "—"}</p>
                          <p className="text-xs text-muted-foreground">{b.check_in} → {b.check_out} · {b.nights} nights</p>
                        </div>
                        <div className="text-right">
                          <p>€{b.total_price}</p>
                          <span className={`text-[0.6rem] px-2 py-0.5 uppercase tracking-wider ${b.status === "confirmed" ? "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]" : b.status === "pending" ? "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminGuestsPage;
