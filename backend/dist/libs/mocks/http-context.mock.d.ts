import type { ExecutionContext } from "@nestjs/common";
export declare function createHttpExecutionContext<TRequest, TResponse>(request: TRequest, response: TResponse): ExecutionContext;
