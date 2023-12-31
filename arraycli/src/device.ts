import { z } from "zod";
import { lazy } from "./util/lazy";

export const deviceSchema = z.object({
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

export type DeviceProps = z.infer<typeof deviceSchema>;

let devices: DeviceProps[] = [];

export const useDevices = lazy(() => devices);

export const setDevices = (newDevices: DeviceProps[]) => {
  devices = newDevices;
};
