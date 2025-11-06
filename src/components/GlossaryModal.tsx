import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const glossaryTerms = [
  {
    term: "Saltear",
    definition: "Cozinhar rapidamente em fogo alto com pouco óleo, mexendo constantemente.",
    icon: "ri-fire-line",
  },
  {
    term: "Refogar",
    definition: "Cozinhar em fogo médio com óleo ou manteiga até dourar levemente.",
    icon: "ri-seedling-line",
  },
  {
    term: "Branquear",
    definition: "Mergulhar brevemente em água fervente, depois em água gelada.",
    icon: "ri-water-flash-line",
  },
  {
    term: "Reduzir",
    definition: "Cozinhar um líquido para evaporar água e concentrar sabores.",
    icon: "ri-drop-line",
  },
  {
    term: "Dourar",
    definition: "Cozinhar até obter uma cor dourada na superfície do alimento.",
    icon: "ri-sun-line",
  },
  {
    term: "Picar",
    definition: "Cortar em pedaços pequenos e uniformes.",
    icon: "ri-scissors-cut-line",
  },
  {
    term: "Amassar",
    definition: "Pressionar e misturar ingredientes até obter uma massa homogênea.",
    icon: "ri-hand-heart-line",
  },
  {
    term: "Temperar",
    definition: "Adicionar sal, pimenta e outros temperos para realçar o sabor.",
    icon: "ri-leaf-line",
  },
];

const GlossaryModal = ({ isOpen, onClose }: GlossaryModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground font-poppins">
            <i className="ri-book-open-line text-primary mr-2"></i>
            Glossário Culinário
          </DialogTitle>
          <p className="text-muted-foreground font-nunito">
            Termos essenciais para você cozinhar com confiança
          </p>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4 py-4">
            {glossaryTerms.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-secondary to-background rounded-2xl p-6 border border-border hover:shadow-card transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-primary-foreground text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 font-poppins">
                      {item.term}
                    </h3>
                    <p className="text-muted-foreground font-nunito leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
          <p className="text-sm text-accent font-nunito text-center">
            <i className="ri-information-line mr-2"></i>
            <strong>Plano Gratuito:</strong> Acesso limitado aos termos mais comuns. Desbloqueie o glossário completo no plano premium!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlossaryModal;
