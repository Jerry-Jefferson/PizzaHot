export interface MostOrderedPizzaResult {
  pizzaName: string;
  orderCount: number;
  totalQuantity: number;
}

export interface MostOrderedPizzaRow {
  pizzaName: string;
  orderCount: number | string;
  totalQuantity: number | string;
}

export interface OrderFactInput {
  orderId: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  finalPrice: number;
  createdAt: Date;
}

export interface OrderItemFactInput {
  orderId: string;
  pizzaId: string | null;
  pizzaName: string;
  quantity: number;
  orderedAt: Date;
}

export interface UserAboveAverageCheckResult {
  userId: string;
  email: string;
  name: string | null;
  orderCount: number;
  averageCheck: number;
  globalAverageCheck: number;
}

export interface UserAboveAverageCheckRow {
  userId: string;
  email: string;
  name: string | null;
  orderCount: number;
  averageCheck: string;
  globalAverageCheck: string;
}

export interface IAnalyticsRepository {
  getMostOrderedPizzaInMonth(month: number, year: number): Promise<MostOrderedPizzaResult | null>;
  getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]>;
}
