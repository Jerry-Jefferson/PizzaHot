import { type ExceptionFilter } from "@nestjs/common";
import { type Observable } from "rxjs";
export declare class RpcExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown): Observable<never>;
}
