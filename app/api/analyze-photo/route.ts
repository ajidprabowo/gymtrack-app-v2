import { NextRequest, NextResponse } from 'next/server';

const MODELS = [
  'gemini-3-flash-preview',
];

function extractJSON(text: string): Record<string, unknown> | null {
  if (!text) return null;
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch { }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { }
  }
  return null;
}

async function callGeminiVision(apiKey: string, model: string, imageBase64: string, mimeType: string) {
  const prompt = `You are a nutrition expert. Look at this food photo carefully and identify all food items visible.

Return ONLY this JSON object, no other text whatsoever:
{"name":"food name in Indonesian","unit":"portion unit in Indonesian (1 porsi, 1 piring, 1 gelas, etc)","caloriesPer":NUMBER,"proteinPer":NUMBER,"carbsPer":NUMBER,"fatPer":NUMBER,"description":"brief Indonesian description of what you see"}

Numbers must be numeric. Estimate nutrition for the visible portion size. No markdown, no explanation. Just JSON.`;

  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 800, temperature: 0.1 },
      }),
    }
  );
}

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  if (!imageBase64) return NextResponse.json({ error: 'Gambar tidak ada' }, { status: 400 });

  const imgMime = mimeType || 'image/jpeg';
  let lastError = '';

  for (const model of MODELS) {
    try {
      const res = await callGeminiVision(apiKey, model, imageBase64, imgMime);
      const raw = await res.json();

      if (res.status === 503 || res.status === 429) {
        lastError = `Model ${model} overloaded (${res.status})`;
        console.warn(lastError);
        await new Promise(r => setTimeout(r, 800));
        continue;
      }

      if (!res.ok) {
        lastError = `Model ${model} error ${res.status}: ${JSON.stringify(raw?.error?.message || raw)}`;
        console.error(lastError);
        continue;
      }

      const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[analyze-photo] model=${model} raw:`, text.slice(0, 200));

      const parsed = extractJSON(text);
      if (!parsed) {
        lastError = `Non-JSON response: "${text.slice(0, 150)}"`;
        console.error(lastError);
        continue;
      }

      const required = ['name', 'unit', 'caloriesPer', 'proteinPer', 'carbsPer', 'fatPer'];
      const missing = required.filter(k => parsed[k] === undefined || parsed[k] === null);
      if (missing.length > 0) {
        lastError = `Missing fields: ${missing.join(', ')}`;
        continue;
      }

      for (const k of ['caloriesPer', 'proteinPer', 'carbsPer', 'fatPer']) {
        parsed[k] = Math.max(0, parseFloat(String(parsed[k])) || 0);
      }

      return NextResponse.json({ result: parsed });

    } catch (err) {
      lastError = `Exception: ${String(err)}`;
      console.error(`[analyze-photo] ${model}:`, err);
    }
  }

  return NextResponse.json(
    { error: `Analisis foto gagal. ${lastError}. Pastikan foto makanan terlihat jelas dan coba lagi.` },
    { status: 500 }
  );
}
