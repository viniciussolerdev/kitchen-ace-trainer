import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCooking } from "@/contexts/CookingContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

export default function Plans() {
  const { user, userPlan, refreshUserPlan } = useCooking();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer upgrade");
      return;
    }

    setIsUpgrading(true);
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ plan_type: "premium" })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshUserPlan();
      toast.success("Plano atualizado para Premium! 🎉");
      navigate("/");
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("Erro ao atualizar plano. Tente novamente.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      description: "Perfeito para começar sua jornada culinária",
      features: [
        "3 receitas simples",
        "Modo guiado básico",
        "Acesso ao glossário",
        "1 badge disponível"
      ],
      cta: "Plano Atual",
      isPremium: false,
      disabled: userPlan === "free"
    },
    {
      name: "Premium",
      price: "R$ 47",
      period: "/mês",
      description: "Desbloqueie todo o potencial da culinária",
      features: [
        "Todas as receitas ilimitadas",
        "Modo guiado completo com timer",
        "Acesso completo ao glossário",
        "Todos os badges e conquistas",
        "Suporte prioritário",
        "Receitas exclusivas semanais"
      ],
      cta: userPlan === "premium" ? "Plano Atual" : "Fazer Upgrade",
      isPremium: true,
      disabled: userPlan === "premium",
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header onGlossaryClick={() => setIsGlossaryOpen(true)} />
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente ou desbloqueie todas as receitas e recursos premium
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.highlight ? 'border-primary border-2 shadow-lg shadow-primary/20' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.highlight ? "hero" : "outline"}
                  className="w-full"
                  disabled={plan.disabled || isUpgrading}
                  onClick={plan.isPremium ? handleUpgrade : undefined}
                >
                  {isUpgrading && plan.isPremium ? "Processando..." : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            * Este é um sistema de demonstração. Nenhuma cobrança real será feita.
          </p>
        </div>
      </main>
    </div>
  );
}