// Objective:
// Turn Project YAML files into JSON Build Output files.
import YAML from "js-yaml";
import { exit } from "process";
import { z } from "zod";
import pc from "picocolors";

const projectSchema = z.object({
  version: z.number(),
  name: z.string(),
  router: z.array(z.string()),
});

type Project = z.infer<typeof projectSchema>;

const getDevicesFromPy = async (path: string) => {
  const command = `python3 -c "from ancilla import get_devices(); from ${path} import *; print(get_devices())"`;
  const proc = Bun.spawn(command.split(" "));
  const out = await new Response(proc.stdout).text();
  console.log(out);
};

const startBuildingRoute = async (_: Project, route: string) => {
  const [container, ...rest] = route.split("/");
  const handlerFile = rest.pop();
  const path = rest.join("/");

  if (!container || !handlerFile || !path) {
    console.error(
      `${pc.red("The route")} ${pc.green(`[${route}]`)} ${pc.red(
        "is invalid."
      )}`
    );
    console.error(pc.green("The route should be in the format:"));
    console.error(pc.green("container/path/to/app.handler"));
    exit(1);
  }

  const devices = await getDevicesFromPy(`${route.split(".")[0]}.py`);
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
  const parsedProject = await readAndParseConfigFile(path);
  await Promise.all(
    parsedProject.router.map((route) =>
      startBuildingRoute(parsedProject, route)
    )
  );
};

export default async () => {
  await handleProject("./build.yaml");
};
