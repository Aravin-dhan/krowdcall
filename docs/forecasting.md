# Forecasting Mechanics

## Coins

Every user starts with **10,000 coins**. Coins are virtual and have no monetary value.

```
Available = 10,000 + realized_pnl − deployed_coins
```

- `deployed_coins` — coins currently staked on active/locked questions
- `realized_pnl` — net coins won/lost from resolved questions

---

## Placing a forecast

A user picks a side (YES or NO), sets a probability, and stakes coins.

- One active forecast per user per question
- Updating a forecast overwrites the previous one (stake is refunded first)
- Forecasting closes when `close_at` is reached or the question is locked

**Validation** (`forecastAction`):
- Question must be `active`
- `close_at` must be in the future
- Probability: 1–99
- Stake: 1–1,000 coins
- User must have enough available coins

---

## Pricing

Entry price is based on the probability the user assigns.

| Side | Entry price |
|---|---|
| YES (`agree`) | `probability` |
| NO (`disagree`) | `100 − probability` |

**Example**: You forecast YES at 70% probability → entry price = 70.

```ts
getYesPrice(probability)  // → probability
getNoPrice(probability)   // → 100 - probability
getEntryPrice(side, probability)
```

---

## Payout

```
payout_multiplier = 100 / entry_price
projected_return  = stake_coins × payout_multiplier
```

**Example**: Entry price = 70 → multiplier = 1.43× → stake 100 coins → projected return 143 coins.

If correct: user receives `projected_return` coins (net gain = projected_return − stake).
If wrong: user loses `stake_coins`.

---

## Probability split bar

The order ticket shows a visual split of YES vs NO probability:

```
YES side width = entry_price  (if YES selected)
NO side width  = 100 − entry_price
```

The green portion represents the YES price; red represents NO.

---

## Scoring (Brier)

After a question resolves, every forecast on it receives a Brier-style score.

```
score = (1 − (normalized_probability − outcome)²) × 10 / 100
```

Where:
- `normalized_probability` = `probability / 100`
- `outcome` = `1` (YES resolved) or `0` (NO resolved)
- Score range: **0** (worst) to **10** (perfect call)

**Examples**:

| Forecast | Side | Probability | Outcome | Score |
|---|---|---|---|---|
| YES at 90% | agree | 90 | YES (1) | 9.19 |
| YES at 50% | agree | 50 | YES (1) | 7.50 |
| YES at 10% | agree | 10 | YES (1) | 0.19 |
| NO at 80% | disagree | 20 | NO (0) | 9.60 |

Score is calculated in `src/lib/score.ts`:

```ts
export function brierScore({ probability, outcome }: { probability: number; outcome: number }) {
  const p = probability / 100;
  return Math.round((1 - Math.pow(p - outcome, 2)) * 10 * 100) / 100;
}
```

---

## Leaderboard

The leaderboard ranks all users who have at least one resolved forecast. It shows:
- **Calls** — number of resolved forecasts
- **Score** — average Brier score across all resolved markets

Higher is better. Score range: 0–100 (displayed as 0–100 on the leaderboard, scaled ×10 from the raw 0–10).

Color coding on the profile page:
- Green: score ≥ 70
- Amber: score ≥ 50
- Red: score < 50

---

## Price history chart

Every time a forecast is placed or updated, a `forecast_tick` row is appended. The chart on the market detail page renders these ticks as an SVG line/area chart.

- X axis: time (first tick → last tick)
- Y axis: probability (20%–80% grid lines)
- Single tick: rendered as a flat horizontal line (not a chart area)

The tape table below the chart shows the 8 most recent ticks with time, side, YES probability, and size.
