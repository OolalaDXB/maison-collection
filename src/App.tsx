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
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminPropertiesPage = lazy(() => import("./pages/admin/AdminPropertiesPage"));
const AdminCalendarPage = lazy(() => import("./pages/admin/AdminCalendarPage"));
const AdminPricingPage = lazy(() => import("./pages/admin/AdminPricingPage"));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage"));
const AdminGuestsPage = lazy(() => import("./pages/admin/AdminGuestsPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminContentPage = lazy(() => import("./pages/admin/AdminContentPage"));
const AdminInquiriesPage = lazy(() => import("./pages/admin/AdminInquiriesPage"));
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminProfilePage = lazy(() => import("./pages/AdminProfilePage"));
const AdminImportPage = lazy(() => import("./pages/admin/AdminImportPage"));
const AdminFinancePage = lazy(() => import("./pages/admin/AdminFinancePage"));
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
