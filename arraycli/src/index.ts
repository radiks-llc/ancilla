import minimist from "minimist";

const commands = minimist(process.argv.slice(2));

switch (commands._[0]) {
  case "start":
    const { default: commandRunServer } = await import("./commands/server");
    await commandRunServer();
    break;
  case "build":
    const { default: commandBuild } = await import("./commands/build");
    commandBuild();
    break;
  default:
    console.log("Command not found.");
    break;
}
