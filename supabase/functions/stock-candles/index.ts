// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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

    if (!ticker) {
      throw new Error('Ticker symbol is required');
    }

    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      throw new Error('Server misconfiguration: FINNHUB_API_KEY is missing');
    }

    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 60 * 60); // Last 30 days
    const resolution = 'D'; // Daily candles

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.status}`);
    }

    const data = await res.json();

    if (data.s === 'no_data') {
      throw new Error(`No candle data found for ${ticker}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
