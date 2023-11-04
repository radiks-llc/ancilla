import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { Prompt, db, prompts } from "./db";
import EventEmitter from "events";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();
const t = initTRPC.create();

export const router = t.router({
  onAdd: t.procedure.subscription(() => {
    return observable<Prompt>((emit) => {
      const onPrompt = (data: Prompt) => emit.next(data);
      ee.on("prompt", onPrompt);
      return () => ee.off("prompt", onPrompt);
    });
  }),
  getPrompts: t.procedure
    .input(z.object({}))
    .query(() => db.select().from(prompts)),
  sendPrompt: t.procedure
    .input(
      z.object({
        payload: z.string(),
      })
    )
    .mutation(async (opts) => {
      const prompt: Prompt = (
        await db
          .insert(prompts)
          .values({ payload: opts.input.payload })
          .returning()
      )[0];
      ee.emit("prompt", prompt);
    }),
});

export type Router = typeof router;
