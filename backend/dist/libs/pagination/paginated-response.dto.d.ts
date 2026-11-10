export declare class PaginatedResponseDto<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    constructor(data: T[], page: number, limit: number, total: number);
}
