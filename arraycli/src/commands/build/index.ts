// Objective:
// Turn Project YAML files into JSON Build Output files.
import YAML from "js-yaml";
import { exit } from "process";
import { z } from "zod";
import pc from "picocolors";
import fs from "fs";
import { ProjectConfig, projectSchema, setProject } from "@/project";
import { FunctionProps, setFunctions } from "@/function";
import { DeviceProps, setDevices } from "@/device";

const dockerfileDevice = `
FROM nvidia/cuda:12.0.1-runtime-ubuntu22.04

ENV RUNPOD_TASK_ROOT=/var/task

ENV NVIDIA_DRIVER_CAPABILITIES compute,graphics,utility,video
RUN apt-get update && apt-get install -qq libglfw3-dev libgles2-mesa-dev freeglut3-dev

COPY requirements.txt* \${RUNPOD_TASK_ROOT}

RUN [ ! -f requirements.txt ] || pip install -r requirements.txt

COPY app.py \${RUNPOD_TASK_ROOT}

CMD [ "python3", "-u", "app.py" ]
`;

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
  return { out, err };
};

const startBuildingDevice = async (device: DeviceProps) => {
  const fnPath = `.ancilla/output/devices/${device}.dev`;
  const devicePath = device.handler.split(".")[0];
  makeDir(fnPath);
  copyFile(devicePath + ".py", `${fnPath}/app.py`);
  writeJSON(`${fnPath}/config.json`, device);
  Bun.write(`${fnPath}/Dockerfile`, dockerfileDevice);
};

const config: ProjectConfig = {
  routes: [],
};

const startBuildingRoute = async (func: FunctionProps) => {
  const functionName = func.path.replace("/", "_");
  const fnPath = `.ancilla/output/functions/${functionName}.func`;
  makeDir(fnPath);

  const handlerScript = func.handler.split(".")[0];
  const devices = await getDevicesFromPy(handlerScript);
  writeJSON(`${fnPath}/devices.json`, devices);
  writeJSON(`${fnPath}/config.json`, func);
  copyFile(handlerScript + ".py", `${fnPath}/app.py`);

  config.routes.push({
    src: func.path,
    dest: functionName,
  });

  return devices;
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

export const useBuilder = (path: string) => {
  const build = async () => {
    clearDir(".ancilla/");
    const project = await readAndParseConfigFile(path);

    const functions = project.router;

    const usedDevices = new Set(
      await Promise.all(project.router.map(startBuildingRoute))
    );

    const devices = project.devices;

    await Promise.all(Array.from(devices).map(startBuildingDevice));

    writeJSON(".ancilla/output/config.json", config);
    return {
      project,
      config,
      functions,
      devices,
    };
  };
  return { build };
};

export default async () => {
  const { build } = useBuilder("build.yaml");

  const { project, functions, devices } = await build();

  setProject(project);
  setFunctions(functions);
  setDevices(devices);
};
