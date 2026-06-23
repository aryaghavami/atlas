import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

// Server-only Plaid client. Keys come from .env.local (PLAID_CLIENT_ID / PLAID_SECRET).
// PLAID_ENV: "sandbox" (fake banks, build/test) | "production" (real banks — needs Plaid prod access).
const env = (process.env.PLAID_ENV || "sandbox") as keyof typeof PlaidEnvironments;

export const plaid = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  })
);
