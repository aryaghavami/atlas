import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaidClient";
import { CountryCode, Products } from "plaid";

export async function POST() {
  try {
    // redirect_uri is required for OAuth banks on a hosted domain; it must EXACTLY match a
    // URI registered in the Plaid dashboard (Team Settings → API → Allowed redirect URIs).
    const redirect_uri = process.env.PLAID_REDIRECT_URI || undefined;
    const r = await plaid.linkTokenCreate({
      user: { client_user_id: "atlas-user" },
      client_name: "Datum",
      products: [Products.Auth, Products.Transactions, Products.Liabilities, Products.Investments],
      country_codes: [CountryCode.Us],
      language: "en",
      ...(redirect_uri ? { redirect_uri } : {}),
    });
    return NextResponse.json({ link_token: r.data.link_token });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: (e as any)?.response?.data ?? String(e) }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
