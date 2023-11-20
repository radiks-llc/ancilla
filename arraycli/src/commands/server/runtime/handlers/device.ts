export type DevicePayload = {
  name: string;
  args: string[];
};

declare module "@/bus" {
  export interface Events {
    "device.invoke": {
      name: string;
      input: DevicePayload;
    };
  }
}

export const useDeviceHandler = () => {
  const invoke = (payload: DevicePayload) => {
    console.log(`invoked device ${payload.name}`);
  };

  return {
    invoke,
  };
};
