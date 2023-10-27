import { Server } from "bun";
import { ArrayConsole } from "./console";

export class ArrayServer {
  private readonly arrayConsole: ArrayConsole;
  private readonly server: Server;

  constructor() {
    this.arrayConsole = new ArrayConsole(this);
    const arrayConsole = this.arrayConsole;
    this.server = Bun.serve<{ username: string }>({
      port: 12343,
      fetch(req, server) {
        if (req.headers.get("upgrade") === "websocket" && server.upgrade(req))
          return;
        return new Response("Upgrade failed :(", { status: 500 });
      },
      websocket: {
        open(ws) {
          ws.send(JSON.stringify({ type: "event", event: "WSConnected" }));
        },
        message(ws, message) {
          if (typeof message !== "string") return;
          arrayConsole.onMessage(JSON.parse(message));
        },
      },
    });
  }

  public get bun() {
    return this.server;
  }
}

const server = new ArrayServer();

export default server;
