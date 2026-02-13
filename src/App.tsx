import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GeolocationProvider } from "@/contexts/GeolocationContext";
import { TaskVerificationProvider } from "@/contexts/TaskVerificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import MapPage from "./pages/MapPage";
import ProgressPage from "./pages/ProgressPage";
import HealthPage from "./pages/HealthPage";
import CommunityPage from "./pages/CommunityPage";
import DistrictsPage from "./pages/DistrictsPage";
import ActionsPage from "./pages/ActionsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <GeolocationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <TaskVerificationProvider>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route element={<Layout />}>
                    <Route path="/" element={<MapPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/health" element={<HealthPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/districts" element={<DistrictsPage />} />
                    <Route path="/actions" element={<ActionsPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TaskVerificationProvider>
            </BrowserRouter>
          </TooltipProvider>
        </GeolocationProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
