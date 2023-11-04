import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { Prompt, db, prompts } from "./db";
import EventEmitter from "events";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();
const t = initTRPC.create();

export const router = t.router({
  onPrompt: t.procedure.subscription(() =>
    observable<Prompt>((emit) => {
      console.log("subbed");
      const onPrompt = (data: Prompt) => {
        console.log("subbed");
        emit.next(data);
      };
      ee.on("prompt", onPrompt);
      return () => ee.off("prompt", onPrompt);
    })
  ),
  getPrompts: t.procedure.query(() => db.select().from(prompts)),
  sendPrompt: t.procedure
    .input(
      z.object({
        payload: z.object({}).passthrough(),
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
