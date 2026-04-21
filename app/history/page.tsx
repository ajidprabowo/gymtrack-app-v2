'use client';
import { useEffect, useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { WorkoutSession, MealEntry, FoodItem, UserProfile } from '@/types';
import AppShell from '@/components/AppShell';
import { useLanguage } from '@/components/LanguageProvider';
import { formatDate, getBadgeClass } from '@/lib/utils';
import Link from 'next/link';
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
  const [activeTab, setActiveTab] = useState<'stats' | 'log'>('stats');
  
  // Log specific states
  const [filter, setFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  useEffect(() => {
    setProfile(storage.getProfile());
    setSessions(storage.getSessions());
    setMeals(storage.getMeals());
    setFoods(storage.getFoods());
  }, []);

  // Stats Calculations
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

  // Log Calculations
  const sortedLogs = useMemo(() =>
    sessions
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(s => filter === 'all' || s.type === filter),
    [sessions, filter]);

  function deleteSession(id: string) {
    if (!window.confirm(t('logWorkout.deleteConfirm'))) return;
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    storage.saveSessions(updated);
    setSelectedLog(null);
  }

  const getSessionVol = (s: WorkoutSession) =>
    s.exercises.reduce((sum, e) =>
      sum + e.sets.reduce((ss, st) => ss + st.reps * (st.weight || 1), 0), 0);

  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 className="page-title">{t('history.title')}</h1>
        <p className="page-sub">{t('history.subtitle')}</p>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          <button onClick={() => setActiveTab('stats')}
            style={{ 
              padding: '8px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: activeTab === 'stats' ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
              color: activeTab === 'stats' ? 'var(--accent)' : 'var(--text2)',
              transition: 'all 0.2s ease', fontFamily: "var(--font-inter, 'Inter', sans-serif)"
            }}>
            {t('dashboard.quickAction.stats')}
          </button>
          <button onClick={() => setActiveTab('log')}
            style={{ 
              padding: '8px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: activeTab === 'log' ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
              color: activeTab === 'log' ? 'var(--accent)' : 'var(--text2)',
              transition: 'all 0.2s ease', fontFamily: "var(--font-inter, 'Inter', sans-serif)"
            }}>
            {t('dashboard.quickAction.log')}
          </button>
        </div>

        {activeTab === 'stats' && (
          <div>
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
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">{t('history.charts.volChart')}</div>
              <ResponsiveContainer width="100%" height={240}>
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

            <div className="grid-2" style={{ marginBottom: 16 }}>
              {/* Calorie bar */}
              <div className="card">
                <div className="card-title">{t('history.charts.calChart')}</div>
                <ResponsiveContainer width="100%" height={180}>
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
                <ResponsiveContainer width="100%" height={180}>
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
                    <div className="empty-sub">{t('history.charts.emptyData')}</div>
                  </div>
                ) : muscleData.map((m, i) => (
                  <div key={m.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ color: COLORS[i % COLORS.length], fontFamily: 'JetBrains Mono,monospace', fontWeight: 700 }}>{m.value} set</span>
                    </div>
                    <div className="progress-wrap" style={{ height: 8 }}>
                      <div className="progress-bar" style={{ width: `${(m.value / muscleData[0].value) * 100}%`, height: 8, background: COLORS[i % COLORS.length] }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Workout type pie */}
              <div className="card">
                <div className="card-title">{t('history.charts.typeChart')}</div>
                {typeData.length === 0 ? (
                  <div className="empty-state" style={{ padding: '20px 0' }}>
                    <div className="empty-sub">{t('history.charts.emptyData')}</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" outerRadius={85}
                        dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                        labelLine fontSize={11} stroke="var(--bg2)" strokeWidth={2}>
                        {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={ttStyle}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p className="page-sub" style={{ marginBottom: 0 }}>{t('logWorkout.subtitle')}</p>
              </div>
              <Link href="/workout" className="btn btn-primary">{t('logWorkout.newWorkout')}</Link>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {['all', 'Push', 'Pull', 'Leg', 'Full Body', 'Custom'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                    background: filter === f ? 'var(--accent)' : 'var(--bg2)',
                    outline: filter === f ? 'none' : '1px solid var(--border)',
                    color: filter === f ? '#fff' : 'var(--text2)',
                    transition: 'all 0.2s ease', fontFamily: "var(--font-inter, 'Inter', sans-serif)"
                  }}>
                  {f === 'all' ? t('logWorkout.filterAll') : f}
                </button>
              ))}
            </div>

            {sortedLogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <div className="empty-title">{t('logWorkout.emptyTitle')}</div>
                <div className="empty-sub">{t('logWorkout.emptySub')}</div>
                <Link href="/workout" className="btn btn-primary" style={{ marginTop: 16 }}>{t('logWorkout.startFirst')}</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sortedLogs.map(s => (
                  <div key={s.id} className="card"
                    style={{ cursor: 'pointer', transition: 'border-color 0.2s ease, transform 0.2s ease', padding: '16px 20px' }}
                    onClick={() => setSelectedLog(selectedLog === s.id ? null : s.id)}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span className={`badge ${getBadgeClass(s.type)}`}>{s.type}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{s.type} Day</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{formatDate(s.date)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        {[
                          { val: s.exercises.length, lbl: t('logWorkout.exerciseLabel'), color: 'var(--accent)' },
                          { val: s.durationMinutes, lbl: t('logWorkout.minuteLabel'), color: 'var(--orange)' },
                          { val: (getSessionVol(s) / 1000).toFixed(1), lbl: t('logWorkout.tonLabel'), color: 'var(--yellow)' },
                        ].map(({ val, lbl, color }) => (
                          <div key={lbl} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color }}>{val}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lbl}</div>
                          </div>
                        ))}
                        <div style={{ fontSize: 20, color: 'var(--text3)', transition: 'transform 0.3s ease', transform: selectedLog === s.id ? 'rotate(180deg)' : 'none' }}>▾</div>
                      </div>
                    </div>

                    {selectedLog === s.id && (
                      <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                        {s.exercises.map(ex => (
                          <div key={ex.id} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <span style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</span>
                              <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>{ex.muscleGroup}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {ex.sets.map((set, i) => (
                                <div key={set.id} style={{
                                  padding: '6px 12px', borderRadius: 8, fontSize: 13,
                                  fontFamily: 'JetBrains Mono,monospace',
                                  background: set.completed ? 'color-mix(in srgb, var(--green) 10%, transparent)' : 'var(--bg3)',
                                  border: `1px solid ${set.completed ? 'color-mix(in srgb, var(--green) 20%, transparent)' : 'var(--border)'}`,
                                  color: set.completed ? 'var(--green)' : 'var(--text2)',
                                }}>
                                  S{i + 1}: {set.reps} × {set.weight > 0 ? `${set.weight}kg` : 'BW'}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {s.notes && (
                          <div style={{ padding: '12px 16px', background: 'var(--bg3)', borderRadius: 8, fontSize: 14, color: 'var(--text)', marginBottom: 16, border: '1px solid var(--border)' }}>
                            📝 {s.notes}
                          </div>
                        )}
                        <button className="btn btn-danger btn-sm"
                          onClick={e => { e.stopPropagation(); deleteSession(s.id); }}>
                          {t('logWorkout.deleteSession')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
