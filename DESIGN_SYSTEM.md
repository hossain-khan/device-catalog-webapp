# Android Device Catalog — Design Specification & UI/UX Guidelines

This document defines the design philosophy, visual token system, layout architecture, component anatomy, and interaction standards for the **Android Device Catalog** web application. All new features, views, and UI modifications must adhere to these guidelines.

---

## 1. Design Philosophy & Aesthetic Direction

The application is designed as a **high-density developer & telemetry console** (inspired by Linear, Vercel, and Google Play Console) tailored for Android engineers, QA specialists, and ecosystem analysts exploring 24,000+ hardware specifications.

### Core Principles
1. **High Signal-to-Noise Ratio**: Prioritize technical data legibility over decorative chrome. Never flood entire card surfaces with saturated or pastel fills; keep surfaces neutral (`--card`, `--muted`) and use color strictly as a **semantic indicator** (top accent bars, status dots, badges, and progress bars).
2. **Adaptive Dual-Theme Architecture**: First-class support for both **Dark Mode** (obsidian slate surfaces) and **Light Mode** (crisp alabaster slate surfaces), synchronized with native browser UI (`color-scheme: light dark`).
3. **Multi-Density Data Exploration**: Different tasks require different information densities. Provide seamless switching between visual exploration (**Cards View**), rapid multi-column scanning (**Sortable Table View**), and macro market intelligence (**Analytics Telemetry**).
4. **Immediate Context & Zero Dead Ends**: Interactive metrics and category rows (e.g., clicking a manufacturer or form factor in Analytics) immediately apply filters and transition the user into the filtered **Device Browser**.

---

## 2. Color System & Design Tokens

All colors use the perceptually uniform **`oklch()`** color space defined in [`src/index.css`](src/index.css) and [`src/lib/deviceColors.ts`](src/lib/deviceColors.ts).

### 2.1 Core Surface & Brand Tokens

| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(0.985 0.003 250)` | `oklch(0.14 0.012 255)` | Root canvas background |
| `--foreground` | `oklch(0.16 0.015 255)` | `oklch(0.96 0.005 250)` | Primary body & heading text |
| `--card` | `oklch(1 0 0)` | `oklch(0.185 0.014 255)` | Elevated card, table, and toolbar containers |
| `--muted` | `oklch(0.955 0.006 250)` | `oklch(0.225 0.014 255)` | Recessed spec boxes, segmented controls, pills |
| `--muted-foreground` | `oklch(0.48 0.02 255)` | `oklch(0.68 0.015 250)` | Secondary labels, eyebrows, and metadata |
| `--primary` | `oklch(0.50 0.145 162)` | `oklch(0.72 0.155 160)` | Android Emerald brand accent, active states, focus rings |
| `--border` | `oklch(0.905 0.008 250)` | `oklch(0.275 0.015 255)` | Hairline structural borders (`border-border/80`) |
| `--destructive` | `oklch(0.56 0.21 25)` | `oklch(0.64 0.20 25)` | Error states, destructive actions, filter reset |

### 2.2 Semantic Category Accents (`deviceColors.ts`)

Devices can be color-coded across 4 switchable modes: **Form Factor**, **Performance Tier**, **Manufacturer**, and **SDK Era**.

- **Rule — Never Paint Full Card Backgrounds**: Category colors (`DeviceColorScheme`) must **only** be applied to:
  1. The `4px` (`h-1`) top accent bar on cards (`colors.primary`).
  2. Translucent thumbnail squircles and category pills (`backgroundColor: colors.secondary`, `borderColor: colors.border`), where `secondary` uses `0.12` alpha and `border` uses `0.28` alpha so they adapt cleanly to both Light and Dark themes.
  3. Inline `6px` (`w-1.5 h-1.5` or `w-2.5 h-2.5`) status indicator dots and distribution progress bars.

| Category / Form Factor | Primary Hue (`oklch`) | Visual Identity |
| :--- | :--- | :--- |
| **Phone** | `oklch(0.60 0.16 245)` | Technical Blue |
| **Tablet** | `oklch(0.60 0.17 290)` | Indigo / Violet |
| **TV** | `oklch(0.62 0.18 25)` | Coral / Rose |
| **Wearable** | `oklch(0.64 0.16 155)` | Android Emerald |
| **Android Automotive** | `oklch(0.68 0.16 65)` | Warm Amber |
| **Chromebook / Desktop** | `oklch(0.62 0.14 200)` | Technical Cyan |
| **Google Play Games on PC** | `oklch(0.62 0.18 335)` | Vibrant Magenta |

---

## 3. Typography & Scannability

Defined in [`index.html`](index.html) and [`src/index.css`](src/index.css):

- **Sans-Serif (`--font-sans`)**: `'Inter', 'IBM Plex Sans', system-ui, sans-serif` with OpenType features `"cv02", "cv03", "cv04", "cv11"` enabled for high legibility at compact sizes.
- **Monospace (`--font-mono`)**: `'JetBrains Mono', 'Fira Code', ui-monospace, monospace` for device codenames (`walleye`, `husky`), ABI tags (`arm64-v8a`), DPI values, JSON schemas, and keyboard shortcuts (`/`).
- **Tabular Numerals (`tabular-nums`)**: **Mandatory** on all numerical metrics, RAM capacities, API levels, device counts, and percentage badges so columns and cards align vertically without jitter.

### Typographic Scale
- **App Title (Navbar)**: `text-sm sm:text-base font-semibold tracking-tight`
- **KPI Metric Value**: `text-3xl font-bold tracking-tight tabular-nums`
- **Section / Card Title**: `text-base font-semibold tracking-tight`
- **Eyebrow / Spec Micro-Label**: `text-[10px]` or `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
- **Data Cell / Spec Value**: `text-xs font-semibold text-foreground`

---

## 4. Layout & Navigation Architecture

### 4.1 Sticky Top Application Header ([`src/App.tsx`](src/App.tsx))
- **Height & Surface**: `h-16 sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md`.
- **Three-Zone Layout**:
  1. **Left (Brand Identity)**: Android icon in a tinted `36x36` (`w-9 h-9 rounded-xl`) container + application title + `Play Console` monospace badge. Clicking returns to the **Device Browser**.
  2. **Center (Workspace Switcher)**: Segmented `TabsList` (`bg-muted/60 border border-border/60 p-1 rounded-lg`) with 4 primary views:
     - **Device Browser** (Default landing view)
     - **Analytics**
     - **Data Source**
     - **Export Data**
  3. **Right (Global Telemetry & Utilities)**:
     - **Dataset Status Pill**: Pulsing emerald indicator + active device count (`23,997 devices`), which navigates to **Data Source** when clicked.
     - **GitHub Link**: Icon button linking to the parser repository.
     - **Theme Toggle**: Light / Dark / System mode switcher.
- **Mobile Adaptation**: On viewports `< 1024px` (`lg:hidden`), the navigation tabs render in a compact secondary strip directly beneath the main header bar.

### 4.2 Workspace Container
- Standard container width (`container mx-auto px-4 py-6`) with `space-y-5` vertical rhythm.
- Never apply global `text-align: center` or fixed `max-width` overrides on `#root`.

---

## 5. Component Anatomy & Patterns

### 5.1 Unified Filter Toolbar ([`src/components/DeviceFiltersPanel.tsx`](src/components/DeviceFiltersPanel.tsx))
- **Single Elevated Surface**: `rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-3.5`.
- **Top Row**: Search input (with `/` keyboard shortcut badge to focus and `X` clear button) paired inline on desktop with primary `Select` dropdowns (`Form Factor`, `Manufacturers`, `Min RAM`, `SDK Version`) and a `Ranges` collapsible trigger.
- **Collapsible Range Drawer**: Houses dual-thumb sliders for **RAM Capacity Range** and **Android SDK / API Range** inside a recessed `bg-muted/25 rounded-lg p-4` container.
- **Bottom Status Bar**: Displays the live filtered count badge (`23,997 of 23,997 devices`), individual removable active-filter pills, and a `Reset Filters` destructive ghost button.

### 5.2 Device Card ([`src/components/DeviceCard.tsx`](src/components/DeviceCard.tsx))
Each card (`rounded-xl border border-border/80 bg-card p-0 overflow-hidden shadow-xs hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 transition-all`) follows a strict 5-part vertical anatomy:
1. **Top Semantic Stripe**: `h-1 w-full` colored with `colors.primary`.
2. **Identity Header (`p-4 pb-3`)**:
   - Left: `48x48` (`w-12 h-12 rounded-xl`) thumbnail squircle with subtle semantic tint.
   - Center: Uppercase OEM eyebrow (`device.manufacturer`), single-line bold model name (`device.modelName`), and monospace codename (`device.device`, shown when distinct from `modelName`).
   - Top-Right: Compact `28x28` (`h-7 w-7 rounded-lg`) action buttons for **Compare** (`+` / `✓`) and **View Source JSON** (`</>`).
3. **Category Badges (`px-4 pb-3`)**: Form Factor pill with semantic dot + Performance Tier badge.
4. **Recessed 2×2 Spec Box (`px-4 pb-3`)**: `bg-muted/40 border border-border/50 rounded-lg p-2.5` displaying **RAM**, **SDK**, **Processor**, and **Screen** with uppercase micro-labels.
5. **ABI Footer (`px-4 py-2.5`)**: `bg-muted/25 border-t border-border/50` with monospace ABI badges (`arm64-v8a`, `armeabi-v7a`) and a hover-revealed `Specs →` affordance.

### 5.3 Sortable Device Table ([`src/components/DeviceTableView.tsx`](src/components/DeviceTableView.tsx))
- **Accessibility & Semantics**:
  - Wrapped in `<div tabIndex={0} role="region" aria-labelledby="device-catalog-table-caption">`.
  - Sortable columns use `<button type="button">` inside `<th scope="col">`, setting `aria-sort="ascending"` or `"descending"` **only** on the active sorted column.
  - Announces sort changes via a single visually hidden `<div role="status" className="sr-status">` region (never `aria-live` on `<table>`).
- **Sorting Logic**:
  - Text columns (`Model`, `Manufacturer`, `Form Factor`, `SoC`) use `Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })`.
  - Numeric columns (`RAM`, `SDK`) sort by raw numeric values (`parseRamMB`, max API level).

### 5.4 Analytics Telemetry Cards ([`src/components/DeviceStatsPanel.tsx`](src/components/DeviceStatsPanel.tsx))
- **KPI Summary Cards**: Top 4 cards feature a `4px` semantic top accent bar, uppercase title, `text-3xl` tabular number, subtitle, and a `40x40` (`w-10 h-10 rounded-xl`) icon badge.
- **Distribution Rows (`DistributionRow`)**: List views in Analytics must always pair the category label, raw count, and percentage share badge (`%`) with a proportional horizontal progress bar (`h-1.5 rounded-full bg-muted/80`).
- **Chart Mode Switcher (`ViewModeToggle`)**: Compact 3-way segmented icon control (`List`, `Bar`, `Pie`) paired with a `Show All` dialog trigger.

---

## 6. Modern Web & Accessibility Standards

1. **Color Scheme & FOUC Prevention**:
   - `<meta name="color-scheme" content="light dark" />` must remain in `index.html`.
   - `:root` and `.dark` must declare `color-scheme` in `src/index.css` so native scrollbars, form controls, and canvas backgrounds match the active theme.
2. **Scrollbar Customization**:
   - Use standard `scrollbar-width: thin` and `scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track)` with `>= 3:1` thumb contrast.
   - Gate legacy `::-webkit-scrollbar` selectors inside `@supports not (scrollbar-color: auto)` so they do not conflict with standard properties in modern browsers.
   - Never animate or transition `scrollbar-color`.
3. **Keyboard Navigation**:
   - Pressing `/` outside of text inputs focuses the primary device search bar.
   - All interactive cards, table regions, and sort header buttons must preserve clear `:focus-visible` outlines.
