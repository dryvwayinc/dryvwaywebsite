import { parseDescription } from "../_lib/format";
import { bodyText } from "./CareersShell";

export function Description({ text }: { text: string }) {
  const blocks = parseDescription(text);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {blocks.map((b, i) =>
        b.kind === "p" ? (
          <p key={i} style={{ ...bodyText, overflowWrap: "anywhere" }}>
            {b.text}
          </p>
        ) : (
          <ul key={i} style={{ ...bodyText, paddingLeft: 22, margin: 0 }}>
            {b.items.map((item, j) => (
              <li key={j} style={{ overflowWrap: "anywhere" }}>
                {item}
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
