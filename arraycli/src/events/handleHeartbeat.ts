import { z } from "zod";
import { EventTypes, MessageTypes } from "../types";
import { ArrayConsole } from "../console";

export const heartbeat = z.object({
  type: z.literal(MessageTypes.Event),
  event: z.literal(EventTypes.Heartbeat),
});

export type Heartbeat = z.infer<typeof heartbeat>;

export function handleHeartbeat(_: Heartbeat, console: ArrayConsole) {
  console.sendMessage({
    type: MessageTypes.Event,
    event: EventTypes.Heartbeat,
  });
}
