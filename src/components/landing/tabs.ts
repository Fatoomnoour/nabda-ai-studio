import type { KeyboardEvent } from "react";

/** Roving keyboard support for an ARIA tablist; arrow keys follow reading direction. */
export function onTabKeyDown(
  e: KeyboardEvent<HTMLElement>,
  index: number,
  count: number,
  select: (i: number) => void,
) {
  const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
  const forward = rtl ? "ArrowLeft" : "ArrowRight";
  const back = rtl ? "ArrowRight" : "ArrowLeft";
  let next: number;
  if (e.key === forward || e.key === "ArrowDown") next = index + 1;
  else if (e.key === back || e.key === "ArrowUp") next = index - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = count - 1;
  else return;
  e.preventDefault();
  next = (next + count) % count;
  select(next);
  const tabs = e.currentTarget.closest('[role="tablist"]')?.querySelectorAll<HTMLElement>('[role="tab"]');
  tabs?.[next]?.focus();
}
