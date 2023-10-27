"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useArrayClient from "@/lib/array/use-client";
import { EventTypes, MessageTypes } from "@cli/types";

export function PromptForm() {
  const client = useArrayClient();
  const [value, setValue] = useState("");

  const onSubmit = () => {
    client.send({
      type: MessageTypes.Event,
      event: EventTypes.Prompt,
      payload: value,
    });
  };

  return (
    <div className="flex gap-16">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
