import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-accent/5 to-primary/10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
          <Sparkles className="h-4 w-4" />
          Comece agora mesmo
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
          Seu salão merece uma gestão <span className="text-primary">profissional</span>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 font-sans max-w-2xl mx-auto">
          Chega de confusão com horários, clientes que não aparecem e planilhas perdidas.
          Comece hoje e veja a diferença em poucos dias.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-8 sm:mb-10 text-xs sm:text-sm font-sans text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> 5 dias grátis
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> Sem cartão de crédito
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> Cancele quando quiser
          </span>
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          onClick={() => navigate("/auth")}
        >
          Quero testar grátis por 5 dias <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-[10px] sm:text-xs text-muted-foreground mt-4 sm:mt-5 font-sans">
          Mais de 200 profissionais já transformaram seus salões com o UpSalon
        </p>
      </div>
    </section>
  );
};

export default CtaSection;
