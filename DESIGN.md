---
name: Tuma
description: Transparent giving, verified forever.
colors:
  harbor-teal: "#0f766e"
  harbor-teal-deep: "#115e59"
  harbor-teal-tint: "#ccfbf1"
  signal-coral: "#ff6b6b"
  ink-slate: "#0f172a"
  slate-mist: "#64748b"
  cloud-slate: "#f8fafc"
  clean-white: "#ffffff"
  whisper-slate: "#f1f5f9"
  border-slate: "#e2e8f0"
  success-green: "#16a34a"
  warning-amber: "#f59e0b"
  destructive-red: "#dc2626"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(3rem, 6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.harbor-teal}"
    textColor: "{colors.clean-white}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.harbor-teal-deep}"
  button-secondary:
    backgroundColor: "{colors.clean-white}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "40px"
  badge-verified:
    backgroundColor: "{colors.harbor-teal-tint}"
    textColor: "{colors.harbor-teal-deep}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
---

# Design System: Tuma

## 1. Overview

**Creative North Star: "The Glass Ledger"**

Tuma is a financial record you can see straight through: everything visible, permanent, precise. The interface carries the quiet assurance of a serious banking app — confident, precise, calm — while its single promise (every shilling provable) shapes every visual decision. Light, airy slate surfaces read like a clean page of accounts; Harbor Teal marks the institution's voice; proof elements (receipts, verification links, on-chain records) are always one click away and visually privileged when they appear.

This system explicitly rejects the charity-website cliché (guilt imagery, hand-heart icons, template NGO layouts), crypto/web3 aesthetics (dark neon gradients, coin imagery — blockchain stays invisible, verification stays visible), corporate bank stiffness, and anything with a university-project look. It is closer to Revolut and Stripe than to any donation site.

**Key Characteristics:**
- Light, spacious, ledger-clean surfaces with generous whitespace
- One institutional color (Harbor Teal) used with restraint
- Serif display voice over a working sans body
- Flat at rest; depth appears only as a response to state
- Proof and verification elements treated as first-class UI citizens

## 2. Colors

A restrained palette: cool slate neutrals carry the page, Harbor Teal speaks for the institution, and Signal Coral appears rarely as a human pulse.

### Primary
- **Harbor Teal** (#0f766e): The deep, steady water of the Dar es Salaam harbor. Primary actions, links, focus rings, the brand voice. Dark mode brightens it to #14b8a6 for contrast.
- **Harbor Teal Deep** (#115e59): Hover/pressed state of primary actions.
- **Harbor Teal Tint** (#ccfbf1): Verified badges, selected states, soft emphasis backgrounds — always paired with Harbor Teal Deep text (6.7:1).

### Secondary
- **Signal Coral** (#ff6b6b): The warm human pulse in a cool system. Reserved for moments of human warmth and emphasis — never for primary actions, never for errors.

### Neutral
- **Ink Slate** (#0f172a): All body and heading text on light surfaces.
- **Slate Mist** (#64748b): Secondary text. At 4.55:1 on Cloud Slate it sits at the contrast floor — never lighten it further.
- **Cloud Slate** (#f8fafc): The page background; a cool near-white, deliberately not warm/cream.
- **Clean White** (#ffffff): Cards, surfaces, inputs.
- **Whisper Slate** (#f1f5f9): Muted fills, hovers, skeleton loaders.
- **Border Slate** (#e2e8f0): Hairline borders and dividers.
- Status: **Success Green** (#16a34a), **Warning Amber** (#f59e0b), **Destructive Red** (#dc2626).

### Named Rules
**The One Coral Rule.** Signal Coral touches at most ~5% of any screen. Its rarity is what makes it warm instead of alarming. If coral appears twice in one viewport, one of them is wrong.

**The Cool Page Rule.** Backgrounds stay in the cool slate family. Warm/cream/beige page backgrounds are prohibited — warmth comes from coral, imagery, and copy, never from the canvas.

## 3. Typography

**Display Font:** Playfair Display (with Georgia fallback)
**Body Font:** Inter (with system-ui fallback)

**Character:** A high-contrast serif voice delivering confident statements over a neutral, hard-working sans. The pairing contrasts on a true axis (serif display + humanist sans) — the serif brings gravity and institutional memory; Inter stays invisible and legible.

### Hierarchy
- **Display** (700, clamp(3rem, 6vw, 3.75rem), 1.1, -0.02em): Hero statements only — one per page.
- **Headline** (700, 2.25rem, 1.2, -0.02em): Section headings on public pages.
- **Title** (600, 1.5rem, 1.3, -0.02em): Card titles, panel headings.
- **Body** (400, 1rem, 1.6): All running text; max line length 65–75ch.
- **Label** (500, 0.875rem, 1.4): Buttons, form labels, metadata.

### Named Rules
**The Two Voices Rule.** Playfair Display speaks only in headings (h1–h4). Everything that works — body, labels, buttons, data — is Inter. A serif below 1.5rem is a mistake.

## 4. Elevation

Flat by default, shadow on state. Surfaces sit flush at rest, separated by hairline Border Slate lines and background tone steps (Cloud Slate → Clean White → Whisper Slate). Shadows are a response, not decoration: they appear on hover-lift, open menus, and modals — and vanish at rest.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08)`): Hover state of interactive cards; never at rest.
- **Hover raise** (`box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12)`): Stronger lift for featured interactive elements.
- **Modal** (`box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18)`): Dialogs and overlays only.

### Named Rules
**The Flat-At-Rest Rule.** No surface carries a shadow while idle. If a card is not interactive, it never gets one at all.

## 5. Components

Refined and restrained: quiet precision, nothing decorative, every state deliberate.

### Buttons
- **Shape:** Gently rounded (12px radius), 40px height (48px for `lg`).
- **Primary:** Harbor Teal fill, Clean White text, 20px horizontal padding.
- **Hover / Focus:** Fill deepens to Harbor Teal Deep; focus shows a 2px Harbor Teal ring offset from the surface. Color transitions only — no scale, no bounce.
- **Secondary:** Clean White fill, Border Slate hairline, Ink Slate text; hover fills Whisper Slate. **Ghost:** transparent, hover Whisper Slate. **Danger:** Destructive Red fill, reserved for irreversible actions.

### Chips / Badges
- **Style:** Pill (fully rounded), Harbor Teal Tint fill, Harbor Teal Deep text, 6px×16px padding.
- **State:** The "verified" badge is the signature use — a quiet credential, never a shouting label.

### Cards / Containers
- **Corner Style:** 12px radius.
- **Background:** Clean White on the Cloud Slate page.
- **Shadow Strategy:** Flat at rest with a Border Slate hairline; Card lift shadow on hover only when the card is a link.
- **Internal Padding:** 24px.

### Inputs / Fields
- **Style:** Clean White fill, Border Slate 1px stroke, 10px radius, 40px height.
- **Focus:** Border shifts to Harbor Teal with a 2px ring; no glow.
- **Error:** Destructive Red border and helper text; the label never turns red.

### Navigation
- Transparent over the page at top; Inter labels (0.875rem, 500); active links in Harbor Teal; mobile collapses to a full-screen sheet, never a cramped dropdown.

### Verification Trail (signature component)
Any element that anchors a claim to proof — receipt rows, on-chain reference links, verified badges. Always rendered in the Harbor Teal family, always interactive, always leading to the public verification view. This is the component family that makes the Glass Ledger real.

## 6. Do's and Don'ts

### Do:
- **Do** use theme tokens for every color; hard-coded hex in components is prohibited.
- **Do** hold body text at ≥4.5:1 contrast; Slate Mist (#64748b) is the lightest allowed text color on light surfaces.
- **Do** provide a reduced-motion alternative for every animation (`prefers-reduced-motion`).
- **Do** build every button, form, and table from the shared components — one source of truth per primitive.
- **Do** treat loading (skeletons), empty, and error states as designed states, not afterthoughts.

### Don't:
- **Don't** ship the charity-website cliché: no sad-imagery guilt appeals, no hand-heart icons, no template NGO layouts.
- **Don't** ship crypto/web3 aesthetics: no dark neon gradients, no coin imagery, no wallet-speak — blockchain stays invisible, verification stays visible.
- **Don't** ship corporate bank stiffness or the university-project look (default template spacing, stock layouts, inconsistent components).
- **Don't** use gradient text, glassmorphism, side-stripe borders (`border-left` accents), or nested cards. Ever.
- **Don't** put Signal Coral on primary actions or use it twice in one viewport (The One Coral Rule).
- **Don't** warm the canvas: no cream, sand, or beige backgrounds (The Cool Page Rule).
- **Don't** apply urgency mechanics — countdowns, guilt pressure, artificial scarcity. Calm confidence, not charity urgency.
