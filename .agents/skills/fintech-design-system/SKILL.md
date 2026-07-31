---
name: fintech-design-system
description: Design tokens, Midnight Gallery dark-mode aesthetic rules, component layouts, and micro-animations for the StockSentiment fintech terminal.
---

# Fintech Design System Skill

This skill provides guidelines and UI specifications for building luxury dark-mode financial interfaces inspired by Linear and Apple Design.

## 1. Color Palette Tokens

| Name | Hex / Class | Usage |
|---|---|---|
| Canvas Background | `#0C0C0E` | Main page body, backdrop |
| Primary Card Fill | `#141418` | Stats cards, watchlist items, widget blocks |
| Dark Bar Fill | `#08080a` | Navigation bar, marquee ticker background |
| Rose Gold Primary | `#E8B4B8` | Primary brand accent, active navigation glow |
| Rose Gold Soft Fill | `bg-[#E8B4B8]/10` | Active pills, badge backgrounds |
| Card Border | `border-2 border-white/5` | Standard card framing |
| Card Hover Border | `hover:border-[#E8B4B8]/30` | Hover interactive feedback |

## 2. Typography Rules

- **Serif (Display)**: DM Serif Display (`font-serif`). Used for:
  - Sentimeter Logo brand mark
  - Primary Ticker Display Titles (e.g. `TSLA`, `AAPL`)
  - Large Portfolio Balance values (`$10,000.00`)
- **Sans (Interface)**: Inter (`font-sans`). Used for:
  - Eyebrow labels (`text-[10px] uppercase tracking-wider font-semibold`)
  - Navigation menu labels
  - Sub-headers and detail metadata
- **Mono (Data)**: JetBrains Mono (`font-mono`). Used for:
  - Exact price values, trade execution logs, API status timestamps

## 3. Micro-Animations

- **Hover Scaling**: All interactive cards use `hover:scale-[1.005] transition-all duration-200`.
- **Marquee Loop**: Horizontal marquee scrolling on the ticker header with CSS `animate-marquee 25s linear infinite`.
- **Pulse Indicators**: Socket streaming badges use `animate-ping` on small colored dots.
