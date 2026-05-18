"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Force instant scroll to top on every single page transition
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
      document.body.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    } catch (err) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
