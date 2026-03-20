import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";

export function AppLayout() {
  const { onTrial, trialDaysLeft, subscribed } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {onTrial && !subscribed && (
            <div className="bg-primary/10 border-b border-primary/20 px-3 sm:px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-primary font-medium">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              Período de Teste Grátis
            </div>
          )}
          <header className="h-12 sm:h-14 flex items-center border-b border-border px-3 sm:px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-3 sm:mr-4" />
          </header>
          <div className="flex-1 p-3 sm:p-6 overflow-x-hidden">
            <Outlet />
          </div>
          <NotificationBell />
        </main>
      </div>
    </SidebarProvider>
  );
}
