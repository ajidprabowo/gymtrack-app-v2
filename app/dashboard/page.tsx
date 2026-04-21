'use client';
import { useEffect, useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { WorkoutSession, MealEntry, FoodItem, UserProfile, ChatMessage } from '@/types';
import { todayStr, formatDateShort, getBadgeClass } from '@/lib/utils';
import AppShell from '@/components/AppShell';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfile(storage.getProfile());
    setSessions(storage.getSessions());
    setMeals(storage.getMeals());
    setFoods(storage.getFoods());
  }, []);

  const today = todayStr();

  const thisWeekSessions = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    return sessions.filter(s => s.date >= weekAgo && s.completed);
  }, [sessions]);

  const todayMeals = useMemo(() => meals.filter(m => m.date === today), [meals, today]);

  const todayCalories = useMemo(() => todayMeals.reduce((sum, m) => {
    const f = foods.find(f => f.id === m.foodId);
    return sum + (f ? f.caloriesPer * m.quantity : 0);
  }, 0), [todayMeals, foods]);

  const todayProtein = useMemo(() => todayMeals.reduce((sum, m) => {
    const f = foods.find(f => f.id === m.foodId);
    return sum + (f ? f.proteinPer * m.quantity : 0);
  }, 0), [todayMeals, foods]);

  const totalVolume = useMemo(() => thisWeekSessions.reduce((sum, s) =>
    sum + s.exercises.reduce((es, e) =>
      es + e.sets.reduce((ss, st) => ss + st.reps * (st.weight || 1), 0), 0), 0), [thisWeekSessions]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date === dateStr && s.completed);
      const vol = daySessions.reduce((sum, s) =>
        sum + s.exercises.reduce((es, e) =>
          es + e.sets.reduce((ss, st) => ss + st.reps * (st.weight || 1), 0), 0), 0);
      const dayMeals = meals.filter(m => m.date === dateStr);
      const kal = dayMeals.reduce((sum, m) => {
        const food = foods.find(f => f.id === m.foodId);
        return sum + (food ? food.caloriesPer * m.quantity : 0);
      }, 0);
      return { day: d.toLocaleDateString('id', { weekday: 'short' }), volume: vol, calories: Math.round(kal) };
    });
  }, [sessions, meals, foods]);

  const recentSessions = sessions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  const calPct = profile ? Math.min(100, (todayCalories / profile.targetCalories) * 100) : 0;
  const protPct = profile ? Math.min(100, (todayProtein / profile.targetProtein) * 100) : 0;

  async function sendChat() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, profile }),
      });
      const data = await res.json();
      const reply = data.text || data.error || 'Maaf, tidak ada respons dari AI.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Koneksi gagal. Pastikan GEMINI_API_KEY sudah diset di Vercel environment variables, lalu redeploy.',
        timestamp: Date.now(),
      }]);
    }
    setLoading(false);
  }

  if (!profile) return <AppShell><div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>{t('dashboard.loading')}</div></AppShell>;

  const greet = () => { const h = new Date().getHours(); return h < 12 ? t('dashboard.morning') : h < 18 ? t('dashboard.afternoon') : t('dashboard.evening'); };

  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{greet()} 👋</div>
          <h1 className="page-title">{profile.name}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{thisWeekSessions.length}/{profile.gymDaysPerWeek} sesi minggu ini</span>
            {thisWeekSessions.length >= profile.gymDaysPerWeek && (
              <span style={{ fontSize: 12, background: 'rgba(57,217,138,0.14)', color: 'var(--green)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>🎯 Target tercapai!</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 16 }}>
          {[
            { label: 'Sesi Minggu Ini', val: thisWeekSessions.length, unit: `/ ${profile.gymDaysPerWeek}`, color: 'var(--accent)' },
            { label: 'Volume Minggu', val: (totalVolume / 1000).toFixed(1), unit: 'ton', color: 'var(--orange)' },
            { label: 'Kalori Hari Ini', val: Math.round(todayCalories), unit: 'kkal', color: 'var(--yellow)' },
            { label: 'Protein Hari Ini', val: Math.round(todayProtein), unit: 'g', color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <span className="stat-val" style={{ color: s.color }}>{s.val}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          {[
            { label: 'Target Kalori', pct: calPct, val: Math.round(todayCalories), target: profile.targetCalories, unit: 'kkal', color: 'var(--yellow), var(--orange)' },
            { label: 'Target Protein', pct: protPct, val: Math.round(todayProtein), target: profile.targetProtein, unit: 'g', color: 'var(--green), #00d2ff' },
          ].map(p => (
            <div key={p.label} className="card">
              <div className="card-title">{p.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text2)' }}>{p.val} {p.unit}</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{Math.round(p.pct)}%</span>
              </div>
              <div className="progress-wrap" style={{ height: 8 }}>
                <div className="progress-bar" style={{ width: `${p.pct}%`, height: 8, background: `linear-gradient(90deg, ${p.color})` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Target: {p.target} {p.unit}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="card-title">Volume Latihan 7 Hari</div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}/>
                <Area type="monotone" dataKey="volume" stroke="var(--accent)" fill="url(#vg)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">Kalori 7 Hari</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' }}/>
                <Bar dataKey="calories" radius={[4,4,0,0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.calories >= (profile?.targetCalories||2700)*0.8 ? 'var(--green)' : 'var(--orange)'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chatbot + Recent Sessions */}
        <div className="grid-2" style={{ marginBottom: 16 }}>
          {/* GymBot Chat */}
          <div className="card" style={{ background: 'linear-gradient(135deg,#16163a,var(--bg2))', border: '1px solid rgba(124,106,255,0.3)', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div className="card-title" style={{ marginBottom: 2 }}>🤖 GymBot AI</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Personal trainer AI kamu</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setChatOpen(true)}>Buka Chat</button>
            </div>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ fontSize: 36 }}>🏋️</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center' }}>Tanya apapun seputar gym, nutrisi, dan program latihan kamu!</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, justifyContent: 'center' }}>
                  {['Apa itu progressive overload?', 'Berapa protein idealku?', 'Tips push day'].map(q => (
                    <button key={q} onClick={() => { setChatOpen(true); setInput(q); }}
                      style={{ padding: '5px 10px', borderRadius: 8, fontSize: 11, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.slice(-2).map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                    {m.content.slice(0, 120)}{m.content.length > 120 ? '...' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Sesi Terakhir</div>
              <Link href="/history" className="btn btn-ghost btn-sm">Semua</Link>
            </div>
            {recentSessions.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-icon">🏋️</div>
                <div className="empty-sub">Belum ada sesi</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentSessions.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${getBadgeClass(s.type)}`}>{s.type}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.exercises.length} ex</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDateShort(s.date)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.durationMinutes} mnt</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-title">Quick Action</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/workout" className="btn btn-primary">🏋️ Mulai Workout</Link>
            <Link href="/nutrition" className="btn btn-ghost">🍽️ Catat Makan</Link>
            <Link href="/log" className="btn btn-ghost">📋 Log</Link>
            <Link href="/history" className="btn btn-ghost">📈 Statistik</Link>
          </div>
        </div>
      </div>

      {/* Full Chat Modal */}
      {chatOpen && (
        <div className="modal-overlay" onClick={() => setChatOpen(false)}>
          <div className="modal" style={{ maxWidth: 560, height: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              🤖 GymBot AI
              <button className="btn-icon" onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, paddingRight: 4 }}>
              {messages.length === 0 && (
                <div className="chat-bubble-bot">
                  Halo! Saya GymBot, personal trainer AI kamu 💪 Tanya apa saja seputar gym, latihan, atau nutrisi!
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} style={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
              ))}
              {loading && <div className="chat-bubble-bot">⏳ Sedang mengetik...</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input" placeholder="Tanya seputar gym..." value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
              />
              <button className="btn btn-primary" onClick={sendChat} disabled={loading || !input.trim()}>Kirim</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
