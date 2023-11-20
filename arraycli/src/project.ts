import { z } from "zod";
import { functionSchema } from "@/function";
import { deviceSchema } from "./device";

type Route = {
  src: string;
  dest: string;
};

export type ProjectConfig = {
  routes: Route[];
};

export const projectSchema = z
  .object({
    version: z.number(),
    name: z.string(),
    devices: z.array(deviceSchema).optional().default([]),
    router: z.array(functionSchema),
  })
  .refine((data) => {
    if (data.version !== 1) {
      throw new Error("Invalid version number.");
    }
    return true;
  })
  .refine(
    (data) =>
      new Set(data.router.map((route) => route.path)).size ===
      data.router.length,
    {
      message: "Duplicate paths in router",
    }
  );

export type Project = z.infer<typeof projectSchema>;

let project: Project;

export const useProject = () => {
  if (project === null) throw new Error("Project not initialized");
  return project;
};

export const setProject = (newProject: Project) => {
  project = newProject;
};
