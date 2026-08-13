/**
 * Skip pose table — the mascot's five states as data.
 *
 * Skip is built from the 13 road-line dashes of the Dryvway "D". Every pose is
 * a full description of where each of the 13 pieces (plus eyes, mouth, shadow)
 * sits; the transition between any two poses is free — CSS interpolates.
 * Pieces a pose doesn't need are parked at opacity 0, never removed.
 *
 * Geometry is ported 1:1 from the approved standalone prototype. Coordinates
 * are in the 440×340 viewBox space.
 */

export const DASH_COUNT = 13

/** SVG viewBox the pose coordinates live in. */
export const VIEW = { w: 440, h: 340 } as const

/**
 * Centre + radius of the loading ring. The spinning layer's transform-origin
 * is set inline from this constant in SkipMascot.tsx so CSS and JS can't drift.
 */
export const RING = { x: 220, y: 174, r: 96 } as const

/** Default quadratic control-point depth of the smile ("M -26 0 Q 0 K 26 0"). */
export const MOUTH_K_DEFAULT = 22

export type SkipPose = 'idle' | 'searching' | 'loading' | 'confirmed' | 'celebrating' | 'waving' | 'sleeping'

export interface PieceState {
  x: number
  y: number
  /** rotation, degrees */
  r?: number
  s?: number
  o?: number
}

export interface Pose {
  dashes: PieceState[]
  eyeL: PieceState
  eyeR: PieceState
  mouth: PieceState
  /** Smile curve depth override (loading flattens the smile). */
  mouthK?: number
  shadow: { x: number; y: number; sx: number; o: number }
  /** Eye-highlight offset — where Skip is looking. */
  look: { x: number; y: number }
  /** Default status copy; callers override per placement. */
  title: string
  sub: string
}

const D = (x: number, y: number, r = 0, s = 1, o = 1): PieceState => ({ x, y, r, s, o })

const ray = (cx: number, cy: number, deg: number, dist: number, s: number): PieceState => {
  const a = (deg * Math.PI) / 180
  return D(cx + dist * Math.cos(a), cy + dist * Math.sin(a), deg, s, 1)
}

// Checkmark: two arms meeting at vertex V. Each arm's innermost dash is placed
// so its rounded end-cap circle sits exactly on V, so the elbow joins
// seamlessly (same silhouette as a round line-join).
const CHECK = (() => {
  const s = 0.7
  const half = 28 * s
  const cap = half - 8.5 * s
  const step = 33
  const V = { x: 193, y: 252 }
  const arm = (outDeg: number, rot: number, n: number): PieceState[] => {
    const a = (outDeg * Math.PI) / 180
    return Array.from({ length: n }, (_, i) =>
      D(V.x + Math.cos(a) * (cap + i * step), V.y + Math.sin(a) * (cap + i * step), rot, s),
    )
  }
  return { short: arm(225, 45, 2), long: arm(-52, -52, 5), V }
})()

export const POSES: Record<SkipPose, Pose> = {
  idle: {
    dashes: [
      D(121, 168), D(187, 168), D(253, 168), D(319, 168),
      D(88, 202), D(154, 202), D(220, 202), D(286, 202), D(352, 202),
      D(121, 236), D(187, 236), D(253, 236), D(319, 236),
    ],
    eyeL: D(188, 102), eyeR: D(252, 102),
    mouth: D(220, 134),
    shadow: { x: 220, y: 292, sx: 1, o: 1 },
    look: { x: 0, y: 0 },
    title: 'Skip', sub: '',
  },
  searching: {
    dashes: [
      D(96, 205, 0, 0.72), D(152, 205, 0, 0.72), D(208, 205, 0, 0.72), D(264, 205, 0, 0.72),
      D(322, 205, 0, 0.8),
      D(355, 187, 42, 0.62), D(355, 223, -42, 0.62),
      D(96, 205, 0, 0.35, 0), D(152, 205, 0, 0.35, 0), D(208, 205, 0, 0.35, 0),
      D(264, 205, 0, 0.35, 0), D(322, 205, 0, 0.35, 0), D(322, 205, 0, 0.35, 0),
    ],
    eyeL: D(150, 146, 0, 0.68), eyeR: D(194, 146, 0, 0.68),
    mouth: D(220, 170, 0, 0.4, 0),
    shadow: { x: 220, y: 292, sx: 1.18, o: 0.55 },
    look: { x: 9, y: 2 },
    title: 'Searching…', sub: 'Finding driveways near you',
  },
  loading: {
    // Dashed ring (road-line roundabout); the layer itself spins via CSS.
    dashes: Array.from({ length: DASH_COUNT }, (_, i) => {
      const deg = -90 + (i * 360) / DASH_COUNT
      const a = (deg * Math.PI) / 180
      return D(RING.x + RING.r * Math.cos(a), RING.y + RING.r * Math.sin(a), deg + 90, 0.6)
    }),
    eyeL: D(200, 164, 0, 0.7), eyeR: D(240, 164, 0, 0.7),
    mouth: D(226, 190, 8, 0.5, 1), mouthK: 5,
    shadow: { x: 220, y: 292, sx: 0.75, o: 0.45 },
    look: { x: 0, y: 0 },
    title: 'Loading…', sub: 'Skip is thinking it over',
  },
  confirmed: {
    dashes: [
      ...[...CHECK.short].reverse(),
      ...CHECK.long,
      ...Array.from({ length: 6 }, () => D(CHECK.V.x, CHECK.V.y, 45, 0.35, 0)),
    ],
    eyeL: D(196, 96, 0, 0.8), eyeR: D(244, 96, 0, 0.8),
    mouth: D(220, 124, 0, 0.85, 1),
    shadow: { x: 220, y: 292, sx: 0.85, o: 0.8 },
    look: { x: 0, y: 0 },
    title: 'Booking confirmed', sub: 'Your spot is locked in',
  },
  celebrating: {
    // 13 rays, one slot per dash — even 360/N spacing; the radius and scale
    // arrays are organic jitter and are coupled to DASH_COUNT by length.
    dashes: Array.from({ length: DASH_COUNT }, (_, i) =>
      ray(
        220, 186, -90 + (i * 360) / DASH_COUNT,
        [130, 118, 134, 122, 132, 118, 128, 120, 130, 122, 126, 116, 134][i],
        [0.55, 0.68, 0.5, 0.62, 0.55, 0.68, 0.5, 0.62, 0.55, 0.66, 0.5, 0.68, 0.55][i],
      ),
    ),
    eyeL: D(199, 178, 0, 0.7), eyeR: D(241, 178, 0, 0.7),
    mouth: D(220, 204, 0, 0.75, 1),
    shadow: { x: 220, y: 292, sx: 0.7, o: 0.5 },
    look: { x: 0, y: -3 },
    title: 'Celebrating!', sub: 'Happy parking',
  },
  waving: {
    // Idle body, but row 2's right-most dash swings up into a raised arm —
    // the morph from idle IS the wave gesture.
    dashes: [
      D(121, 168), D(187, 168), D(253, 168), D(319, 168),
      D(88, 202), D(154, 202), D(220, 202), D(286, 202),
      D(376, 156, -55, 0.9),
      D(121, 236), D(187, 236), D(253, 236), D(319, 236),
    ],
    eyeL: D(188, 102), eyeR: D(252, 102),
    mouth: D(220, 134), mouthK: 26,
    shadow: { x: 220, y: 292, sx: 1, o: 1 },
    look: { x: 0, y: -2 },
    title: 'Hi!', sub: 'Ask me anything about Dryvway',
  },
  sleeping: {
    // Body sags a touch; lids close via the .sleeping CSS module (state, not
    // motion, so it also holds under reduced motion).
    dashes: [
      D(121, 178, 4), D(187, 180), D(253, 180), D(319, 178, -4),
      D(88, 210, 2), D(154, 212), D(220, 212), D(286, 212), D(352, 210, -2),
      D(121, 244), D(187, 246), D(253, 246), D(319, 244),
    ],
    eyeL: D(188, 116, 0, 0.9), eyeR: D(252, 116, 0, 0.9),
    mouth: D(220, 146, 0, 0.8), mouthK: 10,
    shadow: { x: 220, y: 292, sx: 1.08, o: 0.9 },
    look: { x: 0, y: 0 },
    title: 'Zzz…', sub: '',
  },
}
