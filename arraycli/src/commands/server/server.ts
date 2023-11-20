import { Server } from "bun";
import { isObservable, Unsubscribable } from "@trpc/server/observable";
import type { FetchHandlerRequestOptions } from "@trpc/server/adapters/fetch";
import { router } from "./router";

import { AnyRouter, callProcedure, TRPCError } from "@trpc/server";
import { TRPCResponse, TRPCResponseMessage } from "@trpc/server/rpc";

// Be not afraid, I copied a lot of this from
// https://github.com/elysiajs/elysia-trpc/tree/main

export function transformTRPCResponseItem<
  TResponseItem extends TRPCResponse | TRPCResponseMessage
>(router: AnyRouter, item: TResponseItem): TResponseItem {
  if ("error" in item) {
    return {
      ...item,
      error: router._def._config.transformer.output.serialize(item.error),
    };
  }

  if ("data" in item.result) {
    return {
      ...item,
      result: {
        ...item.result,
        data: router._def._config.transformer.output.serialize(
          item.result.data
        ),
      },
    };
  }

  return item;
}

export function transformTRPCResponse<
  TResponse extends
    | TRPCResponse
    | TRPCResponse[]
    | TRPCResponseMessage
    | TRPCResponseMessage[]
>(router: AnyRouter, itemOrItems: TResponse) {
  return Array.isArray(itemOrItems)
    ? itemOrItems.map((item) => transformTRPCResponseItem(router, item))
    : transformTRPCResponseItem(router, itemOrItems);
}

export function getMessageFromUnknownError(
  err: unknown,
  fallback: string
): string {
  if (typeof err === "string") {
    return err;
  }

  if (err instanceof Error && typeof err.message === "string") {
    return err.message;
  }
  return fallback;
}

export function getErrorFromUnknown(cause: unknown): Error {
  if (cause instanceof Error) {
    return cause;
  }
  const message = getMessageFromUnknownError(cause, "Unknown error");
  return new Error(message);
}

export function getTRPCErrorFromUnknown(cause: unknown): TRPCError {
  const error = getErrorFromUnknown(cause);
  // this should ideally be an `instanceof TRPCError` but for some reason that isn't working
  // ref https://github.com/trpc/trpc/issues/331
  if (error.name === "TRPCError") return cause as TRPCError;

  const trpcError = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    cause: error,
    message: error.message,
  });

  // Inherit stack from error
  trpcError.stack = error.stack;

  return trpcError;
}

export function getCauseFromUnknown(cause: unknown) {
  if (cause instanceof Error) {
    return cause;
  }

  return undefined;
}

export interface TRPCClientIncomingRequest {
  id: number | string;
  jsonrpc?: "2.0";
  method: "query" | "mutation" | "subscription" | "subscription.stop";
  params: {
    path: string;
    input?: {
      json?: unknown;
    };
  };
}

export interface TRPCOptions
  extends Omit<FetchHandlerRequestOptions<any>, "req" | "router" | "endpoint"> {
  /**
   * tRPC endpoint
   *
   * @default '/trpc'
   */
  endpoint?: string;
}

type WSContext = {
  id: string;
};

export class ArrayServer {
  private readonly server: Server;

  constructor() {
    const observers: Map<string, Unsubscribable> = new Map();

    this.server = Bun.serve<WSContext>({
      port: 12343,
      fetch(req, server) {
        if (
          req.headers.get("upgrade") === "websocket" &&
          server.upgrade(req, {
            data: {
              // Change this
              id: Math.random().toString(),
            } satisfies WSContext,
          })
        )
          return;

        return new Response("Upgrade failed :(", { status: 500 });
      },
      websocket: {
        async message(ws, messageString) {
          if (typeof messageString !== "string") return;
          const message = JSON.parse(
            messageString
          ) as TRPCClientIncomingRequest;
          const messages: TRPCClientIncomingRequest[] = Array.isArray(message)
            ? message
            : [message];

          let observer: Unsubscribable | undefined;

          for (const incoming of messages) {
            if (!incoming.method || !incoming.params) {
              continue;
            }

            if (incoming.method === "subscription.stop") {
              observer?.unsubscribe();
              observers.delete(ws.data.id.toString());

              ws.send(
                JSON.stringify({
                  id: incoming.id,
                  jsonrpc: incoming.jsonrpc,
                  result: {
                    type: "stopped",
                  },
                })
              );

              continue;
            }

            const result = await callProcedure({
              procedures: router._def.procedures,
              path: incoming.params.path,
              rawInput: incoming.params.input,
              type: incoming.method,
              ctx: {},
            });

            if (incoming.method !== "subscription") {
              ws.send(
                JSON.stringify(
                  transformTRPCResponse(router, {
                    id: incoming.id,
                    jsonrpc: incoming.jsonrpc,
                    result: {
                      type: "data",
                      data: result,
                    },
                  })
                )
              );
              continue;
            }

            ws.send(
              JSON.stringify({
                id: incoming.id,
                jsonrpc: incoming.jsonrpc,
                result: {
                  type: "started",
                },
              })
            );

            if (!isObservable(result))
              throw new TRPCError({
                message: `Subscription ${incoming.params.path} did not return an observable`,
                code: "INTERNAL_SERVER_ERROR",
              });

            observer = result.subscribe({
              next(data) {
                ws.send(
                  JSON.stringify(
                    transformTRPCResponse(router, {
                      id: incoming.id,
                      jsonrpc: incoming.jsonrpc,
                      result: {
                        type: "data",
                        data,
                      },
                    })
                  )
                );
              },
              error(err) {
                ws.send(
                  JSON.stringify(
                    transformTRPCResponse(router, {
                      id: incoming.id,
                      jsonrpc: incoming.jsonrpc,
                      error: router.getErrorShape({
                        error: getTRPCErrorFromUnknown(err),
                        type: incoming.method as "subscription",
                        path: incoming.params.path,
                        input: incoming.params.input,
                        ctx: {},
                      }),
                    })
                  )
                );
              },
              complete() {
                ws.send(
                  JSON.stringify(
                    transformTRPCResponse(router, {
                      id: incoming.id,
                      jsonrpc: incoming.jsonrpc,
                      result: {
                        type: "stopped",
                      },
                    })
                  )
                );
              },
            });

            observers.set(ws.data.id.toString(), observer);
          }
        },
        close(ws) {
          observers.get(ws.data.id.toString())?.unsubscribe();
          observers.delete(ws.data.id.toString());
        },
      },
    });
  }

  public get bun() {
    return this.server;
  }
}

export default () => new ArrayServer();
