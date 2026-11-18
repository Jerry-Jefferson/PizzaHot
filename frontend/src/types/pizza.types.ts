import type { FormErrors } from "./form.types";
import type { PaginationQuery } from "./pagination.types";

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

export interface PizzaFormValues {
  name: string;
  description: string;
  price: number | null;
}

export type PizzaField = keyof PizzaFormValues;

export type PizzaFormErrors = FormErrors<PizzaField>;

export type PendingAction = "add" | "order";

export interface PizzaListQuery extends PaginationQuery {
  search?: string;
}
