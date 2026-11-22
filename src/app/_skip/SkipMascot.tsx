'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from './cn'
import { C } from '../theme'
import styles from './SkipMascot.module.css'
import {
  DASH_COUNT,
  MOUTH_K_DEFAULT,
  POSES,
  RING,
  VIEW,
  type SkipPose,
  type PieceState,
} from './skipPoses'

export type { SkipPose }

export interface SkipMascotProps {
  /** Which pose Skip holds. Changing it morphs from wherever he currently is. */
  pose: SkipPose
  /**
   * `inline` (default): fills its container's width — for cards, overlays,
   * beside inputs. `splash`: absolute full-bleed layer with background and
   * status text; the parent supplies the positioning context.
   */
  variant?: 'inline' | 'splash'
  /**
   * Flipping to false plays the exit (splash: scale-up + fade; inline: fade)
   * and releases pointer events. Unmount after it finishes.
   */
  open?: boolean
  /** Show the status text block. Defaults to true for splash, false for inline. */
  showLabel?: boolean
  /** Override the pose's default status title. */
  label?: string
  /** Override the pose's default status subline. */
  sublabel?: string
  className?: string
}

const applyPiece = (el: SVGElement | null, d: PieceState) => {
  if (!el) return
  el.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.r ?? 0}deg) scale(${d.s ?? 1})`
  el.style.opacity = String(d.o ?? 1)
}

export function SkipMascot({
  pose,
  variant = 'inline',
  open = true,
  showLabel,
  label,
  sublabel,
  className,
}: SkipMascotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dashLayerRef = useRef<SVGGElement>(null)
  const dashRefs = useRef<(SVGGElement | null)[]>([])
  const eyeLRef = useRef<SVGGElement>(null)
  const eyeRRef = useRef<SVGGElement>(null)
  const mouthRef = useRef<SVGGElement>(null)
  const mouthPathRef = useRef<SVGPathElement>(null)
  const shadowRef = useRef<SVGEllipseElement>(null)
  const hlLRef = useRef<SVGCircleElement>(null)
  const hlRRef = useRef<SVGCircleElement>(null)

  const poseRef = useRef(pose)
  const enteredRef = useRef(false)
  const spinCleanupRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mouthTweenRef = useRef<number | undefined>(undefined)
  const mouthKRef = useRef(MOUTH_K_DEFAULT)
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Exiting the spin must carry the interrupted turn forward to 360° instead
  // of snapping back to 0° when the class is removed.
  const setSpin = useCallback((on: boolean) => {
    const layer = dashLayerRef.current
    if (!layer) return
    if (on) {
      clearTimeout(spinCleanupRef.current)
      layer.style.transition = ''
      layer.style.transform = ''
      layer.classList.add(styles.spin)
    } else if (layer.classList.contains(styles.spin)) {
      const cur = getComputedStyle(layer).transform
      layer.classList.remove(styles.spin)
      // 'none': reduced motion disabled the spin. '': non-layout environments
      // (jsdom) that don't compute transforms. Either way there is no angle to
      // carry forward.
      if (cur === 'none' || !cur) return
      const m = new DOMMatrixReadOnly(cur)
      let ang = (Math.atan2(m.b, m.a) * 180) / Math.PI
      if (ang < 0) ang += 360
      layer.style.transition = 'none'
      layer.style.transform = `rotate(${ang}deg)`
      layer.getBoundingClientRect()
      layer.style.transition = 'transform 0.72s var(--skip-bounce)'
      layer.style.transform = 'rotate(360deg)'
      // 760ms = the 720ms transition four lines up, plus margin.
      spinCleanupRef.current = setTimeout(() => {
        layer.style.transition = 'none'
        layer.style.transform = ''
        layer.getBoundingClientRect()
        layer.style.transition = ''
      }, 760)
    }
  }, [])

  // The smile's curve depth lives in the path's `d`, which CSS can't
  // transition, so pose changes tween it briefly here. A scaleY squash would
  // distort the stroke weight instead.
  const setMouthCurve = useCallback((k: number) => {
    if (mouthTweenRef.current !== undefined) cancelAnimationFrame(mouthTweenRef.current)
    if (k === mouthKRef.current) return
    const path = mouthPathRef.current
    if (!path) return
    const from = mouthKRef.current
    const dk = k - from
    const dur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450
    const t0 = performance.now()
    const step = (now: number) => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1
      mouthKRef.current = from + dk * (1 - Math.pow(1 - t, 3))
      path.setAttribute('d', `M -26 0 Q 0 ${mouthKRef.current.toFixed(2)} 26 0`)
      if (t < 1) mouthTweenRef.current = requestAnimationFrame(step)
    }
    mouthTweenRef.current = requestAnimationFrame(step)
  }, [])

  const applyPose = useCallback(
    (name: SkipPose) => {
      const p = POSES[name]
      setSpin(name === 'loading')
      setMouthCurve(p.mouthK ?? MOUTH_K_DEFAULT)
      dashRefs.current.forEach((g, i) => {
        if (!g) return
        g.style.transitionDelay = `${i * 24}ms`
        applyPiece(g, p.dashes[i])
      })
      for (const el of [eyeLRef.current, eyeRRef.current, mouthRef.current]) {
        if (el) el.style.transitionDelay = '140ms'
      }
      applyPiece(eyeLRef.current, p.eyeL)
      applyPiece(eyeRRef.current, p.eyeR)
      applyPiece(mouthRef.current, p.mouth)
      const sh = shadowRef.current
      if (sh) {
        sh.style.transform = `translate(${p.shadow.x}px, ${p.shadow.y}px) scale(${p.shadow.sx}, 1)`
        sh.style.opacity = String(p.shadow.o)
      }
      const look = `translate(${p.look.x}px, ${p.look.y}px)`
      if (hlLRef.current) hlLRef.current.style.transform = look
      if (hlRRef.current) hlRRef.current.style.transform = look
    },
    [setSpin, setMouthCurve],
  )

  // Entrance: scatter the pieces invisibly with transitions off, then two
  // frames later enable transitions and settle into the current pose. Runs
  // entirely client-side (server markup is deterministic: everything at
  // opacity 0), and is idempotent under StrictMode's double-mount — the
  // cleanup cancels the pending frames and the second run restarts cleanly.
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.classList.add(styles.noAnim)
    dashRefs.current.forEach((g) => {
      applyPiece(g, {
        x: 60 + Math.random() * 320,
        y: 40 + Math.random() * 260,
        r: Math.random() * 180 - 90,
        s: 0.3,
        o: 0,
      })
    })
    applyPiece(eyeLRef.current, { x: 160, y: 60, s: 0.2, o: 0 })
    applyPiece(eyeRRef.current, { x: 280, y: 60, s: 0.2, o: 0 })
    applyPiece(mouthRef.current, { x: 220, y: 150, s: 0.2, o: 0 })
    const sh = shadowRef.current
    if (sh) {
      sh.style.transform = 'translate(220px, 292px) scale(0.4, 1)'
      sh.style.opacity = '0'
    }

    const rafs: number[] = []
    rafs.push(
      requestAnimationFrame(() => {
        rafs.push(
          requestAnimationFrame(() => {
            svg.classList.remove(styles.noAnim)
            enteredRef.current = true
            applyPose(poseRef.current)
          }),
        )
      }),
    )
    return () => rafs.forEach(cancelAnimationFrame)
  }, [applyPose])

  useEffect(() => {
    poseRef.current = pose
    if (enteredRef.current) applyPose(pose)
  }, [pose, applyPose])

  // Timers owned by imperative helpers, cancelled on unmount.
  useEffect(
    () => () => {
      clearTimeout(spinCleanupRef.current)
      if (mouthTweenRef.current !== undefined) cancelAnimationFrame(mouthTweenRef.current)
    },
    [],
  )

  // Status text: fade out 220ms → swap the string → fade back. Never
  // crossfade two strings on top of each other.
  const targetTitle = label ?? POSES[pose].title
  const targetSub = sublabel ?? POSES[pose].sub
  const [statusText, setStatusText] = useState({ title: targetTitle, sub: targetSub })
  const [swapping, setSwapping] = useState(false)
  const displayedRef = useRef(statusText)

  useEffect(() => {
    if (displayedRef.current.title === targetTitle && displayedRef.current.sub === targetSub) return
    const commit = () => {
      displayedRef.current = { title: targetTitle, sub: targetSub }
      setStatusText(displayedRef.current)
      setSwapping(false)
    }
    if (!enteredRef.current) {
      commit()
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: mascot pose/morph state must sync synchronously in this effect
    setSwapping(true)
    // 220ms = the .status opacity transition in SkipMascot.module.css.
    labelTimerRef.current = setTimeout(commit, 220)
    return () => clearTimeout(labelTimerRef.current)
  }, [targetTitle, targetSub])

  const isSplash = variant === 'splash'
  const labelVisible = showLabel ?? isSplash

  return (
    <div
      className={cn(
        isSplash
          ? [styles.splash, 'bg-bg', !open && styles.away]
          : [styles.inline, 'block w-full', !open && styles.inlineAway],
        pose === 'loading' && styles.thinking,
        pose === 'sleeping' && styles.sleeping,
        className,
      )}
      style={
        {
          '--skip-amber': C.amber,
          '--skip-ink': C.slate,
          '--skip-highlight': C.paper,
          '--skip-shadow': 'rgba(44, 44, 42, 0.12)',
          '--skip-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        } as CSSProperties
      }
    >
      <div className={isSplash ? 'w-[min(88vw,430px)]' : 'w-full'}>
        <svg
          ref={svgRef}
          className={cn(styles.stage, styles.noAnim)}
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          aria-hidden="true"
          focusable="false"
        >
          <ellipse
            ref={shadowRef}
            className={cn(styles.piece, styles.shadowFill)}
            cx={0}
            cy={0}
            rx={96}
            ry={13}
            style={{ opacity: 0 }}
          />
          <g className={styles.floaty}>
            <g
              ref={dashLayerRef}
              style={{ transformOrigin: `${RING.x}px ${RING.y}px` }}
            >
              {Array.from({ length: DASH_COUNT }, (_, i) => (
                <g
                  key={i}
                  ref={(el) => {
                    dashRefs.current[i] = el
                  }}
                  className={styles.piece}
                  style={{ opacity: 0 }}
                >
                  <rect className={styles.dashRect} x={-28} y={-8.5} width={56} height={17} rx={8.5} />
                </g>
              ))}
            </g>
            <g ref={eyeLRef} className={styles.piece} style={{ opacity: 0 }}>
              <g className={styles.squint}>
                <g className={styles.blink}>
                  <circle className={styles.eyeFill} r={18} />
                  <circle ref={hlLRef} className={styles.hl} cx={-6} cy={-6} r={5.5} />
                </g>
              </g>
            </g>
            <g ref={eyeRRef} className={styles.piece} style={{ opacity: 0 }}>
              <g className={styles.squint}>
                <g className={styles.blink} style={{ animationDelay: '0.05s' }}>
                  <circle className={styles.eyeFill} r={18} />
                  <circle ref={hlRRef} className={styles.hl} cx={-6} cy={-6} r={5.5} />
                </g>
              </g>
            </g>
            <g ref={mouthRef} className={styles.piece} style={{ opacity: 0 }}>
              <path ref={mouthPathRef} className={styles.mouthPath} d={`M -26 0 Q 0 ${MOUTH_K_DEFAULT} 26 0`} />
            </g>
          </g>
        </svg>
      </div>

      <div role="status">
        {labelVisible ? (
          <div className={cn(styles.status, swapping && styles.swap, 'text-center', isSplash ? 'mt-1.5' : 'mt-1')}>
            <div
              className={cn(
                'font-display font-extrabold tracking-tight text-slate',
                isSplash ? 'text-display-sm' : 'text-sm',
              )}
            >
              {statusText.title}
            </div>
            {statusText.sub && (
              <p className={cn('font-medium text-stone', isSplash ? 'mt-1 text-[15px]' : 'mt-0.5 text-xs')}>
                {statusText.sub}
              </p>
            )}
          </div>
        ) : (
          <span className="sr-only">{statusText.title}</span>
        )}
      </div>
    </div>
  )
}
