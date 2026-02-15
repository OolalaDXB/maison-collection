import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useHashScroll from "@/hooks/useHashScroll";
import Index from "./pages/Index";
import PropertyPage from "./pages/PropertyPage";
import GeorgiaPage from "./pages/GeorgiaPage";
import ArabiaPage from "./pages/ArabiaPage";
import AtlantiquePage from "./pages/AtlantiquePage";
import ManagementPage from "./pages/ManagementPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPropertiesPage from "./pages/admin/AdminPropertiesPage";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage";
import AdminPricingPage from "./pages/admin/AdminPricingPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminGuestsPage from "./pages/admin/AdminGuestsPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminContentPage from "./pages/admin/AdminContentPage";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
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
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/arabia" element={<ArabiaPage />} />
          <Route path="/management" element={<ManagementPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/georgia" element={<GeorgiaPage />} />
          <Route path="/atlantique" element={<AtlantiquePage />} />
          <Route path="/book/:slug" element={<BookingPage />} />
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
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollManager />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
