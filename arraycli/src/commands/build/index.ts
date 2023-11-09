// Objective:
// Turn Project YAML files into JSON Build Output files.
import YAML from "js-yaml";
import { exit } from "process";
import { z } from "zod";
import pc from "picocolors";

const projectSchema = z.object({
  version: z.number(),
  name: z.string(),
  functions: z.array(z.string()),
});

type Project = z.infer<typeof projectSchema>;

const startBuildingFunction = async (
  project: Project,
  functionPath: string
) => {};

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
    parsedProject.functions.map((functionPath) =>
      startBuildingFunction(parsedProject, functionPath)
    )
  );
};

export default async () => {
  await handleProject("./build.yaml");
};
