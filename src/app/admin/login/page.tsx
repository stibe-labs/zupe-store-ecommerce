"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signin?redirect=/admin&notice=Admin%20authentication%20required");
  }, [router]);

  return null;
}
