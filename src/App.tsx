import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import MapPage from "./pages/MapPage";
import ProgressPage from "./pages/ProgressPage";
import HealthPage from "./pages/HealthPage";
import CommunityPage from "./pages/CommunityPage";
import DistrictsPage from "./pages/DistrictsPage";
import ActionsPage from "./pages/ActionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
