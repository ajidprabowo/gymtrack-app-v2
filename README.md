# GymTrack Pro 💪

Personal gym tracker dengan AI coach — Next.js App Router + Gemini AI.

## Fitur
- 📊 Dashboard interaktif dengan grafik progress
- 🏋️ Workout tracker dengan live timer & rest timer
- 📋 Log semua sesi latihan
- 🍽️ Nutrisi tracker + kalkulator kalori
- 📈 Statistik & riwayat progress
- 🤖 GymBot AI chatbot (powered by Gemini)
- 🌙 Dark mode & ☀️ Light mode
- 📱 Responsive (HP & laptop)

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local dan isi GEMINI_API_KEY
npm run dev
```

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan environment variable:
   - `GEMINI_API_KEY` = API key dari [Google AI Studio](https://aistudio.google.com/app/apikey)
4. Deploy!

## Mendapatkan Gemini API Key

1. Buka https://aistudio.google.com/app/apikey
2. Buat project baru atau pilih yang ada
3. Generate API key
4. Copy ke Vercel environment variables

## Struktur Project

```
gymtrack/
├── app/
│   ├── api/chat/route.ts     ← API GymBot AI
│   ├── dashboard/page.tsx    ← Dashboard + GymBot
│   ├── workout/page.tsx      ← Workout + Timer
│   ├── log/page.tsx          ← Log sesi
│   ├── nutrition/page.tsx    ← Nutrisi + Kalkulator
│   ├── history/page.tsx      ← Statistik
│   ├── profile/page.tsx      ← Profil & settings
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── AppShell.tsx
│   ├── Navbar.tsx
│   └── ThemeProvider.tsx
├── data/
│   ├── exercises.ts
│   ├── foods.ts
│   └── seeds.ts
├── lib/
│   ├── storage.ts
│   └── utils.ts
└── types/index.ts
```
