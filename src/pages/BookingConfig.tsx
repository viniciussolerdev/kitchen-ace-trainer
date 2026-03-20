import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Copy, ExternalLink } from "lucide-react";

const BookingConfig = () => {
  const { salonId } = useAuth();
  const [salon, setSalon] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salonId) fetchData();
  }, [salonId]);

  const fetchData = async () => {
    if (!salonId) return;
    const [salonRes, settingsRes] = await Promise.all([
      supabase.from("salons").select("*").eq("id", salonId).single(),
      supabase.from("public_booking_settings").select("*").eq("salon_id", salonId).maybeSingle(),
    ]);

    setSalon(salonRes.data);
    setSettings(settingsRes.data);
    setLoading(false);
  };

  const toggleEnabled = async () => {
    if (!settings) return;
    const { error } = await supabase
      .from("public_booking_settings")
      .update({ is_enabled: !settings.is_enabled })
      .eq("id", settings.id);

    if (error) toast.error("Erro ao atualizar");
    else {
      toast.success(settings.is_enabled ? "Agendamento online desabilitado" : "Agendamento online habilitado!");
      setSettings({ ...settings, is_enabled: !settings.is_enabled });
    }
  };

  const bookingUrl = salon ? `${window.location.origin}/salao/${salon.slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success("Link copiado!");
  };

  if (loading) return <div className="animate-pulse text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agendamento Online</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure o autoagendamento para seus clientes</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Agendamento Online Ativo</p>
              <p className="text-sm text-muted-foreground">
                Permite que clientes agendem pelo link público
              </p>
            </div>
            <Switch checked={settings?.is_enabled || false} onCheckedChange={toggleEnabled} />
          </div>

          <div className="space-y-2">
            <Label>Link do seu Salão</Label>
            <div className="flex gap-2">
              <Input value={bookingUrl} readOnly className="bg-muted/50" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => window.open(bookingUrl, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfig;
