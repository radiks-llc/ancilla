import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createTRPCReact } from "@trpc/react-query";
import type { Router } from "@cli/router";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const trpc = createTRPCReact<Router>();
