import { useEffect, type RefObject } from "react";

/**
 * Adds `is-visible` to `[data-reveal]` and `[data-stagger]` elements once they enter the viewport.
 * Content stays visible without JavaScript or with reduced motion: hiding only starts after the
 * root gets `reveal-ready`.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-reveal], [data-stagger]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    root.classList.add("reveal-ready");
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}
