export interface Ingredient {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pizza {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  ingredients?: Ingredient[];
  createdAt: string;
  updatedAt: string;
}

export interface PizzaPayload {
  name: string;
  description: string;
  price: number;
  ingredientIds: string[];
}
