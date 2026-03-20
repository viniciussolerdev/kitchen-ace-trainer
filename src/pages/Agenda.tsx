import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, startOfDay, endOfDay, addMinutes, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

const statusColors: Record<string, string> = {
  scheduled: "bg-info/20 border-info/40 text-info",
  confirmed: "bg-success/20 border-success/40 text-success",
  completed: "bg-primary/20 border-primary/40 text-primary",
  cancelled: "bg-destructive/20 border-destructive/40 text-destructive",
  no_show: "bg-warning/20 border-warning/40 text-warning",
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

const Agenda = () => {
  const { salonId, userRole, professionalId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formClientId, setFormClientId] = useState("");
  const [formProfessionalId, setFormProfessionalId] = useState(
    userRole === "employee" && professionalId ? professionalId : ""
  );
  const [formServiceId, setFormServiceId] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formTime, setFormTime] = useState("09:00");
  const [formStatus, setFormStatus] = useState("scheduled");

  useEffect(() => {
    if (!salonId) return;
    fetchData();
  }, [salonId, currentDate, view]);

  const fetchData = async () => {
    if (!salonId) return;

    const start = view === "day" ? startOfDay(currentDate) : startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = view === "day" ? endOfDay(currentDate) : endOfWeek(currentDate, { weekStartsOn: 1 });

    let aptsQuery = supabase
      .from("appointments")
      .select("*, clients(name, phone), services(name, price, duration_minutes), professionals(name)")
      .eq("salon_id", salonId)
      .gte("start_time", start.toISOString())
      .lte("start_time", end.toISOString())
      .order("start_time");

    // Employees only see their own appointments
    if (userRole === "employee" && professionalId) {
      aptsQuery = aptsQuery.eq("professional_id", professionalId);
    }

    const [aptsRes, clientsRes, profRes, servRes] = await Promise.all([
      aptsQuery,
      supabase.from("clients").select("*").eq("salon_id", salonId).order("name"),
      supabase.from("professionals").select("*").eq("salon_id", salonId).eq("is_active", true).order("name"),
      supabase.from("services").select("*").eq("salon_id", salonId).eq("is_active", true).order("name"),
    ]);

    setAppointments(aptsRes.data || []);
    setClients(clientsRes.data || []);
    setProfessionals(profRes.data || []);
    setServices(servRes.data || []);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) return;
    setLoading(true);

    const service = services.find((s) => s.id === formServiceId);
    const startTime = new Date(`${formDate}T${formTime}:00`);
    const endTime = addMinutes(startTime, service?.duration_minutes || 30);

    const { error } = await supabase.from("appointments").insert({
      salon_id: salonId,
      client_id: formClientId,
      professional_id: formProfessionalId,
      service_id: formServiceId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: formStatus as any,
      booking_source: "internal" as any,
    });

    if (error) {
      toast.error("Erro ao criar agendamento: " + error.message);
    } else {
      toast.success("Agendamento criado!");
      setDialogOpen(false);
      fetchData();
    }
    setLoading(false);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus as any })
      .eq("id", appointmentId);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado!");
      fetchData();
    }
  };

  const navigateDate = (direction: number) => {
    setCurrentDate((prev) => addDays(prev, direction * (view === "week" ? 7 : 1)));
  };

  const weekDays = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i))
    : [currentDate];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button variant={view === "day" ? "default" : "ghost"} size="sm" onClick={() => setView("day")}>
              Dia
            </Button>
            <Button variant={view === "week" ? "default" : "ghost"} size="sm" onClick={() => setView("week")}>
              Semana
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto">
                <Plus className="h-4 w-4 mr-1" /> Agendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={formClientId} onValueChange={setFormClientId} required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select value={formServiceId} onValueChange={setFormServiceId} required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} - R$ {Number(s.price).toFixed(2)} ({s.duration_minutes}min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Profissional</Label>
                  <Select
                    value={formProfessionalId}
                    onValueChange={setFormProfessionalId}
                    required
                    disabled={userRole === "employee" && !!professionalId}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {professionals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando..." : "Criar Agendamento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto no-scrollbar">
            <div className={view === "week" ? "min-w-[600px]" : ""}>
              {/* Header */}
              <div className="grid border-b border-border" style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
                <div className="p-2 text-xs text-muted-foreground border-r border-border" />
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-3 text-center border-r border-border last:border-r-0 ${
                      isSameDay(day, new Date()) ? "bg-primary/5" : ""
                    }`}
                  >
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(day, "EEE", { locale: ptBR })}
                    </p>
                    <p className={`text-lg font-bold font-sans ${
                      isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                    }`}>
                      {format(day, "dd")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}
                >
                  <div className="p-2 text-xs text-muted-foreground border-r border-border text-right pr-3">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  {weekDays.map((day) => {
                    const dayAppts = appointments.filter((a) => {
                      const aptDate = new Date(a.start_time);
                      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
                    });

                    return (
                      <div
                        key={day.toISOString() + hour}
                        className="min-h-[60px] p-1 border-r border-border last:border-r-0 relative"
                      >
                        {dayAppts.map((apt) => (
                          <div
                            key={apt.id}
                            className={`text-xs p-1.5 rounded border mb-1 cursor-pointer ${
                              statusColors[apt.status] || "bg-muted"
                            }`}
                          >
                            <p className="font-medium font-sans truncate">{apt.clients?.name}</p>
                            <p className="truncate opacity-80">{apt.services?.name}</p>
                            <p className="opacity-70">
                              {format(new Date(apt.start_time), "HH:mm")} - {format(new Date(apt.end_time), "HH:mm")}
                            </p>
                            <Select
                              value={apt.status}
                              onValueChange={(value) => handleStatusChange(apt.id, value)}
                            >
                              <SelectTrigger className="h-5 text-[10px] mt-1 border-0 bg-transparent p-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(statusLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;
