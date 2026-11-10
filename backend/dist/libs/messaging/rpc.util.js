import { firstValueFrom, timeout } from "rxjs";
import { toHttpException } from "./rpc-error.js";
export const RPC_TIMEOUT_MS = Number(process.env.RPC_TIMEOUT_MS ?? 10_000);
export async function rpc(client, pattern, data = {}) {
    try {
        const result = await firstValueFrom(client.send(pattern, data).pipe(timeout(RPC_TIMEOUT_MS)));
        return result;
    }
    catch (error) {
        throw toHttpException(error);
    }
}
//# sourceMappingURL=rpc.util.js.map