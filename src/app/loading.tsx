import React from "react";
import { VittalBrandLoader } from "@/components/VittalBrandLoader";

export default function GlobalLoading() {
  return (
    <VittalBrandLoader
      fullScreen
      label="Loading Vittal Lifestyle…"
    />
  );
}
