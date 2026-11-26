"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VittalBrandLoader } from "@/components/VittalBrandLoader";

export default function BagPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cart");
  }, [router]);

  return (
    <VittalBrandLoader
      fullScreen
      label="Opening your shopping bag…"
    />
  );
}
