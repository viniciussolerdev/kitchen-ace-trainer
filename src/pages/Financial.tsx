import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, CreditCard, Receipt, Users } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfessionalCommission {
  id: string;
  name: string;
  commission_rate: number;
  day: number;
  week: number;
  month: number;
}

const Financial = () => {
  const { salonId } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ day: 0, week: 0, month: 0, avgTicket: 0 });
  const [proCommissions, setProCommissions] = useState<ProfessionalCommission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salonId) fetchData();
  }, [salonId]);

  const fetchData = async () => {
    if (!salonId) return;
    const now = new Date();

    const [txRes, proRes, commRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*, appointments(clients(name), services(name))")
        .eq("salon_id", salonId)
        .gte("transaction_date", startOfMonth(now).toISOString())
        .order("transaction_date", { ascending: false }),
      supabase
        .from("professionals")
        .select("id, name, commission_rate")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("commissions")
        .select("*, professionals(name)")
        .eq("salon_id", salonId),
    ]);

    const txs = txRes.data || [];
    setTransactions(txs);

    const dayTotal = txs
      .filter((t) => new Date(t.transaction_date) >= startOfDay(now) && new Date(t.transaction_date) <= endOfDay(now))
      .reduce((s, t) => s + Number(t.amount), 0);

    const weekTotal = txs
      .filter((t) => new Date(t.transaction_date) >= startOfWeek(now, { weekStartsOn: 1 }) && new Date(t.transaction_date) <= endOfWeek(now, { weekStartsOn: 1 }))
      .reduce((s, t) => s + Number(t.amount), 0);

    const monthTotal = txs
      .filter((t) => new Date(t.transaction_date) >= startOfMonth(now) && new Date(t.transaction_date) <= endOfMonth(now))
      .reduce((s, t) => s + Number(t.amount), 0);

    const monthCount = txs.filter(
      (t) => new Date(t.transaction_date) >= startOfMonth(now) && new Date(t.transaction_date) <= endOfMonth(now)
    ).length;

    setStats({
      day: dayTotal,
      week: weekTotal,
      month: monthTotal,
      avgTicket: monthCount > 0 ? monthTotal / monthCount : 0,
    });

    // Calculate commission per professional based on completed appointments
    const professionals = proRes.data || [];
    const commissions = commRes.data || [];

    // Also calculate from transactions linked to appointments with professionals
    const { data: completedApts } = await supabase
      .from("appointments")
      .select("id, professional_id, services(price)")
      .eq("salon_id", salonId)
      .eq("status", "completed");

    const apts = completedApts || [];

    // Get transaction dates for each appointment
    const aptTxMap = new Map<string, Date>();
    txs.forEach((tx) => {
      if (tx.appointment_id) {
        aptTxMap.set(tx.appointment_id, new Date(tx.transaction_date));
      }
    });

    const proComm: ProfessionalCommission[] = professionals.map((pro) => {
      const proApts = apts.filter((a) => a.professional_id === pro.id);
      const rate = Number(pro.commission_rate) / 100;

      let dayComm = 0, weekComm = 0, monthComm = 0;

      proApts.forEach((apt) => {
        const price = Number(apt.services?.price || 0);
        const comm = price * rate;
        // Use transaction date if available, otherwise check commissions table
        const txDate = aptTxMap.get(apt.id);
        const commRecord = commissions.find((c) => c.appointment_id === apt.id);
        const date = txDate || (commRecord ? new Date(commRecord.created_at) : null);

        if (!date) return;

        if (date >= startOfDay(now) && date <= endOfDay(now)) dayComm += comm;
        if (date >= startOfWeek(now, { weekStartsOn: 1 }) && date <= endOfWeek(now, { weekStartsOn: 1 })) weekComm += comm;
        if (date >= startOfMonth(now) && date <= endOfMonth(now)) monthComm += comm;
      });

      return {
        id: pro.id,
        name: pro.name,
        commission_rate: Number(pro.commission_rate),
        day: dayComm,
        week: weekComm,
        month: monthComm,
      };
    });

    setProCommissions(proComm);
    setLoading(false);
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: "Dinheiro",
    credit_card: "Crédito",
    debit_card: "Débito",
    pix: "PIX",
    other: "Outro",
  };

  const statCards = [
    { title: "Hoje", value: stats.day, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { title: "Semana", value: stats.week, icon: TrendingUp, color: "text-info", bg: "bg-info/10" },
    { title: "Mês", value: stats.month, icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
    { title: "Ticket Médio", value: stats.avgTicket, icon: Receipt, color: "text-warning", bg: "bg-warning/10" },
  ];

  if (loading) return <div className="animate-pulse text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Financeiro</h1>
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
                  <p className="text-2xl font-bold mt-1 font-sans">R$ {card.value.toFixed(2)}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto no-scrollbar">
              <Table className="min-w-[480px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden sm:table-cell">Serviço</TableHead>
                    <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhuma transação registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.slice(0, 20).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs sm:text-sm">
                          {format(new Date(tx.transaction_date), "dd/MM HH:mm")}
                        </TableCell>
                        <TableCell>{tx.appointments?.clients?.name || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{tx.appointments?.services?.name || tx.description || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{paymentMethodLabels[tx.payment_method] || tx.payment_method}</TableCell>
                        <TableCell className="text-right font-sans font-medium">
                          R$ {Number(tx.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Comissões por Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto no-scrollbar">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Taxa</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Hoje</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Semana</TableHead>
                    <TableHead className="text-right">Mês</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proCommissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhum profissional cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    proCommissions.map((pro) => (
                      <TableRow key={pro.id}>
                        <TableCell className="font-medium">{pro.name}</TableCell>
                        <TableCell className="text-center font-sans hidden sm:table-cell">{pro.commission_rate.toFixed(1)}%</TableCell>
                        <TableCell className="text-right font-sans hidden sm:table-cell">R$ {pro.day.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-sans hidden sm:table-cell">R$ {pro.week.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-sans font-medium">R$ {pro.month.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {proCommissions.length > 0 && (
                    <TableRow className="bg-muted/30 font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell className="hidden sm:table-cell" />
                      <TableCell className="text-right font-sans hidden sm:table-cell">
                        R$ {proCommissions.reduce((s, p) => s + p.day, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-sans hidden sm:table-cell">
                        R$ {proCommissions.reduce((s, p) => s + p.week, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-sans">
                        R$ {proCommissions.reduce((s, p) => s + p.month, 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
