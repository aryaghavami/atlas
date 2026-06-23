import { AtlasOnboarding } from "@/components/AtlasOnboarding";

export const dynamic = "force-dynamic";

// The real flow: live Plaid Link → figures computed from your actual accounts.
// Needs PLAID_CLIENT_ID / PLAID_SECRET in .env.local.
export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <AtlasOnboarding live />
    </main>
  );
}
