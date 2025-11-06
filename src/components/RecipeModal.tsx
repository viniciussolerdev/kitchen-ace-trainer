import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCooking, Recipe } from "@/contexts/CookingContext";
import { toast } from "@/hooks/use-toast";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeModal = ({ recipe, isOpen, onClose }: RecipeModalProps) => {
  const { completeRecipe, favoriteRecipes, toggleFavorite } = useCooking();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isGuidedMode, setIsGuidedMode] = useState(false);

  useEffect(() => {
    if (recipe && isGuidedMode) {
      setTimeLeft(recipe.steps[currentStep].duration);
      setIsTimerActive(false);
    }
  }, [currentStep, recipe, isGuidedMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            toast({
              title: "Timer Finalizado!",
              description: "Passo completo. Prossiga para o próximo.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleComplete = () => {
    if (recipe) {
      completeRecipe(recipe.id);
      toast({
        title: "Parabéns! 🎉",
        description: "Receita completada com sucesso!",
      });
      onClose();
      setIsGuidedMode(false);
      setCurrentStep(0);
    }
  };

  const handleFavorite = () => {
    if (recipe) {
      toggleFavorite(recipe.id);
      toast({
        title: favoriteRecipes.includes(recipe.id) ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: recipe.title,
      });
    }
  };

  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold text-foreground font-poppins">
              {recipe.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className="text-accent"
            >
              <i className={favoriteRecipes.includes(recipe.id) ? "ri-heart-fill" : "ri-heart-line"}></i>
            </Button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground font-nunito">
            <span className="flex items-center">
              <i className="ri-time-line mr-1"></i>
              {recipe.time}
            </span>
            <span className="flex items-center">
              <i className="ri-bar-chart-line mr-1"></i>
              {recipe.difficulty}
            </span>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">
              3 Ingredientes
            </span>
          </div>
        </DialogHeader>

        {!isGuidedMode ? (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 font-poppins">Ingredientes</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center text-muted-foreground font-nunito">
                    <i className="ri-checkbox-circle-line text-success mr-2"></i>
                    {ingredient}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 font-poppins">Modo de Preparo</h3>
              <div className="space-y-3">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="bg-secondary rounded-xl p-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mr-3 flex-shrink-0">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground font-poppins">{step.title}</h4>
                        <p className="text-sm text-muted-foreground font-nunito">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="hero" className="flex-1" onClick={() => setIsGuidedMode(true)}>
                <i className="ri-guide-line mr-2"></i>
                Modo Guiado
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleComplete}>
                <i className="ri-checkbox-circle-line mr-2"></i>
                Marcar como Completa
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground font-poppins">
                <i className="ri-guide-line text-primary mr-2"></i>
                Modo Guiado
              </h3>
              <span className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold font-nunito">
                Passo {currentStep + 1} de {recipe.steps.length}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h4 className="text-xl font-bold text-foreground mb-2 font-poppins">
                {recipe.steps[currentStep].title}
              </h4>
              <p className="text-muted-foreground mb-4 font-nunito">
                {recipe.steps[currentStep].description}
              </p>

              <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <i className="ri-timer-line text-accent-foreground text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-nunito">Tempo</p>
                    <p className="text-2xl font-bold text-foreground font-poppins">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>

                <Button
                  variant={isTimerActive ? "destructive" : "default"}
                  onClick={() => setIsTimerActive(!isTimerActive)}
                >
                  {isTimerActive ? (
                    <>
                      <i className="ri-pause-line mr-2"></i>
                      Pausar
                    </>
                  ) : (
                    <>
                      <i className="ri-play-line mr-2"></i>
                      Iniciar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Anterior
              </Button>

              {currentStep < recipe.steps.length - 1 ? (
                <Button
                  variant="default"
                  onClick={() => setCurrentStep(Math.min(recipe.steps.length - 1, currentStep + 1))}
                >
                  Próximo
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              ) : (
                <Button variant="hero" onClick={handleComplete}>
                  <i className="ri-checkbox-circle-line mr-2"></i>
                  Finalizar Receita
                </Button>
              )}

              <Button variant="ghost" onClick={() => setIsGuidedMode(false)}>
                <i className="ri-close-line mr-2"></i>
                Sair do Modo Guiado
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecipeModal;
