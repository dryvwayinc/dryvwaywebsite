import type { ReactNode } from "react";
import { C, F } from "../../theme";
import { MinimalHeader } from "../../legal/_components";

const MEASURE = 760;

export function CareersShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ background: C.warm, minHeight: "100vh", color: C.slate }}>
      <MinimalHeader />
      <main
        style={{
          maxWidth: MEASURE,
          margin: "0 auto",
          padding: "clamp(40px, 8vw, 72px) clamp(20px, 5vw, 32px) 96px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: F.display,
            fontWeight: 500,
            fontSize: 11,
            color: C.stone,
            letterSpacing: 1.6,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 32, height: 1, background: C.stoneLine }} />
          {eyebrow}
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
            overflowWrap: "anywhere",
          }}
        >
          {title}
        </h1>
        <div style={{ marginTop: 24 }}>{children}</div>
      </main>
    </div>
  );
}

export const bodyText = {
  fontFamily: F.display,
  fontSize: 16,
  lineHeight: 1.7,
  color: C.slate,
  opacity: 0.78,
  margin: 0,
} as const;
