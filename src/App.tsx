import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import useHashScroll from "@/hooks/useHashScroll";
import Index from "./pages/Index";

const PropertyPage = lazy(() => import("./pages/PropertyPage"));
const GeorgiaPage = lazy(() => import("./pages/GeorgiaPage"));
const ArabiaPage = lazy(() => import("./pages/ArabiaPage"));
const AtlantiquePage = lazy(() => import("./pages/AtlantiquePage"));
const ManagementPage = lazy(() => import("./pages/ManagementPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BookingConfirmationPage = lazy(() => import("./pages/BookingConfirmationPage"));
// Admin pages — prefetch all when any is accessed (single chunk)
const adminImports = {
  login: () => import("./pages/AdminLoginPage"),
  dashboard: () => import("./pages/admin/AdminDashboardPage"),
  properties: () => import("./pages/admin/AdminPropertiesPage"),
  calendar: () => import("./pages/admin/AdminCalendarPage"),
  pricing: () => import("./pages/admin/AdminPricingPage"),
  bookings: () => import("./pages/admin/AdminBookingsPage"),
  guests: () => import("./pages/admin/AdminGuestsPage"),
  reviews: () => import("./pages/admin/AdminReviewsPage"),
  content: () => import("./pages/admin/AdminContentPage"),
  inquiries: () => import("./pages/admin/AdminInquiriesPage"),
  payments: () => import("./pages/admin/AdminPaymentsPage"),
  settings: () => import("./pages/admin/AdminSettingsPage"),
  profile: () => import("./pages/AdminProfilePage"),
  importExport: () => import("./pages/admin/AdminImportPage"),
  finance: () => import("./pages/admin/AdminFinancePage"),
};

// Prefetch all admin pages once any admin route is visited
let adminPrefetched = false;
const prefetchAdmin = () => {
  if (adminPrefetched) return;
  adminPrefetched = true;
  Object.values(adminImports).forEach((load) => load());
};

const AdminLoginPage = lazy(() => { prefetchAdmin(); return adminImports.login(); });
const AdminDashboardPage = lazy(() => { prefetchAdmin(); return adminImports.dashboard(); });
const AdminPropertiesPage = lazy(() => { prefetchAdmin(); return adminImports.properties(); });
const AdminCalendarPage = lazy(() => { prefetchAdmin(); return adminImports.calendar(); });
const AdminPricingPage = lazy(() => { prefetchAdmin(); return adminImports.pricing(); });
const AdminBookingsPage = lazy(() => { prefetchAdmin(); return adminImports.bookings(); });
const AdminGuestsPage = lazy(() => { prefetchAdmin(); return adminImports.guests(); });
const AdminReviewsPage = lazy(() => { prefetchAdmin(); return adminImports.reviews(); });
const AdminContentPage = lazy(() => { prefetchAdmin(); return adminImports.content(); });
const AdminInquiriesPage = lazy(() => { prefetchAdmin(); return adminImports.inquiries(); });
const AdminPaymentsPage = lazy(() => { prefetchAdmin(); return adminImports.payments(); });
const AdminSettingsPage = lazy(() => { prefetchAdmin(); return adminImports.settings(); });
const AdminProfilePage = lazy(() => { prefetchAdmin(); return adminImports.profile(); });
const AdminImportPage = lazy(() => { prefetchAdmin(); return adminImports.importExport(); });
const AdminFinancePage = lazy(() => { prefetchAdmin(); return adminImports.finance(); });
const BookingPage = lazy(() => import("./pages/BookingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const pageVariants = {
  initial: {},
  animate: {},
  exit: { opacity: 0 },
};

const ScrollManager = () => {
  useHashScroll();
  return null;
};

const AppContent = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/arabia" element={<ArabiaPage />} />
            <Route path="/management" element={<ManagementPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/georgia" element={<GeorgiaPage />} />
            <Route path="/atlantique" element={<AtlantiquePage />} />
            <Route path="/book/:slug" element={<BookingPage />} />
            <Route path="/book/:slug/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/properties" element={<AdminPropertiesPage />} />
            <Route path="/admin/calendar" element={<AdminCalendarPage />} />
            <Route path="/admin/pricing" element={<AdminPricingPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/guests" element={<AdminGuestsPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/content" element={<AdminContentPage />} />
            <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/finance" element={<AdminFinancePage />} />
            <Route path="/admin/import" element={<AdminImportPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </m.div>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LazyMotion features={domAnimation} strict>
            <ScrollManager />
            <AppContent />
          </LazyMotion>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
