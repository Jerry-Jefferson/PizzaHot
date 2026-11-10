export const SEED_INGREDIENTS = [
  "Mozzarella",
  "Tomato Sauce",
  "Pepperoni",
  "Mushrooms",
  "Basil",
  "Ham",
  "Pineapple",
  "Olives",
  "Bell Pepper",
  "Chicken",
] as const;

export interface SeedPizza {
  name: string;
  description: string;
  price: number;
  ingredients: string[];
}

export const SEED_PIZZAS: SeedPizza[] = [
  {
    name: "Margherita",
    description: "The classic: tomato, mozzarella and fresh basil",
    price: 8.5,
    ingredients: ["Tomato Sauce", "Mozzarella", "Basil"],
  },
  {
    name: "Pepperoni",
    description: "Generous layer of spicy pepperoni over melted mozzarella",
    price: 10.9,
    ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni"],
  },
  {
    name: "Hawaiian",
    description: "Ham and pineapple, the argument that never ends",
    price: 11.5,
    ingredients: ["Tomato Sauce", "Mozzarella", "Ham", "Pineapple"],
  },
  {
    name: "Funghi",
    description: "Mushrooms and mozzarella on a tomato base",
    price: 9.9,
    ingredients: ["Tomato Sauce", "Mozzarella", "Mushrooms"],
  },
  {
    name: "Prosciutto",
    description: "Thin sliced ham with plenty of cheese",
    price: 10.5,
    ingredients: ["Tomato Sauce", "Mozzarella", "Ham"],
  },
  {
    name: "Capricciosa",
    description: "Ham, mushrooms and olives in the traditional arrangement",
    price: 12.9,
    ingredients: ["Tomato Sauce", "Mozzarella", "Ham", "Mushrooms", "Olives"],
  },
  {
    name: "Chicken Ranch",
    description: "Grilled chicken and sweet bell pepper on a white base",
    price: 12.5,
    ingredients: ["Mozzarella", "Chicken", "Bell Pepper"],
  },
  {
    name: "Diavola",
    description: "Pepperoni and bell pepper for those who like it hot",
    price: 11.9,
    ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni", "Bell Pepper"],
  },
  {
    name: "Vegetariana",
    description: "Mushrooms, bell pepper and olives, no meat in sight",
    price: 11.2,
    ingredients: ["Tomato Sauce", "Mozzarella", "Mushrooms", "Bell Pepper", "Olives"],
  },
  {
    name: "Bianca",
    description: "No tomato at all - just mozzarella and basil",
    price: 8.9,
    ingredients: ["Mozzarella", "Basil"],
  },
  {
    name: "Chicken Pesto",
    description: "Chicken and basil on a white base",
    price: 12.8,
    ingredients: ["Mozzarella", "Chicken", "Basil"],
  },
  {
    name: "Mediterranea",
    description: "Olives, bell pepper and basil with a tomato base",
    price: 11.6,
    ingredients: ["Tomato Sauce", "Mozzarella", "Olives", "Bell Pepper", "Basil"],
  },
  {
    name: "Meat Feast",
    description: "Pepperoni, ham and chicken all at once",
    price: 14.5,
    ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni", "Ham", "Chicken"],
  },
  {
    name: "Tropicana",
    description: "Chicken and pineapple, sweet and savoury together",
    price: 12.7,
    ingredients: ["Tomato Sauce", "Mozzarella", "Chicken", "Pineapple"],
  },
  {
    name: "Funghi Olive",
    description: "Mushrooms and olives for a deeper, saltier bite",
    price: 10.8,
    ingredients: ["Tomato Sauce", "Mozzarella", "Mushrooms", "Olives"],
  },
  {
    name: "Pepperoni Deluxe",
    description: "Pepperoni with mushrooms and olives piled on",
    price: 13.4,
    ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni", "Mushrooms", "Olives"],
  },
  {
    name: "Garden",
    description: "Bell pepper, mushrooms and fresh basil",
    price: 11.0,
    ingredients: ["Tomato Sauce", "Mozzarella", "Bell Pepper", "Mushrooms", "Basil"],
  },
  {
    name: "Ham and Mushroom",
    description: "The steady favourite, ham with mushrooms",
    price: 11.3,
    ingredients: ["Tomato Sauce", "Mozzarella", "Ham", "Mushrooms"],
  },
  {
    name: "Spicy Chicken",
    description: "Chicken and pepperoni with bell pepper",
    price: 13.9,
    ingredients: ["Tomato Sauce", "Mozzarella", "Chicken", "Bell Pepper", "Pepperoni"],
  },
  {
    name: "Quattro Stagioni",
    description: "Four quarters: ham, mushrooms, olives and bell pepper",
    price: 13.6,
    ingredients: ["Tomato Sauce", "Mozzarella", "Ham", "Mushrooms", "Olives", "Bell Pepper"],
  },
];
