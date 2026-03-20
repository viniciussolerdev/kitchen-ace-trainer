import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, CreditCard, Percent } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const MyFinancial = () => {
  const { salonId, professionalId } = useAuth();
  const [commissionRate, setCommissionRate] = useState(0);
  const [stats, setStats] = useState({ day: 0, week: 0, month: 0 });
  const [recentApts, setRecentApts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salonId && professionalId) fetchData();
  }, [salonId, professionalId]);

  const fetchData = async () => {
    if (!salonId || !professionalId) return;
    const now = new Date();

    const [proRes, aptsRes] = await Promise.all([
      supabase
        .from("professionals")
        .select("commission_rate")
        .eq("id", professionalId)
        .single(),
      supabase
        .from("appointments")
        .select("id, start_time, status, services(name, price), clients(name)")
        .eq("salon_id", salonId)
        .eq("professional_id", professionalId)
        .eq("status", "completed")
        .order("start_time", { ascending: false }),
    ]);

    const rate = Number(proRes.data?.commission_rate || 0) / 100;
    setCommissionRate(Number(proRes.data?.commission_rate || 0));

    const apts = aptsRes.data || [];
    setRecentApts(apts.slice(0, 20));

    let dayComm = 0, weekComm = 0, monthComm = 0;
    apts.forEach((apt) => {
      const price = Number(apt.services?.price || 0);
      const comm = price * rate;
      const date = new Date(apt.start_time);

      if (date >= startOfDay(now) && date <= endOfDay(now)) dayComm += comm;
      if (date >= startOfWeek(now, { weekStartsOn: 1 }) && date <= endOfWeek(now, { weekStartsOn: 1 })) weekComm += comm;
      if (date >= startOfMonth(now) && date <= endOfMonth(now)) monthComm += comm;
    });

    setStats({ day: dayComm, week: weekComm, month: monthComm });
    setLoading(false);
  };

  const statCards = [
    { title: "Hoje", value: stats.day, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { title: "Semana", value: stats.week, icon: TrendingUp, color: "text-info", bg: "bg-info/10" },
    { title: "Mês", value: stats.month, icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
    { title: "Comissão", value: commissionRate, icon: Percent, color: "text-warning", bg: "bg-warning/10", suffix: "%" },
  ];

  if (loading) return <div className="animate-pulse text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Financeiro</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "MMMM yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1 font-sans">
                    {card.suffix ? `${card.value.toFixed(1)}${card.suffix}` : `R$ ${card.value.toFixed(2)}`}
                  </p>
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
          <CardTitle className="text-lg">Atendimentos Concluídos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="text-right">Valor Serviço</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum atendimento concluído
                  </TableCell>
                </TableRow>
              ) : (
                recentApts.map((apt) => {
                  const price = Number(apt.services?.price || 0);
                  const comm = price * (commissionRate / 100);
                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="text-sm">
                        {format(new Date(apt.start_time), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{apt.clients?.name || "—"}</TableCell>
                      <TableCell>{apt.services?.name || "—"}</TableCell>
                      <TableCell className="text-right font-sans">R$ {price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-sans font-medium text-success">
                        R$ {comm.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyFinancial;
