import { z } from "zod";
import { EventTypes, MessageTypes } from "../types";
import { ArrayConsole } from "../console";
import { db, prompts } from "../db";

export const prompt = z.object({
  type: z.literal(MessageTypes.Event),
  event: z.literal(EventTypes.Prompt),
  payload: z.string(),
});

export type Prompt = z.infer<typeof prompt>;

export async function handlePrompt(stuff: Prompt, c: ArrayConsole) {
  await db.insert(prompts).values({
    payload: stuff.payload,
  });
  return null;
}
