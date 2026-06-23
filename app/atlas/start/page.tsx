import { AtlasOnboarding } from "@/components/AtlasOnboarding";

export const dynamic = "force-dynamic";

// The full clickable flow for screen-recording: connect → set target → home.
export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <AtlasOnboarding />
    </main>
  );
}
