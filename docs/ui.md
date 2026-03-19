# UI Design System

All styles live in `src/app/globals.css`. There is no component library — everything is custom CSS using CSS custom properties (variables).

---

## Themes

The app ships two themes. The active theme is stored in `localStorage` and applied as a `data-theme` attribute on `<html>`.

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#000000` | `#f4f1e8` (warm parchment) |
| `--bg-alt` | `#000000` | `#e8e1d0` |
| `--surface` | `#050505` | `rgba(255,251,245,0.88)` |
| `--surface-strong` | `#0a0a0a` | `#fffdfa` |
| `--surface-soft` | `rgba(255,255,255,0.04)` | `rgba(10,15,25,0.04)` |
| `--text` | `#f4f4f5` | `#171b26` |
| `--muted` | `#8d8d93` | `#5a6271` |
| `--accent` | `#f4f4f5` | `#e95a2e` (burnt orange) |
| `--outline` | `rgba(255,255,255,0.09)` | `rgba(23,27,38,0.12)` |
| `--success` | `#1ec97b` | `#128f68` |
| `--danger` | `#ff5c5c` | `#d04d4d` |
| `--signal` | `#d4d4d8` | `#f0be34` |
| `--input-bg` | `#0e0e0f` | `rgba(255,255,255,0.78)` |

Toggle component: `src/components/theme-toggle.tsx`

Light mode overrides for hardcoded-dark components (summary chips, board rows, ticket blocks, etc.) are defined as `html[data-theme="light"] .classname` rules at the bottom of `globals.css`.

---

## Typography

```css
--font-body: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
--font-heading: "Avenir Next Condensed", "Franklin Gothic Medium", "Arial Narrow", sans-serif;
--font-mono: "SF Mono", "Fira Code", monospace;
```

- Body: Avenir Next
- Headings & category labels: Avenir Next Condensed (condensed, uppercase)
- Numbers/prices: SF Mono

---

## Spacing scale

| Token | Value |
|---|---|
| `--space-1` | 0.25rem |
| `--space-2` | 0.5rem |
| `--space-3` | 0.8rem |
| `--space-4` | 1rem |
| `--space-5` | 1.35rem |
| `--space-6` | 1.8rem |
| `--space-7` | 2.4rem |

---

## Border radius

| Token | Value | Used for |
|---|---|---|
| `--radius-panel` | 18px | Panels, cards |
| `--radius-card` | 14px | Inner cards, ticket blocks |
| Buttons | 12px | hardcoded |
| Pills/chips | 999px | hardcoded |

---

## Layout

### App shell (≥980px)

```
┌──────────────┬───────────────────────────────────┐
│  Sidebar     │  Main content                     │
│  232px       │  flex-grow                        │
│              │                                   │
│  Logo        │                                   │
│  Nav links   │                                   │
│  Theme       │                                   │
│  User info   │                                   │
└──────────────┴───────────────────────────────────┘
```

### Mobile (<980px)

Full-width content with a fixed bottom navigation bar (4 icon+label items).

### Market detail (≥800px)

```
┌────────────────────────┬───────────────┐
│  Price history chart   │  Order ticket │
│  (flex-grow)           │  400px        │
└────────────────────────┴───────────────┘
```

---

## Key CSS classes

### Layout utilities

| Class | Description |
|---|---|
| `.stack` | `display: grid; gap: var(--space-4)` — vertical stack |
| `.stack-xs` | Same with `gap: var(--space-2)` |
| `.panel` | Rounded panel with border and `var(--surface)` background |
| `.section-header` | Flex row with title + right-aligned secondary content |

### Market board

| Class | Description |
|---|---|
| `.market-board-row` | Single market row |
| `.market-board-row-flash-up` | Green flash animation on price increase |
| `.market-board-row-flash-down` | Red flash animation on price decrease |
| `.market-board-head` | Column headers row |
| `.density-switch` | Compact / Comfortable toggle pill |
| `.density-switch-active` | Selected density button |

### Order ticket

| Class | Description |
|---|---|
| `.ticket-form` | Form wrapper |
| `.ticket-side-switch` | YES / NO button pair |
| `.ticket-side-button-agree` | Active YES button (green tint) |
| `.ticket-side-button-disagree` | Active NO button (red tint) |
| `.ticket-price-stack` | Entry / Payout info block |
| `.ticket-block` | Probability or size section |
| `.prob-split-bar` | Visual YES/NO probability split bar |
| `.prob-split-yes` | Green YES fill (width = entry price %) |

### Summary chips (stats row)

| Class | Description |
|---|---|
| `.summary-chip` | Individual stat chip |
| `.summary-chip-label` | Small uppercase label |
| `.summary-chip-up` | Green border (price moved up) |
| `.summary-chip-down` | Red border (price moved down) |
| `.board-summary-row` | Flex row of chips |

### Status pills

| Class | Color |
|---|---|
| `.pill-active` | Green |
| `.pill-locked` | Amber |
| `.pill-draft` | Muted |
| `.pill-resolved` | Signal (yellow) |

### Category filter chips

| Class | Description |
|---|---|
| `.category-chip` | Individual filter chip |
| `.category-chip-active` | Selected chip (solid `--text` background) |
| `.board-filter-bar` | Flex row of chips |

### Score display

| Class | Description |
|---|---|
| `.score-bar-shell` | 72px wide grey bar background |
| `.score-bar-fill` | Green fill (width = score %) |
| `.score-cell` | Score number + bar together |

### Price history chart

| Class | Description |
|---|---|
| `.history-chart` | SVG element |
| `.history-line` | Green line stroke |
| `.history-area` | Green area fill (semi-transparent) |
| `.history-grid-line` | Horizontal reference lines at 20/50/80% |
| `.chart-axis` | Left-side Y axis labels |
| `.chart-time-axis` | Bottom time range labels |
| `.tape-row` | Trade history row |

---

## Components

| Component | File | Description |
|---|---|---|
| `AppNavigation` | `app-navigation.tsx` | Sidebar nav (desktop) + bottom nav (mobile) with SVG icons |
| `ThemeToggle` | `theme-toggle.tsx` | Dark / Light toggle with localStorage persistence |
| `ForecastComposer` | `forecast-composer.tsx` | Full order ticket (YES/NO, probability slider, size input) |
| `LiveBoardPanels` | `live-board-panels.tsx` | Client shell with SSE, search, category filter, flash animations |
| `MarketBoard` | `market-board.tsx` | Market rows table |
| `LiveMarketView` | `live-market-view.tsx` | Market detail with live SSE updates |
| `MarketHistory` | `market-history.tsx` | Price history chart + trade tape |
| `AdminResolveForm` | `admin-resolve-form.tsx` | Two-step YES/NO resolution confirmation |
| `QuickTradeTrigger` | `quick-trade-trigger.tsx` | Mini order entry from the board row |
| `SubmitButton` | `submit-button.tsx` | Button that shows pending state during form submission |
| `LiveRefresh` | `live-refresh.tsx` | Polls `router.refresh()` every 30s as SSE fallback |
