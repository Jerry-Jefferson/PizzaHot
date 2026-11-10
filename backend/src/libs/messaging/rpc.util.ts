import type { RpcSender } from "./message-client.types.ts";
import { firstValueFrom, timeout } from "rxjs";
import { toHttpException } from "./rpc-error.ts";

export const RPC_TIMEOUT_MS = Number(process.env.RPC_TIMEOUT_MS ?? 10_000);

export async function rpc<T>(client: RpcSender, pattern: string, data: unknown = {}): Promise<T> {
  try {
    const result = await firstValueFrom(client.send(pattern, data).pipe(timeout(RPC_TIMEOUT_MS)));

    return result as T;
  } catch (error) {
    throw toHttpException(error);
  }
}
