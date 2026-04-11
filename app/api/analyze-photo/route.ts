import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gemini-3-flash-preview';

function extractJSON(text: string): Record<string, unknown> | null {
  const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(stripped); } catch {}
  const m = stripped.match(/\{[\s\S]*?\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  if (!imageBase64) return NextResponse.json({ error: 'Gambar tidak ada' }, { status: 400 });

  const prompt = `Kamu adalah ahli nutrisi makanan. Lihat gambar makanan/minuman ini dengan cermat.

Identifikasi semua makanan/minuman yang terlihat dan estimasi kandungan nutrisinya untuk 1 porsi standar yang terlihat dalam foto.

Balas HANYA dengan JSON ini, tanpa teks lain apapun:
{"name":"<nama makanan yang terlihat di foto>","unit":"<satuan porsi (1 porsi, 1 piring, 1 gelas, dll)>","caloriesPer":<angka kalori>,"proteinPer":<angka protein gram>,"carbsPer":<angka karbo gram>,"fatPer":<angka lemak gram>,"description":"<deskripsi singkat makanan yang terlihat>"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
              { text: prompt },
            ],
          }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.2 },
        }),
      }
    );

    const raw = await res.json();
    if (!res.ok) {
      console.error('Gemini photo error:', raw);
      return NextResponse.json({ error: `Gemini ${res.status}: ${JSON.stringify(raw?.error?.message || raw)}` }, { status: 500 });
    }

    const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = extractJSON(text);

    if (!parsed) {
      console.error('Cannot parse photo JSON from:', text);
      return NextResponse.json({ error: `Tidak bisa mengidentifikasi makanan dalam foto. Coba foto lebih dekat dan terang.` }, { status: 500 });
    }

    for (const k of ['caloriesPer','proteinPer','carbsPer','fatPer']) {
      parsed[k] = Math.max(0, parseFloat(String(parsed[k])) || 0);
    }

    return NextResponse.json({ result: parsed });
  } catch (err) {
    console.error('analyze-photo exception:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
