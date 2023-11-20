import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { Prompt, db, prompts } from "./db";
import EventEmitter from "events";
import { observable } from "@trpc/server/observable";
import { useBus } from "@/bus";

const ee = new EventEmitter();
const t = initTRPC.create();

export const router = t.router({
  onPrompt: t.procedure.subscription(() =>
    observable<Prompt>((emit) => {
      const bus = useBus();
      const onPrompt = (data: Prompt) => {
        emit.next(data);
        bus.publish("host.invoke", {
          path: data.path,
          payload: data.payload,
        });
      };
      ee.on("prompt", onPrompt);
      return () => ee.off("prompt", onPrompt);
    })
  ),
  // maybe an http endpoint for devices. functions are websockets, devices are http
  getPrompts: t.procedure.query(() => db.select().from(prompts)),
  sendPrompt: t.procedure
    .input(
      z.object({
        path: z.string(),
        payload: z.any(),
      })
    )
    .mutation(async (opts) => {
      const prompt: Prompt = (
        await db
          .insert(prompts)
          .values({ payload: opts.input.payload, path: opts.input.path })
          .returning()
      )[0];
      ee.emit("prompt", prompt);
    }),
});

export type Router = typeof router;
