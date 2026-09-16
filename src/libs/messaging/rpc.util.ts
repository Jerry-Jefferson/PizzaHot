import { type ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout } from "rxjs";
import { toHttpException } from "./rpc-error.ts";

export const RPC_TIMEOUT_MS = Number(process.env.RPC_TIMEOUT_MS ?? 10_000);

export async function rpc<T>(client: ClientProxy, pattern: string, data: unknown = {}): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data).pipe(timeout(RPC_TIMEOUT_MS)));
  } catch (error) {
    throw toHttpException(error);
  }
}
