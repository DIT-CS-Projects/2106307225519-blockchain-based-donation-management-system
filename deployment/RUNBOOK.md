# Changia — Production Deploy Runbook

## LIVE (deployed 2026-07-29)

| Piece | URL / value |
| ----- | ----------- |
| Frontend (Vercel) | https://changia-hazel.vercel.app |
| Backend (Render) | https://changia-api.onrender.com (health: `/api/health`) |
| Database | Neon (same instance as local dev) |
| Contract (Sepolia) | `0x353b6cdaD14774412B5C7612F0C0D153378F213A` |
| Backend wallet | `0x45338f0ba58b3b114d3545C45055f5b35d4bf716` |
| Blockchain RPC | `https://ethereum-sepolia-rpc.publicnode.com` (public, no key) |

Render service id `srv-d9kisv5aeets739i0e50`, deploys from `main` via
[`render.yaml`](../render.yaml). Vercel project `changia`
(scope `wrapitupps-projects`), env `VITE_API_BASE_URL` =
`https://changia-api.onrender.com/api`. Redeploy either by pushing to `main`.

Free-tier reality: the backend sleeps after ~15 min idle (first request then
takes 30-60s), and uploaded images are ephemeral (no disk). See
[Making uploads durable](#making-uploads-durable).

---

Concrete, step-by-step deploy of the live platform.

**Target architecture**

| Tier       | Host                    | URL (example)                   |
| ---------- | ----------------------- | ------------------------------- |
| Frontend   | Vercel (static)         | `https://changia.vercel.app`    |
| Backend    | Render (Node web svc)   | `https://changia-api.onrender.com` |
| Database   | Neon (managed Postgres) | already provisioned             |
| Blockchain | Ethereum Sepolia        | contract on-chain               |

Config already committed for this: [`render.yaml`](../render.yaml),
[`client/vercel.json`](../client/vercel.json), and the cross-site cookie fix in
[`server/src/utils/authCookies.ts`](../server/src/utils/authCookies.ts).

Do the steps in order. Steps 1–3 can be done in parallel; step 4 (backend)
needs the outputs of 1–3, and step 5 (frontend) needs the backend URL.

---

## 0. Prerequisites

- GitHub: this repo pushed to GitHub (Render and Vercel deploy from it).
- Accounts (all free): [Render](https://render.com),
  [Vercel](https://vercel.com), [Alchemy](https://alchemy.com) (Sepolia RPC).
- The dedicated backend wallet generated for this deploy (address below).

---

## 1. Blockchain — deploy the contract to Sepolia

The backend signs proof transactions from a dedicated wallet. **Do not** reuse
the Hardhat dev key from `server/.env` — it is a public well-known key and
would be drained instantly on a real network. A fresh wallet was generated for
you:

```
Address     : 0x45338f0ba58b3b114d3545C45055f5b35d4bf716
Private key  : (handed to you in chat — store as a secret, never commit)
```

1. **Get a Sepolia RPC URL.** Alchemy → Create App → chain "Ethereum", network
   "Sepolia" → copy the HTTPS URL
   (`https://eth-sepolia.g.alchemy.com/v2/XXXX`).

2. **Fund the wallet.** Paste the address above into a Sepolia faucet
   (e.g. https://sepoliafaucet.com or Alchemy's faucet). ~0.1 test ETH is
   plenty for contract deploy + many proof transactions.

3. **Create `contracts/.env`** (gitignored) from the example:

   ```
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/XXXX
   BACKEND_WALLET_PRIVATE_KEY=0x...   # the private key handed to you
   ETHERSCAN_API_KEY=                 # optional, for source verification
   ```

4. **Deploy the contract** (from `contracts/`):

   ```bash
   cd contracts
   npm ci
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

   Copy the printed `TransparencyRegistry deployed to: 0x...` address — that is
   your `CONTRACT_ADDRESS`.

You now have three values for the backend: `BLOCKCHAIN_RPC_URL` (the Alchemy
URL), `BACKEND_WALLET_PRIVATE_KEY`, and `CONTRACT_ADDRESS`.

---

## 2. Database — Neon (already provisioned)

The app already runs against Neon, so the schema is live. Just confirm:

- You have the Neon connection string (`postgresql://...?sslmode=require`) for
  step 4's `DATABASE_URL`.
- If this branch added migrations, apply them against the production DB before
  going live:

  ```bash
  cd server
  DATABASE_URL="postgresql://...neon..." npm run db:migrate
  ```

- Seed the first admin (once), so you can log in to the admin console:

  ```bash
  cd server
  DATABASE_URL="postgresql://...neon..." \
  ADMIN_NAME="Admin" ADMIN_EMAIL="you@example.com" \
  ADMIN_PHONE="0700000000" ADMIN_PASSWORD="a-strong-password" \
  npm run db:seed:admin
  ```

---

## 3. Push to GitHub

Render and Vercel both deploy from the repo. Make sure `render.yaml`,
`client/vercel.json`, and the `authCookies.ts` change are committed and pushed.

---

## 4. Backend — Render

1. Render Dashboard → **New → Blueprint** → connect this repo. Render reads
   [`render.yaml`](../render.yaml) and proposes the `changia-api` service.
2. It will prompt for the secrets marked `sync: false`. Set:
   - `DATABASE_URL` — the Neon string.
   - `BLOCKCHAIN_RPC_URL` — the Alchemy Sepolia URL from step 1.
   - `BACKEND_WALLET_PRIVATE_KEY` — the private key from step 1.
   - `CONTRACT_ADDRESS` — the deployed address from step 1.
   - `CLIENT_ORIGIN` — leave a placeholder for now
     (e.g. `https://changia.vercel.app`); you will correct it after step 5.
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — leave blank; Render
     auto-generates them (`generateValue: true`).
3. Deploy. When it's live, note the URL, e.g.
   `https://changia-api.onrender.com`. Health check:
   `https://changia-api.onrender.com/api/health` should return OK.

**Free-tier caveats (by design):**
- The service **sleeps after ~15 min idle**; the first request then takes
  ~30–60s to wake. Fine for a demo.
- Uploaded images are **ephemeral** — the free plan has no persistent disk, so
  campaign/beneficiary images reset on each deploy/restart. See
  [Making uploads durable](#making-uploads-durable) to fix.

---

## 5. Frontend — Vercel

1. Vercel → **Add New → Project** → import this repo.
2. **Root Directory: `client`** (important — the app is not at repo root).
   Vercel auto-detects Vite; [`client/vercel.json`](../client/vercel.json)
   supplies the SPA rewrite and build settings.
3. Add an environment variable:
   - `VITE_API_BASE_URL = https://changia-api.onrender.com/api`
     (your Render URL from step 4, **with the `/api` suffix**).
4. Deploy. Note the URL, e.g. `https://changia.vercel.app`.

---

## 6. Close the loop (CORS + cookies)

The backend only accepts the frontend origin it was told about.

1. Back in Render → `changia-api` → Environment → set **`CLIENT_ORIGIN`** to the
   exact Vercel URL from step 5 (no trailing slash), e.g.
   `https://changia.vercel.app`. Save → it redeploys.

This makes CORS allow the frontend and lets the cross-site refresh cookie
(`SameSite=None; Secure`, already handled in code for production) flow. Without
this, login works but sessions won't refresh.

---

## 7. Smoke test the live site

Visit the Vercel URL and verify:

- [ ] Register a donor → email verification logs to Render logs
      (EMAIL_PROVIDER=console) — copy the link from logs to verify.
- [ ] Log in; refresh the page — you stay logged in (proves the cross-site
      cookie works).
- [ ] Make a donation through the mock checkout → receipt generated.
- [ ] Open the donation's **/verify** page → shows a real Sepolia tx hash;
      the "View on Etherscan" link resolves on sepolia.etherscan.io.
- [ ] Log in as the seeded admin → admin console loads.

---

## Making uploads durable

Free Render has no disk, so uploads are ephemeral. Two options:

**A. Render persistent disk (simplest, ~$7/mo).** Upgrade `changia-api` to the
`starter` plan and add to its service in `render.yaml`:

```yaml
    plan: starter
    disk:
      name: uploads
      mountPath: /opt/render/project/src/server/uploads
      sizeGB: 1
```

The app already reads/writes `server/uploads`, so no code change is needed.

**B. Object storage (Cloudflare R2 / S3, free tier).** Swap the Multer disk
storage in [`server/src/middleware/upload.ts`](../server/src/middleware/upload.ts)
for an S3-compatible client and serve public URLs. More work; only worth it if
you outgrow a single disk.

---

## Optional upgrades

- **Real email:** set `EMAIL_PROVIDER=smtp` and `SMTP_HOST/PORT/USER/PASS/FROM`
  on Render (e.g. a free Brevo/Resend SMTP) to send verification + receipt mail
  instead of logging it.
- **Keep backend awake:** a free uptime pinger (e.g. UptimeRobot hitting
  `/api/health` every 10 min) avoids cold starts during a demo.
- **Custom domain:** add it in Vercel (frontend) and Render (backend), then
  update `VITE_API_BASE_URL` and `CLIENT_ORIGIN` to the new hosts.
