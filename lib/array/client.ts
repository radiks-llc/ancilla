import { z } from "zod";
import { clientEvent } from "@cli/events";
import { EventTypes, MessageTypes } from "@/arraycli/src/types";

/**
 * ArrayClient
 *
 * This has the responsibility of maintaining a WebSocket client to
 * 12343 which is how the console talks to your local machine. It
 * will also be responsible for sending and receiving messages
 * from the server.
 *
 * @export
 */
export class ArrayClient {
  private readonly client: WebSocket;
  private readonly handlers: { [key: string]: (data: any) => void } = {};
  private readonly queue: string[] = [];

  private lastHeartbeat: number = Date.now();
  private heartbeatInterval?: number;
  private connected: boolean = false;
  private connectionPromise?: Promise<void>;

  /**
   * Creates an instance of ArrayClient.
   * @memberof ArrayClient
   */
  constructor() {
    this.client = new WebSocket("ws://localhost:12343");
    this.client.onopen = () => {
      this.connected = true;
      this.queue.forEach((msg) => this.client.send(msg));
      this.queue.length = 0;
    };
    this.client.onmessage = (msg) => {
      if (typeof msg.data !== "string") throw new Error("Expected string data");
      const data = JSON.parse(msg.data);
      if (data.type === "event") {
        if (this.handlers[data.event]) {
          if (data.type === MessageTypes.Heartbeat)
            this.lastHeartbeat = Date.now();

          this.handlers[data.event](data.data);
        }
      }
    };
    this.client.onerror = (err) => {
      console.error(err);
    };
    this.client.onclose = () => {
      this.connected = false;
    };
  }

  /**
   * Returns the last time a heartbeat was received from the server
   */
  public getLastHeartbeat(): number {
    return this.lastHeartbeat;
  }

  /**
   * Connects to the server and returns a promise that resolves
   * when the connection is established.
   *
   * @returns {Promise<void>}
   * @memberof ArrayClient
   */
  public connect(): Promise<void> {
    if (this.connected) {
      // @ts-ignore
      this.heartbeatInterval = window.setInterval(() => {
        this.send({ type: MessageTypes.Heartbeat });
      }, 1000);

      return Promise.resolve();
    } else if (this.connectionPromise) {
      return this.connectionPromise;
    } else {
      this.connectionPromise = new Promise((resolve) => {
        this.client.onopen = () => {
          this.connected = true;
          resolve();
        };
      });
      return this.connectionPromise;
    }
  }

  /**
   * Sends a message to the server.
   *
   * @param {string} msg
   * @memberof ArrayClient
   */
  public send(msg: z.infer<typeof clientEvent>): void {
    if (this.connected) {
      this.client.send(JSON.stringify(msg));
    } else {
      if (msg.type === MessageTypes.Event) this.queue.push(JSON.stringify(msg));
    }
  }

  /**
   * Is the client connected to the server?
   * @readonly
   * @type {boolean}
   */
  public get isConnected(): boolean {
    return this.connected;
  }

  /**
   * Adds an event handler for a specific event.
   *
   * @param {string} event
   * @param {(data: any) => void} handler
   * @memberof ArrayClient
   */
  public addHandler(event: string, handler: (data: any) => void): void {
    this.handlers[event] = handler;
  }

  /**
   * Removes an event handler for a specific event.
   *
   * @param {(data: any) => void} handler
   * @memberof ArrayClient
   */
  public removeHandler(handler: (data: any) => void): void {
    for (const event in this.handlers) {
      if (this.handlers[event] === handler) {
        delete this.handlers[event];
      }
    }
  }
}
