import pc from "picocolors";
import startDevServer from "./server";
import "@/db";

export default async () => {
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
