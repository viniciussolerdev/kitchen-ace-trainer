import { Button } from "@/components/ui/button";
import { useCooking } from "@/contexts/CookingContext";

interface RecipeCardProps {
  recipeId: string;
  title: string;
  ingredients: string[];
  time: string;
  difficulty: string;
  onCook: () => void;
}

const RecipeCard = ({ recipeId, title, ingredients, time, difficulty, onCook }: RecipeCardProps) => {
  const { completedRecipes, favoriteRecipes, toggleFavorite } = useCooking();
  const isCompleted = completedRecipes.includes(recipeId);
  const isFavorite = favoriteRecipes.includes(recipeId);

  return (
    <div className="bg-card rounded-3xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all p-6 border border-border relative">
      {isCompleted && (
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <i className="ri-check-line text-success-foreground"></i>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold font-nunito">
          3 Ingredientes
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(recipeId);
            }}
            className="text-accent hover:scale-110 transition-transform"
          >
            <i className={isFavorite ? "ri-heart-fill" : "ri-heart-line"}></i>
          </button>
          <span className="text-muted-foreground text-sm font-nunito">
            <i className="ri-time-line mr-1"></i>
            {time}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-card-foreground mb-3 font-poppins">
        {title}
      </h3>
      
      <div className="space-y-2 mb-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center text-muted-foreground font-nunito text-sm">
            <i className="ri-checkbox-circle-line text-success mr-2"></i>
            {ingredient}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground font-nunito">
          Dificuldade: <span className="font-semibold text-foreground">{difficulty}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={onCook}>
          <i className="ri-play-circle-line mr-1"></i>
          {isCompleted ? "Refazer" : "Cozinhar"}
        </Button>
      </div>
    </div>
  );
};

export default RecipeCard;
