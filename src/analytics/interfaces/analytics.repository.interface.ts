export interface MostOrderedPizzaResult {
  pizzaName: string;
  orderCount: number;
}

export interface UserAboveAverageCheckResult {
  userId: string;
  email: string;
  name: string | null;
  orderCount: number;
  averageCheck: number;
  globalAverageCheck: number;
}

export interface IAnalyticsRepository {
  getMostOrderedPizzaInMonth(month: number, year: number): Promise<MostOrderedPizzaResult | null>;
  getUsersWithAboveAverageCheck(): Promise<UserAboveAverageCheckResult[]>;
}
