import { z } from "zod";
import { heartbeat } from "./handleHeartbeat";
import { prompt } from "./handlePrompt";
import { MessageTypes, EventTypes } from "../types";

export const WSConnected = z.object({
  type: z.literal(MessageTypes.Event),
  event: z.literal(EventTypes.WSConnected),
});

export const wsConnected: z.infer<typeof WSConnected> = {
  type: MessageTypes.Event,
  event: EventTypes.WSConnected,
};

export const WSDisconnected = z.object({
  type: z.literal(MessageTypes.Event),
  event: z.literal(EventTypes.WSDisconnected),
});

export const wsDisconnected: z.infer<typeof WSDisconnected> = {
  type: MessageTypes.Event,
  event: EventTypes.WSDisconnected,
};

export const serverEvent = z.discriminatedUnion("event", [
  WSConnected,
  WSDisconnected,
  heartbeat,
]);

export const clientEvent = z.discriminatedUnion("event", [heartbeat, prompt]);
