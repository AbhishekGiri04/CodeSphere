
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { EditorContextProvider } from "./contexts/EditorContext";
import { CollaborationContextProvider } from "./contexts/CollaborationContext";
import { UserContextProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./components/ThemeProvider";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./pages/Index";
import Room from "./pages/Room";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="codesphere-theme">
        <TooltipProvider>
          <UserContextProvider>
            <CollaborationContextProvider>
              <EditorContextProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/room/:roomId" element={<Room />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </EditorContextProvider>
            </CollaborationContextProvider>
          </UserContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
