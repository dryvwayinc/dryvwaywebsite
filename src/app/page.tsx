"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { C, F } from "./theme";

// ------------------------------------------------------------------
// Web app destinations — the landing page links into the Dryvway app,
// which lives on its own subdomain. Override via NEXT_PUBLIC_APP_URL.
// `/dashboard/*` deep-links are safe: signed-out visitors are bounced to
// the app's sign-in and routed back after auth.
// ------------------------------------------------------------------
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.dryvwayinc.com";
const APP = {
  signIn: `${APP_URL}/`,
  signUp: `${APP_URL}/?mode=signup`,
  find: `${APP_URL}/dashboard/find`,
  list: `${APP_URL}/dashboard/list`,
} as const;

// ------------------------------------------------------------------
// Icon set — single-stroke, slate by default
// ------------------------------------------------------------------
type IconName =
  | "search"
  | "pin"
  | "pin-fill"
  | "star"
  | "clock"
  | "car"
  | "house"
  | "shield"
  | "check-circle"
  | "arrow-r"
  | "arrow-l"
  | "heart"
  | "cover"
  | "wallet"
  | "sun"
  | "phone";

function Icon({
  name,
  size = 20,
  color = "currentColor",
  stroke = 1.6,
}: {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
}) {
  const p = {
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const v = "0 0 24 24";
  switch (name) {
    case "search":
      return (
        <svg width={size} height={size} viewBox={v}>
          <circle cx="11" cy="11" r="7" {...p} />
          <path d="M20 20l-3.5-3.5" {...p} />
        </svg>
      );
    case "pin":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z" {...p} />
          <circle cx="12" cy="9" r="2.5" {...p} />
        </svg>
      );
    case "pin-fill":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z" fill={color} />
          <circle cx="12" cy="9" r="2.4" fill="#fff" />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path
            d="M12 3l2.6 5.6 6 .7-4.5 4.2 1.3 6L12 16.6 6.6 19.5l1.3-6L3.4 9.3l6-.7L12 3z"
            fill={color}
            stroke={color}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "clock":
      return (
        <svg width={size} height={size} viewBox={v}>
          <circle cx="12" cy="12" r="9" {...p} />
          <path d="M12 7v5l3.5 2" {...p} />
        </svg>
      );
    case "car":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path
            d="M5 16h14M6 16v2M18 16v2M5 16l1.5-5.5a2 2 0 011.9-1.5h7.2a2 2 0 011.9 1.5L19 16"
            {...p}
          />
          <circle cx="8" cy="16" r="1.5" {...p} />
          <circle cx="16" cy="16" r="1.5" {...p} />
        </svg>
      );
    case "house":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9z" {...p} />
          <path d="M10 21v-6h4v6" {...p} />
        </svg>
      );
    case "shield":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...p} />
          <path d="M9 12l2.2 2.2L15 10.5" {...p} />
        </svg>
      );
    case "check-circle":
      return (
        <svg width={size} height={size} viewBox={v}>
          <circle cx="12" cy="12" r="9" {...p} />
          <path d="M8 12.5l3 3 5-6" {...p} />
        </svg>
      );
    case "arrow-r":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M5 12h14M13 6l6 6-6 6" {...p} />
        </svg>
      );
    case "arrow-l":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M19 12H5M11 6l-6 6 6 6" {...p} />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" {...p} />
        </svg>
      );
    case "cover":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path d="M3 12l9-7 9 7M5 11v9h14v-9" {...p} />
        </svg>
      );
    case "wallet":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path
            d="M4 7c0-1.1.9-2 2-2h13v3M4 7v11a2 2 0 002 2h13v-4M19 13h-3a2 2 0 010-4h3v4z"
            {...p}
          />
        </svg>
      );
    case "sun":
      return (
        <svg width={size} height={size} viewBox={v}>
          <circle cx="12" cy="12" r="4" {...p} />
          <path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5"
            {...p}
          />
        </svg>
      );
    case "phone":
      return (
        <svg width={size} height={size} viewBox={v}>
          <path
            d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A14 14 0 013 6a2 2 0 012-2z"
            {...p}
          />
        </svg>
      );
  }
}

// ------------------------------------------------------------------
// Brandmark — Dryvway logo mark
// ------------------------------------------------------------------
function Brandmark({ size = 30 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Dryvway"
      width={size}
      height={size}
      priority
      style={{ display: "block", borderRadius: 7 }}
    />
  );
}

// ------------------------------------------------------------------
// Hooks
// ------------------------------------------------------------------
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return y;
}

// Viewport breakpoints — mirrors the audit targets: 375 / 430 (phone),
// 768 (tablet), 1024+ (desktop). SSR renders the desktop branch, then the
// effect corrects on mount; first client render also returns "desktop", so
// there is no hydration mismatch. Mobile styling is layered on top of the
// existing desktop inline styles via `bp === "phone"` / `bp !== "desktop"`
// checks — the desktop values themselves are never altered.
type Breakpoint = "phone" | "tablet" | "desktop";
function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    const tablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const update = () =>
      setBp(phone.matches ? "phone" : tablet.matches ? "tablet" : "desktop");
    update();
    phone.addEventListener("change", update);
    tablet.addEventListener("change", update);
    return () => {
      phone.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);
  return bp;
}

// Nav collapses to a hamburger until the full row fits (~1024px). Kept
// separate from useBreakpoint so the threshold can differ from the layout
// breakpoints without affecting desktop (>=1024 stays the full inline nav).
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function useReveal(opts: { threshold?: number; rootMargin?: string } = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      {
        threshold: opts.threshold ?? 0.15,
        rootMargin: opts.rootMargin ?? "0px 0px -8% 0px",
      },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [opts.threshold, opts.rootMargin]);
  return [ref, shown] as const;
}

function Rise({
  children,
  delay = 0,
  y = 24,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  style?: CSSProperties;
}) {
  const [ref, shown] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transition: `opacity 700ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 800ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CountUp({
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [ref, shown] = useReveal({ threshold: 0.4 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!shown) {
      setVal(0);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * to);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shown, to, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

// ------------------------------------------------------------------
// Photo placeholder — golden-hour gradient + film grain
// ------------------------------------------------------------------
type PhotoTone = "warm" | "porch" | "dusk" | "morning" | "block" | "night";
function Photo({
  tone = "warm",
  label,
  src,
  height = "100%",
  radius = 20,
  style,
  children,
  priority = false,
  sizes = "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 640px",
  alt,
}: {
  tone?: PhotoTone;
  label?: string;
  src?: string;
  height?: number | string;
  radius?: number;
  style?: CSSProperties;
  children?: ReactNode;
  priority?: boolean;
  sizes?: string;
  alt?: string;
}) {
  const tones: Record<PhotoTone, string> = {
    warm: "linear-gradient(160deg,#f3d9b8 0%, #e6b078 32%, #c97a4e 62%, #5e3a31 100%)",
    porch: "linear-gradient(170deg,#f8e7c8 0%, #e9b274 35%, #a86948 70%, #3e2a25 100%)",
    dusk: "linear-gradient(180deg,#f0c089 0%, #d18856 45%, #6e3f33 80%, #2c2422 100%)",
    morning: "linear-gradient(170deg,#f9eedc 0%, #ddb98a 40%, #8e6f5a 80%, #3a2f29 100%)",
    block: "linear-gradient(165deg,#ead3b0 0%, #c79870 50%, #6b4e3f 100%)",
    night: "linear-gradient(180deg,#3a2e2a 0%, #2c2422 60%, #1a1614 100%)",
  };
  const filterId = `g${(label || "x").replace(/\W/g, "")}`;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: tones[tone],
        boxShadow:
          "0 30px 60px -30px rgba(44,44,42,0.35), 0 8px 24px -12px rgba(44,44,42,0.18)",
        ...style,
      }}
    >
      {src && (
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      )}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: src ? 0.12 : 0.18,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      >
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      {!src && (
        <svg
          viewBox="0 0 400 260"
          preserveAspectRatio="xMidYMax slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}
        >
          <path
            d="M0 220 L80 180 L120 150 L180 175 L240 140 L300 165 L360 145 L400 170 L400 260 L0 260 Z"
            fill="#2C2C2A"
          />
          <path d="M40 200 L70 175 L100 200 L100 235 L40 235 Z" fill="#2C2C2A" />
          <path d="M250 195 L290 165 L330 195 L330 240 L250 240 Z" fill="#2C2C2A" />
        </svg>
      )}
      {label && (
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 12,
            fontFamily: F.display, fontWeight: 500,
            fontSize: 10,
            letterSpacing: 0.6,
            color: "rgba(255,255,255,0.78)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

function Avatar({
  name,
  size = 32,
  tone = "warm",
}: {
  name: string;
  size?: number;
  tone?: "warm" | "porch" | "dusk" | "morning";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const bgs = {
    warm: "linear-gradient(135deg,#e8b078,#a86948)",
    porch: "linear-gradient(135deg,#dbb98a,#6e4937)",
    dusk: "linear-gradient(135deg,#c97a4e,#4a2e29)",
    morning: "linear-gradient(135deg,#e6c298,#8e6f5a)",
  };
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgs[tone],
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.display,
        fontWeight: 600,
        fontSize: size * 0.38,
        letterSpacing: 0.4,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ------------------------------------------------------------------
// Styled buttons & shared helpers
// ------------------------------------------------------------------
function btnPrimary(): CSSProperties {
  return {
    background: C.amber,
    color: C.slate,
    border: 0,
    borderRadius: 999,
    padding: "10px 18px",
    fontFamily: F.display,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "transform 200ms ease, background 200ms ease",
  };
}
function btnGhost(): CSSProperties {
  return {
    background: "transparent",
    color: C.slate,
    border: 0,
    borderRadius: 999,
    padding: "10px 14px",
    fontFamily: F.display,
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
  };
}
function btnGhostBordered(): CSSProperties {
  return {
    background: "transparent",
    color: C.slate,
    border: `1px solid ${C.slate}`,
    borderRadius: 999,
    padding: "12px 22px",
    fontFamily: F.display,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "all 220ms ease",
  };
}

// Interactive CTA link. Inline styles can't use :hover, so motion is driven by
// hover/press state (same idiom as NavLink/SideCard). Resting appearance is the
// untouched btn* base; hover adds a lift + (primary) amber glow and a one-shot
// light sweep; press squishes for tactile feedback. All motion is gated off
// under prefers-reduced-motion (color/glow stay — those aren't motion).
function HoverButton({
  href,
  variant,
  children,
  onClick,
  style,
}: {
  href: string;
  variant: "primary" | "ghost" | "ghostBordered";
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");

  const isPrimary = variant === "primary";
  const base =
    variant === "primary"
      ? btnPrimary()
      : variant === "ghostBordered"
        ? btnGhostBordered()
        : btnGhost();

  const lift = press ? -1 : hover ? -2 : 0;
  const scale = press ? 0.97 : 1;

  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        ...base,
        position: "relative",
        overflow: "hidden", // clips the shine sweep to the pill shape
        textDecoration: "none",
        background: hover && !isPrimary
          ? variant === "ghostBordered"
            ? C.amberSoft
            : C.warmDeep
          : base.background,
        boxShadow: isPrimary && hover
          ? "0 12px 26px -10px rgba(232,160,64,0.6)"
          : isPrimary
            ? "0 0 0 rgba(232,160,64,0)"
            : undefined,
        transform: reduce ? "none" : `translateY(${lift}px) scale(${scale})`,
        transition:
          "transform 220ms cubic-bezier(.22,.61,.36,1), background 200ms ease, box-shadow 260ms ease",
        ...style,
      }}
    >
      {isPrimary && !reduce && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "40%",
            background:
              "linear-gradient(105deg, transparent, rgba(255,255,255,0.55), transparent)",
            // Sweep across on enter; snap back instantly (no transition) on leave.
            transform: hover ? "translateX(320%)" : "translateX(-160%)",
            transition: hover ? "transform 720ms ease" : "none",
            pointerEvents: "none",
          }}
        />
      )}
      {/* relative wrapper keeps the label painting above the absolute shine span */}
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {children}
      </span>
    </a>
  );
}

function SectionLabel({ num, text }: { num: string; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: F.display, fontWeight: 500,
        fontSize: 11,
        color: C.stone,
        letterSpacing: 1.6,
        textTransform: "uppercase",
        marginBottom: 28,
      }}
    >
      <span style={{ width: 32, height: 1, background: C.stoneLine }} />
      {num} — {text}
    </div>
  );
}

function h2Style(): CSSProperties {
  return {
    fontFamily: F.display,
    fontWeight: 600,
    fontSize: "clamp(30px, 4.6vw, 64px)",
    lineHeight: 1.04,
    letterSpacing: -1.6,
    color: C.slate,
    margin: 0,
    maxWidth: 820,
  };
}

// ------------------------------------------------------------------
// Nav
// ------------------------------------------------------------------
const NAV_LINKS = [
  { href: "#featured", label: "Find a spot" },
  { href: "#calculator", label: "List your driveway" },
  { href: "#how", label: "How it works" },
  { href: "#trust", label: "Help" },
];

function Nav() {
  const y = useScrollY();
  const solid = y > 40;
  // Collapse to a hamburger until the full link row comfortably fits (~1024px).
  // Desktop (>=1024px) keeps the original inline nav untouched.
  const compact = useMediaQuery("(max-width: 1023px)");
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  // Resizing from phone back up to desktop should always clear the panel.
  useEffect(() => {
    if (!compact && open) setOpen(false);
  }, [compact, open]);
  // Escape closes the menu and returns focus to the toggle (keyboard a11y).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const opaque = solid || open;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition:
          "background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease, padding 300ms ease",
        background: opaque ? "rgba(245,240,235,0.82)" : "rgba(245,240,235,0)",
        backdropFilter: opaque ? "saturate(140%) blur(14px)" : "none",
        WebkitBackdropFilter: opaque ? "saturate(140%) blur(14px)" : "none",
        borderBottom: `1px solid ${opaque ? C.stoneLine : "transparent"}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: compact
            ? solid
              ? "12px 20px"
              : "16px 20px"
            : solid
              ? "14px 32px"
              : "22px 32px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          transition: "padding 300ms ease",
        }}
      >
        <a
          href="#top"
          aria-label="Dryvway Inc. home"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
          onClick={() => setOpen(false)}
        >
          <Brandmark size={42} />
          <span
            style={{
              fontFamily: F.display,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: C.slate,
              whiteSpace: "nowrap",
            }}
          >
            Dryvway Inc.
          </span>
        </a>
        <div style={{ flex: 1 }} />
        {compact ? (
          <button
            ref={menuBtnRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            onClick={() => setOpen((v) => !v)}
            style={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              color: C.slate,
              marginRight: -8,
            }}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        ) : (
          <>
            <NavLink href="#featured">Find a spot</NavLink>
            <NavLink href="#calculator">List your driveway</NavLink>
            <NavLink href="#how">How it works</NavLink>
            <NavLink href="#trust">Help</NavLink>
            <div style={{ width: 1, height: 18, background: C.stoneLine }} />
            <HoverButton variant="ghost" href={APP.signIn}>
              Sign in
            </HoverButton>
            <HoverButton variant="primary" href={APP.signUp}>
              Get started
            </HoverButton>
          </>
        )}
      </div>

      {compact && open && (
        <div
          id="mobile-nav-panel"
          style={{
            borderTop: `1px solid ${C.stoneLine}`,
            background: "rgba(245,240,235,0.97)",
            backdropFilter: "saturate(140%) blur(14px)",
            WebkitBackdropFilter: "saturate(140%) blur(14px)",
            padding: "8px 20px 20px",
          }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 52,
                fontFamily: F.display,
                fontWeight: 500,
                fontSize: 17,
                color: C.slate,
                textDecoration: "none",
                borderBottom: `1px solid ${C.stoneLineSoft}`,
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            <HoverButton
              variant="ghostBordered"
              href={APP.signIn}
              onClick={() => setOpen(false)}
              style={{ justifyContent: "center", padding: "14px 22px" }}
            >
              Sign in
            </HoverButton>
            <HoverButton
              variant="primary"
              href={APP.signUp}
              onClick={() => setOpen(false)}
              style={{ justifyContent: "center", padding: "14px 22px", fontSize: 15 }}
            >
              Get started
            </HoverButton>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const [h, setH] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: F.display,
        fontWeight: 500,
        fontSize: 14,
        letterSpacing: -0.1,
        color: C.slate,
        textDecoration: "none",
        position: "relative",
        padding: "6px 0",
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1.5,
          background: C.slate,
          transform: h ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 320ms cubic-bezier(.22,.61,.36,1)",
        }}
      />
    </a>
  );
}

// ------------------------------------------------------------------
// Hero
// ------------------------------------------------------------------
function Hero() {
  const y = useScrollY();
  const parallax = Math.min(80, y * 0.18);
  const bp = useBreakpoint();
  const isPhone = bp === "phone";
  // The nav already collapses to a hamburger below 1024px, so the hero stacks
  // for phone AND tablet to stay consistent. Desktop (>=1024px) is unchanged.
  const stacked = bp !== "desktop";

  return (
    <section
      id="top"
      style={{ position: "relative", paddingTop: isPhone ? 96 : 120, paddingBottom: 80, scrollMarginTop: 80 }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isPhone ? "0 20px" : "0 32px" }}>
        <Rise delay={50}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px 6px 8px",
              borderRadius: 999,
              background: C.amberSoft,
              color: C.amberDeep,
              fontFamily: F.display,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: 0.1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.amber,
                boxShadow: `0 0 0 4px ${C.amberSoft}`,
                animation: "dryvPulse 2.2s ease-in-out infinite",
              }}
            />
            Now in the Bay Area · Coming to LA & Austin
          </div>
        </Rise>
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isPhone ? "20px 20px 0" : "24px 32px 0",
          display: "grid",
          gridTemplateColumns: stacked ? "1fr" : "1.15fr 1fr",
          gap: stacked ? 36 : 64,
          alignItems: "center",
        }}
      >
        <div>
          <Rise delay={120} y={28}>
            <h1
              style={{
                fontFamily: F.display,
                fontWeight: 600,
                fontSize: "clamp(38px, 7.4vw, 104px)",
                lineHeight: 0.96,
                letterSpacing: isPhone ? -1.2 : -2.2,
                color: C.slate,
                margin: 0,
              }}
            >
              Your driveway.
              <br />
              <span style={{ color: C.slate }}>Their </span>
              <span style={{ fontFamily: F.body, fontStyle: "italic", fontWeight: 400 }}>
                destination.
              </span>
            </h1>
          </Rise>

          <Rise delay={260}>
            <p
              style={{
                fontFamily: F.display,
                fontSize: 20,
                lineHeight: 1.5,
                color: C.slate,
                marginTop: 28,
                marginBottom: 36,
                maxWidth: 520,
                opacity: 0.85,
              }}
            >
              List your space in five minutes. Earn every time someone parks. Or find a spot
              near the stadium, the airport, the office — and skip the circling.
            </p>
          </Rise>

        </div>

        <div style={{ position: "relative", height: stacked ? (isPhone ? 360 : 460) : 620 }}>
          <Rise delay={200} y={36} style={{ position: "absolute", inset: 0 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translate3d(0,${-parallax * 0.25}px,0)`,
                transition: "transform 120ms linear",
              }}
            >
              <Photo
                tone="porch"
                src="/photos/hero-driveway.jpg"
                label="46 Almond St · Mission · 4:42 PM"
                alt="A welcoming residential driveway at golden hour, available to book on Dryvway"
                height="100%"
                radius={28}
                priority
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 560px"
              />
            </div>
          </Rise>

          <Rise
            delay={520}
            y={18}
            style={{ position: "absolute", left: stacked ? 12 : -32, bottom: stacked ? 16 : 56, zIndex: 2 }}
          >
            <div
              style={{
                background: C.paper,
                borderRadius: 18,
                padding: 16,
                border: `1px solid ${C.stoneLine}`,
                boxShadow:
                  "0 24px 60px -24px rgba(44,44,42,0.4), 0 6px 16px -8px rgba(44,44,42,0.18)",
                width: 240,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name="Wayne O." tone="porch" size={36} />
                <div>
                  <div
                    style={{
                      fontFamily: F.display,
                      fontWeight: 600,
                      fontSize: 13,
                      color: C.slate,
                    }}
                  >
                    Wayne · Mission District
                  </div>
                  <div style={{ fontFamily: F.display, fontSize: 11, color: C.stone }}>
                    Booked · Sat 6–11 PM
                  </div>
                </div>
              </div>
              <div style={{ height: 1, background: C.stoneLine, margin: "14px 0" }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontFamily: F.display, fontSize: 12, color: C.stone }}>
                  Tonight
                </span>
                <span
                  style={{
                    fontFamily: F.display,
                    fontWeight: 600,
                    fontSize: 22,
                    color: C.slate,
                    letterSpacing: -0.5,
                  }}
                >
                  +$<CountUp to={42} duration={1100} />
                </span>
              </div>
            </div>
          </Rise>

          <Rise
            delay={620}
            y={18}
            style={{ position: "absolute", right: stacked ? 12 : -24, top: stacked ? 16 : 60, zIndex: 2 }}
          >
            <div
              style={{
                background: C.paper,
                borderRadius: 18,
                padding: "12px 14px",
                border: `1px solid ${C.stoneLine}`,
                boxShadow: "0 18px 40px -18px rgba(44,44,42,0.35)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: 240,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: C.amberSoft,
                  color: C.amberDeep,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="pin-fill" size={18} color={C.amberDeep} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F.display,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.slate,
                  }}
                >
                  4 min walk to gate
                </div>
                <div style={{ fontFamily: F.display, fontSize: 11, color: C.stone }}>
                  Maria’s · $8/hr · 4.9 ★
                </div>
              </div>
            </div>
          </Rise>
        </div>
      </div>

      <div style={{ marginTop: isPhone ? 64 : 100, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(90deg, #F5F0EB, transparent 8%, transparent 92%, #F5F0EB)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 56,
            animation: "dryvMarquee 38s linear infinite",
            width: "max-content",
          }}
        >
          {[0, 1].map((k) =>
            [
              "Mission District",
              "SoMa",
              "Oakland Hills",
              "Santa Clara",
              "Berkeley",
              "Palo Alto",
              "The Sunset",
              "Hayes Valley",
              "Fruitvale",
              "San Mateo",
            ].map((n, i) => (
              <div
                key={`${k}-${i}`}
                style={{
                  fontFamily: F.display,
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.stone,
                  display: "flex",
                  alignItems: "center",
                  gap: 56,
                }}
              >
                {n}
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: C.stoneSoft,
                  }}
                />
              </div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Two-sided
// ------------------------------------------------------------------
function SideCard({
  tone,
  tag,
  tagIcon,
  title,
  body,
  cta,
  href,
  src,
  delay = 0,
  amber,
}: {
  tone: PhotoTone;
  tag: string;
  tagIcon: IconName;
  title: string;
  body: string;
  cta: string;
  href: string;
  src?: string;
  delay?: number;
  amber?: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <Rise delay={delay} y={28}>
      <div
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          background: C.paper,
          borderRadius: 28,
          border: `1px solid ${C.stoneLine}`,
          padding: 0,
          transform: h ? "translateY(-4px)" : "translateY(0)",
          boxShadow: h
            ? "0 36px 70px -30px rgba(44,44,42,0.4)"
            : "0 20px 50px -28px rgba(44,44,42,0.25)",
          transition:
            "transform 360ms cubic-bezier(.22,.61,.36,1), box-shadow 360ms cubic-bezier(.22,.61,.36,1)",
        }}
      >
        <div style={{ height: 280, position: "relative" }}>
          <Photo tone={tone} src={src} radius={0} height="100%" />
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              background: "rgba(245,240,235,0.92)",
              borderRadius: 999,
              padding: "6px 12px 6px 8px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: F.display,
              fontSize: 12,
              fontWeight: 600,
              color: C.slate,
              backdropFilter: "blur(6px)",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: C.slate,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon name={tagIcon} size={12} color={C.warm} />
            </span>
            {tag}
          </div>
        </div>
        <div style={{ padding: 32 }}>
          <h3
            style={{
              fontFamily: F.display,
              fontWeight: 600,
              fontSize: 28,
              lineHeight: 1.12,
              letterSpacing: -0.6,
              color: C.slate,
              margin: 0,
              maxWidth: 440,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontFamily: F.display,
              fontSize: 17,
              lineHeight: 1.55,
              color: C.slate,
              opacity: 0.78,
              marginTop: 16,
              marginBottom: 28,
              maxWidth: 460,
            }}
          >
            {body}
          </p>
          <a
            href={href}
            style={{
              ...(amber ? btnPrimary() : btnGhostBordered()),
              textDecoration: "none",
            }}
          >
            {cta}{" "}
            <Icon name="arrow-r" size={14} color={amber ? C.warm : C.slate} stroke={2} />
          </a>
        </div>
      </div>
    </Rise>
  );
}

function TwoSided() {
  const isPhone = useBreakpoint() === "phone";
  return (
    <section
      id="marketplace"
      style={{ padding: isPhone ? "72px 20px 56px" : "120px 32px 80px", maxWidth: 1280, margin: "0 auto", scrollMarginTop: 80 }}
    >
      <Rise>
        <SectionLabel num="01" text="The marketplace" />
      </Rise>
      <Rise delay={80}>
        <h2 style={h2Style()}>
          Two people who could never <br />
          find each other, now do.
        </h2>
      </Rise>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
          gap: isPhone ? 20 : 28,
          marginTop: isPhone ? 40 : 64,
        }}
      >
        <SideCard
          tone="dusk"
          tag="For Dru"
          tagIcon="car"
          title="Find a spot near the stadium, the airport, the office."
          body="Skip the circling. Reserve in thirty seconds. Pull in, walk five minutes, arrive."
          cta="Find a spot"
          href={APP.find}
          src="/photos/driver.jpg"
          delay={80}
        />
        <SideCard
          tone="porch"
          tag="For Wayne"
          tagIcon="house"
          title="List your driveway. Earn while it sits empty."
          body="Five minutes to list. You set the hours. Paid every Friday, directly to your bank."
          cta="List your driveway"
          href={APP.list}
          src="/photos/host-driveway.jpg"
          delay={180}
          amber
        />
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Featured driveways
// ------------------------------------------------------------------
type Listing = {
  host: string;
  tone: PhotoTone;
  src: string;
  neighborhood: string;
  city: string;
  price: number;
  rating: number;
  reviews: number;
  landmark: string;
  miles: number;
  covered: boolean;
};

const LISTINGS: Listing[] = [
  {
    host: "Maria",
    tone: "porch",
    src: "/photos/listing-maria.jpg",
    neighborhood: "Mission District",
    city: "San Francisco",
    price: 8,
    rating: 4.9,
    reviews: 142,
    landmark: "Oracle Park",
    miles: 0.4,
    covered: false,
  },
  {
    host: "Jamal",
    tone: "dusk",
    src: "/photos/listing-jamal.jpg",
    neighborhood: "Inner Sunset",
    city: "San Francisco",
    price: 6,
    rating: 4.8,
    reviews: 98,
    landmark: "Golden Gate Park",
    miles: 0.2,
    covered: true,
  },
  {
    host: "Lena",
    tone: "morning",
    src: "/photos/listing-lena.jpg",
    neighborhood: "Rockridge",
    city: "Oakland",
    price: 5,
    rating: 5.0,
    reviews: 67,
    landmark: "BART",
    miles: 0.1,
    covered: false,
  },
  {
    host: "Theo",
    tone: "block",
    src: "/photos/listing-theo.jpg",
    neighborhood: "Santa Clara",
    city: "Santa Clara",
    price: 14,
    rating: 4.9,
    reviews: 215,
    landmark: "Levi’s Stadium",
    miles: 0.6,
    covered: false,
  },
  {
    host: "Priya",
    tone: "warm",
    src: "/photos/listing-priya.jpg",
    neighborhood: "Hayes Valley",
    city: "San Francisco",
    price: 9,
    rating: 4.9,
    reviews: 88,
    landmark: "Civic Center",
    miles: 0.3,
    covered: true,
  },
  {
    host: "Daniel",
    tone: "porch",
    src: "/photos/listing-daniel.jpg",
    neighborhood: "North Beach",
    city: "San Francisco",
    price: 7,
    rating: 4.7,
    reviews: 54,
    landmark: "Coit Tower",
    miles: 0.5,
    covered: false,
  },
];

function RailBtn({ onClick, icon }: { onClick: () => void; icon: IconName }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `1px solid ${C.stoneLine}`,
        background: h ? C.slate : C.paper,
        color: h ? C.warm : C.slate,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        transition: "all 220ms ease",
      }}
    >
      <Icon name={icon} size={16} stroke={2} />
    </button>
  );
}

function ListingCard(props: Listing) {
  const { host, tone, neighborhood, city, price, rating, reviews, landmark, miles, covered } =
    props;
  const [h, setH] = useState(false);
  const [fav, setFav] = useState(false);
  const isPhone = useBreakpoint() === "phone";
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ flex: isPhone ? "0 0 300px" : "0 0 340px", scrollSnapAlign: "start", cursor: "pointer" }}
    >
      <div style={{ position: "relative" }}>
        <Photo tone={tone} src={props.src} height={isPhone ? 260 : 300} radius={22} label={`${host} · ${neighborhood}`} sizes="(max-width: 767px) 300px, 340px" />
        <button
          aria-label={fav ? "Remove from saved" : "Save listing"}
          aria-pressed={fav}
          onClick={(e) => {
            e.stopPropagation();
            setFav(!fav);
          }}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: isPhone ? 44 : 34,
            height: isPhone ? 44 : 34,
            borderRadius: "50%",
            background: "rgba(245,240,235,0.9)",
            border: 0,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            transform: fav ? "scale(1.08)" : "scale(1)",
            transition: "transform 240ms cubic-bezier(.22,.61,.36,1)",
          }}
        >
          <Icon name="heart" size={16} color={fav ? C.amberDeep : C.slate} stroke={2} />
        </button>
        {covered && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "rgba(245,240,235,0.9)",
              backdropFilter: "blur(6px)",
              padding: "4px 10px",
              borderRadius: 999,
              fontFamily: F.display,
              fontWeight: 600,
              fontSize: 11,
              color: C.slate,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon name="cover" size={11} color={C.slate} stroke={2} /> Covered
          </div>
        )}
      </div>
      <div
        style={{
          paddingTop: 14,
          transform: h ? "translateY(-2px)" : "translateY(0)",
          transition: "transform 240ms ease",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}
        >
          <div
            style={{
              fontFamily: F.display,
              fontWeight: 600,
              fontSize: 15,
              color: C.slate,
              letterSpacing: -0.2,
            }}
          >
            {host}’s driveway · {neighborhood}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontFamily: F.display,
              fontSize: 13,
              color: C.slate,
            }}
          >
            <Icon name="star" size={12} color={C.amber} /> {rating}
          </div>
        </div>
        <div style={{ fontFamily: F.display, fontSize: 14, color: C.stone, marginTop: 4 }}>
          {miles} mi from {landmark} · {city}
        </div>
        <div style={{ marginTop: 10, fontFamily: F.display, fontSize: 15, color: C.slate }}>
          <strong style={{ fontWeight: 600, letterSpacing: -0.2 }}>${price}</strong>
          <span style={{ color: C.stone, fontWeight: 400 }}>
            {" "}
            /hour · {reviews} reviews
          </span>
        </div>
      </div>
    </div>
  );
}

function FeaturedRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const isPhone = useBreakpoint() === "phone";
  const scrollBy = (dx: number) =>
    railRef.current && railRef.current.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section id="featured" style={{ padding: isPhone ? "40px 0 72px" : "60px 0 100px", scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isPhone ? "0 20px" : "0 32px" }}>
        <Rise>
          <SectionLabel num="02" text="Featured driveways" />
        </Rise>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <Rise delay={80}>
            <h2 style={h2Style()}>
              Real driveways. Real prices. <br />
              Real{" "}
              <span
                style={{ fontFamily: F.body, fontStyle: "italic", fontWeight: 400 }}
              >
                neighbours
              </span>
              .
            </h2>
          </Rise>
          <Rise delay={160}>
            <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
              <RailBtn onClick={() => scrollBy(-360)} icon="arrow-l" />
              <RailBtn onClick={() => scrollBy(360)} icon="arrow-r" />
            </div>
          </Rise>
        </div>
        <Rise delay={200}>
          <p
            style={{
              fontFamily: F.display,
              fontSize: 15,
              lineHeight: 1.5,
              color: C.stone,
              marginTop: 20,
              maxWidth: 580,
            }}
          >
            <span style={{ fontWeight: 600, color: C.slate }}>Example listings.</span>{" "}
            These are illustrations of the driveways, prices, and walk times you’ll
            find — not live inventory. Search your destination to see what’s actually
            available near you.
          </p>
        </Rise>
      </div>

      <div
        ref={railRef}
        className="rail"
        style={{
          display: "flex",
          gap: 20,
          overflowX: "auto",
          overflowY: "visible",
          padding: isPhone ? "28px 20px 20px" : "36px 32px 24px",
          scrollSnapType: "x mandatory",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {LISTINGS.map((l, i) => (
          <Rise key={i} delay={i * 60} y={20}>
            <ListingCard {...l} />
          </Rise>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// How it works
// ------------------------------------------------------------------
type StepDef = { icon: IconName; title: string; body: string };

const DRU_STEPS: StepDef[] = [
  {
    icon: "search",
    title: "Search your destination.",
    body: "Type the stadium, the airport, the block. We show every nearby driveway, sorted by walk time.",
  },
  {
    icon: "check-circle",
    title: "Reserve in thirty seconds.",
    body: "Pick your window. Pay once. The host gets a heads-up. Your spot is held the whole time.",
  },
  {
    icon: "car",
    title: "Pull in and park.",
    body: "Address, photos, and door code in your pocket. Walk five minutes. Make the kickoff.",
  },
];
const WAYNE_STEPS: StepDef[] = [
  {
    icon: "house",
    title: "List in five minutes.",
    body: "Three photos, a few measurements, your address. We handle the listing copy.",
  },
  {
    icon: "clock",
    title: "Set your hours.",
    body: "Weekends only. Game nights. Mornings while you’re at work. Your call, anytime.",
  },
  {
    icon: "wallet",
    title: "Get paid weekly.",
    body: "Direct deposit every Friday. No invoices. No chasing. We hold the funds, you receive them.",
  },
];

function SideToggle({
  side,
  setSide,
}: {
  side: "dru" | "wayne";
  setSide: (s: "dru" | "wayne") => void;
}) {
  const isPhone = useBreakpoint() === "phone";
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 4,
        borderRadius: 999,
        background: C.warmDeep,
        position: "relative",
      }}
    >
      {(["dru", "wayne"] as const).map((s) => (
        <button
          key={s}
          onClick={() => setSide(s)}
          style={{
            position: "relative",
            zIndex: 1,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            padding: isPhone ? "13px 22px" : "10px 22px",
            borderRadius: 999,
            fontFamily: F.display,
            fontWeight: 600,
            fontSize: 13,
            color: side === s ? C.warm : C.slate,
            transition: "color 280ms ease",
            minWidth: 130,
          }}
        >
          For {s === "dru" ? "Dru" : "Wayne"}
        </button>
      ))}
      <div
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          width: "calc(50% - 4px)",
          left: side === "dru" ? 4 : "calc(50%)",
          background: C.slate,
          borderRadius: 999,
          transition: "left 380ms cubic-bezier(.22,.61,.36,1)",
        }}
      />
    </div>
  );
}

function Step({ n, icon, title, body }: { n: number; icon: IconName; title: string; body: string }) {
  return (
    <div>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: C.paper,
          border: `1px solid ${C.stoneLine}`,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 12px 28px -16px rgba(44,44,42,0.25)",
        }}
      >
        <Icon name={icon} size={28} color={C.slate} stroke={1.6} />
      </div>
      <div
        style={{
          fontFamily: F.display, fontWeight: 500,
          fontSize: 11,
          color: C.stone,
          letterSpacing: 1.5,
          marginTop: 24,
          textTransform: "uppercase",
        }}
      >
        Step {String(n).padStart(2, "0")}
      </div>
      <h3
        style={{
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 24,
          lineHeight: 1.18,
          letterSpacing: -0.5,
          color: C.slate,
          marginTop: 10,
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: F.display,
          fontSize: 16,
          lineHeight: 1.55,
          color: C.slate,
          opacity: 0.75,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function HowItWorks() {
  const [side, setSide] = useState<"dru" | "wayne">("dru");
  const steps = side === "dru" ? DRU_STEPS : WAYNE_STEPS;
  const isPhone = useBreakpoint() === "phone";
  return (
    <section
      id="how"
      style={{ padding: isPhone ? "72px 20px 64px" : "120px 32px 100px", maxWidth: 1280, margin: "0 auto", scrollMarginTop: 80 }}
    >
      <Rise>
        <SectionLabel num="03" text="How it works" />
      </Rise>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <Rise delay={80}>
          <h2 style={h2Style()}>
            Six steps, three for each side. <br />
            That is the entire product.
          </h2>
        </Rise>
        <Rise delay={140}>
          <SideToggle side={side} setSide={setSide} />
        </Rise>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "repeat(3,1fr)",
          gap: 28,
          marginTop: isPhone ? 48 : 80,
        }}
      >
        {steps.map((s, i) => (
          <Rise key={side + i} delay={i * 100} y={24}>
            <Step n={i + 1} {...s} />
          </Rise>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Trust
// ------------------------------------------------------------------
const PILLARS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "check-circle",
    title: "Verified hosts",
    body: "ID, address, and home photos checked before any driveway goes live.",
  },
  {
    icon: "shield",
    title: "Insured parking",
    body: "Every booking covered up to $1M, on both sides of the marketplace.",
  },
  {
    icon: "star",
    title: "Real reviews",
    body: "Only verified drivers leave reviews. No fakes. No bots. Ever.",
  },
  {
    icon: "phone",
    title: "Local support",
    body: "A real person, in your city, picks up within sixty seconds.",
  },
];

const REVIEWS = [
  {
    quote:
      "“Beat $48 stadium parking by $32. Walked four minutes. Got home an hour earlier than I would have.”",
    who: "Andre · Berkeley · Apr 2026",
  },
  {
    quote: "“It paid for the new water heater. The driveway sits empty Tuesdays anyway.”",
    who: "Jen · Oakland Hills · Mar 2026",
  },
  {
    quote:
      "“I list during games, vacations, and weekdays I’m at the office. About $640 last month.”",
    who: "Marcus · Santa Clara · Feb 2026",
  },
];

function Trust() {
  const bp = useBreakpoint();
  const isPhone = bp === "phone";
  // 4 pillars are too tight at tablet width, so go 2-up on phone AND tablet.
  const isMobile = bp !== "desktop";
  return (
    <section
      id="trust"
      style={{ padding: isPhone ? "20px 20px 72px" : "20px 32px 100px", maxWidth: 1280, margin: "0 auto", scrollMarginTop: 80 }}
    >
      <Rise>
        <SectionLabel num="04" text="Trust, in plain sight" />
      </Rise>
      <Rise delay={80}>
        <h2 style={h2Style()}>
          Trust is the product. <br />
          <span style={{ color: C.stone }}>Everything else is decoration.</span>
        </h2>
      </Rise>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
          gap: 20,
          marginTop: isPhone ? 36 : 56,
        }}
      >
        {PILLARS.map((p, i) => (
          <Rise key={i} delay={i * 80} y={20}>
            <div
              style={{
                padding: 24,
                borderRadius: 20,
                background: C.warmSoftest,
                border: `1px solid ${C.stoneLineSoft}`,
                height: "100%",
              }}
            >
              <Icon name={p.icon} size={22} color={C.slate} stroke={1.6} />
              <h4
                style={{
                  fontFamily: F.display,
                  fontWeight: 600,
                  fontSize: 17,
                  color: C.slate,
                  margin: "14px 0 8px",
                  letterSpacing: -0.2,
                }}
              >
                {p.title}
              </h4>
              <p
                style={{
                  fontFamily: F.display,
                  fontSize: isPhone ? 15 : 14,
                  lineHeight: 1.55,
                  color: C.slate,
                  opacity: 0.72,
                  margin: 0,
                }}
              >
                {p.body}
              </p>
            </div>
          </Rise>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "1fr" : "repeat(3,1fr)",
          gap: 28,
          marginTop: isPhone ? 36 : 56,
        }}
      >
        {REVIEWS.map((r, i) => (
          <Rise key={i} delay={i * 100} y={18}>
            <figure style={{ margin: 0 }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {[0, 1, 2, 3, 4].map((s) => (
                  <Icon key={s} name="star" size={14} color={C.amber} />
                ))}
              </div>
              <blockquote
                style={{
                  fontFamily: F.display,
                  fontSize: 19,
                  lineHeight: 1.5,
                  color: C.slate,
                  margin: 0,
                }}
              >
                {r.quote}
              </blockquote>
              <figcaption
                style={{
                  fontFamily: F.display,
                  fontSize: 13,
                  color: C.stone,
                  marginTop: 14,
                }}
              >
                {r.who}
              </figcaption>
            </figure>
          </Rise>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Calculator
// ------------------------------------------------------------------
const CITIES = [
  {
    key: "sc",
    name: "Santa Clara",
    rate: 11,
    hours: 95,
    vibe: "Game nights + weekday commuters",
  },
  {
    key: "sf",
    name: "San Francisco",
    rate: 8,
    hours: 110,
    vibe: "Stadiums, concerts, downtown",
  },
  {
    key: "oak",
    name: "Oakland",
    rate: 6,
    hours: 85,
    vibe: "BART-adjacent, A’s + Warriors",
  },
  {
    key: "pa",
    name: "Palo Alto",
    rate: 9,
    hours: 70,
    vibe: "Office commuters, no street parking",
  },
  {
    key: "sm",
    name: "San Mateo",
    rate: 7,
    hours: 60,
    vibe: "CalTrain, airport overflow",
  },
] as const;

function Calculator() {
  const [cityKey, setCityKey] = useState<(typeof CITIES)[number]["key"]>("sc");
  const city = CITIES.find((c) => c.key === cityKey)!;
  const [hours, setHours] = useState<number>(city.hours);
  useEffect(() => {
    setHours(city.hours);
  }, [city.hours]);
  const monthly = Math.round(city.rate * hours * 0.92);
  const yearly = monthly * 12;
  const [ref, shown] = useReveal({ threshold: 0.25 });
  const bp = useBreakpoint();
  const isPhone = bp === "phone";
  const stack = bp !== "desktop";

  return (
    <section
      ref={ref}
      id="calculator"
      style={{ padding: isPhone ? "56px 20px 80px" : "80px 32px 120px", maxWidth: 1280, margin: "0 auto", scrollMarginTop: 80 }}
    >
      <Rise>
        <SectionLabel num="05" text="Earnings calculator" />
      </Rise>
      <Rise delay={80}>
        <h2 style={h2Style()}>
          See what your driveway <br />
          could earn this month.
        </h2>
      </Rise>

      <div
        style={{
          marginTop: isPhone ? 36 : 56,
          background: C.slate,
          color: C.warm,
          borderRadius: isPhone ? 22 : 32,
          padding: isPhone ? 22 : 40,
          display: "grid",
          gridTemplateColumns: stack ? "1fr" : "1fr 1.1fr",
          gap: stack ? 32 : 56,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }}
        >
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke={C.warm} strokeWidth={1} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: F.display, fontWeight: 500,
              fontSize: 11,
              letterSpacing: 1.5,
              color: C.stoneSoft,
              textTransform: "uppercase",
            }}
          >
            Where is your driveway?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {CITIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCityKey(c.key)}
                style={{
                  padding: isPhone ? "13px 16px" : "10px 16px",
                  borderRadius: 999,
                  border: `1px solid ${
                    cityKey === c.key ? C.amber : "rgba(245,240,235,0.16)"
                  }`,
                  background: cityKey === c.key ? C.amberSoft : "transparent",
                  color: cityKey === c.key ? C.amber : C.warm,
                  fontFamily: F.display,
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 220ms ease",
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: 36,
              fontFamily: F.display, fontWeight: 500,
              fontSize: 11,
              letterSpacing: 1.5,
              color: C.stoneSoft,
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span>Hours you’d list it · per month</span>
            <span
              style={{
                color: C.warm,
                fontFamily: F.display,
                fontSize: 14,
                letterSpacing: 0,
                textTransform: "none",
              }}
            >
              {hours} hrs
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={200}
            step={5}
            value={hours}
            onChange={(e) => setHours(+e.target.value)}
            style={{ width: "100%", marginTop: 14, accentColor: C.amber, height: 4 }}
          />
          <div
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              borderRadius: 16,
              background: "rgba(245,240,235,0.05)",
              border: "1px solid rgba(245,240,235,0.08)",
            }}
          >
            <Icon name="sun" size={20} color={C.amber} />
            <div
              style={{
                fontFamily: F.display,
                fontSize: 14,
                lineHeight: 1.5,
                color: C.warm,
                opacity: 0.85,
              }}
            >
              {city.vibe}.
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.display, fontWeight: 500,
                fontSize: 11,
                letterSpacing: 1.5,
                color: C.stoneSoft,
                textTransform: "uppercase",
              }}
            >
              Estimated monthly earnings
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontWeight: 600,
                fontSize: "clamp(44px, 8vw, 128px)",
                lineHeight: 0.95,
                letterSpacing: -3,
                marginTop: 16,
                color: C.amber,
              }}
            >
              ${shown ? <CountUp to={monthly} duration={1400} key={monthly} /> : 0}
            </div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 18,
                color: C.warm,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              ≈ ${yearly.toLocaleString()} per year
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <div
              style={{
                fontFamily: F.display, fontWeight: 500,
                fontSize: 11,
                letterSpacing: 1.5,
                color: C.stoneSoft,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              When you’ll earn it
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 96 }}>
              {[28, 46, 32, 38, 72, 88, 56].map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    height: "100%",
                  }}
                >
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        background:
                          i === 4 || i === 5 ? C.amber : "rgba(245,240,235,0.2)",
                        height: shown ? `${v}%` : 0,
                        borderRadius: 4,
                        transition: `height 1100ms cubic-bezier(.22,.61,.36,1) ${i * 60}ms`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: F.display, fontWeight: 500,
                      fontSize: 10,
                      color: C.stoneSoft,
                      marginTop: 6,
                      textAlign: "center",
                    }}
                  >
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a
            href={APP.list}
            style={{
              marginTop: 36,
              alignSelf: "flex-start",
              background: C.amber,
              color: C.slate,
              border: 0,
              borderRadius: 999,
              padding: "14px 24px",
              fontFamily: F.display,
              fontWeight: 600,
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 12px 30px -8px rgba(232,160,64,0.45)",
            }}
          >
            Start your listing <Icon name="arrow-r" size={14} color={C.slate} stroke={2.2} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Origin story
// ------------------------------------------------------------------
function Story() {
  const isPhone = useBreakpoint() === "phone";
  return (
    <section id="story" style={{ padding: isPhone ? "56px 0 72px" : "80px 0 100px", scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isPhone ? "0 20px" : "0 32px" }}>
        <Rise>
          <SectionLabel num="06" text="Where we started" />
        </Rise>
      </div>

      <Rise delay={80} y={24}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isPhone ? "0 20px" : "0 32px" }}>
          {/* Levi's Stadium, Santa Clara. Photo: Dvortygirl / Wikimedia Commons,
              CC BY 4.0. See public/photos/CREDITS.md for full attribution. */}
          <Photo
            tone="dusk"
            src="/photos/story.jpg"
            label="Tasman Drive, Santa Clara · 5:08 PM, a Sunday in November"
            height={isPhone ? 300 : 460}
            radius={28}
          />
        </div>
      </Rise>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: isPhone ? "40px 20px 0" : "64px 32px 0" }}>
        <Rise delay={80}>
          <p
            style={{
              fontFamily: F.display,
              fontSize: isPhone ? 18 : 22,
              lineHeight: 1.55,
              color: C.slate,
              margin: 0,
            }}
          >
            It started on a Sunday in November, a few blocks from Levi’s Stadium. There was a
            game at four. By two, the cars were circling — slow, frustrated, looking for
            somewhere to leave a vehicle for three hours and a half. From a porch, a homeowner
            watched, and noticed: his own driveway, the one his car was not parked on, was
            empty.
          </p>
        </Rise>
        <Rise delay={180}>
          <p
            style={{
              fontFamily: F.display,
              fontSize: isPhone ? 18 : 22,
              lineHeight: 1.55,
              color: C.slate,
              margin: "28px 0 0",
            }}
          >
            That afternoon, a driver paid him $25. They shook hands. The next weekend, the
            same driver came back. By spring, the porch had a clipboard. By summer, a
            neighbour was doing it too.
          </p>
        </Rise>
        <Rise delay={280}>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 16,
              color: C.slate,
              opacity: 0.7,
              marginTop: 56,
              fontStyle: "italic",
            }}
          >
            We are not a tech platform. We are a neighbour.
          </p>
        </Rise>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Final CTA + Footer
// ------------------------------------------------------------------
function FinalCTA() {
  const isPhone = useBreakpoint() === "phone";
  return (
    <section style={{ background: C.slate, color: C.warm, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          right: isPhone ? -80 : -120,
          top: 40,
          opacity: 0.08,
          transform: "rotate(-12deg)",
        }}
      >
        <Icon name="pin-fill" size={isPhone ? 300 : 520} color={C.amber} />
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isPhone ? "96px 20px 80px" : "160px 32px 120px",
          position: "relative",
        }}
      >
        <Rise>
          <div
            style={{
              fontFamily: F.display, fontWeight: 500,
              fontSize: 11,
              letterSpacing: 1.5,
              color: C.stoneSoft,
              textTransform: "uppercase",
            }}
          >
            One last thing
          </div>
        </Rise>
        <Rise delay={100}>
          <h2
            style={{
              fontFamily: F.display,
              fontWeight: 600,
              fontSize: "clamp(34px, 6.4vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: -2,
              color: C.warm,
              margin: "24px 0 0",
              maxWidth: 1000,
            }}
          >
            That driveway down the street is{" "}
            <span
              style={{
                fontFamily: F.body,
                fontStyle: "italic",
                fontWeight: 400,
                color: C.amber,
              }}
            >
              still sitting empty.
            </span>
          </h2>
        </Rise>
        <Rise delay={220}>
          <div style={{ display: "flex", gap: 14, marginTop: 56, flexWrap: "wrap" }}>
            <a
              href={APP.find}
              style={{
                background: C.amber,
                color: C.slate,
                border: 0,
                borderRadius: 999,
                padding: "18px 30px",
                fontFamily: F.display,
                fontWeight: 600,
                fontSize: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                textDecoration: "none",
                boxShadow: "0 14px 40px -12px rgba(232,160,64,0.5)",
              }}
            >
              Find a spot <Icon name="arrow-r" size={16} color={C.slate} stroke={2.2} />
            </a>
            <a
              href={APP.list}
              style={{
                background: "transparent",
                color: C.warm,
                border: "1px solid rgba(245,240,235,0.28)",
                borderRadius: 999,
                padding: "18px 30px",
                fontFamily: F.display,
                fontWeight: 600,
                fontSize: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              List your driveway <Icon name="arrow-r" size={16} color={C.warm} stroke={2.2} />
            </a>
          </div>
        </Rise>
      </div>
    </section>
  );
}

function FootCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 13,
          color: C.warm,
          marginBottom: 18,
          letterSpacing: -0.1,
        }}
      >
        {title}
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              style={{
                fontFamily: F.display,
                fontSize: 14,
                color: C.warm,
                opacity: 0.65,
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  const isPhone = useBreakpoint() === "phone";
  return (
    <footer style={{ background: C.slate, color: C.warm, paddingTop: 4 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isPhone ? "0 20px 48px" : "0 32px 56px" }}>
        <div style={{ height: 1, background: "rgba(245,240,235,0.12)" }} />
        <div
          style={{
            paddingTop: 56,
            display: "grid",
            gridTemplateColumns: isPhone ? "1fr 1fr" : "1.4fr 1fr 1fr 1fr",
            gap: isPhone ? 28 : 40,
          }}
        >
          <div>
            <Brandmark size={44} />
            <p
              style={{
                fontFamily: F.display,
                fontSize: 14,
                lineHeight: 1.55,
                color: C.warm,
                opacity: 0.6,
                marginTop: 16,
                maxWidth: 280,
              }}
            >
              We started in California. We are coming to your block.
            </p>
          </div>
          <FootCol
            title="Product"
            links={[
              { label: "Find a spot", href: APP.find },
              { label: "List your driveway", href: APP.list },
              { label: "How it works", href: "#how" },
              { label: "Trust & safety", href: "#trust" },
            ]}
          />
          <FootCol
            title="Cities"
            links={[
              { label: "San Francisco", href: "#featured" },
              { label: "Oakland", href: "#featured" },
              { label: "Santa Clara", href: "#featured" },
              { label: "Palo Alto", href: "#featured" },
              { label: "San Mateo", href: "#featured" },
              { label: "Berkeley", href: "#featured" },
            ]}
          />
          <FootCol
            title="Company"
            links={[
              { label: "Our story", href: "#story" },
              { label: "Careers", href: "#" },
              { label: "Press", href: "#" },
              { label: "Help center", href: "#trust" },
            ]}
          />
        </div>
        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: "1px solid rgba(245,240,235,0.12)",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: F.display,
            fontSize: 12,
            color: C.warm,
            opacity: 0.5,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span>© 2026 Dryvway, Inc.</span>
          <span>
            <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
              Privacy
            </a>
            {" · "}
            <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
              Terms
            </a>
            {" · Insurance"}
          </span>
        </div>
      </div>
    </footer>
  );
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------
export default function Page() {
  return (
    <div style={{ background: C.warm, minHeight: "100vh", overflowX: "hidden" }}>
      <Nav />
      <Hero />
      <TwoSided />
      <FeaturedRail />
      <HowItWorks />
      <Trust />
      <Calculator />
      <Story />
      <FinalCTA />
      <Footer />
    </div>
  );
}
