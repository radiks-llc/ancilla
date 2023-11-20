"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "@/lib/utils";

export function PromptForm() {
  const prompt = trpc.sendPrompt.useMutation();
  const [value, setValue] = useState("");

  const onSubmit = () => prompt.mutate({ path: "/app", payload: { value } });

  return (
    <div className="flex gap-16">
      <Textarea
        value={value}
        // @ts-ignore
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
