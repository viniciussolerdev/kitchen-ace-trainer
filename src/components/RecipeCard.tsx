import { Button } from "@/components/ui/button";
import { useCooking } from "@/contexts/CookingContext";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipeId: string;
  title: string;
  ingredients: string[];
  time: string;
  difficulty: string;
  onCook: () => void;
  isLocked?: boolean;
}

const RecipeCard = ({ recipeId, title, ingredients, time, difficulty, onCook, isLocked = false }: RecipeCardProps) => {
  const { completedRecipes, favoriteRecipes, toggleFavorite } = useCooking();
  const navigate = useNavigate();
  const isCompleted = completedRecipes.includes(recipeId);
  const isFavorite = favoriteRecipes.includes(recipeId);

  const handleAction = () => {
    if (isLocked) {
      navigate("/plans");
    } else {
      onCook();
    }
  };

  return (
    <div className={`bg-card rounded-3xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all p-6 border border-border relative ${isLocked ? 'opacity-75' : ''}`}>
      {isLocked && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <i className="ri-lock-line text-muted-foreground"></i>
          </div>
        </div>
      )}
      {!isLocked && isCompleted && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <i className="ri-check-line text-success-foreground"></i>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold font-nunito">
          {isLocked ? "🔒 Premium" : "3 Ingredientes"}
        </span>
        <div className="flex items-center space-x-2">
          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(recipeId);
              }}
              className="text-accent hover:scale-110 transition-transform"
            >
              <i className={isFavorite ? "ri-heart-fill" : "ri-heart-line"}></i>
            </button>
          )}
          <span className="text-muted-foreground text-sm font-nunito">
            <i className="ri-time-line mr-1"></i>
            {isLocked ? "?" : time}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-card-foreground mb-3 font-poppins">
        {title}
      </h3>
      
      <div className="space-y-2 mb-4">
        {isLocked ? (
          <div className="text-center py-4">
            <i className="ri-lock-line text-4xl text-muted-foreground mb-2 block"></i>
            <p className="text-sm text-muted-foreground font-nunito">
              Disponível apenas no plano Premium
            </p>
          </div>
        ) : (
          ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center text-muted-foreground font-nunito text-sm">
              <i className="ri-checkbox-circle-line text-success mr-2"></i>
              {ingredient}
            </div>
          ))
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground font-nunito">
          Dificuldade: <span className="font-semibold text-foreground">{isLocked ? "?" : difficulty}</span>
        </span>
        <Button 
          variant={isLocked ? "outline" : "secondary"} 
          size="sm" 
          onClick={handleAction}
        >
          {isLocked ? (
            <>
              <i className="ri-vip-crown-line mr-1"></i>
              Desbloquear
            </>
          ) : (
            <>
              <i className="ri-play-circle-line mr-1"></i>
              {isCompleted ? "Refazer" : "Cozinhar"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RecipeCard;
