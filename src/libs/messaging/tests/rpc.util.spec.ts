import { describe, it, expect, jest } from "@jest/globals";
import { HttpStatus } from "@nestjs/common";
import { Observable, of, throwError } from "rxjs";
import { rpc } from "../rpc.util.ts";
import type { RpcSender } from "../message-client.types.ts";

function senderReturning(stream: Observable<unknown>): RpcSender {
  return { send: jest.fn<RpcSender["send"]>().mockReturnValue(stream) };
}

describe("rpc", () => {
  it("passes the pattern and payload to the client", async () => {
    const sender = senderReturning(of({ id: "1" }));

    await rpc(sender, "catalog.pizza.find_by_id", { id: "1" });

    expect(sender.send).toHaveBeenCalledWith("catalog.pizza.find_by_id", { id: "1" });
  });

  it("sends an empty object when no payload is given", async () => {
    const sender = senderReturning(of([]));

    await rpc(sender, "catalog.ingredient.list");

    expect(sender.send).toHaveBeenCalledWith("catalog.ingredient.list", {});
  });

  it("resolves with the first value of the stream", async () => {
    await expect(rpc(senderReturning(of({ name: "Margherita" })), "p")).resolves.toEqual({
      name: "Margherita",
    });
  });

  it("re-raises a serialized remote error with its own status", async () => {
    const remote = { __rpc: true, status: 404, message: "Pizza not found", error: "NotFound" };

    await expect(rpc(senderReturning(throwError(() => remote)), "p")).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      message: "Pizza not found",
    });
  });

  it("turns a broker failure into 503", async () => {
    const sender = senderReturning(throwError(() => new Error("connection lost")));

    await expect(rpc(sender, "p")).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });

  it("turns an empty stream into 504", async () => {
    const empty = new Observable<unknown>((subscriber) => subscriber.complete());

    await expect(rpc(senderReturning(empty), "p")).rejects.toMatchObject({
      status: HttpStatus.GATEWAY_TIMEOUT,
    });
  });
});
