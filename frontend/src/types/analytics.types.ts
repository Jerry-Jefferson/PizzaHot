export interface MostOrderedPizza {
  pizzaName: string;
  orderCount: number;
}

export interface UserAboveAverageCheck {
  userId: string;
  email: string;
  name: string | null;
  orderCount: number;
  averageCheck: number;
  globalAverageCheck: number;
}
