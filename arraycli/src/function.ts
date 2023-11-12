import { z } from "zod";

export const functionSchema = z.object({
  path: z.string(),
  handler: z.string(),
  memory: z.number().optional().default(128),
  runtime: z.string().optional().default("container"),
  architecture: z.enum(["amd_64", "arm_64"]).optional().default("arm_64"),
  container: z
    .object({
      buildArgs: z.record(z.string()).optional(),
      file: z.string().optional(),
    })
    .optional(),
});

export type FunctionProps = z.infer<typeof functionSchema>;
