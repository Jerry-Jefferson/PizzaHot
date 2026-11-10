import type { IRedemptionsRepository } from "../promocode.types.ts";
export declare class RedemptionsService {
    private readonly redemptions;
    private readonly logger;
    constructor(redemptions: IRedemptionsRepository);
    isAvailableFor(userId: string, promocodeId: string): Promise<boolean>;
    assertAvailableFor(userId: string, promocodeId: string): Promise<void>;
    reserve(userId: string, promocodeId: string): Promise<void>;
    confirm(userId: string, promocodeId: string, orderId: string): Promise<void>;
    release(userId: string, promocodeId: string): Promise<void>;
    reapStaleReservations(): Promise<number>;
}
