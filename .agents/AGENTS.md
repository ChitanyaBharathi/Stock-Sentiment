# Project Rules: StockSentiment Terminal

## Core Design System & Aesthetic Standards
- **Palette**: Midnight Obsidian `#0C0C0E` background, `#141418` cards, `#08080a` navbar/carousel, and Rose Gold `#E8B4B8` accents (`#E8B4B8/10` fills, `#E8B4B8` text highlights & subtle glowing borders).
- **Typography**: 
  - Serif Display: `DM Serif Display` for brand logo, primary ticker headers, and key financial metric displays.
  - Body Sans: `Inter` with custom letter-spacing (`tracking-wider`, `tracking-tight`).
  - Code/Data Mono: `JetBrains Mono` for pricing values, percentages, and telemetry logs.
- **Card Framing**: Use `border-2 border-white/5` with subtle hover scaling (`hover:scale-[1.005]`) and rose gold border brightening (`hover:border-[#E8B4B8]/30 transition-all duration-200`).

## Component & State Management
- **Ghost Chart Prevention**: When changing active tickers in hooks or views, instantly clear transient pricing/chart state (`setData(null)`, `setCandleData(null)`) and set `loading=true` to prevent stale data flashing.
- **Defensive Data Handling**: Never assume API returns non-null values. Check `data?.c`, `data?.dp`, `data?.d` with fallback defaults (`'---'`, `0`).
- **Validation Before Persistence**: Never insert unverified stock symbols into Supabase `watchlists`. Validate ticker against the `get-stock` Edge Function first.

## API & WebSockets Policy
- Fallback gracefully between Live Finnhub API Key, Yahoo Finance proxy, and Edge Function endpoints.
- Manage WebSockets cleanly (`wss://ws.finnhub.io`): always unsubscribe and close sockets on component unmount to avoid memory leaks.
