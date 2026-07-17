# Product

## Register

brand

## Platform

web

## Users

Primary: donors in Tanzania — individuals and organizations who give to fundraising campaigns using the payment rails they already trust (M-Pesa, Tigo Pesa, Airtel Money, bank transfer via AzamPay). Many are first-time online donors with little technical experience; they arrive skeptical about where charity money actually goes, and they want to give in a few minutes on a phone.

Secondary: NGO administrators who create and manage campaigns, verify beneficiaries, and disburse funds through the logged-in dashboard. The dashboard is a product-register surface; design tasks there override the default register.

## Product Purpose

Changia is a donation platform that makes charitable giving in Tanzania verifiable. Donors contribute to verified NGO campaigns with familiar local payment methods; every completed donation and disbursement is anchored to an immutable blockchain proof that anyone can check. Success looks like a skeptical first-time visitor completing a donation and later verifying, on their own, that it reached the campaign — then coming back to give again.

## Positioning

The only way to give where you can independently prove what happened to your money — familiar Tanzanian payments in front, immutable verification behind.

## Conversion & proof

- Primary CTA: Browse campaigns. Secondary CTA: How verification works — the objection-handler for skeptics, and it feeds back into Browse.
- The line a visitor remembers after 10 seconds: "Transparent giving, verified forever."
- Belief ladder (trust-first): 1. This platform is legitimate → 2. These campaigns and NGOs are verified → 3. My money actually reaches the beneficiary → 4. I can prove it afterward, myself → donate.
- Proof on hand: none yet (pre-launch). The verification mechanism itself is the proof: live on-chain records, the public verification page, receipts, and the how-it-works story. Never fabricate testimonials, partner logos, or impact numbers.

## Brand Personality

Confident, precise, calm. The voice of a serious financial platform that happens to serve generosity: it never begs, never guilt-trips, never shouts. Donors should feel the same quiet assurance they get from a good banking app — the money is safe, the system is serious, nothing is hidden.

## Anti-references

- Charity-website cliché: sad-imagery guilt appeals, hand-heart icons, the generic NGO template feel.
- Crypto/web3 aesthetics: dark neon gradients, coin imagery, wallet-speak. Blockchain stays invisible; verification stays visible.
- Corporate bank stiffness: navy-suit formality, legalese energy, cold institutional distance.
- University-project look: default template spacing, stock layouts, inconsistent components.

## Design Principles

1. Proof over promises — never ask to be trusted; show the verifiable record. Every trust claim on a screen should be one click from its evidence.
2. Familiar in front, immutable behind — paying feels like the mobile-money flows donors already know; blockchain complexity never leaks into the interface.
3. Calm confidence, not charity urgency — no guilt, no countdown pressure. Donors are treated like investors in outcomes, not marks for sympathy.
4. Fintech precision everywhere — spacing, loading states, empty states, and copy held to the standard of Revolut, Stripe, and Linear; nothing ships that reads "good enough for a student project".

## Accessibility & Inclusion

Keyboard navigation, ARIA labels, visible focus states, readable contrast (4.5:1 body-text bar), and fully responsive layouts are repo-level requirements (CLAUDE.md). Many donors are on low-end Android devices over slow connections, so performance and low data weight are accessibility concerns here, not just polish. Reduced-motion preferences are honored on every animation.
