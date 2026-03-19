"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type LiveRefreshProps = {
  intervalMs?: number;
};

export function LiveRefresh({ intervalMs = 5000 }: LiveRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}
