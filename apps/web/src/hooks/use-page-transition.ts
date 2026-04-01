import { createScope, animate } from "animejs";
import { useEffect, useRef } from "react";

export function usePageTransition<T extends HTMLElement>(
  triggerKey: string | undefined
) {
  const containerRef = useRef<T>(null);
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (scopeRef.current) {
      scopeRef.current.revert();
    }

    scopeRef.current = createScope({ root: containerRef.current });

    scopeRef.current.add(() => {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateX: [20, 0],
        duration: 250,
        ease: "outQuart",
      });
    });

    return () => {
      if (scopeRef.current) {
        scopeRef.current.revert();
        scopeRef.current = null;
      }
    };
  }, [triggerKey]);

  return containerRef;
}
