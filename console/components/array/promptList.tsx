"use client";

import React from "react";
import usePrompts from "@/lib/array/use-prompts";
import { Prompt } from "@cli/db";

export default function PromptList() {
  const { prompts } = usePrompts();

  return (
    <div>
      {prompts?.map((prompt: Prompt) => (
        <div key={prompt.id}>
          <pre>{JSON.stringify(prompt.payload)}</pre>
          <div>{prompt.createdAt}</div>
        </div>
      ))}
    </div>
  );
}
