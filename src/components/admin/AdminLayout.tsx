import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Home, CalendarDays, DollarSign, ClipboardList,
  Users, Star, FileText, Mail, CreditCard, Settings, Upload, LogOut, Menu, X
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Properties", path: "/admin/properties", icon: Home },
  { title: "Calendar", path: "/admin/calendar", icon: CalendarDays },
  { title: "Pricing", path: "/admin/pricing", icon: DollarSign },
  { title: "Bookings", path: "/admin/bookings", icon: ClipboardList },
  { title: "Guests", path: "/admin/guests", icon: Users },
  { title: "Reviews", path: "/admin/reviews", icon: Star },
  { title: "Content", path: "/admin/content", icon: FileText },
  { title: "Inquiries", path: "/admin/inquiries", icon: Mail },
  { title: "Payments", path: "/admin/payments", icon: CreditCard },
  { title: "Settings", path: "/admin/settings", icon: Settings },
  { title: "Import / Export", path: "/admin/import", icon: Upload },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const sidebar = (
    <nav className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <Link to="/" className="font-body uppercase tracking-[0.05em] font-light text-lg text-[hsl(0,0%,100%)]">
          MAISONS
        </Link>
        <p className="text-[0.65rem] text-[hsl(0,0%,50%)] mt-1">Admin</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
              isActive(item.path)
                ? "bg-[hsl(10,40%,55%)] text-[hsl(0,0%,100%)]"
                : "text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)] hover:bg-[hsl(0,0%,15%)]"
            }`}
          >
            <item.icon size={16} />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-[hsl(0,0%,20%)]">
        <p className="text-[0.7rem] text-[hsl(0,0%,50%)] mb-2 truncate">{user?.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,100%)] transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex w-full">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 bg-[hsl(0,0%,10%)] shrink-0 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Mobile header + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-12 bg-[hsl(0,0%,10%)] flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="text-[hsl(0,0%,100%)]">
          <Menu size={20} />
        </button>
        <span className="ml-3 text-sm text-[hsl(0,0%,100%)] font-body uppercase tracking-wider">Maisons Admin</span>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[hsl(0,0%,0%,0.5)]" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-[hsl(0,0%,10%)]">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-[hsl(0,0%,100%)]">
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-background">
        <div className="md:hidden h-12" /> {/* spacer for mobile header */}
        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
