import Link from "next/link";
import { C, F } from "../../theme";
import { employmentTypeLabel } from "../_lib/format";
import type { PublicRole } from "../_lib/types";

export function RoleCard({ role }: { role: PublicRole }) {
  const meta = [employmentTypeLabel(role.employment_type), role.location, role.pay]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={`/careers/${role.id}`}
      style={{
        display: "block",
        padding: "20px 24px",
        borderRadius: 16,
        background: C.warmSoftest,
        border: `1px solid ${C.stoneLine}`,
        textDecoration: "none",
        color: C.slate,
      }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: -0.3,
          overflowWrap: "anywhere",
        }}
      >
        {role.title}
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 14,
          color: C.stone,
          marginTop: 6,
          overflowWrap: "anywhere",
        }}
      >
        {meta}
      </div>
    </Link>
  );
}
