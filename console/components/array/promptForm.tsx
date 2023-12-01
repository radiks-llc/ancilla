"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "@/lib/utils";
import { FunctionProps } from "@cli/function";

export function PromptForm() {
  const prompt = trpc.sendPrompt.useMutation();
  const [value, setValue] = useState("");
  const { data } = trpc.getFunctions.useQuery<FunctionProps[]>();

  const onSubmit = () => prompt.mutate({ path: "/app", payload: { value } });

  // {data?.map((func) => (
  //   <div key={func.path}>
  //     <p>{func.handler}</p>
  //     <p>{func.path}</p>
  //   </div>
  // ))}

  return (
    <section className="flex-1 p-8">
      <h3 className="text-2xl font-semibold mb-4"></h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="endpoint-url">Endpoint URL</Label>
          <Input id="endpoint-url" placeholder="Enter endpoint URL" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="json-query">JSON Query</Label>
          <Textarea
            className="min-h-[100px]"
            id="json-query"
            placeholder="Enter your JSON query"
            value={value}
            // @ts-ignore
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button onClick={onSubmit}>Submit</Button>
      </div>
    </section>
  );
}
