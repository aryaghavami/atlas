import { AtlasLanding } from "@/components/AtlasLanding";

export const dynamic = "force-dynamic";

// Root → the free-funnel landing (hook + email gate → unlock the demo + deploy-your-own).
// The interactive demo itself lives at /atlas/start.
export default function Page() {
  return <AtlasLanding />;
}
