import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Admin pages grouped into a single chunk
          if (id.includes('/components/admin/') || id.includes('/pages/admin/') || id.includes('/pages/AdminLoginPage') || id.includes('/pages/AdminProfilePage') || id.includes('/pages/AdminDashboard')) {
            return 'admin';
          }
          // Property detail pages (Arabia, Georgia, Atlantique)
          if (id.includes('/components/arabia/') || id.includes('/pages/ArabiaPage') ||
              id.includes('/components/georgia/') || id.includes('/pages/GeorgiaPage') ||
              id.includes('/components/atlantique/') || id.includes('/pages/AtlantiquePage')) {
            return 'properties';
          }
          // Booking flow
          if (id.includes('/pages/BookingPage') || id.includes('/pages/BookingConfirmation') || id.includes('/components/BookingModal')) {
            return 'booking';
          }
          if (!id.includes('node_modules')) return;
          // Vendor chunks
          if (id.includes('/react/') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
          if (id.includes('@supabase') || id.includes('@tanstack/react-query')) return 'vendor-supabase';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('recharts')) return 'vendor-charts';
          if (id.includes('mapbox-gl')) return 'vendor-map';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms';
          if (id.includes('xlsx')) return 'vendor-xlsx';
          if (id.includes('@radix-ui')) return 'vendor-ui';
        },
      },
    },
  },
}));
