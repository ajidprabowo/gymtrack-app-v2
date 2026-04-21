'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { WorkoutSession, Exercise, GymSet, MuscleGroup, UserProfile } from '@/types';
import { genId, formatDuration, getBadgeClass } from '@/lib/utils';
import { MUSCLE_GROUPS, EXERCISE_PRESETS, WORKOUT_PRESETS } from '@/data/exercises';
import AppShell from '@/components/AppShell';

const TYPES = ['Push', 'Pull', 'Leg', 'Full Body', 'Custom'] as const;

// Store reps & weight as strings so inputs can be fully cleared
interface SetDisplay extends Omit<GymSet, 'reps' | 'weight'> {
  repsStr: string;
  weightStr: string;
}
interface ExDisplay extends Omit<Exercise, 'sets'> {
  sets: SetDisplay[];
}
interface SessionDisplay extends Omit<WorkoutSession, 'exercises'> {
  exercises: ExDisplay[];
}

function toDisplay(session: WorkoutSession): SessionDisplay {
  return {
    ...session,
    exercises: session.exercises.map(e => ({
      ...e,
      sets: e.sets.map(s => ({ ...s, repsStr: String(s.reps), weightStr: String(s.weight) })),
    })),
  };
}

function toSave(session: SessionDisplay): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(e => ({
      ...e,
      sets: e.sets.map(s => ({
        id: s.id, completed: s.completed,
        reps:   parseFloat(s.repsStr)   || 0,
        weight: parseFloat(s.weightStr) || 0,
      })),
    })),
  };
}

export default function WorkoutPage() {
  const [sessions, setSessions]   = useState<WorkoutSession[]>([]);
  const [active, setActive]       = useState<SessionDisplay | null>(null);
  const [showAddEx, setShowAddEx] = useState(false);
  const [newEx, setNewEx]         = useState({ name: '', muscleGroup: 'Chest' as MuscleGroup });

  // Workout timer
  const [elapsed, setElapsed]         = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef  = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Rest timer
  const [restTimer, setRestTimer]   = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const restRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSessions(storage.getSessions());

    const savedActive = storage.getActiveWorkout();
    if (savedActive) setActive(savedActive);

    const savedTimer = storage.getTimerState();
    if (savedTimer) {
      if (savedTimer.running) {
        setTimerRunning(true);
        startTimeRef.current = savedTimer.startTime;
        const e = Math.floor((Date.now() - savedTimer.startTime) / 1000);
        setElapsed(e);
        intervalRef.current = setInterval(() => {
          setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
      } else {
        setElapsed(savedTimer.elapsed);
      }
    }
  }, []);

  useEffect(() => {
    if (active) {
      storage.saveActiveWorkout(active);
    } else {
      storage.clearActiveWorkout();
    }
  }, [active]);

  const syncTimerState = (running: boolean, start: number, currentElapsed: number) => {
    storage.saveTimerState({ running, startTime: start, elapsed: currentElapsed });
  };

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    setTimerRunning(true);
    syncTimerState(true, startTimeRef.current, elapsed);
  }, [elapsed]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
    setElapsed(prev => {
      syncTimerState(false, startTimeRef.current, prev);
      return prev;
    });
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    setTimerRunning(false);
    storage.clearTimerState();
  }, []);

  const startRest = (seconds: number) => {
    if (restRef.current) clearInterval(restRef.current);
    setRestTimer(seconds);
    setRestRunning(true);
    restRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) { clearInterval(restRef.current!); setRestRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (restRef.current) clearInterval(restRef.current);
  }, []);

  // ── Workout actions ────────────────────────────────────────────────────────
  function startWorkout(type: WorkoutSession['type']) {
    const prefill = (WORKOUT_PRESETS[type] || []).map(f => ({
      id: genId(), name: f.name, muscleGroup: f.mg,
      sets: [{ id: genId(), repsStr: '12', weightStr: '0', completed: false }],
    }));
    const session: SessionDisplay = {
      id: genId(), date: new Date().toISOString().split('T')[0],
      type, exercises: prefill, durationMinutes: 0, completed: false,
    };
    setActive(session);
    setElapsed(0);
    // Start timer automatically
    startTimeRef.current = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    setTimerRunning(true);
    syncTimerState(true, startTimeRef.current, 0);
  }

  function addSet(exId: string) {
    if (!active) return;
    setActive({
      ...active,
      exercises: active.exercises.map(e => {
        if (e.id !== exId) return e;
        const last = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [...e.sets, {
            id: genId(),
            repsStr:   last?.repsStr   ?? '12',
            weightStr: last?.weightStr ?? '0',
            completed: false,
          }],
        };
      }),
    });
  }

  function updateSetStr(exId: string, setId: string, field: 'repsStr' | 'weightStr', value: string) {
    if (!active) return;
    // Allow empty string or valid number strings (including decimals)
    if (value !== '' && !/^-?\d*\.?\d*$/.test(value)) return;
    setActive({
      ...active,
      exercises: active.exercises.map(e =>
        e.id !== exId ? e : {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s),
        }
      ),
    });
  }

  function toggleSetComplete(exId: string, setId: string) {
    if (!active) return;
    setActive({
      ...active,
      exercises: active.exercises.map(e =>
        e.id !== exId ? e : {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s),
        }
      ),
    });
    startRest(90);
  }

  function removeSet(exId: string, setId: string) {
    if (!active) return;
    setActive({
      ...active,
      exercises: active.exercises.map(e =>
        e.id !== exId ? e : { ...e, sets: e.sets.filter(s => s.id !== setId) }
      ),
    });
  }

  function removeExercise(exId: string) {
    if (!active) return;
    setActive({ ...active, exercises: active.exercises.filter(e => e.id !== exId) });
  }

  function addExercise() {
    if (!active || !newEx.name.trim()) return;
    const ex: ExDisplay = {
      id: genId(), name: newEx.name.trim(), muscleGroup: newEx.muscleGroup,
      sets: [{ id: genId(), repsStr: '12', weightStr: '0', completed: false }],
    };
    setActive({ ...active, exercises: [...active.exercises, ex] });
    setNewEx({ name: '', muscleGroup: 'Chest' });
    setShowAddEx(false);
  }

  function finishWorkout() {
    if (!active) return;
    pauseTimer();
    const durationMinutes = Math.max(1, Math.round(elapsed / 60));
    const finished: WorkoutSession = { ...toSave(active), durationMinutes, completed: true };
    const updated = [finished, ...sessions];
    setSessions(updated);
    storage.saveSessions(updated);
    setActive(null);
    resetTimer();
  }

  function cancelWorkout() {
    if (window.confirm('Batalkan workout ini?')) {
      setActive(null);
      resetTimer();
    }
  }

  // ── History helper ─────────────────────────────────────────────────────────
  const getPrevExercise = useCallback((name: string) => {
    const sorted = [...sessions].sort((a,b) => b.date.localeCompare(a.date));
    for (const session of sorted) {
      if (session.id === active?.id) continue;
      const ex = session.exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
      if (ex && ex.sets.length > 0) return { date: session.date, sets: ex.sets };
    }
    return null;
  }, [sessions, active]);

  // ── No active workout ──────────────────────────────────────────────────────
  if (!active) {
    return (
      <AppShell>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 className="page-title">Mulai Workout</h1>
          <p className="page-sub">Pilih tipe workout hari ini</p>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {TYPES.map(type => (
              <button key={type} onClick={() => startWorkout(type)}
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <span className={`badge badge-${type.toLowerCase().replace(' ', '-')}`} style={{ marginBottom: 8, display: 'block', width: 'fit-content' }}>{type}</span>
                <div style={{ fontFamily: 'var(--font-montserrat,Montserrat,sans-serif)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{type} Day</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  {type === 'Push' && 'Chest · Shoulder · Triceps'}
                  {type === 'Pull' && 'Back · Biceps · Rear Delt'}
                  {type === 'Leg' && 'Quads · Hamstring · Calves'}
                  {type === 'Full Body' && 'Semua grup otot dalam 1 sesi'}
                  {type === 'Custom' && 'Buat workout sesuai keinginan'}
                </div>
              </button>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Tips Sebelum Latihan</div>
            {['💧 Minum 1-2 gelas air sebelum mulai', '🔥 Warm up 5-10 menit sebelum mulai', '📱 Tonton video form untuk gerakan baru', '📝 Catat beban tiap set untuk progressive overload'].map(t => (
              <div key={t} style={{ padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{t}</div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Active workout ─────────────────────────────────────────────────────────
  const totalSets     = active.exercises.reduce((s, e) => s + e.sets.length, 0);
  const completedSets = active.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0);
  const progress      = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <span className={`badge badge-${active.type.toLowerCase().replace(' ','-')}`}
              style={{ marginBottom: 6, display: 'block', width: 'fit-content' }}>{active.type}</span>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{active.type} Day</h1>
          </div>

          {/* Live Timer Card */}
          <div style={{ textAlign: 'right', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 18px', minWidth: 140 }}>
            <div className="timer-sm">{formatDuration(elapsed)}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
              <button
                onClick={timerRunning ? pauseTimer : startTimer}
                style={{
                  padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: timerRunning ? 'rgba(255,92,92,0.15)' : 'rgba(57,217,138,0.15)',
                  color: timerRunning ? 'var(--red)' : 'var(--green)',
                  border: `1px solid ${timerRunning ? 'rgba(255,92,92,0.3)' : 'rgba(57,217,138,0.3)'}`,
                }}>
                {timerRunning ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button className="btn-icon btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={resetTimer}>↺</button>
            </div>
          </div>
        </div>

        {/* Rest Timer */}
        {restRunning && (
          <div style={{ marginBottom: 12, background: 'rgba(124,106,255,0.1)', border: '1px solid rgba(124,106,255,0.3)', borderRadius: 12, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>⏱ Rest Timer</span>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 22, fontWeight: 700, color: restTimer <= 10 ? 'var(--red)' : 'var(--accent)' }}>
              {formatDuration(restTimer)}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[60, 90, 120].map(s => (
                <button key={s} className="btn btn-sm btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => startRest(s)}>{s}s</button>
              ))}
              <button className="btn btn-sm btn-danger"
                onClick={() => { if (restRef.current) clearInterval(restRef.current); setRestRunning(false); }}>✕</button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="card" style={{ marginBottom: 14, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: 'var(--text2)' }}>{completedSets}/{totalSets} set selesai</span>
            <span style={{ fontWeight: 700 }}>{progress}%</span>
          </div>
          <div className="progress-wrap" style={{ height: 8 }}>
            <div className="progress-bar" style={{ width: `${progress}%`, height: 8, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
          </div>
        </div>

        {/* Exercise cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {active.exercises.map(ex => {
            const prevEx = getPrevExercise(ex.name);
            return (
              <div key={ex.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-montserrat,Montserrat,sans-serif)', fontSize: 15, fontWeight: 700 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span>{ex.muscleGroup}</span>
                      {prevEx && (
                        <div style={{ background: 'var(--bg2)', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 10, width: 'fit-content' }}>
                           <span style={{color: 'var(--accent)', fontWeight: 600}}>Terakhir ({prevEx.date}):</span> {prevEx.sets.filter(s => s.reps > 0 || s.weight > 0).map(s => `${s.weight}kg x ${s.reps}`).join(' · ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeExercise(ex.id)}>✕</button>
                </div>

                {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 36px', gap: 6, fontSize: 10, color: 'var(--text3)', marginBottom: 6, padding: '0 2px' }}>
                <span>#</span><span>Reps</span><span>Berat (kg)</span><span>Status</span><span></span>
              </div>

              {/* Sets */}
              {ex.sets.map((set, si) => (
                <div key={set.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 36px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono,monospace' }}>{si + 1}</span>

                  {/* Reps - clearable */}
                  <input
                    type="text" inputMode="decimal" className="input"
                    style={{ padding: '6px 8px', fontSize: 13, textAlign: 'center' }}
                    value={set.repsStr}
                    placeholder="0"
                    onChange={e => updateSetStr(ex.id, set.id, 'repsStr', e.target.value)}
                    onFocus={e => e.target.select()}
                  />

                  {/* Weight - clearable */}
                  <input
                    type="text" inputMode="decimal" className="input"
                    style={{ padding: '6px 8px', fontSize: 13, textAlign: 'center' }}
                    value={set.weightStr}
                    placeholder="0"
                    onChange={e => updateSetStr(ex.id, set.id, 'weightStr', e.target.value)}
                    onFocus={e => e.target.select()}
                  />

                  {/* Done toggle */}
                  <button onClick={() => toggleSetComplete(ex.id, set.id)}
                    style={{
                      padding: '6px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: set.completed ? 'rgba(57,217,138,0.18)' : 'var(--bg3)',
                      border: `1px solid ${set.completed ? 'rgba(57,217,138,0.4)' : 'var(--border)'}`,
                      color: set.completed ? 'var(--green)' : 'var(--text3)',
                    }}>
                    {set.completed ? '✓' : '—'}
                  </button>

                  <button className="btn-icon" style={{ padding: '6px', fontSize: 11 }}
                    onClick={() => removeSet(ex.id, set.id)}>✕</button>
                </div>
              ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => addSet(ex.id)}>+ Set</button>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => startRest(90)}>⏱ Rest 90s</button>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-ghost"
          style={{ width: '100%', marginBottom: 14, justifyContent: 'center' }}
          onClick={() => setShowAddEx(true)}>
          + Tambah Latihan
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={finishWorkout}>
            ✓ Selesai — {formatDuration(elapsed)}
          </button>
          <button className="btn btn-danger" onClick={cancelWorkout}>Batal</button>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddEx && (
        <div className="modal-overlay" onClick={() => setShowAddEx(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              Tambah Latihan
              <button className="btn-icon" onClick={() => setShowAddEx(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Grup Otot</label>
              <select className="input" value={newEx.muscleGroup}
                onChange={e => setNewEx({ ...newEx, muscleGroup: e.target.value as MuscleGroup, name: '' })}>
                {MUSCLE_GROUPS.map(mg => <option key={mg}>{mg}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Latihan</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {EXERCISE_PRESETS[newEx.muscleGroup].map(p => (
                  <button key={p} onClick={() => setNewEx({ ...newEx, name: p })}
                    style={{
                      padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: newEx.name === p ? 'var(--accent)' : 'var(--bg3)',
                      border: `1px solid ${newEx.name === p ? 'var(--accent)' : 'var(--border)'}`,
                      color: newEx.name === p ? '#fff' : 'var(--text2)',
                    }}>
                    {p}
                  </button>
                ))}
              </div>
              <input className="input" placeholder="Atau ketik nama latihan sendiri..."
                value={newEx.name}
                onChange={e => setNewEx({ ...newEx, name: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}
                onClick={addExercise} disabled={!newEx.name.trim()}>Tambah</button>
              <button className="btn btn-ghost" onClick={() => setShowAddEx(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
