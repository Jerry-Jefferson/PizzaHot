import type { Observable } from "rxjs";

export interface RpcSender {
  send(pattern: string, data: unknown): Observable<unknown>;
}

export interface EventPublisher {
  emit(pattern: string, data: unknown): Observable<unknown>;
}
