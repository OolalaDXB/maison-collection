import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PropertyPage from "./pages/PropertyPage";
import ArabiaPage from "./pages/ArabiaPage";
import ManagementPage from "./pages/ManagementPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPropertiesPage from "./pages/admin/AdminPropertiesPage";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage";
import AdminPricingPage from "./pages/admin/AdminPricingPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import BookingPage from "./pages/BookingPage";
import {
  AdminGuestsPage,
  AdminContentPage, AdminInquiriesPage, AdminPaymentsPage, AdminSettingsPage
} from "./pages/admin/AdminPlaceholderPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/arabia" element={<ArabiaPage />} />
          <Route path="/management" element={<ManagementPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/georgia" element={<PropertyPage />} />
          <Route path="/atlantique" element={<PropertyPage />} />
          <Route path="/book/:slug" element={<BookingPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/properties" element={<AdminPropertiesPage />} />
          <Route path="/admin/calendar" element={<AdminCalendarPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/guests" element={<AdminGuestsPage />} />
          <Route path="/admin/reviews" element={<AdminPropertiesPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
