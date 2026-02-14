import AdminLayout from "@/components/admin/AdminLayout";

const AdminPlaceholder = ({ title }: { title: string }) => (
  <AdminLayout>
    <h1 className="font-display text-2xl mb-4">{title}</h1>
    <p className="text-muted-foreground">Coming soon.</p>
  </AdminLayout>
);

export const AdminCalendarPage = () => <AdminPlaceholder title="Calendar" />;
export const AdminPricingPage = () => <AdminPlaceholder title="Pricing" />;
export const AdminBookingsPage = () => <AdminPlaceholder title="Bookings" />;
export const AdminGuestsPage = () => <AdminPlaceholder title="Guests" />;
export const AdminContentPage = () => <AdminPlaceholder title="Content" />;
export const AdminInquiriesPage = () => <AdminPlaceholder title="Inquiries" />;
export const AdminPaymentsPage = () => <AdminPlaceholder title="Payments" />;
export const AdminSettingsPage = () => <AdminPlaceholder title="Settings" />;
