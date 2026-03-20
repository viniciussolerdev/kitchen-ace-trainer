import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Building2, Phone, MapPin, Globe, Save, Loader2, Clock } from "lucide-react";

interface SalonData {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
}

interface BusinessHour {
  id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function SalonSettings() {
  const { salonId } = useAuth();
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);

  useEffect(() => {
    if (!salonId) return;
    const fetchData = async () => {
      const [salonRes, hoursRes] = await Promise.all([
        supabase.from("salons").select("*").eq("id", salonId).single(),
        supabase.from("business_hours").select("*").eq("salon_id", salonId).order("day_of_week"),
      ]);

      if (salonRes.error) {
        toast.error("Erro ao carregar dados do salão");
        return;
      }
      setSalon(salonRes.data);
      setName(salonRes.data.name || "");
      setPhone(salonRes.data.phone || "");
      setAddress(salonRes.data.address || "");
      setBusinessHours(hoursRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [salonId]);

  const handleSave = async () => {
    if (!salonId || !name.trim()) {
      toast.error("O nome do salão é obrigatório");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("salons")
      .update({
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
      })
      .eq("id", salonId);

    setSaving(false);
    if (error) toast.error("Erro ao salvar alterações");
    else toast.success("Dados do salão atualizados!");
  };

  const updateHour = (index: number, field: keyof BusinessHour, value: any) => {
    setBusinessHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    const results = await Promise.all(
      businessHours.map((h) =>
        supabase
          .from("business_hours")
          .update({ is_open: h.is_open, open_time: h.open_time, close_time: h.close_time })
          .eq("id", h.id)
      )
    );
    const hasError = results.some((r) => r.error);
    setSavingHours(false);
    if (hasError) toast.error("Erro ao salvar alguns horários");
    else toast.success("Horários de funcionamento atualizados!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Configurações do Salão</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie as informações do seu estabelecimento</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-sans">
            <Building2 className="h-5 w-5 text-primary" />
            Informações Gerais
          </CardTitle>
          <CardDescription>Dados básicos do seu salão visíveis para clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Salão</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Studio Beauty" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Telefone
            </Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Endereço
            </Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" rows={2} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Link de Agendamento
            </Label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {window.location.origin}/salao/{salon?.slug}
            </div>
            <p className="text-xs text-muted-foreground">Compartilhe este link para seus clientes agendarem online</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-sans">
            <Clock className="h-5 w-5 text-primary" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription>Defina os horários de atendimento do salão para cada dia da semana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {businessHours.map((h, i) => (
            <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
              <div className="w-24 font-medium text-sm">{DAY_NAMES[h.day_of_week]}</div>
              <Switch checked={h.is_open} onCheckedChange={(val) => updateHour(i, "is_open", val)} />
              {h.is_open ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={h.open_time}
                    onChange={(e) => updateHour(i, "open_time", e.target.value)}
                    className="w-28"
                  />
                  <span className="text-muted-foreground text-sm">às</span>
                  <Input
                    type="time"
                    value={h.close_time}
                    onChange={(e) => updateHour(i, "close_time", e.target.value)}
                    className="w-28"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Fechado</span>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveHours} disabled={savingHours}>
              {savingHours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Horários
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
