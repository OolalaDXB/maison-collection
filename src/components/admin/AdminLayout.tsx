import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Home, CalendarDays, DollarSign, ClipboardList,
  Users, Star, FileText, Mail, CreditCard, Settings, Upload, LogOut, Menu, X, BarChart3
} from "lucide-react";

interface NavSection {
  label: string;
  items: { title: string; path: string; icon: React.ComponentType<any> }[];
}

const navSections: NavSection[] = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { title: "Properties", path: "/admin/properties", icon: Home },
      { title: "Calendar", path: "/admin/calendar", icon: CalendarDays },
      { title: "Bookings", path: "/admin/bookings", icon: ClipboardList },
    ],
  },
  {
    label: "Guests",
    items: [
      { title: "Guests", path: "/admin/guests", icon: Users },
      { title: "Reviews", path: "/admin/reviews", icon: Star },
      { title: "Inquiries", path: "/admin/inquiries", icon: Mail },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Pricing", path: "/admin/pricing", icon: DollarSign },
      { title: "Payments", path: "/admin/payments", icon: CreditCard },
      { title: "Finance", path: "/admin/finance", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Content", path: "/admin/content", icon: FileText },
      { title: "Import / Export", path: "/admin/import", icon: Upload },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
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
      {/* Logo */}
      <div className="p-6 pb-2">
        <Link to="/" className="block">
          <span className="font-display text-lg tracking-[0.15em] text-white">
            MAISONS
          </span>
          <p className="font-body text-[0.6rem] uppercase tracking-[0.2em] text-white/40 mt-0.5">
            Administration
          </p>
        </Link>
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto px-3 pt-2">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[0.6rem] uppercase tracking-[0.15em] text-white/25 mt-5 mb-2 px-3">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 font-body text-[0.8rem] tracking-wide transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/15 text-white font-medium"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <item.icon size={15} />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User section */}
      <div className="p-4 border-t border-white/10">
        <p className="text-[0.65rem] text-white/50 mb-2 truncate font-body">{user?.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 font-body text-[0.8rem] text-white/40 hover:text-white transition-colors"
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
      <aside className="hidden md:block w-60 bg-[hsl(30,5%,8%)] shrink-0 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Mobile header + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-12 bg-[hsl(30,5%,8%)] flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="text-white">
          <Menu size={20} />
        </button>
        <span className="ml-3 font-display text-sm tracking-[0.15em] text-white">MAISONS</span>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[hsl(0,0%,0%,0.5)]" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-[hsl(30,5%,8%)]">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white">
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-background">
        <div className="md:hidden h-12" />
        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
