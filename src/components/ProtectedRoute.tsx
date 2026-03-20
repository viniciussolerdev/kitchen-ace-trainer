import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

function SubscriptionGate() {
  const { subscriptionLoading, checkSubscription, signOut, trialDaysLeft } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Verificando assinatura...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-primary/30 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Período de teste encerrado</h2>
          <p className="text-muted-foreground mb-6">
            Seu teste grátis de 5 dias terminou. Para continuar usando o UpSalon, assine o plano profissional por apenas R$ 69/mês. Seus dados estão salvos e estarão disponíveis assim que assinar!
          </p>
          <Button
            size="lg"
            className="w-full text-lg py-6 mb-3"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</>
            ) : (
              <>Assinar agora <ArrowRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={checkSubscription}>
            Já assinei — verificar novamente
          </Button>
          <Button variant="link" className="w-full mt-2 text-muted-foreground" onClick={signOut}>
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, subscribed, subscriptionLoading, userRole, onTrial, trialDaysLeft } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Employees don't need their own subscription (admin pays)
  // Users on trial get access
  if (userRole !== "employee" && !subscribed && !onTrial && !subscriptionLoading) {
    return <SubscriptionGate />;
  }

  // Still loading subscription for non-employees
  if (userRole !== "employee" && !onTrial && subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Verificando assinatura...</div>
      </div>
    );
  }

  return <>{children}</>;
}
