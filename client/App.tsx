import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Tea from "./pages/Tea";
import PlaceholderPage from "./pages/PlaceholderPage";
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
          <Route path="/tea" element={<Tea />} />
          <Route path="/offers" element={<PlaceholderPage title="العروض" />} />
          <Route path="/cold-coffee" element={<PlaceholderPage title="قهوة بارده" />} />
          <Route path="/hot-coffee" element={<PlaceholderPage title="قهوه ساخنة" />} />
          <Route path="/natural-juices" element={<PlaceholderPage title="العصائر الطبيعية" />} />
          <Route path="/cocktails" element={<PlaceholderPage title="الكوكتيل و الموهيتو" />} />
          <Route path="/manakish" element={<PlaceholderPage title="المناقيش و الفطائر" />} />
          <Route path="/pizza" element={<PlaceholderPage title="البيتزا" />} />
          <Route path="/sandwiches" element={<PlaceholderPage title="السندوتش و ال��رجر" />} />
          <Route path="/desserts" element={<PlaceholderPage title="الحلا" />} />
          <Route path="/shisha" element={<PlaceholderPage title="الشيشة" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
