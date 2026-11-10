import type { ExecutionContext } from "@nestjs/common";

type HttpArgumentsHost = ReturnType<ExecutionContext["switchToHttp"]>;

function unavailable(member: string): never {
  throw new Error(`${member}() is not provided by this HTTP test context`);
}

export function createHttpExecutionContext<TRequest, TResponse>(
  request: TRequest,
  response: TResponse
): ExecutionContext {
  const boxedRequest: unknown = request;
  const boxedResponse: unknown = response;

  const http: HttpArgumentsHost = {
    getRequest: <T>(): T => boxedRequest as T,
    getResponse: <T>(): T => boxedResponse as T,
    getNext: () => unavailable("getNext"),
  };

  return {
    switchToHttp: () => http,
    switchToRpc: () => unavailable("switchToRpc"),
    switchToWs: () => unavailable("switchToWs"),
    getType: () => unavailable("getType"),
    getArgs: () => unavailable("getArgs"),
    getArgByIndex: () => unavailable("getArgByIndex"),
    getClass: () => unavailable("getClass"),
    getHandler: () => unavailable("getHandler"),
  };
}
