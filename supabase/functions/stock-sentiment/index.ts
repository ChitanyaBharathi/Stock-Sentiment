// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// HuggingFace Inference API endpoint for ProsusAI FinBERT model
const HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/ProsusAI/finbert";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request from browser
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    // Process headlines in parallel via HuggingFace Inference API
    const articles = await Promise.all(
      headlines.map(async (item: any) => {
        const headlineText = typeof item === 'string' ? item : (item?.headline || String(item));
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