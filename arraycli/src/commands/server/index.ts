import pc from "picocolors";
import startDevServer from "./server";
import "./db";
import { useHandlers } from "./runtime/handlers";
import { useBuilder } from "../build";
import { setProject } from "@/project";
import { setFunctions } from "@/function";
import { setDevices } from "@/device";

export const useRuntimeServerConfig = async () => {
  return {
    API_VERSION: "v1",
    url: `wss://localhost:12343`, // todo: make this configurable
  };
};

export default async () => {
  useHandlers();
  const { build } = useBuilder("build.yaml");
  const { project, functions, devices } = await build();

  setProject(project);
  setFunctions(functions);
  setDevices(devices);

  const server = startDevServer();
  const message = `\
  ${pc.green(`
  ⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⣶⣶⣶⣶⣶⣶⣶⣶⣦⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⣀⣴⣾⠿⠿⠛⠛⠋⠉⠉⠉⠛⠛⠛⠿⢿⣿⣿⣿⣦⣄⠀⠀⠀⠀⠀
  ⠀⠀⣠⣾⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣿⣷⡄⠀⠀⠀
  ⠰⣶⣿⡏⠀⠀⠀⠀⠀⠀⠀⣠⣶⣶⣦⣄⣀⡀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣄⣀⣀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠿⠿⠿⠋⠉⠁⠀⠀⠀⠀⢀⣿⣿⣿⣿⠋⠉⠉
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⣿⣿⣿⠋⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⢠⣾⣶⣶⣤⣤⣤⣤⣤⣤⣴⣶⣾⣿⣿⣿⣿⠿⠋⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠛⠛⠛⢿⣿⡿⠿⠿⠿⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀`)}

  ${pc.bold("Array Server Started.")}
  Web:        ${pc.underline(
    pc.blue(`https://${server.bun.hostname}:${server.bun.port}`)
  )}
  Websockets: ${pc.underline(
    pc.blue(`wss://${server.bun.hostname}:${server.bun.port}`)
  )} (debug mode)
  `;

  console.log(message);
};
