---
name: financial-data-validator
description: Data verification rules for stock quotes, candle data, WebSocket streams, and watchlist insertions.
---

# Financial Data Validator Skill

This skill defines data sanitization and validation procedures for market telemetry.

## 1. Ticker Symbol Validation Rules
- Strips whitespace and forces uppercase format (e.g. `' aapl '` -> `'AAPL'`).
- Maps popular company names to tickers before searching (e.g., `'Apple'` -> `'AAPL'`).
- Validates price payload return: if `payload.c === 0 && payload.pc === 0`, classify symbol as invalid/unquoted.
- Only insert valid symbols into Supabase `watchlists` table.

## 2. Real-Time Stream Lifecycle
- When switching active ticker in `useStockData` or `useWebSocketStream`, return an immediate `isStale` loading payload before `useEffect` fires to prevent ghost chart flashes.
- On unmount, cleanly send `unsubscribe` frames to WebSocket server before closing socket connection.
