/**
 * One page of rows plus the size of the whole set: what a repository returns and what travels
 * over the broker. PaginatedResponseDto is built from this and adds what the client needs -
 * page, limit and totalPages.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
}
