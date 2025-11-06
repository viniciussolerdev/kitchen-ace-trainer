import React, { createContext, useContext, useState, useEffect } from "react";

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  time: string;
  difficulty: string;
  steps: {
    number: number;
    title: string;
    description: string;
    duration: number;
  }[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requiredRecipes: number;
  image?: string;
}

interface CookingContextType {
  recipes: Recipe[];
  badges: Badge[];
  completedRecipes: string[];
  favoriteRecipes: string[];
  completeRecipe: (recipeId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
}

const CookingContext = createContext<CookingContextType | undefined>(undefined);

export const CookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedRecipes, setCompletedRecipes] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cookingProgress");
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedRecipes(data.completed || []);
      setFavoriteRecipes(data.favorites || []);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cookingProgress", JSON.stringify({
      completed: completedRecipes,
      favorites: favoriteRecipes,
    }));
  }, [completedRecipes, favoriteRecipes]);

  const recipes: Recipe[] = [
    {
      id: "pasta-tomate",
      title: "Pasta ao Tomate",
      ingredients: ["Massa (200g)", "Tomate (4 unidades)", "Manjericão fresco"],
      time: "15 min",
      difficulty: "Fácil",
      steps: [
        { number: 1, title: "Ferver Água", description: "Coloque água para ferver com sal", duration: 120 },
        { number: 2, title: "Preparar Molho", description: "Corte os tomates e refogue com manjericão", duration: 180 },
        { number: 3, title: "Cozinhar Massa", description: "Adicione a massa na água fervente", duration: 480 },
        { number: 4, title: "Finalizar", description: "Misture a massa com o molho e sirva", duration: 60 },
      ],
    },
    {
      id: "omelete-cremosa",
      title: "Omelete Cremosa",
      ingredients: ["Ovos (3 unidades)", "Queijo ralado (50g)", "Manteiga (1 colher)"],
      time: "8 min",
      difficulty: "Fácil",
      steps: [
        { number: 1, title: "Bater Ovos", description: "Bata os ovos com um garfo até ficar homogêneo", duration: 60 },
        { number: 2, title: "Aquecer Frigideira", description: "Derreta a manteiga em fogo médio", duration: 90 },
        { number: 3, title: "Cozinhar", description: "Despeje os ovos e adicione o queijo", duration: 240 },
        { number: 4, title: "Dobrar e Servir", description: "Dobre ao meio e sirva quente", duration: 30 },
      ],
    },
    {
      id: "salada-caprese",
      title: "Salada Caprese",
      ingredients: ["Tomate (3 unidades)", "Mussarela de búfala (200g)", "Manjericão fresco"],
      time: "5 min",
      difficulty: "Muito Fácil",
      steps: [
        { number: 1, title: "Cortar Ingredientes", description: "Corte tomate e mussarela em fatias", duration: 120 },
        { number: 2, title: "Montar Prato", description: "Alterne fatias de tomate e mussarela", duration: 60 },
        { number: 3, title: "Finalizar", description: "Adicione manjericão, azeite e sal", duration: 60 },
      ],
    },
    {
      id: "arroz-alho",
      title: "Arroz de Alho",
      ingredients: ["Arroz (1 xícara)", "Alho (4 dentes)", "Azeite (2 colheres)"],
      time: "20 min",
      difficulty: "Fácil",
      steps: [
        { number: 1, title: "Refogar Alho", description: "Doure o alho picado no azeite", duration: 120 },
        { number: 2, title: "Adicionar Arroz", description: "Adicione o arroz e mexa por 1 minuto", duration: 60 },
        { number: 3, title: "Cozinhar", description: "Adicione 2 xícaras de água e cozinhe", duration: 900 },
        { number: 4, title: "Finalizar", description: "Desligue quando a água secar", duration: 60 },
      ],
    },
    {
      id: "panqueca-simples",
      title: "Panqueca Simples",
      ingredients: ["Farinha (1 xícara)", "Leite (1 xícara)", "Ovo (1 unidade)"],
      time: "12 min",
      difficulty: "Médio",
      steps: [
        { number: 1, title: "Fazer Massa", description: "Misture todos os ingredientes até ficar homogêneo", duration: 120 },
        { number: 2, title: "Aquecer Frigideira", description: "Aqueça a frigideira com um fio de óleo", duration: 90 },
        { number: 3, title: "Cozinhar", description: "Despeje a massa e espere bolhas formarem", duration: 300 },
        { number: 4, title: "Virar e Servir", description: "Vire e cozinhe o outro lado", duration: 120 },
      ],
    },
    {
      id: "bruschetta-italiana",
      title: "Bruschetta Italiana",
      ingredients: ["Pão italiano (6 fatias)", "Tomate (3 unidades)", "Alho (2 dentes)"],
      time: "10 min",
      difficulty: "Fácil",
      steps: [
        { number: 1, title: "Tostar Pão", description: "Toste as fatias de pão até dourar", duration: 180 },
        { number: 2, title: "Preparar Tomate", description: "Pique tomate, alho e misture", duration: 150 },
        { number: 3, title: "Montar", description: "Esfregue alho no pão e adicione o tomate", duration: 90 },
        { number: 4, title: "Finalizar", description: "Regue com azeite e sirva", duration: 30 },
      ],
    },
  ];

  const badges: Badge[] = [
    {
      id: "iniciante",
      title: "Iniciante",
      description: "Complete sua primeira receita",
      icon: "ri-star-line",
      unlocked: completedRecipes.length >= 1,
      requiredRecipes: 1,
    },
    {
      id: "cozinheiro",
      title: "Cozinheiro",
      description: "Complete 5 receitas",
      icon: "ri-fire-line",
      unlocked: completedRecipes.length >= 5,
      requiredRecipes: 5,
    },
    {
      id: "chef",
      title: "Chef",
      description: "Complete 10 receitas",
      icon: "ri-medal-line",
      unlocked: completedRecipes.length >= 10,
      requiredRecipes: 10,
    },
    {
      id: "mestre",
      title: "Mestre Culinário",
      description: "Complete todas as receitas",
      icon: "ri-trophy-line",
      unlocked: completedRecipes.length >= recipes.length,
      requiredRecipes: recipes.length,
    },
  ];

  const completeRecipe = (recipeId: string) => {
    if (!completedRecipes.includes(recipeId)) {
      setCompletedRecipes([...completedRecipes, recipeId]);
    }
  };

  const toggleFavorite = (recipeId: string) => {
    if (favoriteRecipes.includes(recipeId)) {
      setFavoriteRecipes(favoriteRecipes.filter(id => id !== recipeId));
    } else {
      setFavoriteRecipes([...favoriteRecipes, recipeId]);
    }
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  return (
    <CookingContext.Provider
      value={{
        recipes,
        badges,
        completedRecipes,
        favoriteRecipes,
        completeRecipe,
        toggleFavorite,
        getRecipeById,
      }}
    >
      {children}
    </CookingContext.Provider>
  );
};

export const useCooking = () => {
  const context = useContext(CookingContext);
  if (!context) {
    throw new Error("useCooking must be used within CookingProvider");
  }
  return context;
};
