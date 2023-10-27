import { z } from "zod";
import { ArrayServer } from "./server";
import { ServerWebSocket } from "bun";
import { clientEvent, serverEvent, wsConnected } from "./events/index";
import { EventTypes, MessageTypes } from "./types";
import { handleHeartbeat } from "./events/handleHeartbeat";
import { handlePrompt } from "./events/handlePrompt";

export class ArrayConsole {
  private readonly server: ArrayServer;
  private readonly pubQueue: z.infer<typeof serverEvent>[];

  private websocket?: ServerWebSocket;

  constructor(server: ArrayServer) {
    this.server = server;
    this.pubQueue = [];
  }

  public onOpen(websocket: ServerWebSocket) {
    this.websocket = websocket;
    this.publish(wsConnected);
  }

  public onMessage(event: z.infer<typeof clientEvent>) {
    console.log(event);
    if (event.type === MessageTypes.Event) {
      if (event.event === EventTypes.Heartbeat) handleHeartbeat(event, this);
      if (event.event === EventTypes.Prompt) handlePrompt(event, this);
    }
  }

  public sendMessage(event: z.infer<typeof serverEvent>) {
    this.publish(event);
  }

  private publish(event: z.infer<typeof serverEvent>) {
    if (this.websocket) {
      for (const pubEvent of this.pubQueue) {
        this.websocket.send(JSON.stringify(serverEvent.parse(pubEvent)));
      }

      this.websocket.send(JSON.stringify(serverEvent.parse(event)));
    } else {
      this.pubQueue.push(event);
    }
  }
}
