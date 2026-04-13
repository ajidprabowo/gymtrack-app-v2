import { NextRequest, NextResponse } from 'next/server';

// Use stable flash model — preview models are unreliable for structured output
const MODELS = [
  'gemini-3-flash-preview',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

function extractJSON(text: string): Record<string, unknown> | null {
  if (!text) return null;
  // 1. Strip markdown fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // 2. Direct parse
  try { return JSON.parse(cleaned); } catch {}
  // 3. Find first complete {...} block
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  return null;
}

async function callGemini(apiKey: string, model: string, prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.0,   // fully deterministic
          topP: 0.1,
        },
      }),
    }
  );
  return res;
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  if (!query?.trim()) return NextResponse.json({ error: 'Query kosong' }, { status: 400 });

  // Very direct prompt — no ambiguity, output only JSON
  const prompt = `You are a nutrition database. Output ONLY a single JSON object, no other text.

Food: "${query.trim()}"

Determine a standard single serving size. Return this exact JSON format:
{"name":"food name in Indonesian","unit":"serving unit in Indonesian","caloriesPer":NUMBER,"proteinPer":NUMBER,"carbsPer":NUMBER,"fatPer":NUMBER}

Numbers must be numeric (not strings). No markdown, no explanation, no extra text. Just the JSON.`;

  let lastError = '';

  for (const model of MODELS) {
    try {
      const res  = await callGemini(apiKey, model, prompt);
      const raw  = await res.json();

      if (res.status === 503 || res.status === 429) {
        lastError = `Model ${model} overloaded (${res.status}), trying next...`;
        console.warn(lastError);
        await new Promise(r => setTimeout(r, 800)); // brief wait before retry
        continue;
      }

      if (!res.ok) {
        lastError = `Model ${model} error ${res.status}: ${JSON.stringify(raw?.error?.message || raw)}`;
        console.error(lastError);
        continue;
      }

      const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[analyze-food] model=${model} raw:`, text.slice(0, 200));

      const parsed = extractJSON(text);
      if (!parsed) {
        lastError = `Model ${model} returned non-JSON: "${text.slice(0, 150)}"`;
        console.error(lastError);
        continue;
      }

      // Validate & coerce
      const required = ['name', 'unit', 'caloriesPer', 'proteinPer', 'carbsPer', 'fatPer'];
      const missing  = required.filter(k => parsed[k] === undefined || parsed[k] === null);
      if (missing.length > 0) {
        lastError = `Missing fields: ${missing.join(', ')} in: ${JSON.stringify(parsed)}`;
        console.error(lastError);
        continue;
      }

      for (const k of ['caloriesPer', 'proteinPer', 'carbsPer', 'fatPer']) {
        parsed[k] = Math.max(0, parseFloat(String(parsed[k])) || 0);
      }

      return NextResponse.json({ result: parsed });

    } catch (err) {
      lastError = `Model ${model} exception: ${String(err)}`;
      console.error(lastError);
    }
  }

  return NextResponse.json(
    { error: `Semua model gagal. Error terakhir: ${lastError}` },
    { status: 500 }
  );
}
