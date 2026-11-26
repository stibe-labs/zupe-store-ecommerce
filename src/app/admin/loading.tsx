import React from "react";
import { VittalBrandLoader } from "@/components/VittalBrandLoader";

export default function AdminLoading() {
  return (
    <VittalBrandLoader
      fullScreen
      label="Loading Enterprise ERP…"
      sublabel="Vittal Lifestyle Command"
    />
  );
}
