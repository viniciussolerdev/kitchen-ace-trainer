import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Scissors, Check, Calendar, User, CreditCard,
  Banknote, Smartphone, Wallet,
} from "lucide-react";
import { format, addDays, startOfDay, endOfDay, addMinutes, isBefore } from "date-fns";
import { formatPhone, normalizePhone, isValidPhone } from "@/lib/phone";
import { ptBR } from "date-fns/locale";

const PAYMENT_METHODS = [
  { id: "cash", label: "Dinheiro", icon: Banknote, description: "Pague no local" },
  { id: "credit_card", label: "Cartão de Crédito", icon: CreditCard, description: "Pague com cartão no local" },
  { id: "debit_card", label: "Cartão de Débito", icon: CreditCard, description: "Pague com débito no local" },
  { id: "pix", label: "Pix", icon: Smartphone, description: "Transferência instantânea" },
  { id: "other", label: "Outro", icon: Wallet, description: "Combinado com o salão" },
];

interface BusinessHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

const PublicBooking = () => {
  const { slug } = useParams();
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [advanceDays, setAdvanceDays] = useState(30);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingClientName, setExistingClientName] = useState<string | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  useEffect(() => {
    if (slug) fetchSalon();
  }, [slug]);

  const fetchSalon = async () => {
    const { data: salonData } = await supabase
      .from("salons")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!salonData) {
      setLoading(false);
      return;
    }

    setSalon(salonData);

    const [servicesRes, profRes, settingsRes, hoursRes] = await Promise.all([
      supabase.from("services").select("*").eq("salon_id", salonData.id).eq("is_active", true).order("name"),
      supabase.from("professionals").select("*").eq("salon_id", salonData.id).eq("is_active", true).order("name"),
      supabase.from("public_booking_settings").select("*").eq("salon_id", salonData.id).maybeSingle(),
      supabase.from("business_hours").select("*").eq("salon_id", salonData.id).order("day_of_week"),
    ]);

    if (!settingsRes.data?.is_enabled) {
      setSalon(null);
      setLoading(false);
      return;
    }

    setAdvanceDays(settingsRes.data?.advance_days || 30);
    setServices(servicesRes.data || []);
    setProfessionals(profRes.data || []);
    setBusinessHours(hoursRes.data || []);
    setLoading(false);
  };

  const fetchAppointments = async (date: string) => {
    if (!salon) return;
    // Use T12:00:00 to avoid UTC midnight date-shift issues
    const dayRef = new Date(date + "T12:00:00");
    const start = startOfDay(dayRef).toISOString();
    const end = endOfDay(dayRef).toISOString();

    const { data } = await supabase
      .from("appointments")
      .select("start_time, end_time, professional_id")
      .eq("salon_id", salon.id)
      .gte("start_time", start)
      .lte("start_time", end)
      .neq("status", "cancelled")
      .neq("status", "no_show");

    setAppointments(data || []);
  };

  useEffect(() => {
    if (selectedDate && salon) fetchAppointments(selectedDate);
  }, [selectedDate, selectedProfessional]);

  const getBusinessHourForDate = (dateStr: string): BusinessHour | undefined => {
    const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
    return businessHours.find((h) => h.day_of_week === dayOfWeek);
  };

  const getAvailableSlots = () => {
    if (!selectedService || !selectedDate) return [];

    const bh = getBusinessHourForDate(selectedDate);
    if (!bh || !bh.is_open) return [];

    const [openH, openM] = bh.open_time.split(":").map(Number);
    const closeParts = bh.close_time.split(":").map(Number);
    const closeTotal = closeParts[0] * 60 + closeParts[1]; // total minutes from midnight

    const duration = selectedService.duration_minutes;
    const slots: string[] = [];
    const now = new Date();

    const openTotal = openH * 60 + openM;

    for (let t = openTotal; t < closeTotal; t += 30) {
      const hour = Math.floor(t / 60);
      const min = t % 60;

      // Slot must end within closing time
      if (t + duration > closeTotal) continue;

      const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      const slotStart = new Date(`${selectedDate}T${timeStr}:00`);
      const slotEnd = addMinutes(slotStart, duration);

      // Skip past slots for today
      if (isBefore(slotStart, now)) continue;

      // When a specific professional is selected, check only their appointments
      if (selectedProfessional) {
        const hasConflict = appointments.some((apt) => {
          if (apt.professional_id !== selectedProfessional.id) return false;
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return slotStart < aptEnd && slotEnd > aptStart;
        });
        if (hasConflict) continue;
      } else {
        // When "any professional", check if at least one professional is free
        const allBusy = professionals.every((pro) => {
          return appointments.some((apt) => {
            if (apt.professional_id !== pro.id) return false;
            const aptStart = new Date(apt.start_time);
            const aptEnd = new Date(apt.end_time);
            return slotStart < aptEnd && slotEnd > aptStart;
          });
        });
        if (allBusy && professionals.length > 0) continue;
      }

      slots.push(timeStr);
    }
    return slots;
  };

  const checkExistingClientTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const checkExistingClient = (phone: string) => {
    clearTimeout(checkExistingClientTimeoutRef.current);
    const clean = normalizePhone(phone);
    if (!salon || clean.length < 10) {
      setExistingClientName(null);
      return;
    }
    checkExistingClientTimeoutRef.current = setTimeout(async () => {
      setCheckingPhone(true);
      const { data } = await supabase
        .from("clients")
        .select("name")
        .eq("salon_id", salon.id)
        .eq("phone", clean)
        .maybeSingle();
      setExistingClientName(data?.name || null);
      if (data?.name) setClientName(data.name);
      setCheckingPhone(false);
    }, 500);
  };

  const isFullName = (name: string) => name.trim().split(/\s+/).length >= 2;

  const handleSubmit = async () => {
    const cleanPhone = normalizePhone(clientPhone);
    if (!salon || !selectedService || !selectedTime || !clientName || !cleanPhone) return;

    if (!isValidPhone(cleanPhone)) {
      toast.error("Telefone inválido. Use DDD + número (10 ou 11 dígitos).");
      return;
    }

    setSubmitting(true);

    // Check if client with this phone already exists for this salon
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("salon_id", salon.id)
      .eq("phone", cleanPhone)
      .maybeSingle();

    let clientId: string;

    if (existingClient) {
      clientId = existingClient.id;
      // Update email if provided and client exists
      if (clientEmail.trim()) {
        await supabase.from("clients").update({ email: clientEmail.trim() }).eq("id", existingClient.id);
      }
    } else {
      clientId = crypto.randomUUID();
      const insertData: any = { id: clientId, salon_id: salon.id, name: clientName, phone: cleanPhone };
      if (clientEmail.trim()) insertData.email = clientEmail.trim();
      const { error: clientError } = await supabase
        .from("clients")
        .insert(insertData);

      if (clientError) {
        toast.error("Erro ao registrar dados");
        setSubmitting(false);
        return;
      }
    }

    let proId = selectedProfessional?.id;
    if (!proId) {
      // Find a professional who is actually free for this slot
      const slotStart = new Date(`${selectedDate}T${selectedTime}:00`);
      const slotEnd = addMinutes(slotStart, selectedService.duration_minutes);
      const freePro = professionals.find((pro) => {
        return !appointments.some((apt) => {
          if (apt.professional_id !== pro.id) return false;
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return slotStart < aptEnd && slotEnd > aptStart;
        });
      });
      proId = freePro?.id || professionals[0]?.id;
    }
    if (!proId) {
      toast.error("Nenhum profissional disponível");
      setSubmitting(false);
      return;
    }

    const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const endTime = addMinutes(startTime, selectedService.duration_minutes);

    const { error } = await supabase.from("appointments").insert({
      salon_id: salon.id,
      client_id: clientId,
      professional_id: proId,
      service_id: selectedService.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "scheduled" as any,
      booking_source: "online" as any,
      notes: selectedPayment ? `Pagamento: ${PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label}` : null,
    });

    if (error) {
      toast.error("Erro ao agendar: " + error.message);
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Scissors className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Salão não encontrado</h2>
            <p className="text-muted-foreground">Este link de agendamento não está disponível.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    const paymentLabel = PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Agendamento Confirmado!</h2>
            <p className="text-muted-foreground">Seu horário foi agendado com sucesso!</p>
            <div className="mt-4 p-4 rounded-lg bg-muted/50 text-left text-sm space-y-1">
              <p><strong>Serviço:</strong> {selectedService?.name}</p>
              <p><strong>Data:</strong> {selectedDate && format(new Date(selectedDate + "T12:00:00"), "dd/MM/yyyy")}</p>
              <p><strong>Horário:</strong> {selectedTime}</p>
              <p><strong>Profissional:</strong> {selectedProfessional?.name || "A definir"}</p>
              {paymentLabel && <p><strong>Pagamento:</strong> {paymentLabel}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate dates filtering by open days
  const dates: string[] = [];
  for (let i = 0; i <= advanceDays && dates.length < 60; i++) {
    const d = addDays(new Date(), i);
    const dateStr = format(d, "yyyy-MM-dd");
    const bh = getBusinessHourForDate(dateStr);
    if (bh?.is_open !== false) {
      dates.push(dateStr);
    }
  }

  const availableSlots = getAvailableSlots();
  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
            <Scissors className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{salon.name}</h1>
          <p className="text-muted-foreground text-sm">Agende seu horário online</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${s <= step ? "w-8 bg-primary" : "w-2 bg-muted"}`}
            />
          ))}
        </div>

        {/* Step 1 – Serviço */}
        {step === 1 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" /> Escolha o Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep(2); }}
                  className={`w-full text-left p-4 rounded-lg border transition-all hover:border-primary/50 ${
                    selectedService?.id === service.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.duration_minutes} minutos</p>
                    </div>
                    <p className="font-bold text-primary font-sans">R$ {Number(service.price).toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 2 – Profissional */}
        {step === 2 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Escolha o Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => { setSelectedProfessional(null); setStep(3); }}
                className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50"
              >
                <p className="font-medium">Qualquer disponível</p>
                <p className="text-sm text-muted-foreground">O sistema escolherá o melhor horário</p>
              </button>
              {professionals.map((pro) => (
                <button
                  key={pro.id}
                  onClick={() => { setSelectedProfessional(pro); setStep(3); }}
                  className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50"
                >
                  <p className="font-medium">{pro.name}</p>
                </button>
              ))}
              <Button variant="ghost" onClick={() => setStep(1)} className="w-full mt-2">Voltar</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3 – Data e Horário */}
        {step === 3 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Data e Horário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {dates.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`p-2 rounded-lg border text-center text-sm transition-all ${
                        selectedDate === d ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(d + "T12:00:00"), "EEE", { locale: ptBR })}
                      </p>
                      <p>{format(new Date(d + "T12:00:00"), "dd/MM")}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="space-y-2">
                  <Label>Horário</Label>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum horário disponível neste dia</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => { setSelectedTime(time); setStep(4); }}
                          className={`p-2 rounded-lg border text-sm text-center transition-all ${
                            selectedTime === time ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button variant="ghost" onClick={() => setStep(2)} className="w-full">Voltar</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4 – Método de Pagamento */}
        {step === 4 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Método de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">Escolha como prefere pagar no dia do atendimento</p>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => { setSelectedPayment(method.id); setStep(5); }}
                    className={`w-full text-left p-4 rounded-lg border transition-all hover:border-primary/50 ${
                      selectedPayment === method.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              <Button variant="ghost" onClick={() => setStep(3)} className="w-full mt-2">Voltar</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5 – Seus Dados */}
        {step === 5 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-1">
                <p><strong>Serviço:</strong> {selectedService?.name}</p>
                <p><strong>Profissional:</strong> {selectedProfessional?.name || "Qualquer disponível"}</p>
                <p><strong>Data:</strong> {selectedDate && format(new Date(selectedDate + "T12:00:00"), "dd/MM/yyyy")}</p>
                <p><strong>Horário:</strong> {selectedTime}</p>
                <p><strong>Valor:</strong> R$ {Number(selectedService?.price).toFixed(2)}</p>
                <p><strong>Pagamento:</strong> {PAYMENT_METHODS.find(p => p.id === selectedPayment)?.label}</p>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={clientPhone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setClientPhone(formatted);
                    checkExistingClient(formatted);
                  }}
                  placeholder="(11) 99999-9999"
                  required
                  maxLength={16}
                />
                {existingClientName && (
                  <p className="text-sm text-primary flex items-center gap-1">
                    <Check className="h-3 w-3" /> Número já cadastrado — {existingClientName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Seu Nome Completo</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  required
                  disabled={!!existingClientName}
                />
                {clientName && !isFullName(clientName) && !existingClientName && (
                  <p className="text-sm text-destructive">Digite seu nome completo (nome e sobrenome)</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>E-mail <span className="text-muted-foreground text-xs">(para receber confirmação)</span></Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={submitting || !clientName || !clientPhone || (!existingClientName && !isFullName(clientName))}
              >
                {submitting ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
              <Button variant="ghost" onClick={() => setStep(4)} className="w-full">Voltar</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
