import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gemini-3-flash-preview';

function callGemini(apiKey: string, body: object) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
}

function extractJSON(text: string): Record<string, unknown> | null {
  // Strip markdown fences
  const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Try direct parse
  try { return JSON.parse(stripped); } catch {}
  // Try extract first {...}
  const m = stripped.match(/\{[\s\S]*?\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  if (!query?.trim()) return NextResponse.json({ error: 'Query kosong' }, { status: 400 });

  const prompt = `Kamu adalah ahli nutrisi makanan. Analisis kandungan nutrisi dari: "${query.trim()}"

Tentukan 1 porsi standar yang wajar (misal: 1 batang, 1 bungkus, 1 gelas, 100 gram, 1 buah).
Estimasi nilai nutrisi per porsi standar tersebut.

Balas HANYA dengan JSON ini, tanpa teks lain:
{"name":"<nama makanan>","unit":"<satuan>","caloriesPer":<angka>,"proteinPer":<angka>,"carbsPer":<angka>,"fatPer":<angka>}`;

  try {
    const res = await callGemini(apiKey, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.2 },
    });

    const raw = await res.json();
    if (!res.ok) {
      console.error('Gemini error:', raw);
      return NextResponse.json({ error: `Gemini ${res.status}: ${JSON.stringify(raw?.error?.message || raw)}` }, { status: 500 });
    }

    const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = extractJSON(text);

    if (!parsed) {
      console.error('Cannot parse JSON from:', text);
      return NextResponse.json({ error: `Tidak bisa parse respons AI: ${text.slice(0, 100)}` }, { status: 500 });
    }

    // Coerce numerics
    for (const k of ['caloriesPer','proteinPer','carbsPer','fatPer']) {
      parsed[k] = Math.max(0, parseFloat(String(parsed[k])) || 0);
    }

    const required = ['name','unit','caloriesPer','proteinPer','carbsPer','fatPer'];
    for (const k of required) {
      if (parsed[k] === undefined) return NextResponse.json({ error: `Field '${k}' missing` }, { status: 500 });
    }

    return NextResponse.json({ result: parsed });
  } catch (err) {
    console.error('analyze-food exception:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
