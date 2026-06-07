# HIT - AI/DATA Brand System

The brand-in-code reference for HomeworkLab's public surfaces. This is the source of
truth for type, color, spacing, motion, and voice. When something here disagrees with
a page, the page is wrong.

> No image-generation tooling was available when this was written, so there are no
> generated logo boards or mockups here. Everything below is implemented directly in
> code (`src/app/globals.css`, `src/app/layout.tsx`) and is enforceable today.

---

## 1. Two-theme architecture

There are deliberately **two** styling worlds. Do not mix them.

| Surface | Theme | Tokens | Icons | Dark mode |
|---|---|---|---|---|
| **Public / marketing** (`/`, `/about`, `/contact`, `/help`, `/login`, `/privacy`, `/terms`, error pages) | `.site` wrapper | semantic CSS vars (`--surface`, `--ink`, `--brand`, …) | Phosphor (`@phosphor-icons/react/dist/ssr`) | yes (`prefers-color-scheme`) |
| **Authenticated app** (`/dashboard`, `/admin/*`, `/assignment/*`, `/courses/*`, `/materials/*`) | global `--hw-*` Material tokens | `--hw-*` | Material Symbols (icon font, loaded in `layout.tsx`) | no (light only, for now) |

**Why two:** the app surfaces are product UI built on a mature Material token set and the
Material Symbols font that the whole dashboard depends on. Retokenizing them wholesale is
high-risk for zero user-facing gain. The public surfaces are the brand's front door, so
they get the considered `.site` system. The `.site` dark mode is scoped to `.site` exactly
so it never flips the not-yet-dark-ready dashboard.

To put any public page on-brand: wrap its root in `<div className="site …">`. It inherits
the full token system, dark mode, focus rings, and motion for free.

---

## 2. Typography

Loaded once via `next/font` in `src/app/layout.tsx`; exposed as Tailwind utilities.

| Role | Family | Utility | Use for |
|---|---|---|---|
| Display | **Outfit** | `font-display` | headlines, section titles, wordmark, card titles |
| Body | **Inter** | `font-sans` (default) | paragraphs, UI text |
| Mono | **JetBrains Mono** | `font-mono` | small technical labels, numerals (`tabular-nums`) |

**Rules**
- Headlines: `font-display`, `font-bold`/`font-extrabold`, `tracking-tight`, tight leading (`leading-[1.05]` to `leading-tight`).
- Body: `text-base`/`text-lg`, `leading-relaxed`, cap measure at ~`max-w-[65ch]` / `52ch`.
- Use the **full weight ramp** (400/500/600/700/800) for hierarchy - not just 400/700.
- **Sentence case** for everything. No Title Case headers, no ALL-CAPS except a single small eyebrow.
- Eyebrows (the one allowed uppercase label): `font-mono text-[11px] uppercase tracking-[0.2em]` - max one per ~3 sections.
- Numerals in data contexts: `font-mono tabular-nums`.
- No serif anywhere. No `font-[Manrope]` / `font-[Space_Grotesk]` (never loaded → broken).
- `text-balance` on headlines, `text-pretty` on body to kill orphans.

---

## 3. Color

One locked accent: **indigo**. The brand is preserved from the original product.

### `.site` semantic tokens (defined in `globals.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--surface` | `#f6f8fb` | `#0c0d12` | page background |
| `--surface-2` | `#ffffff` | `#15171f` | elevated cards |
| `--surface-3` | `#eef1f5` | `#111219` | alternating sections |
| `--surface-inset` | `#e7ebf1` | `#1b1d27` | wells, hairline blocks |
| `--ink` | `#14161b` | `#f1f2f5` | primary text |
| `--ink-muted` | `#555b66` | `#a3a8b4` | secondary text |
| `--ink-faint` | `#8a909c` | `#6f7480` | tertiary / metadata |
| `--line` | `#e2e6ec` | `#262a35` | hairlines, borders |
| `--line-strong` | `#d2d8e0` | `#333846` | stronger dividers |
| `--brand` | `#4648d4` | `#5a5cf0` | **fills / buttons** (white text = AAA both modes) |
| `--brand-strong` | `#393bbf` | `#6f71ff` | button hover |
| `--brand-ink` | `#4648d4` | `#a9aaff` | **accent text + icons** (lightens in dark for AA) |
| `--brand-soft` | indigo @ 8% | indigo @ 12% | tinted icon chips |
| `--on-brand` | `#ffffff` | `#ffffff` | text on brand fills |

Use as `bg-[var(--surface-2)]`, `text-[var(--ink-muted)]`, `border-[var(--line)]`, etc.

**Rules**
- **One accent.** Indigo only. No second marketing accent. The instructor brand-fill panel is `--brand`, not a new color.
- `--brand` for **fills**; `--brand-ink` for **text/icons** (it lightens in dark so accent text stays AA).
- No pure `#000` / `#fff` as surfaces - use the tokens.
- No AI-purple glow / gradient orbs. Background interest comes from the subtle `.dot-field`, never blurred radial blobs.
- Status colors (success / warn / error) may use Tailwind `emerald` / `amber` / `red` **for semantic meaning only**, kept desaturated. They are not brand accents.
- Shadows are **tinted toward the brand hue**, never pure black: use `var(--shadow-card)` / `var(--shadow-lift)`.

---

## 4. Spacing & layout

- Container: `max-w-7xl mx-auto px-6` (≈1280px). Never edge-to-edge on wide screens.
- Section rhythm: `py-24 md:py-28`. Let it breathe; bottom padding can run slightly heavier than top, optically.
- Grid over flex-percentage math. `grid grid-cols-1 md:grid-cols-N`.
- Anti-center: prefer asymmetric splits and left-aligned headers over centered-everything (except short manifesto/CTA moments).
- No `h-screen` for full-height - use `min-h-[100dvh]`.
- Mobile: every multi-column block declares its `grid-cols-1` fallback in place.

---

## 5. Shape & elevation

**Radius lock**
- Interactive (buttons, pills, chips, avatars): `rounded-full`
- Surfaces (cards, image frames, panels): `rounded-2xl`
- Large feature bands (CTA): `rounded-3xl`
- Inner media inside a card: `rounded-xl`

**Elevation**
- Cards: `shadow-[var(--shadow-card)]`. Lifted/hero: `shadow-[var(--shadow-lift)]`.
- Use elevation only where it communicates hierarchy. Otherwise group with `border`, `divide-y`, or whitespace - not a card box around everything.

---

## 6. Motion (restrained, CSS-only)

Dial: **MOTION_INTENSITY 4**. No GSAP, no JS animation lib, no scroll listeners. Pages stay
Server Components.

- **Scroll reveal**: add class `reveal` to a block. Driven by `animation-timeline: view()`, gated behind `@supports` **and** `prefers-reduced-motion: no-preference` (unsupporting browsers just show content).
- **Tactile press**: class `press` → 180ms transition + `translateY(1px) scale(.985)` on `:active`.
- **Hover**: transition `transform`/`opacity`/colors only (GPU-friendly). Never animate `top`/`left`/`width`/`height`.
- **Smooth anchor scroll**: enabled globally, reduced-motion-safe.
- **Reduced motion**: a `.site`-scoped reset neutralizes animations/transitions under `prefers-reduced-motion: reduce`.
- **Focus**: `.site :focus-visible` gets a `--brand-ink` ring - keyboard users always see focus.

---

## 7. Iconography

- **Public/`.site`**: Phosphor, imported from `@phosphor-icons/react/dist/ssr` (server-safe - keeps pages RSC). Standardize `weight`: `"bold"` for inline actions (arrows, checks), `"duotone"` for feature/brand glyphs.
- **App**: Material Symbols (existing). Keep - the dashboard depends on it.
- Never hand-roll icon SVG paths. One icon family per surface; do not mix Phosphor into the dashboard or Material Symbols into `.site`.

---

## 8. Components

**Buttons**
- Primary: `bg-[var(--brand)] text-[var(--on-brand)] rounded-full press hover:bg-[var(--brand-strong)]`.
- Secondary: `border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--ink)] rounded-full press`.
- Labels: ≤3 words, one line, never wrap at desktop. **One label per intent** across the whole site (signup = "Get Started" everywhere; contact = "Request a demo").

**Cards** - `rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] shadow-[var(--shadow-card)]`. In card groups, pin CTAs to the bottom so they form one line; align titles/descriptions across siblings.

**Links** - `text-[var(--brand-ink)]`, `press`, distinct hover (color + motion), visible focus ring. Active nav item is visually distinct (weight/underline/tint), not just color.

---

## 9. Voice & content

- Plain, specific, active voice. Confident, not loud.
- **Banned filler verbs:** Elevate, Seamless, Unleash, Next-Gen, Game-changer, Delve, Tapestry, "In the world of…".
- **No em-dashes (`—`) or en-dashes (`–`) anywhere visible.** Use a hyphen, comma, period, colon, or parentheses.
- No fake-round / fake-precise numbers. Use real data (e.g. lesson counts from `src/lib/courses.ts`) or omit. Mark sample content (`{/* sample: replace before launch */}`).
- Realistic, locale-appropriate names - never "John Doe" / "Acme Corp".
- No exclamation marks in success messages. Errors are direct: "Connection failed. Please try again." - not "Oops!".
- Every image has meaningful `alt`. Every flow has a way back.

---

## 10. Quick reference (copy-paste)

```tsx
// Public page shell
<div className="site min-h-[100dvh]">
  <main className="mx-auto max-w-7xl px-6 py-24 md:py-28">
    <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl text-balance">
      …
    </h1>
    <p className="mt-5 max-w-[65ch] text-lg leading-relaxed text-[var(--ink-muted)] text-pretty">…</p>
  </main>
</div>

// Primary button
<Link className="press inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]">…</Link>
```
