import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, CalendarDays, Clock, Scissors as ScissorsIcon, Building2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logoUpsalon from "@/assets/logo-upsalon.png";
import textUpsalon from "@/assets/text-upsalon.png";

type ConfirmationAction = "confirm" | "cancel";

interface AppointmentInfo {
  clients?: { name: string };
  services?: { name: string };
  professionals?: { name: string };
  salons?: { name: string };
  start_time?: string;
}

const AppointmentConfirmation = ({ action }: { action: ConfirmationAction }) => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token inválido");
      setLoading(false);
      return;
    }

    const processAction = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("confirm-appointment", {
          body: { token, action },
        });

        if (fnError) throw fnError;

        if (data?.success) {
          setSuccess(true);
          setMessage(data.message);
          setAppointment(data.appointment);
        } else {
          setError(data?.error || "Erro ao processar solicitação");
          if (data?.appointment) setAppointment(data.appointment);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao conectar com o servidor");
      } finally {
        setLoading(false);
      }
    };

    processAction();
  }, [token, action]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const isConfirm = action === "confirm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <img src={logoUpsalon} alt="UpSalon" className="h-8 w-8 object-contain" />
            <img src={textUpsalon} alt="UpSalon" className="h-5 object-contain" />
          </div>
        </div>

        <Card className="border-border/50 shadow-lg overflow-hidden">
          {/* Colored top bar */}
          <div className={`h-2 ${
            loading ? "bg-muted" : success 
              ? (isConfirm ? "bg-success" : "bg-destructive") 
              : "bg-warning"
          }`} />

          <CardContent className="p-8 text-center">
            {loading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground">
                  {isConfirm ? "Confirmando presença..." : "Cancelando agendamento..."}
                </p>
              </div>
            ) : success ? (
              <div className="space-y-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  isConfirm ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  {isConfirm ? (
                    <CheckCircle className="h-10 w-10 text-success" />
                  ) : (
                    <XCircle className="h-10 w-10 text-destructive" />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground">{message}</h2>
                </div>

                {appointment?.start_time && (
                  <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3">
                    {appointment.clients?.name && (
                      <p className="text-sm text-muted-foreground">
                        👤 <strong>Cliente:</strong> {appointment.clients.name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" /> {formatDate(appointment.start_time)}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> {formatTime(appointment.start_time)}
                    </p>
                    {appointment.services?.name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <ScissorsIcon className="h-4 w-4" /> {appointment.services.name}
                      </p>
                    )}
                    {appointment.salons?.name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> {appointment.salons.name}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Você pode fechar esta página.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10">
                  <AlertCircle className="h-10 w-10 text-warning" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Ops!</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
