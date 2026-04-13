'use client';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { MealEntry, FoodItem, UserProfile } from '@/types';
import { genId, todayStr } from '@/lib/utils';
import AppShell from '@/components/AppShell';

const MEAL_TYPES = [
  'Sarapan','Snack Pagi','Makan Siang',
  'Pre-Workout','Post-Workout','Makan Malam','Sebelum Tidur',
] as const;

const DEFAULT_IDS = new Set([
  'f1','f2','f3','f4','f5','f6','f7','f8','f9',
  'f11','f17','f19','f20','f22',
]);

interface AIResult {
  name: string; unit: string;
  caloriesPer: number; proteinPer: number; carbsPer: number; fatPer: number;
  description?: string;
}

// ─── Nutrisi Result Card (reused in both modals) ──────────────────────────
function NutriCard({ result, editUnit, setEditUnit }: {
  result: AIResult; editUnit: string; setEditUnit: (v: string) => void;
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,106,255,0.08), var(--bg3))',
      border: '1px solid rgba(124,106,255,0.25)', borderRadius: 14, padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-montserrat,Montserrat,sans-serif)', fontWeight: 800, fontSize: 16 }}>
            {result.name}
          </div>
          {result.description && (
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{result.description}</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>per 1 {result.unit}</div>
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(124,106,255,0.15)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          ✨ AI
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Kalori',  val: result.caloriesPer, unit: 'kkal', color: 'var(--yellow)' },
          { label: 'Protein', val: result.proteinPer,  unit: 'g',    color: 'var(--green)' },
          { label: 'Karbo',   val: result.carbsPer,    unit: 'g',    color: 'var(--accent)' },
          { label: 'Lemak',   val: result.fatPer,      unit: 'g',    color: 'var(--orange)' },
        ].map(({ label, val, unit: u, color }) => (
          <div key={label} style={{ textAlign: 'center', padding: '10px 4px', background: 'var(--bg2)', borderRadius: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'JetBrains Mono,monospace' }}>
              {Number(val).toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{label} ({u})</div>
          </div>
        ))}
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
          Satuan porsi (bisa diedit)
        </label>
        <input className="input" value={editUnit} onChange={e => setEditUnit(e.target.value)} placeholder="batang, bungkus, gram..." />
      </div>
    </div>
  );
}

// ─── Camera / Photo Modal ─────────────────────────────────────────────────
function CameraModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (food: FoodItem) => void;
}) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  const [mode, setMode]         = useState<'camera'|'preview'|'result'>('camera');
  const [capturedImg, setCapturedImg] = useState<string>(''); // base64 data URL
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<AIResult | null>(null);
  const [editUnit, setEditUnit] = useState('');
  const [error, setError]       = useState('');
  const [camError, setCamError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment'|'user'>('environment');

  const startCamera = useCallback(async (facing: 'environment'|'user' = 'environment') => {
    setCamError('');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setCamError(msg.includes('Permission') || msg.includes('NotAllowed')
        ? 'Akses kamera ditolak. Izinkan akses kamera di browser dan coba lagi.'
        : 'Kamera tidak tersedia. Gunakan tombol "Upload Foto" sebagai alternatif.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);  // eslint-disable-line

  function flipCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  }

  function capture() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    // Resize to max 800px to reduce payload size
    const MAX = 800;
    const scale = Math.min(1, MAX / Math.max(video.videoWidth, video.videoHeight));
    canvas.width  = Math.round(video.videoWidth  * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    setCapturedImg(dataUrl);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setMode('preview');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      // Resize uploaded image too
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setCapturedImg(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          setCapturedImg(dataUrl);
        }
        streamRef.current?.getTracks().forEach(t => t.stop());
        setMode('preview');
      };
      img.onerror = () => {
        setCapturedImg(dataUrl);
        setMode('preview');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  async function analyzePhoto() {
    if (!capturedImg) return;
    setLoading(true); setError('');
    try {
      const base64  = capturedImg.split(',')[1];
      const mimeType = 'image/jpeg'; // always jpeg after canvas compression

      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data.result as AIResult);
      setEditUnit(data.result.unit);
      setMode('result');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes('503') || msg.includes('overloaded')
        ? 'Server AI sedang sibuk. Tunggu beberapa detik lalu klik "Analisis Nutrisi" lagi.'
        : msg.length > 200 ? 'Analisis gagal. Pastikan foto makanan terlihat jelas dan coba lagi.' : msg);
    }
    setLoading(false);
  }

  function retake() {
    setCapturedImg('');
    setResult(null);
    setError('');
    setMode('camera');
    startCamera(facingMode);
  }

  function handleAdd() {
    if (!result) return;
    onAdd({
      id: genId(), name: result.name, unit: editUnit || result.unit,
      caloriesPer: result.caloriesPer, proteinPer: result.proteinPer,
      carbsPer: result.carbsPer, fatPer: result.fatPer,
      isCustom: true, usageCount: 0,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-montserrat,Montserrat,sans-serif)', fontWeight: 800, fontSize: 17 }}>
            📷 {mode === 'camera' ? 'Foto Makanan' : mode === 'preview' ? 'Preview Foto' : 'Hasil Analisis'}
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 20, maxHeight: '80vh', overflowY: 'auto' }}>
          {/* ── Camera mode ── */}
          {mode === 'camera' && (
            <>
              {camError ? (
                <div style={{ padding: '16px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)', borderRadius: 12, fontSize: 13, color: 'var(--red)', lineHeight: 1.6, marginBottom: 14 }}>
                  ⚠️ {camError}
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: 14, aspectRatio: '4/3' }}>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} playsInline muted />
                  {/* Overlay grid */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '70%', height: '70%', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12 }} />
                  </div>
                  {/* Flip button */}
                  <button onClick={flipCamera} style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🔄
                  </button>
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginBottom: 14 }}>
                Arahkan kamera ke makanan, pastikan terlihat jelas
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {!camError && (
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 15 }} onClick={capture}>
                    📸 Foto Sekarang
                  </button>
                )}
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => fileRef.current?.click()}>
                  🖼️ Upload Foto
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </>
          )}

          {/* ── Preview mode ── */}
          {mode === 'preview' && (
            <>
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 14, background: '#000', aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImg} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              {error && (
                <div style={{ padding: '12px 14px', background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)', borderRadius: 10, fontSize: 13, color: 'var(--red)', marginBottom: 14, lineHeight: 1.6 }}>
                  ⚠️ {error}
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
                    Tip: pastikan makanan terlihat jelas, pencahayaan cukup, dan tidak blur.
                  </div>
                </div>
              )}
              {/* Loading state */}
              {loading && (
                <div style={{ textAlign: 'center', padding: '12px 0', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>
                    🤖 AI sedang menganalisis foto...
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                    Mencoba beberapa model AI, harap tunggu sebentar
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={analyzePhoto} disabled={loading}>
                  {loading ? '⏳ Menganalisis...' : (error ? '🔄 Coba Lagi' : '✨ Analisis Nutrisi')}
                </button>
                <button className="btn btn-ghost" onClick={retake} disabled={loading}>📷 Foto Ulang</button>
              </div>
            </>
          )}

          {/* ── Result mode ── */}
          {mode === 'result' && result && (
            <>
              {/* Small thumbnail */}
              <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 14, height: 120 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImg} alt="food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <NutriCard result={result} editUnit={editUnit} setEditUnit={setEditUnit} />
              <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 14 }}>
                ⚠️ Estimasi AI berdasarkan visual. Akurasi bergantung pada kualitas foto.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>
                  ✓ Tambahkan & Catat
                </button>
                <button className="btn btn-ghost" onClick={retake}>🔄 Foto Ulang</button>
              </div>
            </>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

// ─── AI Text Analysis Modal ───────────────────────────────────────────────
function AIFoodModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (food: FoodItem) => void;
}) {
  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<AIResult | null>(null);
  const [error,    setError]    = useState('');
  const [editUnit, setEditUnit] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function analyze(q?: string) {
    const text = (q ?? query).trim();
    if (!text) return;
    if (q) setQuery(q);
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data.result as AIResult);
      setEditUnit(data.result.unit);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Show user-friendly message
      if (msg.includes('503') || msg.includes('overloaded') || msg.includes('Semua model')) {
        setError('Server AI sedang sibuk. Klik "Coba Lagi" dalam beberapa detik.');
      } else if (msg.includes('non-JSON') || msg.includes('parse')) {
        setError('AI memberikan respons tidak valid. Klik "Coba Lagi" — biasanya berhasil pada percobaan kedua.');
      } else {
        setError(`Gagal: ${msg.slice(0, 120)}`);
      }
    }
    setLoading(false);
  }

  function handleAdd() {
    if (!result) return;
    onAdd({ id: genId(), name: result.name, unit: editUnit || result.unit,
      caloriesPer: result.caloriesPer, proteinPer: result.proteinPer,
      carbsPer: result.carbsPer, fatPer: result.fatPer, isCustom: true, usageCount: 0 });
  }

  const EXAMPLES = ['Beng Beng','Es Teh Manis','Indomie Goreng','Martabak Manis','Teh Botol','KFC Original','Mangga 100 gram','Nasi Padang 1 porsi'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <span>✨ Analisis Makanan dengan AI</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
          Ketik nama makanan apa saja — AI akan memperkirakan kandungan nutrisinya.
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input ref={inputRef} className="input" placeholder="Contoh: Beng Beng, Mangga 100 gram..."
            value={query}
            onChange={e => { setQuery(e.target.value); setResult(null); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && analyze()} />
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', minWidth: 96 }}
            onClick={() => analyze()} disabled={loading || !query.trim()}>
            {loading ? '⏳ ...' : '🔍 Analisis'}
          </button>
        </div>

        {!result && !loading && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Contoh cepat</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => analyze(ex)}
                  style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ padding: '28px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 600 }}>Menganalisis "{query}"...</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Estimasi berdasarkan database nutrisi global</div>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 14, background: 'rgba(255,92,92,0.08)', border: '1px solid rgba(255,92,92,0.25)', fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
            ⚠️ {error}
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => analyze()} style={{ fontSize: 12 }}>🔄 Coba Lagi</button>
            </div>
          </div>
        )}

        {result && !loading && (
          <>
            <NutriCard result={result} editUnit={editUnit} setEditUnit={setEditUnit} />
            <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 14 }}>
              ⚠️ Nilai nutrisi adalah estimasi AI. Periksa label kemasan untuk akurasi lebih tinggi.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>✓ Tambahkan ke Daftar</button>
              <button className="btn btn-ghost" onClick={() => { setResult(null); setQuery(''); setError(''); }}>Ulangi</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function NutritionPage() {
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [meals,        setMeals]        = useState<MealEntry[]>([]);
  const [foods,        setFoods]        = useState<FoodItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showAdd,      setShowAdd]      = useState(false);
  const [showCalc,     setShowCalc]     = useState(false);
  const [showAI,       setShowAI]       = useState(false);
  const [showCamera,   setShowCamera]   = useState(false);
  const [showManage,   setShowManage]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [newMeal, setNewMeal] = useState<{ foodId: string; quantityStr: string; mealType: MealEntry['mealType'] }>({
    foodId: '', quantityStr: '1', mealType: 'Sarapan',
  });
  const [calcItems, setCalcItems] = useState<{ foodId: string; qtyStr: string }[]>([]);

  useEffect(() => {
    const p = storage.getProfile(); const f = storage.getFoods(); const m = storage.getMeals();
    setProfile(p); setFoods(f); setMeals(m);
    setNewMeal(prev => ({ ...prev, foodId: f[0]?.id || '' }));
    setCalcItems([{ foodId: f[0]?.id || '', qtyStr: '1' }]);
  }, []);

  const usageMap = useMemo(() => {
    const map: Record<string, number> = {};
    meals.forEach(m => { map[m.foodId] = (map[m.foodId] || 0) + 1; });
    return map;
  }, [meals]);

  const sortedFoods = useMemo(() =>
    [...foods].sort((a, b) => {
      const ua = usageMap[a.id] || 0; const ub = usageMap[b.id] || 0;
      if (ub !== ua) return ub - ua;
      return a.name.localeCompare(b.name);
    }), [foods, usageMap]);

  const filteredFoods = useMemo(() =>
    sortedFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
    [sortedFoods, search]);

  const dayMeals  = useMemo(() => meals.filter(m => m.date === selectedDate), [meals, selectedDate]);
  const dayTotals = useMemo(() => dayMeals.reduce((acc, m) => {
    const f = foods.find(f => f.id === m.foodId); if (!f) return acc;
    return { calories: acc.calories + f.caloriesPer * m.quantity, protein: acc.protein + f.proteinPer * m.quantity, carbs: acc.carbs + f.carbsPer * m.quantity, fat: acc.fat + f.fatPer * m.quantity };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }), [dayMeals, foods]);

  const mealsByType = useMemo(() => {
    const g: Record<string, MealEntry[]> = {};
    MEAL_TYPES.forEach(t => { g[t] = []; });
    dayMeals.forEach(m => { if (g[m.mealType]) g[m.mealType].push(m); });
    return g;
  }, [dayMeals]);

  const calcTotals = useMemo(() => calcItems.reduce((acc, item) => {
    const f = foods.find(f => f.id === item.foodId); const qty = parseFloat(item.qtyStr) || 0;
    if (!f || !qty) return acc;
    return { calories: acc.calories + f.caloriesPer * qty, protein: acc.protein + f.proteinPer * qty, carbs: acc.carbs + f.carbsPer * qty, fat: acc.fat + f.fatPer * qty };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }), [calcItems, foods]);

  function saveFood(food: FoodItem) {
    const updated = [...foods, food];
    setFoods(updated); storage.saveFoods(updated);
    return food;
  }

  // Called after AI text analysis — add food, open add meal modal
  function handleAIFoodAdd(food: FoodItem) {
    saveFood(food);
    setNewMeal(prev => ({ ...prev, foodId: food.id }));
    setShowAI(false); setShowAdd(true);
  }

  // Called after camera analysis — add food AND immediately log it
  function handlePhotoFoodAdd(food: FoodItem) {
    saveFood(food);
    setNewMeal(prev => ({ ...prev, foodId: food.id, quantityStr: '1' }));
    setShowCamera(false); setShowAdd(true);
  }

  function addMeal() {
    const qty = parseFloat(newMeal.quantityStr);
    if (!newMeal.foodId || !qty || qty <= 0) return;
    const updatedFoods = foods.map(f => f.id === newMeal.foodId ? { ...f, usageCount: (f.usageCount || 0) + 1 } : f);
    setFoods(updatedFoods); storage.saveFoods(updatedFoods);
    const entry: MealEntry = { id: genId(), foodId: newMeal.foodId, quantity: qty, mealType: newMeal.mealType, date: selectedDate };
    const updated = [...meals, entry]; setMeals(updated); storage.saveMeals(updated);
    setShowAdd(false); setSearch(''); setNewMeal(prev => ({ ...prev, quantityStr: '1' }));
  }

  function deleteMeal(id: string) {
    const u = meals.filter(m => m.id !== id); setMeals(u); storage.saveMeals(u);
  }

  function deleteFood(id: string) {
    if (DEFAULT_IDS.has(id)) return;
    const uf = foods.filter(f => f.id !== id); setFoods(uf); storage.saveFoods(uf);
    const um = meals.filter(m => m.foodId !== id); setMeals(um); storage.saveMeals(um);
  }

  const getFood = (id: string) => foods.find(f => f.id === id);

  if (!profile) return <AppShell><div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div></AppShell>;

  const targetCarbs  = Math.round(profile.targetCalories * 0.5 / 4);
  const targetFat    = Math.round(profile.targetCalories * 0.25 / 9);
  const newMealQty   = parseFloat(newMeal.quantityStr) || 0;
  const selectedFood = getFood(newMeal.foodId);
  const customFoods  = foods.filter(f => !DEFAULT_IDS.has(f.id));

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Nutrisi</h1>
            <p className="page-sub">Tracking kalori & makronutrien harian</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => setShowCalc(true)}>🔢 Kalkulator</button>
            <button className="btn btn-ghost" style={{ borderColor: 'rgba(57,217,138,0.4)', color: 'var(--green)' }} onClick={() => setShowCamera(true)}>
              📷 Foto Makanan
            </button>
            <button className="btn btn-ghost" style={{ borderColor: 'rgba(124,106,255,0.4)', color: 'var(--accent)' }} onClick={() => setShowAI(true)}>
              ✨ Cari via AI
            </button>
            {customFoods.length > 0 && (
              <button className="btn btn-ghost" onClick={() => setShowManage(true)}>⚙️ Kelola</button>
            )}
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Catat Makan</button>
          </div>
        </div>

        {/* Date */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>Tanggal:</label>
          <input type="date" className="input" style={{ width: 'auto' }} value={selectedDate} max={todayStr()} onChange={e => setSelectedDate(e.target.value)} />
        </div>

        {/* Macro cards */}
        <div className="grid-4" style={{ marginBottom: 16 }}>
          {[
            { label: 'Kalori',  val: Math.round(dayTotals.calories), target: profile.targetCalories, unit: 'kkal', color: 'var(--yellow)' },
            { label: 'Protein', val: Math.round(dayTotals.protein),  target: profile.targetProtein,  unit: 'g',    color: 'var(--green)' },
            { label: 'Karbo',   val: Math.round(dayTotals.carbs),    target: targetCarbs,             unit: 'g',    color: 'var(--accent)' },
            { label: 'Lemak',   val: Math.round(dayTotals.fat),      target: targetFat,               unit: 'g',    color: 'var(--orange)' },
          ].map(({ label, val, target, unit, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div style={{ marginBottom: 8 }}>
                <span className="stat-val" style={{ color }}>{val}</span>
                <span className="stat-unit">/ {target}{unit}</span>
              </div>
              <div className="progress-wrap" style={{ height: 4 }}>
                <div className="progress-bar" style={{ width: `${Math.min(100,(val/target)*100)}%`, height: 4, background: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Progress card */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Ringkasan Hari Ini</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              {[
                { label: 'Kalori',  val: dayTotals.calories, target: profile.targetCalories, unit: 'kkal', color: 'var(--yellow), var(--orange)' },
                { label: 'Protein', val: dayTotals.protein,  target: profile.targetProtein,  unit: 'g',    color: 'var(--green), #00d2ff' },
              ].map(({ label, val, target, unit, color }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 700 }}>{Math.round(val)} / {target} {unit}</span>
                  </div>
                  <div className="progress-wrap" style={{ height: 10 }}>
                    <div className="progress-bar" style={{ width: `${Math.min(100,(val/target)*100)}%`, height: 10, background: `linear-gradient(90deg,${color})` }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Sisa Kalori',  val: Math.max(0, profile.targetCalories - dayTotals.calories), color: 'var(--yellow)', unit: 'kkal' },
                { label: 'Sisa Protein', val: Math.max(0, profile.targetProtein - dayTotals.protein),   color: 'var(--green)',  unit: 'g' },
              ].map(({ label, val, color, unit }) => (
                <div key={label} style={{ textAlign: 'center', padding: '14px 18px', background: 'var(--bg3)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'JetBrains Mono,monospace' }}>{Math.round(val)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{label} ({unit})</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meals by type */}
        {MEAL_TYPES.map(mealType => {
          const items = mealsByType[mealType]; if (!items?.length) return null;
          const typeKal = items.reduce((s, m) => { const f = getFood(m.foodId); return s + (f ? f.caloriesPer * m.quantity : 0); }, 0);
          return (
            <div key={mealType} className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>{mealType}</div>
                <span style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }}>{Math.round(typeKal)} kkal</span>
              </div>
              {items.map(m => {
                const food = getFood(m.foodId); if (!food) return null;
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{food.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {m.quantity} {food.unit} · {Math.round(food.proteinPer * m.quantity)}g protein · {Math.round(food.carbsPer * m.quantity)}g karbo
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--yellow)', fontFamily: 'JetBrains Mono,monospace' }}>{Math.round(food.caloriesPer * m.quantity)}</span>
                      <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => deleteMeal(m.id)}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {dayMeals.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <div className="empty-title">Belum ada catatan makan</div>
            <div className="empty-sub">Catat makanan untuk tracking nutrisi</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Catat Makan</button>
              <button className="btn btn-ghost" style={{ color: 'var(--green)', borderColor: 'rgba(57,217,138,0.4)' }} onClick={() => setShowCamera(true)}>📷 Foto Makanan</button>
              <button className="btn btn-ghost" onClick={() => setShowAI(true)}>✨ Cari via AI</button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Camera Modal ═══ */}
      {showCamera && <CameraModal onClose={() => setShowCamera(false)} onAdd={handlePhotoFoodAdd} />}

      {/* ═══ AI Text Analysis Modal ═══ */}
      {showAI && <AIFoodModal onClose={() => setShowAI(false)} onAdd={handleAIFoodAdd} />}

      {/* ═══ Add Meal Modal ═══ */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              Catat Makanan
              <button className="btn-icon" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Waktu Makan</label>
              <select className="input" value={newMeal.mealType} onChange={e => setNewMeal({ ...newMeal, mealType: e.target.value as MealEntry['mealType'] })}>
                {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Cari Makanan</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setShowAdd(false); setShowCamera(true); }} style={{ fontSize: 11, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>📷 Foto</button>
                  <button onClick={() => { setShowAdd(false); setShowAI(true); }} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✨ AI</button>
                </div>
              </div>
              <input className="input" placeholder="Ketik nama makanan..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 14 }}>
              {filteredFoods.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
                  Tidak ditemukan.{' '}
                  <button onClick={() => { setShowAdd(false); setShowAI(true); }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>✨ Analisis via AI</button>
                </div>
              ) : filteredFoods.map(f => {
                const freq = usageMap[f.id] || 0;
                return (
                  <div key={f.id} onClick={() => setNewMeal({ ...newMeal, foodId: f.id })}
                    style={{ padding: '9px 12px', cursor: 'pointer', fontSize: 13, background: newMeal.foodId === f.id ? 'rgba(124,106,255,0.12)' : 'transparent', borderBottom: '1px solid var(--border)', color: newMeal.foodId === f.id ? 'var(--accent)' : 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{f.name}<span style={{ color: 'var(--text3)', fontSize: 11 }}> / {f.unit}</span></span>
                      {f.isCustom && <span style={{ fontSize: 10, background: 'rgba(124,106,255,0.15)', color: 'var(--accent)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>AI</span>}
                      {freq > 0 && <span style={{ fontSize: 10, background: 'rgba(57,217,138,0.12)', color: 'var(--green)', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>×{freq}</span>}
                    </div>
                    <span style={{ color: 'var(--yellow)', fontFamily: 'JetBrains Mono,monospace', fontSize: 12, flexShrink: 0 }}>{f.caloriesPer} kkal</span>
                  </div>
                );
              })}
            </div>
            {selectedFood && newMealQty > 0 && (
              <div style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{selectedFood.name} × {newMealQty} {selectedFood.unit}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap' }}>
                  <span>🔥 <b style={{ color: 'var(--yellow)' }}>{(selectedFood.caloriesPer * newMealQty).toFixed(0)}</b> kkal</span>
                  <span>💪 <b style={{ color: 'var(--green)' }}>{(selectedFood.proteinPer * newMealQty).toFixed(1)}g</b> protein</span>
                  <span>🍚 <b style={{ color: 'var(--accent)' }}>{(selectedFood.carbsPer * newMealQty).toFixed(1)}g</b> karbo</span>
                  <span>🧈 <b style={{ color: 'var(--orange)' }}>{(selectedFood.fatPer * newMealQty).toFixed(1)}g</b> lemak</span>
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Jumlah {selectedFood ? `(${selectedFood.unit})` : ''}</label>
              <input type="text" inputMode="decimal" className="input" value={newMeal.quantityStr} placeholder="0"
                onChange={e => setNewMeal({ ...newMeal, quantityStr: e.target.value })} onFocus={e => e.target.select()} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={addMeal} disabled={!newMeal.foodId || !newMealQty || newMealQty <= 0}>Simpan</button>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Manage Custom Foods Modal ═══ */}
      {showManage && (
        <div className="modal-overlay" onClick={() => setShowManage(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">⚙️ Kelola Daftar Makanan<button className="btn-icon" onClick={() => setShowManage(false)}>✕</button></div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>
              Makanan yang ditambahkan via AI atau foto dapat dihapus. Makanan bawaan tidak dapat dihapus.
            </div>
            {customFoods.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}><div className="empty-sub">Belum ada makanan custom</div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                {customFoods.sort((a, b) => (usageMap[b.id]||0) - (usageMap[a.id]||0)).map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
                        {f.name}
                        <span style={{ fontSize: 10, background: 'rgba(124,106,255,0.15)', color: 'var(--accent)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>AI</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{f.caloriesPer} kkal / {f.unit}{(usageMap[f.id]||0) > 0 ? ` · dipakai ${usageMap[f.id]}×` : ''}</div>
                    </div>
                    <button className="btn btn-danger btn-sm" style={{ flexShrink: 0, marginLeft: 12 }} onClick={() => { if (window.confirm(`Hapus "${f.name}"?`)) deleteFood(f.id); }}>🗑 Hapus</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16 }}><button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setShowManage(false)}>Tutup</button></div>
          </div>
        </div>
      )}

      {/* ═══ Calculator Modal ═══ */}
      {showCalc && (
        <div className="modal-overlay" onClick={() => setShowCalc(false)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">🔢 Kalkulator Kalori<button className="btn-icon" onClick={() => setShowCalc(false)}>✕</button></div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>Hitung kalori tanpa menyimpan ke log</div>
            {calcItems.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 36px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select className="input" value={item.foodId} onChange={e => setCalcItems(calcItems.map((c,ci) => ci===i ? {...c, foodId: e.target.value} : c))}>
                  {sortedFoods.map(f => <option key={f.id} value={f.id}>{f.name} ({f.unit})</option>)}
                </select>
                <input type="text" inputMode="decimal" className="input" value={item.qtyStr} placeholder="0"
                  onChange={e => setCalcItems(calcItems.map((c,ci) => ci===i ? {...c, qtyStr: e.target.value} : c))} onFocus={e => e.target.select()} />
                <button className="btn btn-danger btn-sm" style={{ padding: '8px' }} onClick={() => setCalcItems(calcItems.filter((_,ci) => ci!==i))}>✕</button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => setCalcItems([...calcItems, { foodId: sortedFoods[0]?.id||'', qtyStr: '1' }])}>+ Tambah Makanan</button>
            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Total Nutrisi:</div>
              <div className="grid-4" style={{ gap: 8 }}>
                {[{ label:'Kalori', val:calcTotals.calories, unit:'kkal', color:'var(--yellow)' }, { label:'Protein', val:calcTotals.protein, unit:'g', color:'var(--green)' }, { label:'Karbo', val:calcTotals.carbs, unit:'g', color:'var(--accent)' }, { label:'Lemak', val:calcTotals.fat, unit:'g', color:'var(--orange)' }].map(({ label, val, unit, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: 12, background: 'var(--bg2)', borderRadius: 10 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'JetBrains Mono,monospace' }}>{val.toFixed(0)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label} ({unit})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
