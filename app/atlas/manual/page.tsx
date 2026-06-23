import { AtlasManual } from "@/components/AtlasManual";

export const dynamic = "force-dynamic";

// Manual holdings editor - add assets/debts Plaid can't reach; they fold into net worth.
export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <AtlasManual />
    </main>
  );
}
