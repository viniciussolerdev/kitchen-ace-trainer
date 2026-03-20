import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Send, Check, Mail, Copy, ExternalLink } from "lucide-react";
import { format, addHours } from "date-fns";

const WhatsApp = () => {
  const { salonId } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  useEffect(() => {
    if (salonId) fetchData();
  }, [salonId]);

  const fetchData = async () => {
    if (!salonId) return;

    const now = new Date();
    const tomorrow = addHours(now, 24);

    const [aptsRes, notifRes, salonRes] = await Promise.all([
      supabase
        .from("appointments")
        .select("*, clients(name, phone, email), services(name), professionals(name)")
        .eq("salon_id", salonId)
        .gte("start_time", now.toISOString())
        .lte("start_time", tomorrow.toISOString())
        .in("status", ["scheduled"])
        .order("start_time"),
      supabase
        .from("whatsapp_notifications")
        .select("*, appointments(start_time, clients(name))")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("salons").select("*").eq("id", salonId).single(),
    ]);

    setAppointments(aptsRes.data || []);
    setNotifications(notifRes.data || []);
    setSalon(salonRes.data);
    setLoading(false);
  };

  const buildWhatsAppUrl = (appointment: any): string | null => {
    if (!appointment.clients?.phone) return null;
    const phone = appointment.clients.phone.replace(/\D/g, "");
    const salonName = salon?.name || "nosso salão";
    const time = format(new Date(appointment.start_time), "HH:mm");
    const date = format(new Date(appointment.start_time), "dd/MM");
    const baseUrl = window.location.origin;
    const token = appointment.confirmation_token;
    
    let confirmLinks = "";
    if (token) {
      confirmLinks = `\n\n✅ Confirmar presença:\n${baseUrl}/confirmar/${token}\n\n❌ Cancelar agendamento:\n${baseUrl}/cancelar/${token}`;
    }
    
    const message = encodeURIComponent(
      `Olá, ${appointment.clients.name}! 😊\n\nVocê tem horário agendado para *${date}* às *${time}* no *${salonName}*.\n\nServiço: ${appointment.services?.name}\nProfissional: ${appointment.professionals?.name}${confirmLinks}`
    );
    return `https://wa.me/55${phone}?text=${message}`;
  };

  const sendReminder = async (appointment: any) => {
    if (!appointment.clients?.phone) {
      toast.error("Cliente sem número de telefone!");
      return;
    }

    const url = buildWhatsAppUrl(appointment);
    if (!url) return;

    // Show dialog with link (works inside iframes where wa.me is blocked)
    setWhatsappLink(url);
    setWhatsappDialogOpen(true);

    await supabase.from("whatsapp_notifications").insert({
      salon_id: salonId!,
      appointment_id: appointment.id,
      sent_at: new Date().toISOString(),
      status: "sent" as any,
    });

    fetchData();
  };

  const markConfirmed = async (appointmentId: string) => {
    await supabase
      .from("appointments")
      .update({ status: "confirmed" as any })
      .eq("id", appointmentId);

    toast.success("Agendamento confirmado!");
    fetchData();
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    sent: "Enviado",
    confirmed: "Confirmado",
    failed: "Falhou",
  };

  // Email reminder status based on appointment fields
  const getEmailStatus = (apt: any) => {
    if (apt.confirmed_at) return "confirmed";
    if (apt.cancelled_at) return "cancelled";
    if (apt.reminder_3h_sent) return "3h_sent";
    if (apt.reminder_24h_sent) return "24h_sent";
    return "pending";
  };

  const emailStatusLabels: Record<string, string> = {
    pending: "Aguardando",
    "24h_sent": "Lembrete 24h enviado",
    "3h_sent": "Lembrete 3h enviado",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
  };

  if (loading) return <div className="animate-pulse text-muted-foreground">Carregando...</div>;

  // Get appointments with email for email history (recent ones)
  const appointmentsWithEmail = appointments.filter((apt) => apt.clients?.email);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Envios de Confirmação</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie lembretes por WhatsApp e e-mail</p>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> E-mail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-6 mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Agendamentos para Lembrar ({appointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Nenhum agendamento pendente nas próximas 24h
                </p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div>
                        <p className="font-medium">{apt.clients?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.services?.name} • {apt.professionals?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.start_time), "dd/MM 'às' HH:mm")}
                        </p>
                        {apt.clients?.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{apt.clients.phone}</p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => markConfirmed(apt.id)}>
                          <Check className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Confirmar</span>
                        </Button>
                        <Button size="sm" onClick={() => sendReminder(apt)}>
                          <MessageSquare className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Enviar</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Histórico WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Enviado em</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhuma notificação registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell>{notif.appointments?.clients?.name || "—"}</TableCell>
                        <TableCell>
                          {notif.appointments?.start_time
                            ? format(new Date(notif.appointments.start_time), "dd/MM HH:mm")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {notif.sent_at ? format(new Date(notif.sent_at), "dd/MM HH:mm") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={notif.status === "confirmed" ? "default" : "secondary"}>
                            {statusLabels[notif.status] || notif.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6 mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Lembretes por E-mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Lembretes são enviados automaticamente por e-mail 24h e 3h antes do horário para clientes com e-mail cadastrado.
              </p>

              {appointmentsWithEmail.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Nenhum agendamento com e-mail nas próximas 24h
                </p>
              ) : (
                <div className="space-y-3">
                  {appointmentsWithEmail.map((apt) => {
                    const status = getEmailStatus(apt);
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div>
                          <p className="font-medium">{apt.clients?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.services?.name} • {apt.professionals?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.start_time), "dd/MM 'às' HH:mm")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{apt.clients?.email}</p>
                        </div>
                        <Badge variant={status === "confirmed" ? "default" : status === "cancelled" ? "destructive" : "secondary"}>
                          {emailStatusLabels[status]}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Todos os Agendamentos com E-mail</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EmailHistoryTable salonId={salonId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Enviar via WhatsApp
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Clique no botão abaixo para abrir o WhatsApp com a mensagem pronta, ou copie o link.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={whatsappLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir no WhatsApp
            </a>
            <Button
              variant="outline"
              onClick={() => {
                if (whatsappLink) {
                  navigator.clipboard.writeText(whatsappLink);
                  toast.success("Link copiado!");
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Separate component for email history table to avoid bloating main component
const EmailHistoryTable = ({ salonId }: { salonId: string | null }) => {
  const [emailAppointments, setEmailAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salonId) fetchEmailHistory();
  }, [salonId]);

  const fetchEmailHistory = async () => {
    if (!salonId) return;
    const { data } = await supabase
      .from("appointments")
      .select("id, start_time, reminder_24h_sent, reminder_3h_sent, confirmed_at, cancelled_at, status, clients(name, email)")
      .eq("salon_id", salonId)
      .not("clients.email", "is", null)
      .order("start_time", { ascending: false })
      .limit(50);

    // Filter out appointments where client has no email (join filtering)
    setEmailAppointments((data || []).filter((a: any) => a.clients?.email));
    setLoading(false);
  };

  const getStatus = (apt: any) => {
    if (apt.confirmed_at) return { label: "Confirmado", variant: "default" as const };
    if (apt.cancelled_at) return { label: "Cancelado", variant: "destructive" as const };
    if (apt.reminder_3h_sent) return { label: "3h enviado", variant: "secondary" as const };
    if (apt.reminder_24h_sent) return { label: "24h enviado", variant: "secondary" as const };
    return { label: "Aguardando", variant: "outline" as const };
  };

  if (loading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead>Status E-mail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emailAppointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              Nenhum agendamento com e-mail encontrado
            </TableCell>
          </TableRow>
        ) : (
          emailAppointments.map((apt) => {
            const status = getStatus(apt);
            return (
              <TableRow key={apt.id}>
                <TableCell>{apt.clients?.name || "—"}</TableCell>
                <TableCell className="text-xs">{apt.clients?.email}</TableCell>
                <TableCell>{format(new Date(apt.start_time), "dd/MM HH:mm")}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default WhatsApp;
