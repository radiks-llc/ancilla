import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing
import { PayloadSchema } from "@cli/types";

export interface Store {
  payloads: PayloadSchema[];
  handleCrappySync: (payloads: PayloadSchema[]) => void;
}

export const useStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        payloads: [],
        handleCrappySync: (payloads) => set({ payloads }),
      }),
      {
        name: "payloads",
      }
    )
  )
);
