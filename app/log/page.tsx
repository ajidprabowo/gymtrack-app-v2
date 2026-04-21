'use client';
import { useEffect, useState, useMemo } from 'react';
import { storage } from '@/lib/storage';
import { WorkoutSession } from '@/types';
import { formatDate, getBadgeClass } from '@/lib/utils';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function LogPage() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setSessions(storage.getSessions());
  }, []);

  const sorted = useMemo(() =>
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
    setSelected(null);
  }

  const totalVol = (s: WorkoutSession) =>
    s.exercises.reduce((sum, e) =>
      sum + e.sets.reduce((ss, st) => ss + st.reps * (st.weight || 1), 0), 0);

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">{t('logWorkout.title')}</h1>
            <p className="page-sub">{t('logWorkout.subtitle')}</p>
          </div>
          <Link href="/workout" className="btn btn-primary">{t('logWorkout.newWorkout')}</Link>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'Push', 'Pull', 'Leg', 'Full Body', 'Custom'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: filter === f ? 'var(--accent)' : 'var(--bg2)',
                outline: filter === f ? 'none' : '1px solid var(--border)',
                color: filter === f ? '#fff' : 'var(--text2)',
              }}>
              {f === 'all' ? t('logWorkout.filterAll') : f}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <div className="empty-title">{t('logWorkout.emptyTitle')}</div>
            <div className="empty-sub">{t('logWorkout.emptySub')}</div>
            <Link href="/workout" className="btn btn-primary" style={{ marginTop: 16 }}>{t('logWorkout.startFirst')}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map(s => (
              <div key={s.id} className="card"
                style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
                onClick={() => setSelected(selected === s.id ? null : s.id)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge ${getBadgeClass(s.type)}`}>{s.type}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-montserrat,Montserrat,sans-serif)', fontWeight: 700, fontSize: 15 }}>{s.type} Day</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{formatDate(s.date)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    {[
                      { val: s.exercises.length, lbl: t('logWorkout.exerciseLabel'), color: 'var(--accent)' },
                      { val: s.durationMinutes, lbl: t('logWorkout.minuteLabel'), color: 'var(--orange)' },
                      { val: (totalVol(s) / 1000).toFixed(1), lbl: t('logWorkout.tonLabel'), color: 'var(--yellow)' },
                    ].map(({ val, lbl, color }) => (
                      <div key={lbl} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{lbl}</div>
                      </div>
                    ))}
                    <div style={{ fontSize: 18, color: 'var(--text3)', transition: 'transform 0.2s', transform: selected === s.id ? 'rotate(180deg)' : 'none' }}>▾</div>
                  </div>
                </div>

                {selected === s.id && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    {s.exercises.map(ex => (
                      <div key={ex.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontFamily: 'var(--font-montserrat,Montserrat,sans-serif)', fontWeight: 700, fontSize: 14 }}>{ex.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: 6 }}>{ex.muscleGroup}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {ex.sets.map((set, i) => (
                            <div key={set.id} style={{
                              padding: '5px 10px', borderRadius: 8, fontSize: 12,
                              fontFamily: 'JetBrains Mono,monospace',
                              background: set.completed ? 'rgba(57,217,138,0.1)' : 'var(--bg3)',
                              border: `1px solid ${set.completed ? 'rgba(57,217,138,0.3)' : 'var(--border)'}`,
                              color: set.completed ? 'var(--green)' : 'var(--text2)',
                            }}>
                              S{i + 1}: {set.reps}×{set.weight > 0 ? `${set.weight}kg` : 'BW'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {s.notes && (
                      <div style={{ padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
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
    </AppShell>
  );
}
