import { z } from "zod";
import { EventTypes, MessageTypes } from "../types";
import { ArrayConsole } from "../console";

export const prompt = z.object({
  type: z.literal(MessageTypes.Event),
  event: z.literal(EventTypes.Prompt),
  payload: z.string(),
});

export type Prompt = z.infer<typeof prompt>;

export function handlePrompt(stuff: Prompt, c: ArrayConsole) {
  console.log(stuff);
  return null;
}
