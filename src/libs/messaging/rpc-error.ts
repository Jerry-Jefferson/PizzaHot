import { HttpException, HttpStatus } from "@nestjs/common";

export interface RpcErrorPayload {
  __rpc: true;
  status: number;
  message: string;
  error: string;
}

export function isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __rpc?: unknown }).__rpc === true &&
    typeof (value as { status?: unknown }).status === "number"
  );
}

export function buildRpcErrorPayload(exception: unknown): RpcErrorPayload {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    const message =
      typeof response === "string"
        ? response
        : ((response as { message?: string | string[] }).message ?? exception.message);

    return {
      __rpc: true,
      status: exception.getStatus(),
      message: Array.isArray(message) ? message.join(", ") : message,
      error: exception.name,
    };
  }

  return {
    __rpc: true,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    error: exception instanceof Error ? exception.name : "UnknownError",
  };
}

export function toHttpException(error: unknown): HttpException {
  if (isRpcErrorPayload(error)) {
    return new HttpException(error.message, error.status);
  }

  const name = error instanceof Error ? error.name : "";
  if (name === "TimeoutError" || name === "EmptyError") {
    return new HttpException(
      "Upstream service did not respond in time",
      HttpStatus.GATEWAY_TIMEOUT
    );
  }

  return new HttpException("Upstream service is unavailable", HttpStatus.SERVICE_UNAVAILABLE);
}
