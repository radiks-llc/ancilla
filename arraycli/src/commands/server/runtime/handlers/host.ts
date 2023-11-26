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
      };
    };
  }
}

let nextPort = 8080;

export const useHostHandler = () => {
  const bus = useBus();
  const { fromPath, functions } = useFunctions();
  const processes = new Map<string, Subprocess<"ignore", "pipe", "pipe">>();

  // const installRequirements = async (txtPath: string) => {
  //   if (await Bun.file(txtPath).exists()) {
  //     const proc = Bun.spawn(["pip", "install", "-r", txtPath]);
  //     const stdout = await new Response(proc.stdout).text();
  //     const stderr = await new Response(proc.stderr).text();
  //     return { stdout, stderr };
  //   }
  // };

  const serverStarted = async (stdout: ReadableStream<Uint8Array>) => {
    for await (const chunk of stdout) {
      const str = new TextDecoder().decode(chunk);
      if (str.includes("Uvicorn running on http://")) {
        return;
      }
    }
  };

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
        shell: true,
        stderr: "pipe",
        stdout: "pipe",
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

    await serverStarted(proc.stderr);

    let response = null;

    try {
      const fetchResult = await fetch(`http://0.0.0.0:${nextPort}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(payload),
      });

      response = await fetchResult.text();
    } catch (err) {
      console.log(err);
    } finally {
      nextPort += 1;
      proc.kill();
      processes.delete(path);
    }

    const stdout = (await new Response(proc.stdout).text()).trim();
    const stderr = await new Response(proc.stderr).text();

    return { response, stdout, stderr };
  };

  bus.subscribe("host.invoke", async ({ properties: { path, payload } }) => {
    const output = await invoke({ path, payload });
    bus.publish("host.invoke.result", { path, output });
  });

  bus.subscribe("host.invoke.result", ({ properties: { path, output } }) => {
    // console.log({ path, output });
  });

  return { invoke };
};
