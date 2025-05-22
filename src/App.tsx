
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { themeService } from "./core/theme/ThemeService";
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Clients from "./pages/Clients";
import Vehicles from "./pages/Vehicles";
import Appointments from "./pages/Appointments";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Marketing from "./pages/Marketing";
import NotFoundPage from "./pages/NotFoundPage";

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize theme
const initializeTheme = () => {
  themeService.initialize();
};

const App = () => {
  // Initialize theme when app starts
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Páginas públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Páginas protegidas (dentro do layout) */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/marketing" element={<Marketing />} />
              </Route>
              
              {/* Página 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
