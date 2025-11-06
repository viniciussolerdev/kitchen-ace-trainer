import { useCooking } from "@/contexts/CookingContext";

interface BadgeCardProps {
  title: string;
  description: string;
  icon: string;
  requiredRecipes: number;
  image?: string;
}

const BadgeCard = ({ title, description, icon, requiredRecipes, image }: BadgeCardProps) => {
  const { completedRecipes } = useCooking();
  const unlocked = completedRecipes.length >= requiredRecipes;
  const progress = Math.min((completedRecipes.length / requiredRecipes) * 100, 100);
  return (
    <div className={`bg-card rounded-3xl shadow-card p-6 text-center transition-all border border-border ${
      unlocked ? 'hover:-translate-y-1 hover:shadow-card-hover' : 'opacity-60'
    }`}>
      <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
        unlocked 
          ? 'bg-gradient-to-br from-accent to-accent-light' 
          : 'bg-muted'
      }`}>
        {image ? (
          <img src={image} alt={title} className="w-16 h-16 object-contain" />
        ) : (
          <i className={`${icon} text-4xl ${unlocked ? 'text-accent-foreground' : 'text-muted-foreground'}`}></i>
        )}
      </div>
      
      <h3 className="text-lg font-bold text-card-foreground mb-2 font-poppins">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground font-nunito">
        {description}
      </p>
      
      {unlocked ? (
        <div className="mt-3">
          <span className="inline-flex items-center px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold font-nunito">
            <i className="ri-check-line mr-1"></i>
            Desbloqueado
          </span>
        </div>
      ) : (
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground font-nunito">
            {completedRecipes.length}/{requiredRecipes} receitas
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
