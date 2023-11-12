import path from "path";
import { FunctionProps } from "@/function";
import { exit } from "process";

export interface StartWorkerInput {
  url: string;
  workerID: string;
  functionID: string;
  environment: Record<string, string>;
  handler: string;
  runtime: string;
}

interface ShouldBuildInput {
  file: string;
  functionID: string;
}

interface BuildInput {
  functionID: string;
  mode: "deploy" | "start";
  imageRoot: string;
  props: FunctionProps;
}

type RuntimeHandler = {
  startWorker: (worker: StartWorkerInput) => Promise<void>;
  stopWorker: (workerID: string) => Promise<void>;
  shouldBuild: (input: ShouldBuildInput) => boolean;
  canHandle: (runtime: string) => boolean;
  build: (input: BuildInput) => Promise<
    | {
        type: "success";
        handler: string;
        sourcemap?: string;
      }
    | {
        type: "error";
        errors: string[];
      }
  >;
};

export function isChild(parent: string, child: string) {
  const relative = path.relative(parent, child);
  return Boolean(
    relative && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

export const useContainerHandler = (): RuntimeHandler => {
  const containers = new Map<string, string>();
  const sources = new Map<string, string>();

  return {
    startWorker: async () => {},
    stopWorker: async () => {},
    shouldBuild: (input) => {
      const parent = sources.get(input.functionID);
      if (!parent) return false;
      return isChild(parent, input.file);
    },
    canHandle: (input) => input.startsWith("container"),
    build: async (input) => {
      console.log(input.imageRoot);
      sources.set(input.functionID, input.imageRoot);

      if (input.mode === "start") {
        try {
          await Bun.spawn(
            [
              `docker build`,
              `-t ancilla-dev:${input.functionID}`,
              ...(input.props.container?.file
                ? [`-f ${input.props.container.file}`]
                : []),
              ...Object.entries(input.props.container?.buildArgs || {}).map(
                ([k, v]) => `--build-arg ${k}=${v}`
              ),
              `.`,
            ],
            {
              cwd: input.imageRoot,
              env: {
                ...process.env,
              },
            }
          );
        } catch (ex) {
          return {
            type: "error",
            errors: [String(ex)],
          };
        }
      }

      if (input.mode === "deploy") {
        try {
          const platform =
            input.props.architecture === "arm_64"
              ? "linux/arm64"
              : "linux/amd64";
          const proc = await Bun.spawn(
            [
              `docker`,
              `build`,
              `-t`,
              `sst-build:${input.functionID}`,
              ...(input.props.container?.file
                ? [`-f ${input.props.container.file}`]
                : []),
              ...Object.entries(input.props.container?.buildArgs || {}).map(
                ([k, v]) => `--build-arg ${k}=${v}`
              ),
              `--platform`,
              `${platform}`,
              `.`,
            ],
            {
              cwd: input.imageRoot,
              env: {
                ...process.env,
              },
            }
          );

          console.log(
            [
              `docker`,
              `build`,
              `-t`,
              `ancilla-build:${input.functionID}`,
              ...(input.props.container?.file
                ? [`-f ${input.props.container.file}`]
                : []),
              ...Object.entries(input.props.container?.buildArgs || {}).map(
                ([k, v]) => `--build-arg ${k}=${v}`
              ),
              `--platform`,
              `${platform}`,
              `.`,
            ].join(" ")
          );

          const out = (await new Response(proc.stdout).text()).trim();
          const err = (await new Response(proc.stderr).text()).trim();
          if (err) {
            console.error("Failed to get devices from python file.");
            console.error(err);
            exit(1);
          }

          console.log(out);
        } catch (ex) {
          console.error(ex);
          return {
            type: "error",
            errors: [String(ex)],
          };
        }
      }

      return {
        type: "success",
        handler: "not required for container",
      };
    },
  };
};
