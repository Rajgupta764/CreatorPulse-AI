# CreatorPulse AI — Website Theme & Design System

> Inspired by [VEED.io](https://www.veed.io/) — clean, premium, and trust-building. We aim for a white-background, black-text aesthetic with refined typography and subtle accents.

---

## Design Direction

### VEED.io Analysis

VEED.io uses:
- **White background** (`#ffffff`) with plenty of negative space
- **Dark charcoal text** (`#0d0d0d` range) — near-black, never pure `#000`
- **Single accent color** — vibrant purple/indigo for CTAs, links, highlights
- **Minimal borders** — very light gray dividers (`#f0f0f0` or `#e8e8e8`)
- **Generous whitespace** — large padding, wide layouts, breathing room
- **Clean typography** — sans-serif, medium weight for headings, regular for body
- **Soft shadows** — subtle elevated cards, no heavy box-shadows
- **Rounded corners** — 8-12px radius for cards and buttons

### Our Target Vibe

| Attribute | Value |
|---|---|
| **Overall feel** | Premium, clean, trustworthy, analytical |
| **Background** | White (`#ffffff`), never pure paper texture |
| **Text** | Near-black (`oklch(0.12 0.01 260)` / `#1a1a1e`) |
| **Secondary text** | Muted dark gray (`oklch(0.45 0.01 260)` / `#6b6b7a`) |
| **Accent color** | Deep vibrant blue-indigo (`oklch(0.52 0.22 265)`) |
| **Borders** | Very light gray (`oklch(0.92 0.005 260)` / `#eaeaea`) |
| **Cards** | White with subtle border + very soft shadow |
| **Typography** | Inter (headings), JetBrains Mono (scores/data) |

---

## Color System

### Semantic Colors

| Token | Value (oklch) | Description |
|---|---|---|
| `--background` | `oklch(1 0 0)` | Pure white page background |
| `--foreground` | `oklch(0.12 0.01 260)` | Near-black primary text |
| `--card` | `oklch(1 0 0)` | White card background |
| `--card-foreground` | `oklch(0.12 0.01 260)` | Text on cards |
| `--popover` | `oklch(1 0 0)` | Dropdown/modal background |
| `--popover-foreground` | `oklch(0.12 0.01 260)` | Text on popovers |
| `--primary` | `oklch(0.52 0.22 265)` | Brand accent (CTAs, links, active states) |
| `--primary-foreground` | `oklch(0.97 0 0)` | Text on primary (white) |
| `--secondary` | `oklch(0.96 0.005 260)` | Light gray secondary surface |
| `--secondary-foreground` | `oklch(0.25 0.01 260)` | Text on secondary |
| `--muted` | `oklch(0.96 0.005 260)` | Muted/disabled background |
| `--muted-foreground` | `oklch(0.45 0.01 260)` | Muted text (labels, hints) |
| `--accent` | `oklch(0.96 0.005 260)` | Accent surface (hover states) |
| `--accent-foreground` | `oklch(0.2 0.01 260)` | Text on accent |
| `--destructive` | `oklch(0.55 0.22 27)` | Errors, warnings, danger |
| `--destructive-foreground` | `oklch(0.97 0 0)` | Text on destructive |
| `--border` | `oklch(0.92 0.005 260)` | All borders and dividers |
| `--input` | `oklch(0.92 0.005 260)` | Input field borders |
| `--ring` | `oklch(0.52 0.22 265 / 0.3)` | Focus ring on inputs/buttons |
| `--radius` | `0.625rem` | 10px base border radius |

### Brand Derivatives

| Token | Value (oklch) | Usage |
|---|---|---|
| `--brand` | `oklch(0.52 0.22 265)` | Deep blue-indigo primary |
| `--brand-light` | `oklch(0.7 0.15 265)` | Lighter brand (hover states) |
| `--brand-lighter` | `oklch(0.92 0.05 265)` | Very light brand (backgrounds, badges) |
| `--brand-dark` | `oklch(0.4 0.18 265)` | Darker brand (active states) |

### Chart Colors

| Token | Value (oklch) | Usage |
|---|---|---|
| `--chart-1` | `oklch(0.52 0.22 265)` | Brand (primary data line) |
| `--chart-2` | `oklch(0.55 0.18 160)` | Green (positive trends) |
| `--chart-3` | `oklch(0.65 0.18 45)` | Amber (warnings) |
| `--chart-4` | `oklch(0.55 0.18 0)` | Red (negative trends) |
| `--chart-5` | `oklch(0.6 0.15 290)` | Purple (secondary data) |

### Score Color Scale (used for virality scores, psychology bars)

| Range | Color (oklch) | Label |
|---|---|---|
| 0–30 | `oklch(0.55 0.18 0)` | Red — needs work |
| 31–50 | `oklch(0.65 0.18 45)` | Amber — average |
| 51–70 | `oklch(0.65 0.18 100)` | Yellow-green — good |
| 71–85 | `oklch(0.55 0.18 160)` | Green — strong |
| 86–100 | `oklch(0.45 0.2 160)` | Dark green — excellent |

---

## Typography

### Font Stack

| Usage | Font | Weight | Fallback |
|---|---|---|---|
| **Headings (h1-h3)** | Inter | 700 (bold) | system sans-serif |
| **Headings (h4-h6)** | Inter | 600 (semibold) | system sans-serif |
| **Body text** | Inter | 400 (regular) | system sans-serif |
| **Small text / labels** | Inter | 500 (medium) | system sans-serif |
| **Scores, numbers, data** | JetBrains Mono | 400 (regular) | monospace |
| **Code / pre** | JetBrains Mono | 400 (regular) | monospace |

### Font Sizes

```css
--text-xs:   0.75rem  (12px)   — labels, timestamps
--text-sm:   0.875rem (14px)   — secondary text, meta
--text-base: 1rem     (16px)   — body
--text-lg:   1.125rem (18px)   — large body
--text-xl:   1.25rem  (20px)   — sub-headings
--text-2xl:  1.5rem   (24px)   — h4
--text-3xl:  1.875rem (30px)   — h3
--text-4xl:  2.25rem  (36px)   — h2
--text-5xl:  3rem     (48px)   — h1
```

### Line Heights

```css
--leading-tight:    1.15   — headings
--leading-normal:   1.5    — body
--leading-relaxed:  1.625  — long-form text
--leading-loose:    2      — sparse layouts
```

---

## Layout & Spacing

### Page Structure

```
┌──────────────────────────────────────────────────────┐
│                     Top Navigation                     │
│  [Logo]  Link  Link  Link  [Sign In] [Get Started]    │
├──────────────────────────────────────────────────────┤
│                                                        │
│   ┌──────────── Header Section ──────────────┐        │
│   │  Large heading                              │        │
│   │  Subtitle / description                     │        │
│   │  [Primary CTA] [Secondary CTA]              │        │
│   └────────────────────────────────────────────┘        │
│                                                        │
│   ┌──────── Content Section ───────────────────┐        │
│   │                                              │        │
│   │  ┌──────┐ ┌──────┐ ┌──────┐                 │        │
│   │  │Card 1│ │Card 2│ │Card 3│                 │        │
│   │  └──────┘ └──────┘ └──────┘                 │        │
│   │                                              │        │
│   └────────────────────────────────────────────┘        │
│                                                        │
├──────────────────────────────────────────────────────┤
│                     Footer                              │
└──────────────────────────────────────────────────────┘
```

### Max Widths

```css
--max-width-sm:   640px    — narrow content (auth forms, single columns)
--max-width-md:   768px    — medium content
--max-width-lg:   1024px   — standard page width
--max-width-xl:   1280px   — wide pages (dashboard, results)
--max-width-2xl:  1440px   — full-width layouts
```

### Spacing Scale

Follows Tailwind default scale:
```
p-4  = 16px   (card padding)
p-6  = 24px   (section padding)
p-8  = 32px   (page padding)
gap-4 = 16px  (card grid gap)
gap-6 = 24px  (section gap)
gap-8 = 32px  (large section gap)
```

---

## Component Design

### Cards

```css
.card {
  background: white;
  border: 1px solid oklch(0.92 0.005 260);    /* #eaeaea */
  border-radius: 0.625rem;                        /* 10px */
  box-shadow:
    0 1px 3px oklch(0 0 0 / 0.04),
    0 1px 2px oklch(0 0 0 / 0.02);
  transition: box-shadow 150ms ease, border-color 150ms ease;
}

.card:hover {
  border-color: oklch(0.85 0.01 260);
  box-shadow:
    0 4px 12px oklch(0 0 0 / 0.06),
    0 2px 4px oklch(0 0 0 / 0.04);
}
```

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| **Primary** | `--primary` (blue) | White | None | Slightly darker brand |
| **Secondary** | `--secondary` (light gray) | `--secondary-foreground` | None | Slightly darker gray |
| **Outline** | Transparent | `--foreground` | `--border` | Light gray bg |
| **Ghost** | Transparent | `--foreground` | None | Light gray bg |
| **Destructive** | `--destructive` (red) | White | None | Slightly darker red |

### Inputs

```css
.input {
  background: white;
  border: 1px solid oklch(0.92 0.005 260);
  border-radius: 0.5rem;       /* 8px */
  padding: 0.625rem 0.875rem;  /* 10px 14px */
  font-size: 0.875rem;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px oklch(0.52 0.22 265 / 0.15);
  outline: none;
}

.input::placeholder {
  color: oklch(0.6 0.01 260);
}
```

### Dividers

```css
.divider {
  border: none;
  height: 1px;
  background: oklch(0.92 0.005 260);
  margin: 1.5rem 0;
}
```

### Score Bars (Psychology Dimensions)

```
Curiosity     ████████████████░░░░░░  82
Authority     ████████░░░░░░░░░░░░░  45
Novelty       ████████████░░░░░░░░░  63
Emotion       ████████████████████░  91
```

- Bar background: `oklch(0.92 0.005 260)` (light gray)
- Bar fill: `var(--primary)` gradient
- Label: `--muted-foreground` (medium gray)
- Value: `--foreground` (near-black), JetBrains Mono

### Score Number Display (Virality Score)

```
┌─────────────────────┐
│     72/100          │
│   ▲ 15 pts above    │
│   your average      │
└─────────────────────┘
```

- Large number: `2.25rem` font, `--foreground`, JetBrains Mono
- Delta text: `0.875rem`, green (positive) or red (negative)
- Container: card with centered content

---

## Navigation

```css
.nav {
  background: oklch(1 0 0 / 0.85);   /* white with 85% opacity */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid oklch(0.92 0.005 260);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-link {
  color: oklch(0.45 0.01 260);       /* medium gray */
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: color 150ms ease, background 150ms ease;
}

.nav-link:hover {
  color: var(--foreground);
  background: oklch(0.96 0.005 260);
}

.nav-link.active {
  color: var(--primary);
}
```

---

## Page-Level Layouts

### Landing Page
- Full-width hero with large centered heading
- Icon grid or feature cards in 3-column layout
- Demo widget in centered single column
- Footer with 4-column grid

### Tool Pages (Analyze, Battle, Hook, etc.)
- Centered single column (`max-w-4xl`)
- Input form at top
- Results below (cards, bars, tables)
- Consistent 32px spacing between sections

### Dashboard
- Full-width (`max-w-6xl` or no max-width)
- Stats row at top (4 cards in a row)
- Charts and insights in 2-column grid below
- Activity feed on right rail or full width

---

## Shadows

```css
/* Card (subtle) */
box-shadow: 0 1px 3px oklch(0 0 0 / 0.04), 0 1px 2px oklch(0 0 0 / 0.02);

/* Elevated card (dropdown, hover) */
box-shadow: 0 4px 12px oklch(0 0 0 / 0.08), 0 2px 4px oklch(0 0 0 / 0.04);

/* Modal / Dialog */
box-shadow: 0 20px 60px oklch(0 0 0 / 0.12), 0 8px 24px oklch(0 0 0 / 0.08);
```

---

## Visual Examples (Moodboard)

### Color Palette Reference

```
Primary      ■ #4A6CF7  (oklch 0.52 0.22 265)
Background   ■ #FFFFFF
Text         ■ #1A1A1E  (oklch 0.12 0.01 260)
Secondary    ■ #6B6B7A  (oklch 0.45 0.01 260)
Border       ■ #EAEAEA  (oklch 0.92 0.005 260)
Card Hover   ■ #F5F5F7  (oklch 0.96 0.003 260)
Success      ■ #22C55E  (oklch 0.55 0.18 160)
Error        ■ #EF4444  (oklch 0.55 0.22 27)
```

### Visual Hierarchy

```
    H1: The Ultimate Guide to YouTube Title Analysis (3rem, bold)
    H2: How It Works (2.25rem, bold)
    H3: Real Metrics, Not AI Guesses (1.875rem, semibold)

    Body: CreatorPulse AI analyzes your titles using a combination of
    real metrics, pattern detection, and AI enrichment. (1rem, regular)

    Body small: Paste any YouTube title to see its viral DNA. (0.875rem, regular)

    Label: CHARACTER COUNT  (0.75rem, medium, uppercase, letter-spacing)
    Value: 52              (1rem, JetBrains Mono)
```

### Sample Card Layout

```
┌────────────────────────────────────────────┐
│  Title DNA Analyzer                         │
│  Paste any YouTube title to analyze         │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Enter YouTube title...              │ │
│  │                                      │ │
│  │  [Analyze]                           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Virality Score                       │ │
│  │           72/100                      │ │
│  │  ▲ 15 pts above your average          │ │
│  │  Strong curiosity gap + urgency       │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌───────────┐ ┌───────────┐              │
│  │  Patterns  │ │  Power    │              │
│  │            │ │  Words    │              │
│  │ Curiosity  │ │  Secret   │              │
│  │ Urgency    │ │  Proven   │              │
│  │            │ │  Easy     │              │
│  └───────────┘ └───────────┘              │
│                                            │
│  ┌─── Psychology ───────────────────────┐  │
│  │  Curiosity  ████████████░░  82       │  │
│  │  Authority  ██████░░░░░░░░  45       │  │
│  │  Novelty    █████████░░░░  63        │  │
│  │  Emotion    ██████████████░  91      │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## Migration from Current Dark Theme

The current codebase uses a dark theme (background `oklch(0.11 0.005 260)`, foreground `oklch(0.97 0.002 260)`). The new theme must replace ALL color tokens in `src/app/globals.css`.

### `globals.css` — Root Variables Replacement

```css
@theme inline {
  /* Keep font variables */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);

  /* Keep radius variables */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* Color tokens (listed, values in :root below) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-brand: var(--brand);
  --color-brand-light: var(--brand-light);
  --color-brand-lighter: var(--brand-lighter);
  --color-brand-dark: var(--brand-dark);
}

:root {
  --background: oklch(1 0 0);                    /* white */
  --foreground: oklch(0.12 0.01 260);            /* near-black */

  --card: oklch(1 0 0);                          /* white */
  --card-foreground: oklch(0.12 0.01 260);       /* near-black */

  --popover: oklch(1 0 0);                       /* white */
  --popover-foreground: oklch(0.12 0.01 260);    /* near-black */

  --primary: oklch(0.52 0.22 265);               /* blue-indigo */
  --primary-foreground: oklch(0.97 0 0);         /* white */

  --secondary: oklch(0.96 0.005 260);            /* light gray */
  --secondary-foreground: oklch(0.25 0.01 260);  /* dark gray */

  --muted: oklch(0.96 0.005 260);                /* light gray */
  --muted-foreground: oklch(0.45 0.01 260);      /* medium gray */

  --accent: oklch(0.96 0.005 260);               /* light gray */
  --accent-foreground: oklch(0.2 0.01 260);      /* dark gray */

  --destructive: oklch(0.55 0.22 27);            /* red */
  --destructive-foreground: oklch(0.97 0 0);     /* white */

  --border: oklch(0.92 0.005 260);               /* light gray border */
  --input: oklch(0.92 0.005 260);                /* light gray input border */
  --ring: oklch(0.52 0.22 265 / 0.3);            /* primary focus ring */

  --chart-1: oklch(0.52 0.22 265);               /* blue (brand) */
  --chart-2: oklch(0.55 0.18 160);               /* green */
  --chart-3: oklch(0.65 0.18 45);                /* amber */
  --chart-4: oklch(0.55 0.18 0);                 /* red */
  --chart-5: oklch(0.6 0.15 290);                /* purple */

  --radius: 0.625rem;                             /* 10px base radius */

  --brand: oklch(0.52 0.22 265);                 /* blue */
  --brand-light: oklch(0.7 0.15 265);            /* lighter blue */
  --brand-lighter: oklch(0.92 0.05 265);         /* very light blue */
  --brand-dark: oklch(0.4 0.18 265);             /* darker blue */
}
```

---

## Key Rules

1. **No pure black `#000000`** — use `oklch(0.12 0.01 260)` for text, `oklch(0.45 0.01 260)` for secondary text
2. **No pure white `#ffffff`** for surfaces other than background — cards get subtle borders (`oklch(0.92 0.005 260)`)
3. **Single accent color** — the blue-indigo `--primary` is the only accent; do not introduce secondary accent colors
4. **Subtle shadows only** — cards should feel flat and clean, not elevated
5. **Generous whitespace** — minimum 16px padding inside cards, 24px between sections
6. **Mono numbers** — all scores, percentages, and data values render in JetBrains Mono
7. **Consistent radius** — 10px for cards and containers, 8px for inputs and buttons
8. **No dark mode** — this is a single-theme light application; no dark mode toggle
