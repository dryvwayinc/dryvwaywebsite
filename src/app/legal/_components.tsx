import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { C, F } from "../theme";

// ------------------------------------------------------------------
// Shared scaffold for the long-form legal pages (Privacy, Terms).
// Server components — static text, no interactivity. They borrow the
// landing page's palette, fonts, and numbered-section aesthetic but use
// a minimal chrome (logo + back-to-home) rather than the marketing Nav.
// ------------------------------------------------------------------

const MEASURE = 760;

// Small uppercase eyebrow with a leading rule — mirrors SectionLabel on
// the landing page (page.tsx).
function eyebrowStyle(): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 14,
    fontFamily: F.display,
    fontWeight: 500,
    fontSize: 11,
    color: C.stone,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  };
}

function HomeLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/"
      style={{
        fontFamily: F.display,
        fontWeight: 500,
        fontSize: 14,
        color: C.slate,
        textDecoration: "none",
        opacity: 0.75,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </Link>
  );
}

function Brandmark({ size = 30 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Dryvway"
      width={size}
      height={size}
      style={{ display: "block", borderRadius: 7 }}
    />
  );
}

export function LegalShell({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div style={{ background: C.warm, minHeight: "100vh", color: C.slate }}>
      {/* Top bar */}
      <header
        style={{
          borderBottom: `1px solid ${C.stoneLine}`,
          background: "rgba(245,240,235,0.82)",
          backdropFilter: "saturate(140%) blur(14px)",
          WebkitBackdropFilter: "saturate(140%) blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "16px clamp(20px, 5vw, 32px)",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <Link href="/" style={{ display: "inline-flex", textDecoration: "none" }}>
            <Brandmark size={42} />
          </Link>
          <div style={{ flex: 1 }} />
          <HomeLink>← Back to home</HomeLink>
        </div>
      </header>

      {/* Title + body */}
      <main style={{ maxWidth: MEASURE, margin: "0 auto", padding: "clamp(48px, 9vw, 72px) clamp(20px, 5vw, 32px) 96px" }}>
        <div style={eyebrowStyle()}>
          <span style={{ width: 32, height: 1, background: C.stoneLine }} />
          {effectiveDate}
        </div>
        <h1
          style={{
            fontFamily: F.display,
            fontWeight: 600,
            fontSize: "clamp(30px, 4vw, 52px)",
            lineHeight: 1.06,
            letterSpacing: -1.4,
            color: C.slate,
            margin: "24px 0 0",
          }}
        >
          {title}
        </h1>

        <div style={{ marginTop: 8 }}>{children}</div>
      </main>

      {/* Slim footer */}
      <footer style={{ background: C.slate, color: C.warm }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "28px clamp(20px, 5vw, 32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Brandmark size={38} />
            <span
              style={{
                fontFamily: F.display,
                fontSize: 12,
                color: C.warm,
                opacity: 0.5,
              }}
            >
              © 2026 Dryvway, Inc.
            </span>
          </div>
          <Link
            href="/"
            style={{
              fontFamily: F.display,
              fontSize: 13,
              color: C.warm,
              opacity: 0.65,
              textDecoration: "none",
            }}
          >
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginTop: 56 }}>
      <div style={{ ...eyebrowStyle(), marginBottom: 12 }}>
        <span style={{ width: 32, height: 1, background: C.stoneLine }} />
        {num}
      </div>
      <h2
        style={{
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 20,
          lineHeight: 1.3,
          letterSpacing: -0.3,
          color: C.slate,
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

const bodyStyle: CSSProperties = {
  fontFamily: F.display,
  fontSize: 16,
  lineHeight: 1.7,
  color: C.slate,
  opacity: 0.78,
  margin: 0,
};

export function P({ children }: { children: ReactNode }) {
  return <p style={{ ...bodyStyle, marginTop: 16 }}>{children}</p>;
}

export function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: "16px 0 0",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            ...bodyStyle,
            position: "relative",
            paddingLeft: 20,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 2,
              top: "0.62em",
              width: 6,
              height: 6,
              borderRadius: 999,
              background: C.amber,
            }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Contact({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: 24,
        padding: "20px 24px",
        borderRadius: 16,
        background: C.warmSoftest,
        border: `1px solid ${C.stoneLineSoft}`,
      }}
    >
      {children}
    </div>
  );
}

export function MailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      style={{ color: C.amberDeep, textDecoration: "none", fontWeight: 500 }}
    >
      {email}
    </a>
  );
}
