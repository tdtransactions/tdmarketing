"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When pathname or searchParams change, show the bar briefly
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // We also want to catch clicks on links before the pathname actually changes
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && anchor.href && !anchor.href.includes("#") && anchor.target !== "_blank") {
        setVisible(true);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="h-[3px] bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-loading-bar" />
      <style jsx global>{`
        @keyframes loading-bar {
          0% { width: 0; opacity: 1; }
          50% { width: 70%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
