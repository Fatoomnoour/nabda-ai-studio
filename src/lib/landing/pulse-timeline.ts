// Scroll-progress timeline for the A1 NABDA pulse animation (pure, testable).
export type Point = { x: number; y: number };
export type Stage = "rest" | "launch" | "contact" | "rebound" | "landing" | "sparkle" | "alive";

// The dot's original logo home: floating above the bowl's center, level with the peak top (as in the official mark).
export const HOME: Point = { x: 342, y: 52 };
export const PEAK: Point = { x: 176, y: 56 };
export const REBOUND: Point = { x: 436, y: 30 };

export function stageAt(p: number): Stage {
  if (p < 0.08) return "rest";
  if (p < 0.24) return "launch";
  if (p < 0.34) return "contact";
  if (p < 0.52) return "rebound";
  if (p < 0.66) return "landing";
  if (p < 0.78) return "sparkle";
  return "alive";
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const quad = (a: Point, c: Point, b: Point, t: number): Point => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

export interface Frame {
  dot: Point;
  stretch: number; // >1 elongates the dot while flying
  tipDrop: number; // spring compression of the right tip
  peakBend: number; // elastic deformation of the tall peak, 0..1
  sparkle: number; // 0..1 opacity
  ecg: number; // 0..1 drawn fraction of the living pulse
}

export function frameAt(p: number): Frame {
  const s = stageAt(p);
  const motion = p > 0.08 && p < 0.66 ? Math.sin(Math.PI * seg(p, 0.08, 0.66)) : 0;
  const tipDrop = 8 * motion;
  let dot = HOME;
  let stretch = 1;
  if (s === "launch") {
    const t = ease(seg(p, 0.08, 0.24));
    dot = quad(HOME, { x: 260, y: 0 }, PEAK, t);
    stretch = 1 + 0.35 * Math.sin(Math.PI * t);
  } else if (s === "contact") {
    const t = seg(p, 0.24, 0.34);
    const contact = Math.sin(Math.PI * t);
    dot = { x: PEAK.x - 14 * contact, y: PEAK.y + 16 * contact };
  } else if (s === "rebound") {
    const t = ease(seg(p, 0.34, 0.52));
    dot = quad(PEAK, { x: 300, y: -4 }, REBOUND, t);
    stretch = 1 + 0.2 * Math.sin(Math.PI * t);
  } else if (s === "landing") {
    const raw = seg(p, 0.52, 0.66);
    const t = ease(raw);
    const base = quad(REBOUND, { x: 404, y: 16 }, HOME, t);
    const settle = raw > 0.8 ? 5 * Math.sin(Math.PI * seg(raw, 0.8, 1)) : 0;
    dot = { x: base.x, y: base.y + settle };
  }
  const peakBend = s === "contact" ? Math.sin(Math.PI * seg(p, 0.24, 0.34)) : 0;
  const sparkle = p >= 0.66 && p < 0.73 ? 1 - ease(seg(p, 0.66, 0.73)) : 0;
  const ecg = ease(seg(p, 0.78, 0.88));
  return { dot, stretch, tipDrop, peakBend, sparkle, ecg };
}

/** Preserve the existing pulse; grow its left baseline into an attached ECG after settling. */
export function pulsePath(tipDrop: number, peakBend: number, ecg = 0): string {
  const px = PEAK.x - 14 * peakBend;
  const py = PEAK.y + 16 * peakBend;
  const progress = clamp(ecg);
  const startX = 40 - 40 * progress;
  const width = 150 - startX;
  const wave: [number, number][] = [
    [0, 0], [0.3, 0], [0.4, -8], [0.48, 0], [0.56, 10], [0.64, -26], [0.72, 12], [0.8, 0], [1, 0],
  ];
  const baseline = wave.map(([x, y]) => `L${startX + width * x} ${200 + progress * y}`).join(" ");
  return `M${startX} 200 ${baseline} L${px} ${py} L200 200 L228 238 L244 160 L258 226 Q330 300 410 238 Q440 212 442 ${180 + tipDrop} L500 ${178 + tipDrop}`;
}