import { Button } from "@/components/ui/button";

interface RecipeCardProps {
  title: string;
  ingredients: string[];
  time: string;
  difficulty: string;
  image?: string;
}

const RecipeCard = ({ title, ingredients, time, difficulty }: RecipeCardProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold font-nunito">
          3 Ingredientes
        </span>
        <span className="text-muted-foreground text-sm font-nunito">
          <i className="ri-time-line mr-1"></i>
          {time}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-card-foreground mb-3 font-poppins">
        {title}
      </h3>
      
      <div className="space-y-2 mb-4">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center text-muted-foreground font-nunito">
            <i className="ri-checkbox-circle-line text-success mr-2"></i>
            {ingredient}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground font-nunito">
          Dificuldade: <span className="font-semibold text-foreground">{difficulty}</span>
        </span>
        <Button variant="secondary" size="sm">
          <i className="ri-play-circle-line mr-1"></i>
          Cozinhar
        </Button>
      </div>
    </div>
  );
};

export default RecipeCard;
