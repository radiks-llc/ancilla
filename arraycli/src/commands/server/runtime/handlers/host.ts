import { useBus } from "@/bus";
import { useFunctions } from "@/function";
import { Subprocess } from "bun";

export type HostPayload = {
  path: string;
  payload: any;
};

declare module "@/bus" {
  export interface Events {
    "host.invoke": HostPayload;
    "host.invoke.result": {
      path: string;
      output: {
        response: string;
        stdout: string;
        stderr: string;
        handlerReturn: any;
      };
    };
  }
}

let nextPort = 8080;

export const useHostHandler = () => {
  const bus = useBus();
  const { fromPath, functions } = useFunctions();
  const processes = new Map<string, Subprocess<"ignore", "pipe", "inherit">>();

  // const installRequirements = async (txtPath: string) => {
  //   if (await Bun.file(txtPath).exists()) {
  //     const proc = Bun.spawn(["pip", "install", "-r", txtPath]);
  //     const stdout = await new Response(proc.stdout).text();
  //     const stderr = await new Response(proc.stderr).text();
  //     return { stdout, stderr };
  //   }
  // };

  // const serverStarted = async (stdout: ReadableStream<Uint8Array>) => {
  //   for await (const chunk of stdout) {
  //     console.log({ chunk });
  //     const str = new TextDecoder().decode(chunk);
  //     if (str.includes("Running Ancilla API")) {
  //       return;
  //     }
  //   }
  // };

  const invoke = async ({ path, payload }: HostPayload) => {
    const fn = fromPath(path);
    if (!fn) {
      throw new Error(`Function ${path} not found.`);
    }

    let proc = processes.get(path);
    if (!proc) {
      const { handler } = fn;
      const [handlerFile] = handler.split(".");

      proc = await Bun.spawn(["python", handlerFile + ".py"], {
        env: {
          ...process.env,
          ANCILLA_ENV: "dev",
          LOG_LEVEL: "DEBUG",
          PYTHONUNBUFFERED: "TRUE",
          PORT: `${nextPort}`,
        },
      });
      processes.set(path, proc);
    }

    // Readable stream
    // wait for process to print "Uvicorn running on"
    // await serverStarted(proc.stdout);
    // i give up, uvicorn is not printing anything to stdout probably because it's
    // buffering it. i'm just going to wait a second and hope that's enough time
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const fetchResult = await fetch(`http://localhost:${nextPort}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(payload),
      });

      const stdout = (await new Response(proc.stdout).text()).trim();
      const stderr = await new Response(proc.stderr).text();

      console.log({ stdout, stderr });
      const handlerReturn = JSON.parse(stdout);
      const response = await fetchResult.text();
      return { response, stdout, stderr, handlerReturn };
    } finally {
      // nextPort += 1;
      // proc.kill();
      // processes.delete(path);
    }
  };

  bus.subscribe("host.invoke", async ({ properties: { path, payload } }) => {
    const output = await invoke({ path, payload });
    bus.publish("host.invoke.result", { path, output });
  });

  bus.subscribe("host.invoke.result", ({ properties: { path, output } }) => {
    console.log({ path, output });
  });

  return { invoke };
};
