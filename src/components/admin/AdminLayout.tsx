import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Home, CalendarDays, DollarSign, ClipboardList,
  Users, Star, FileText, Mail, CreditCard, Settings, Upload, LogOut, Menu, X, BarChart3, Sun, Moon
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  const { user, isAdmin, isConcierge, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(() => {
    return localStorage.getItem("admin-light-mode") === "true";
  });

  useEffect(() => {
    if (!loading && (!user || (!isAdmin && !isConcierge))) {
      navigate("/admin/login");
    }
  }, [loading, user, isAdmin, isConcierge, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("admin-light-mode", String(lightMode));
  }, [lightMode]);

  if (loading || !user || (!isAdmin && !isConcierge)) {
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

  // Sidebar colors based on mode
  const sidebarBg = lightMode ? "bg-[hsl(36,20%,97%)]" : "bg-[hsl(30,8%,12%)]";
  const sidebarBorder = lightMode ? "border-r border-[hsl(0,0%,88%)]" : "";
  const logoColor = lightMode ? "text-[hsl(0,0%,10%)]" : "text-white";
  const subtitleColor = lightMode ? "text-[hsl(0,0%,50%)]" : "text-white/50";
  const sectionLabelColor = lightMode ? "text-[hsl(0,0%,60%)]" : "text-white/40";
  const navItemColor = lightMode ? "text-[hsl(0,0%,30%)]" : "text-white/80";
  const navItemHover = lightMode ? "hover:text-[hsl(0,0%,10%)] hover:bg-[hsl(36,15%,93%)]" : "hover:text-white hover:bg-white/5";
  const navActiveClass = lightMode
    ? "bg-primary/10 text-primary font-medium"
    : "bg-white/10 text-white font-medium";
  const userEmailColor = lightMode ? "text-[hsl(0,0%,50%)]" : "text-white/60";
  const signOutColor = lightMode ? "text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,10%)]" : "text-white/50 hover:text-white";
  const borderColor = lightMode ? "border-[hsl(0,0%,88%)]" : "border-white/10";
  const faviconBg = lightMode ? "hsl(var(--primary))" : "#c1695f";
  const mainBg = lightMode ? "bg-white" : "bg-background";

  const sidebar = (
    <nav className="flex flex-col h-full">
      {/* Logo with favicon */}
      <div className="p-6 pb-2">
        <Link to="/" className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <rect width="128" height="128" fill={faviconBg} rx="8"/>
            <path d="M 28 88 L 28 56 L 64 28 L 100 56 L 100 88 L 82 88 L 82 64 L 64 50 L 46 64 L 46 88 Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="miter"/>
          </svg>
          <div>
            <span className={`font-display text-lg tracking-[0.15em] ${logoColor}`}>
              MAISONS
            </span>
            <p className={`font-body text-[0.6rem] uppercase tracking-[0.2em] ${subtitleColor} mt-0.5`}>
              Administration
            </p>
          </div>
        </Link>
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto px-3 pt-2">
        {navSections.map((section) => {
          // Hide Finance section for concierge users
          if (!isAdmin && section.label === "Finance") return null;
          if (!isAdmin && section.label === "Content") return null;
          if (!isAdmin && section.label === "System") return null;
          return (
            <div key={section.label}>
              <p className={`text-[0.65rem] uppercase tracking-[0.15em] ${sectionLabelColor} mt-6 mb-2 px-3 font-medium`}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 font-body text-[0.82rem] tracking-wide transition-colors rounded-sm ${
                      isActive(item.path)
                        ? navActiveClass
                        : `${navItemColor} ${navItemHover}`
                    }`}
                  >
                    <item.icon size={16} strokeWidth={1.8} />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Theme toggle + User section */}
      <div className={`p-4 border-t ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 ${navItemColor}`}>
            {lightMode ? <Sun size={14} /> : <Moon size={14} />}
            <span className="font-body text-[0.75rem]">{lightMode ? "Clair" : "Sombre"}</span>
          </div>
          <Switch
            checked={lightMode}
            onCheckedChange={setLightMode}
            className="scale-90"
          />
        </div>
        <p className={`text-[0.68rem] ${userEmailColor} mb-2 truncate font-body`}>{user?.email}</p>
        <button
          onClick={signOut}
          className={`flex items-center gap-2 font-body text-[0.8rem] ${signOutColor} transition-colors`}
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
      <aside className={`hidden md:block w-60 ${sidebarBg} ${sidebarBorder} shrink-0 sticky top-0 h-screen`}>
        {sidebar}
      </aside>

      {/* Mobile header + drawer */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-40 h-12 ${sidebarBg} flex items-center px-4 ${lightMode ? "border-b border-[hsl(0,0%,88%)]" : ""}`}>
        <button onClick={() => setMobileOpen(true)} className={logoColor}>
          <Menu size={20} />
        </button>
        <span className={`ml-3 font-display text-sm tracking-[0.15em] ${logoColor}`}>MAISONS</span>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[hsl(0,0%,0%,0.5)]" onClick={() => setMobileOpen(false)} />
          <aside className={`relative w-60 h-full ${sidebarBg}`}>
            <button onClick={() => setMobileOpen(false)} className={`absolute top-4 right-4 ${logoColor}`}>
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 min-h-screen ${mainBg}`}>
        <div className="md:hidden h-12" />
        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
