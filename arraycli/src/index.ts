import commandRunServer from "./commands/server";
import minimist from "minimist";

let commands = minimist(process.argv.slice(2));

switch (commands._[0]) {
  case "start":
    commandRunServer();
    break;
  case "build":
    console.log("build");
    break;
  default:
    console.log("Command not found.");
    break;
}
