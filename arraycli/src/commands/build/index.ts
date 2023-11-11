// Objective:
// Turn Project YAML files into JSON Build Output files.
import YAML from "js-yaml";
import { exit } from "process";
import { z } from "zod";
import pc from "picocolors";
import fs from "fs";

const dockerfileHost = `
FROM public.ecr.aws/lambda/python:3.11
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/

ENV LAMBDA_TASK_ROOT=/var/task

COPY requirements.txt \${LAMBDA_TASK_ROOT}

RUN pip install -r requirements.txt

COPY app.py \${LAMBDA_TASK_ROOT}

CMD [ "app.handler" ]
`;

const dockerfileDevice = `
FROM nvidia/cuda:12.0.1-runtime-ubuntu22.04

ENV RUNPOD_TASK_ROOT=/var/task

ENV NVIDIA_DRIVER_CAPABILITIES compute,graphics,utility,video
RUN apt-get update && apt-get install -qq libglfw3-dev libgles2-mesa-dev freeglut3-dev

COPY requirements.txt \${RUNPOD_TASK_ROOT}

RUN pip install -r requirements.txt

COPY app.py \${RUNPOD_TASK_ROOT}

CMD [ "python3", "-u", "app.py" ]
`;

const functionSchema = z.object({
  path: z.string(),
  handler: z.string(),
  memory: z.number().optional(),
});

type Function = z.infer<typeof functionSchema>;

const projectSchema = z
  .object({
    version: z.number(),
    name: z.string(),
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

const clearDir = (path: string) => {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true });
  }
};

const makeDir = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

const writeJSON = (path: string, data: unknown) => {
  Bun.write(path, JSON.stringify(data, null, 2));
};

const copyFile = async (src: string, dest: string) => {
  Bun.write(dest, await Bun.file(src).text());
};

type Project = z.infer<typeof projectSchema>;

const getDevicesFromPy = async (path: string) => {
  const pyPath = path.replace("/", ".");
  const proc = Bun.spawn([
    "python",
    "-c",
    `from ancilla import get_devices; from ${pyPath} import *; print(get_devices())`,
  ]);
  const out = (await new Response(proc.stdout).text()).trim();
  const err = (await new Response(proc.stderr).text()).trim();
  if (err) {
    console.error("Failed to get devices from python file.");
    console.error(err);
    exit(1);
  }
  return JSON.parse(out);
};

const startBuildingDevice = async (device: string) => {
  const fnPath = `.ancilla/output/devices/${device}.dev`;
  makeDir(fnPath);
  copyFile(device + "/app.py", `${fnPath}/app.py`);
  Bun.write(`${fnPath}/Dockerfile`, dockerfileDevice);
};

const startBuildingRoute = async (config: ProjectConfig, func: Function) => {
  const functionName = func.path.replace("/", "_");
  const fnPath = `.ancilla/output/functions/${functionName}.func`;
  makeDir(fnPath);
  const [container, ...rest] = func.handler.split("/");
  const handlerFile = rest.pop();

  if (!container || !handlerFile) {
    console.error(
      `Error: ${pc.red("The route")} ${pc.green(`[${func.path}]`)} ${pc.red(
        "is invalid."
      )}`
    );
    console.info("The route should be in the format:");
    console.info(pc.green("    container/path/to/app.handler"));
    exit(1);
  }

  const handlerScript = func.handler.split(".")[0];
  const devices = await getDevicesFromPy(handlerScript);
  writeJSON(`${fnPath}/devices.json`, devices);
  copyFile(handlerScript + ".py", `${fnPath}/app.py`);
  Bun.write(`${fnPath}/Dockerfile`, dockerfileHost);

  config.routes.push({
    src: func.path,
    dest: functionName,
  });

  return devices;
};

type Route = {
  src: string;
  dest: string;
};

type ProjectConfig = {
  routes: Route[];
};

const readAndParseConfigFile = async (path: string) => {
  const text = await Bun.file(path).text();
  const project = YAML.load(text) as unknown;

  try {
    return projectSchema.parse(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      let message = `${pc.red("The project")} ${pc.green(
        "[build.yaml]"
      )} ${pc.red("file is invalid.")}`;
      for (const issue of err.issues) {
        message += `\n${pc.white(`   ${issue.path}`)} ${pc.blue(
          ` --> ${issue.message}`
        )}`;
      }
      console.error(message);
    }
    exit(1);
  }
};

const handleProject = async (path: string) => {
  clearDir(".ancilla/");
  const parsedProject = await readAndParseConfigFile(path);
  const config: ProjectConfig = {
    routes: [],
  };
  const devices = new Set(
    await Promise.all(
      parsedProject.router.map((route) => startBuildingRoute(config, route))
    )
  );

  await Promise.all(Array.from(devices).map(startBuildingDevice));

  writeJSON(".ancilla/output/config.json", config);
};

export default async () => {
  await handleProject("./build.yaml");
};
