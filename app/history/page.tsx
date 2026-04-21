'use client';
import { useEffect, useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { WorkoutSession, MealEntry, FoodItem, UserProfile } from '@/types';
import AppShell from '@/components/AppShell';
import { useLanguage } from '@/components/LanguageProvider';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';

export default function HistoryPage() {
  const { t } = useLanguage();
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [meals, setMeals]       = useState<MealEntry[]>([]);
  const [foods, setFoods]       = useState<FoodItem[]>([]);
  const [range, setRange]       = useState<7 | 30>(7);

  useEffect(() => {
    setProfile(storage.getProfile());
    setSessions(storage.getSessions());
    setMeals(storage.getMeals());
    setFoods(storage.getFoods());
  }, []);

  const trend = useMemo(() =>
    Array.from({ length: range }, (_, i) => {
      const d = new Date(Date.now() - (range - 1 - i) * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const label = range === 7
        ? d.toLocaleDateString('id', { weekday: 'short' })
        : d.toLocaleDateString('id', { day: 'numeric', month: 'short' });

      const daySessions = sessions.filter(s => s.date === dateStr && s.completed);
      const vol = daySessions.reduce((sum, s) =>
        sum + s.exercises.reduce((es, e) =>
          es + e.sets.reduce((ss, st) => ss + st.reps * (st.weight || 1), 0), 0), 0);

      const dayMeals = meals.filter(m => m.date === dateStr);
      const kal  = dayMeals.reduce((sum, m) => { const f = foods.find(f => f.id === m.foodId); return sum + (f ? f.caloriesPer * m.quantity : 0); }, 0);
      const prot = dayMeals.reduce((sum, m) => { const f = foods.find(f => f.id === m.foodId); return sum + (f ? f.proteinPer  * m.quantity : 0); }, 0);

      return { date: label, volume: vol, calories: Math.round(kal), protein: Math.round(prot) };
    }), [sessions, meals, foods, range]);

  const muscleData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => s.exercises.forEach(e => { map[e.muscleGroup] = (map[e.muscleGroup] || 0) + e.sets.length; }));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [sessions]);

  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => { map[s.type] = (map[s.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const completed  = sessions.filter(s => s.completed);
  const totalVol   = sessions.reduce((sum, s) => sum + s.exercises.reduce((es, e) => es + e.sets.reduce((ss, st) => ss + st.reps * (st.weight || 1), 0), 0), 0);
  const avgDur     = completed.length ? Math.round(completed.reduce((s, ss) => s + ss.durationMinutes, 0) / completed.length) : 0;
  const totalEx    = sessions.reduce((sum, s) => sum + s.exercises.length, 0);

  const COLORS = ['var(--accent)','var(--green)','var(--orange)','var(--yellow)','var(--red)','#00d2ff','var(--accent2)','#ff9ff3'];

  const ttStyle = { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)' };

  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 className="page-title">{t('history.title')}</h1>
        <p className="page-sub">Progress tracking</p>

        {/* All-time stats */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {[
            { label: t('history.stats.totalSessions'),   val: completed.length,              unit: t('history.stats.sessionsUnit'),     color: 'var(--accent)' },
            { label: t('history.stats.totalVolume'), val: (totalVol/1000).toFixed(1),    unit: t('history.stats.tonUnit'),      color: 'var(--orange)' },
            { label: t('history.stats.totalExercise'),val: totalEx,                       unit: t('history.stats.exerciseUnit'), color: 'var(--yellow)' },
            { label: t('history.stats.avgDuration'),val: avgDur,                        unit: t('history.stats.minuteUnit'),    color: 'var(--green)' },
          ].map(({ label, val, unit, color }) => (
            <div key={label} className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
              <div className="stat-label">{label}</div>
              <span className="stat-val" style={{ color }}>{val}</span>
              <span className="stat-unit">{unit}</span>
            </div>
          ))}
        </div>

        {/* Range toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {([7, 30] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '6px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: range === r ? 'var(--accent)' : 'var(--bg2)',
                outline: range === r ? 'none' : '1px solid var(--border)',
                color: range === r ? '#fff' : 'var(--text2)' }}>
              {r === 7 ? t('history.filters.sevenDays') : t('history.filters.thirtyDays')}
            </button>
          ))}
        </div>

        {/* Volume trend */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-title">{t('history.charts.volChart')}</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={ttStyle} labelStyle={{ color: 'var(--text2)' }}/>
              <Area type="monotone" dataKey="volume" name="Volume (kg·rep)" stroke="var(--accent)" fill="url(#vg)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid-2" style={{ marginBottom: 12 }}>
          {/* Calorie bar */}
          <div className="card">
            <div className="card-title">{t('history.charts.calChart')}</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={ttStyle}/>
                <Bar dataKey="calories" name="Kalori (kkal)" radius={[4,4,0,0]}>
                  {trend.map((e, i) => <Cell key={i} fill={e.calories >= (profile?.targetCalories||2700)*0.8 ? 'var(--green)' : 'var(--orange)'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Protein bar */}
          <div className="card">
            <div className="card-title">{t('history.charts.proChart')}</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={trend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={ttStyle}/>
                <Bar dataKey="protein" name="Protein (g)" radius={[4,4,0,0]}>
                  {trend.map((e, i) => <Cell key={i} fill={e.protein >= (profile?.targetProtein||100)*0.8 ? 'var(--green)' : 'var(--accent)'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid-2">
          {/* Muscle breakdown */}
          <div className="card">
            <div className="card-title">{t('history.charts.distChart')}</div>
            {muscleData.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-sub">Belum ada data</div>
              </div>
            ) : muscleData.map((m, i) => (
              <div key={m.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span style={{ color: COLORS[i % COLORS.length], fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{m.value} set</span>
                </div>
                <div className="progress-wrap" style={{ height: 6 }}>
                  <div className="progress-bar" style={{ width: `${(m.value / muscleData[0].value) * 100}%`, height: 6, background: COLORS[i % COLORS.length] }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Workout type pie */}
          <div className="card">
            <div className="card-title">{t('history.charts.typeChart')}</div>
            {typeData.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-sub">Belum ada data</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={75}
                    dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                    labelLine fontSize={11}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={ttStyle}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
