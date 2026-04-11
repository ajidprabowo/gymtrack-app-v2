'use client';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { UserProfile } from '@/types';
import AppShell from '@/components/AppShell';
import { useTheme } from '@/components/ThemeProvider';

export default function ProfilePage() {
  const [form, setForm]   = useState<UserProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => { setForm(storage.getProfile()); }, []);

  function save() {
    if (!form) return;
    storage.saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!form) return <AppShell><div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div></AppShell>;

  const recCal  = Math.round(form.weightKg * 44) + 500;
  const recProt = Math.round(form.weightKg * 2);
  const bmiRaw  = form.heightCm > 0 ? form.weightKg / Math.pow(form.heightCm / 100, 2) : 0;
  const bmi     = bmiRaw.toFixed(1);
  const bmiStatus = bmiRaw < 18.5 ? 'Kurus' : bmiRaw < 25 ? 'Normal' : bmiRaw < 30 ? 'Overweight' : 'Obesitas';
  const bmiColor  = bmiRaw < 18.5 ? 'var(--accent)' : bmiRaw < 25 ? 'var(--green)' : 'var(--orange)';

  const schedule = form.gymDaysPerWeek === 2
    ? ['Full Body','Rest','Rest','Full Body','Rest','Rest','Rest']
    : form.gymDaysPerWeek === 3
    ? ['Push','Pull','Leg','Rest','Rest','Rest','Rest']
    : ['Push','Pull','Leg','Rest','Upper','Lower','Rest'];

  return (
    <AppShell>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 className="page-title">Profil</h1>
        <p className="page-sub">Pengaturan dan target personal kamu</p>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          {/* Profile form */}
          <div className="card">
            <div className="card-title">Data Diri</div>
            {[
              { label: 'Nama', field: 'name', type: 'text' },
              { label: 'Berat Badan (kg)', field: 'weightKg', type: 'number' },
              { label: 'Tinggi Badan (cm)', field: 'heightCm', type: 'number' },
            ].map(({ label, field, type }) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  type={type === 'number' ? 'text' : 'text'}
                  inputMode={type === 'number' ? 'decimal' : 'text'}
                  className="input"
                  value={(form as any)[field]}
                  placeholder={type === 'number' ? '0' : ''}
                  onChange={e => setForm({ ...form, [field]: type === 'number' ? (e.target.value === '' ? '' : e.target.value) : e.target.value })}
                  onBlur={e => {
                    if (type === 'number') {
                      const val = parseFloat(e.target.value);
                      setForm({ ...form, [field]: isNaN(val) ? 0 : val });
                    }
                  }}
                  onFocus={e => e.target.select()}
                />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Goal</label>
              <select className="input" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value as UserProfile['goal'] })}>
                <option value="Bulking">Bulking (nambah otot)</option>
                <option value="Cutting">Cutting (turun lemak)</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Hari Gym per Minggu</label>
              <select className="input" value={form.gymDaysPerWeek} onChange={e => setForm({ ...form, gymDaysPerWeek: parseInt(e.target.value) })}>
                {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} hari</option>)}
              </select>
            </div>
          </div>

          <div>
            {/* Targets */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-title">Target Nutrisi</div>
              <div className="form-group">
                <label className="form-label">Target Kalori (kkal/hari)</label>
                <input
                  type="text" inputMode="numeric" className="input"
                  value={form.targetCalories}
                  placeholder="0"
                  onChange={e => setForm({ ...form, targetCalories: e.target.value === '' ? 0 : (parseInt(e.target.value) || form.targetCalories) })}
                  onFocus={e => e.target.select()}
                />
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                  Rekomendasi BB {form.weightKg}kg: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{recCal} kkal</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Target Protein (g/hari)</label>
                <input
                  type="text" inputMode="numeric" className="input"
                  value={form.targetProtein}
                  placeholder="0"
                  onChange={e => setForm({ ...form, targetProtein: e.target.value === '' ? 0 : (parseInt(e.target.value) || form.targetProtein) })}
                  onFocus={e => e.target.select()}
                />
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                  Rekomendasi: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{recProt}g</span> (2g × {form.weightKg}kg)
                </div>
              </div>
              <button className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
                style={{ width: '100%', justifyContent: 'center' }} onClick={save}>
                {saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
              </button>
            </div>

            {/* Body stats */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-title">Statistik Tubuh</div>
              {[
                { label: 'BMI', val: `${bmi} (${bmiStatus})`, color: bmiColor },
                { label: 'Berat Ideal', val: `${Math.round(18.5*Math.pow(form.heightCm/100,2))}–${Math.round(24.9*Math.pow(form.heightCm/100,2))} kg`, color: 'var(--green)' },
                { label: 'Goal', val: form.goal, color: form.goal==='Bulking'?'var(--orange)':form.goal==='Cutting'?'var(--accent)':'var(--green)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color, fontFamily: 'JetBrains Mono,monospace', fontSize: 13 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Theme toggle */}
            <div className="card">
              <div className="card-title">Tampilan</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Ganti tema tampilan</div>
                </div>
                <button className="btn btn-ghost" onClick={toggle}>
                  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly schedule */}
        <div className="card" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, var(--bg2)), var(--bg2))', border: '1px solid rgba(124,106,255,0.25)' }}>
          <div className="card-title" style={{ color: 'var(--accent2)' }}>Jadwal Latihan Minggu Ini</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 16 }}>
            {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map((day, i) => {
              const isGym = schedule[i] !== 'Rest';
              return (
                <div key={day} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                  background: isGym ? 'rgba(124,106,255,0.15)' : 'var(--bg3)',
                  border: `1px solid ${isGym ? 'rgba(124,106,255,0.35)' : 'var(--border)'}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isGym ? 'var(--accent)' : 'var(--text3)', marginBottom: 3 }}>{day}</div>
                  <div style={{ fontSize: 10, color: isGym ? 'var(--text)' : 'var(--text3)' }}>{schedule[i]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '🍚', text: `Surplus ${form.goal === 'Bulking' ? '300-500' : form.goal === 'Cutting' ? '-300-500' : '0'} kkal/hari` },
              { icon: '🥩', text: `Target ${recProt}g protein/hari` },
              { icon: '😴', text: 'Tidur 7-9 jam setiap malam' },
              { icon: '📈', text: 'Catat beban tiap sesi (progressive overload)' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text2)', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 8 }}>
                <span>{t.icon}</span><span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
