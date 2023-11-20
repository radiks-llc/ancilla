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

let functions: FunctionProps[] = [];

export const useFunctions = () => {
  const getID = (func: FunctionProps) => {
    return func.path.replace("/", "_");
  };
  const fromPath = (path: string) => {
    return functions.find((func) => func.path === path);
  };
  return {
    fromID: (id: string) => functions.find((func) => getID(func) === id),
    fromPath,
    functions,
  };
};

export const setFunctions = (newFunctions: FunctionProps[]) => {
  functions = newFunctions;
};
