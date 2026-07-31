---
name: edge-function-builder
description: Guidelines and patterns for creating, auditing, and securing Supabase Deno Edge Functions with CORS, rate-limiting, and error handling.
---

# Edge Function Builder Skill

This skill documents how to build and maintain serverless Edge Functions in `supabase/functions/`.

## Standard Edge Function Template

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();
    if (!ticker) throw new Error('Missing ticker parameter');

    // Business Logic / External API Fetch
    const data = { ticker, c: 150.00, dp: 1.25 };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
```

## Security & Rate Limiting Requirements
- Always include CORS options handler.
- Enforce IP-based rate limiting or token checks for external APIs like Finnhub to prevent API quota exhaustion.
- Return structured error JSON with standard HTTP status codes (`400`, `429`, `500`).
