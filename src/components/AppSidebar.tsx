import {
  Calendar,
  Users,
  DollarSign,
  LayoutDashboard,
  UserCog,
  MessageSquare,
  Globe,
  Settings,
  LogOut,
  Wallet,
  CreditCard,
  Headphones,
  Loader2 } from
"lucide-react";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Scissors } from "lucide-react";
import logoUpsalon from "@/assets/logo-upsalon.png";
import textUpsalon from "@/assets/text-upsalon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator } from
"@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const adminMainItems = [
{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
{ title: "Agenda", url: "/agenda", icon: Calendar },
{ title: "Clientes", url: "/clientes", icon: Users },
{ title: "Profissionais", url: "/profissionais", icon: UserCog },
{ title: "Serviços", url: "/servicos", icon: Scissors }];


const adminManagementItems = [
{ title: "Financeiro", url: "/financeiro", icon: DollarSign },
{ title: "Envios de Confirmação", url: "/whatsapp", icon: MessageSquare },
{ title: "Agendamento Online", url: "/agendamento-config", icon: Globe },
{ title: "Meu Salão", url: "/configuracoes", icon: Settings }];


const employeeItems = [
{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
{ title: "Minha Agenda", url: "/agenda", icon: Calendar },
{ title: "Meu Financeiro", url: "/meu-financeiro", icon: Wallet }];


export function AppSidebar() {
  const { signOut, profile, userRole } = useAuth();
  const isEmployee = userRole === "employee";
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Não foi possível abrir o portal de assinatura.");
      }
    } catch {
      toast.error("Erro ao acessar gerenciamento de assinatura.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src={logoUpsalon} alt="UpSalon" className="h-9 w-9 object-contain" />
          <img src={textUpsalon} alt="UpSalon" className="h-4 object-contain" />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {isEmployee ?
        <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {employeeItems.map((item) =>
              <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> :

        <>
            <SidebarGroup>
              <SidebarGroupLabel>Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMainItems.map((item) =>
                <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Gestão</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminManagementItems.map((item) =>
                <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        }
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {!isEmployee && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="text-muted-foreground hover:text-purple-accent">
                {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                <span>Gerenciar Assinatura</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <SidebarMenuButton className="text-muted-foreground hover:text-purple-accent">
                  <Headphones className="h-4 w-4" />
                  <span>Suporte</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-sans">Central de Suporte</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Precisa de ajuda? Entre em contato conosco:
                  </p>
                  <div className="space-y-3">
                    <a
                      href="mailto:contato.upsalon@gmail.com"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-purple-accent/50 hover:bg-purple-accent/5 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-purple-accent/10">
                        <MessageSquare className="h-4 w-4 text-purple-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium font-sans">E-mail</p>
                        <p className="text-xs text-muted-foreground">contato.upsalon@gmail.com</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/5517992018693"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-purple-accent/50 hover:bg-purple-accent/5 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-purple-accent/10">
                        <Globe className="h-4 w-4 text-purple-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium font-sans">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">Atendimento via WhatsApp</p>
                      </div>
                    </a>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>);

}