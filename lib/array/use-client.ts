import { ArrayContext } from "@/components/array/connection";
import React from "react";

export default function useArrayClient() {
  return React.useContext(ArrayContext);
}
