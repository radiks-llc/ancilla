import pc from "picocolors";
import server from "./server";
import "./db";

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
