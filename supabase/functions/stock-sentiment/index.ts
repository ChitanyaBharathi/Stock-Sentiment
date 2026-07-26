// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// HuggingFace Inference API endpoint for ProsusAI FinBERT model
const HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert";

const ALLOWED_ORIGINS = ['http://localhost:5173'];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const isAllowed = origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= 30) return false;
  record.count++;
  return true;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight request from browser
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { headlines } = await req.json();
    const hfToken = Deno.env.get("Hugging_face_token") || Deno.env.get("HF_TOKEN");

    if (!hfToken) {
      throw new Error("Missing HF_TOKEN or Hugging_face_token environment secret.");
    }

    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return new Response(JSON.stringify({ articles: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Input validation: ensure headlines are strings and not excessively long
    const validatedHeadlines = headlines.map(h => {
      const text = typeof h === 'string' ? h : (h?.headline || String(h));
      return text.substring(0, 500); // Prevent massive payloads
    });

    // Process headlines in parallel via HuggingFace Inference API
    const articles = await Promise.all(
      validatedHeadlines.map(async (headlineText: string) => {
        try {
          const res = await fetch(HF_MODEL_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: headlineText }),
          });

          const data = await res.json();

          // Handle Cold Start (when HuggingFace is waking up the model)
          if (data.error && String(data.error).includes("loading")) {
            return {
              headline: headlineText,
              sentiment: "NEUTRAL",
              confidence: 50,
              note: "Model waking up...",
            };
          }

          // FinBERT returns an array of scores: [{ label: 'positive', score: 0.92 }, ...]
          const predictions = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);
          
          // Pick label with highest probability score
          const topPrediction = predictions.reduce(
            (max: any, item: any) => (item && typeof item.score === 'number' && item.score > max.score ? item : max),
            { label: "neutral", score: 0 }
          );

          return {
            headline: headlineText,
            sentiment: (topPrediction.label || "neutral").toUpperCase(), // 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
            confidence: Math.round((topPrediction.score || 0) * 100),
          };
        } catch (err) {
          return {
            headline: headlineText,
            sentiment: "NEUTRAL",
            confidence: 0,
            error: "Failed to classify",
          };
        }
      })
    );

    // Calculate aggregated overall score percentages
    const total = articles.length;
    const positiveCount = articles.filter((a) => a.sentiment === "POSITIVE").length;
    const negativeCount = articles.filter((a) => a.sentiment === "NEGATIVE").length;

    const bullishPercent = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
    const bearishPercent = total > 0 ? Math.round((negativeCount / total) * 100) : 0;

    let aggregateLabel = "NEUTRAL";
    if (positiveCount > negativeCount && positiveCount > 0) {
      aggregateLabel = "BULLISH";
    } else if (negativeCount > positiveCount && negativeCount > 0) {
      aggregateLabel = "BEARISH";
    }

    return new Response(
      JSON.stringify({
        articles,
        aggregateLabel,
        bullishPercent,
        bearishPercent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});