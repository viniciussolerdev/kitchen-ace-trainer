import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, DollarSign, Users, TrendingUp, Clock, Star, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { salonId, userRole, professionalId } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    todayRevenue: 0,
    totalClients: 0,
    monthRevenue: 0,
    pendingConfirmation: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId) return;

    const fetchStats = async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      if (userRole === "employee" && professionalId) {
        const [appointmentsRes, upcomingRes] = await Promise.all([
          supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .eq("salon_id", salonId)
            .eq("professional_id", professionalId)
            .gte("start_time", startOfToday)
            .lte("start_time", endOfToday),
          supabase
            .from("appointments")
            .select("*, clients(name), services(name, price), professionals(name)")
            .eq("salon_id", salonId)
            .eq("professional_id", professionalId)
            .eq("status", "confirmed")
            .gte("start_time", new Date().toISOString())
            .order("start_time", { ascending: true })
            .limit(5),
        ]);

        setStats({
          todayAppointments: appointmentsRes.count || 0,
          todayRevenue: 0,
          totalClients: 0,
          monthRevenue: 0,
          pendingConfirmation: 0,
          confirmed: 0,
          cancelled: 0,
        });
        setUpcomingAppointments(upcomingRes.data || []);
      } else {
        // Admin: full data
        const [appointmentsRes, clientsRes, transactionsRes, upcomingRes, monthTransRes, pendingRes, confirmedRes, cancelledRes] = await Promise.all([
          supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .eq("salon_id", salonId)
            .gte("start_time", startOfToday)
            .lte("start_time", endOfToday),
          supabase
            .from("clients")
            .select("id", { count: "exact" })
            .eq("salon_id", salonId),
          supabase
            .from("transactions")
            .select("amount")
            .eq("salon_id", salonId)
            .gte("transaction_date", startOfToday)
            .lte("transaction_date", endOfToday),
          supabase
            .from("appointments")
            .select("*, clients(name), services(name, price), professionals(name)")
            .eq("salon_id", salonId)
            .eq("status", "confirmed")
            .gte("start_time", new Date().toISOString())
            .order("start_time", { ascending: true })
            .limit(5),
          supabase
            .from("transactions")
            .select("amount")
            .eq("salon_id", salonId)
            .gte("transaction_date", startOfMonth),
          supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .eq("salon_id", salonId)
            .eq("status", "scheduled")
            .gte("start_time", new Date().toISOString()),
          supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .eq("salon_id", salonId)
            .eq("status", "confirmed")
            .gte("start_time", new Date().toISOString()),
          supabase
            .from("appointments")
            .select("id", { count: "exact" })
            .eq("salon_id", salonId)
            .eq("status", "cancelled")
            .gte("start_time", startOfToday)
            .lte("start_time", endOfToday),
        ]);

        const todayRevenue = (transactionsRes.data || []).reduce(
          (sum, t) => sum + Number(t.amount), 0
        );
        const monthRevenue = (monthTransRes.data || []).reduce(
          (sum, t) => sum + Number(t.amount), 0
        );

        setStats({
          todayAppointments: appointmentsRes.count || 0,
          todayRevenue,
          totalClients: clientsRes.count || 0,
          monthRevenue,
          pendingConfirmation: pendingRes.count || 0,
          confirmed: confirmedRes.count || 0,
          cancelled: cancelledRes.count || 0,
        });
        setUpcomingAppointments(upcomingRes.data || []);
      }

      setLoading(false);
    };

    fetchStats();
  }, [salonId, userRole, professionalId]);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Carregando dashboard...</div>;
  }

  const isEmployee = userRole === "employee";

  const statCards = isEmployee
    ? [
        {
          title: "Meus Atendimentos Hoje",
          value: stats.todayAppointments,
          icon: Calendar,
          color: "text-info",
          bg: "bg-info/10",
        },
      ]
    : [
        {
          title: "Atendimentos Hoje",
          value: stats.todayAppointments,
          icon: Calendar,
          color: "text-info",
          bg: "bg-info/10",
        },
        {
          title: "Faturamento Hoje",
          value: `R$ ${stats.todayRevenue.toFixed(2)}`,
          icon: DollarSign,
          color: "text-success",
          bg: "bg-success/10",
        },
        {
          title: "Total de Clientes",
          value: stats.totalClients,
          icon: Users,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          title: "Faturamento Mensal",
          value: `R$ ${stats.monthRevenue.toFixed(2)}`,
          icon: TrendingUp,
          color: "text-warning",
          bg: "bg-warning/10",
        },
        {
          title: "Aguardando Confirmação",
          value: stats.pendingConfirmation,
          icon: AlertCircle,
          color: "text-warning",
          bg: "bg-warning/10",
        },
        {
          title: "Confirmados",
          value: stats.confirmed,
          icon: CheckCircle,
          color: "text-success",
          bg: "bg-success/10",
        },
        {
          title: "Cancelados Hoje",
          value: stats.cancelled,
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${isEmployee ? '' : 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'} gap-4`}>
        {statCards.map((card) => (
          <Card key={card.title} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1 font-sans">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Próximos Atendimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum atendimento agendado.</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm font-sans">{apt.clients?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.services?.name} • {apt.professionals?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium font-sans">
                      {format(new Date(apt.start_time), "HH:mm")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(apt.start_time), "dd/MM")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
