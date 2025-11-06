import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Step {
  number: number;
  title: string;
  description: string;
  duration: number;
}

const steps: Step[] = [
  { number: 1, title: "Preparar Ingredientes", description: "Separe os 3 ingredientes e lave-os bem", duration: 120 },
  { number: 2, title: "Cortar e Preparar", description: "Corte os ingredientes conforme indicado", duration: 180 },
  { number: 3, title: "Cozinhar", description: "Siga o método de cocção recomendado", duration: 300 },
  { number: 4, title: "Finalizar", description: "Tempere e apresente seu prato", duration: 60 },
];

const GuidedModeCard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  return (
    <div className="bg-gradient-to-br from-secondary to-background rounded-3xl shadow-card p-8 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-card-foreground font-poppins">
          <i className="ri-guide-line text-primary mr-2"></i>
          Modo Guiado
        </h3>
        <span className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold font-nunito">
          Passo {currentStep + 1} de {steps.length}
        </span>
      </div>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Current Step */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h4 className="text-xl font-bold text-card-foreground mb-2 font-poppins">
            {steps[currentStep].title}
          </h4>
          <p className="text-muted-foreground mb-4 font-nunito">
            {steps[currentStep].description}
          </p>
          
          {/* Timer Display */}
          <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <i className="ri-timer-line text-accent-foreground text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-nunito">Tempo Estimado</p>
                <p className="text-lg font-bold text-foreground font-poppins">
                  {Math.floor(steps[currentStep].duration / 60)}:{String(steps[currentStep].duration % 60).padStart(2, '0')}
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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Anterior
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              variant="default"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            >
              Próximo
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          ) : (
            <Button variant="hero">
              <i className="ri-checkbox-circle-line mr-2"></i>
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedModeCard;
