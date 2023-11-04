import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing

export interface Store {}

export const useStore = create<Store>()(
  devtools(
    persist((set) => ({}), {
      name: "payloads",
    })
  )
);
