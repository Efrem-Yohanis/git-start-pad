import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CampaignProvider } from "@/context/CampaignContext";
import AppShell from "@/components/AppShell";
import CampaignList from "@/pages/CampaignList";
import CampaignDetail from "@/pages/CampaignDetail";
import CampaignCreate from "@/pages/CampaignCreate";
import AudienceList from "@/pages/AudienceList";
import AudienceDetail from "@/pages/AudienceDetail";
import ScheduleList from "@/pages/ScheduleList";
import ScheduleDetail from "@/pages/ScheduleDetail";
import MessageContentList from "@/pages/MessageContentList";
import MessageContentDetail from "@/pages/MessageContentDetail";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CampaignProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<CampaignList />} />
              <Route path="/campaigns/new" element={<CampaignCreate />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/campaigns/:id/edit" element={<CampaignCreate />} />
              <Route path="/audiences" element={<AudienceList />} />
              <Route path="/audiences/:id" element={<AudienceDetail />} />
              <Route path="/schedules" element={<ScheduleList />} />
              <Route path="/schedules/:id" element={<ScheduleDetail />} />
              <Route path="/messages" element={<MessageContentList />} />
              <Route path="/messages/:id" element={<MessageContentDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </CampaignProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
