import { NextRequest, NextResponse } from 'next/server';

const MODEL = 'gemini-3-flash-preview';

export async function POST(req: NextRequest) {
  const { messages, profile } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });

  const systemPrompt = `Kamu adalah GymBot, personal trainer AI yang ahli dalam dunia fitness dan gym.
Kamu membantu pengguna dengan pertanyaan seputar:
- Program latihan gym (Push, Pull, Leg, Full Body)
- Teknik dan form gerakan yang benar
- Nutrisi dan diet untuk bulking/cutting
- Suplemen gym
- Recovery dan istirahat
- Tips untuk pemula gym

Profil pengguna saat ini:
- Berat badan: ${profile?.weightKg || 50}kg
- Tinggi: ${profile?.heightCm || 170}cm
- Goal: ${profile?.goal || 'Bulking'}
- Hari gym per minggu: ${profile?.gymDaysPerWeek || 3}x
- Target kalori: ${profile?.targetCalories || 2700} kkal/hari
- Target protein: ${profile?.targetProtein || 100}g/hari

Berikan jawaban yang:
- Dalam Bahasa Indonesia yang friendly dan semangat
- Spesifik dan actionable
- Disesuaikan dengan profil pengguna di atas
- Singkat tapi informatif (max 3-4 paragraf)
- Gunakan emoji sesekali agar tidak kaku
Jika pertanyaan tidak berkaitan dengan gym/fitness, arahkan kembali ke topik gym.`;

  const contents = messages.map((msg: { role: string; content: string }) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini chat error:', res.status, errText);
      return NextResponse.json({ text: `Error Gemini API (${res.status}). Pastikan API key valid.` }, { status: 200 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return NextResponse.json({ text: 'Maaf, tidak ada respons dari AI. Coba lagi ya! 💪' });
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Chat exception:', err);
    return NextResponse.json({ text: 'Koneksi ke AI gagal. Periksa internet dan coba lagi.' }, { status: 200 });
  }
}
