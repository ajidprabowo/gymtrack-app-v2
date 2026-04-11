export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id', {
    day: 'numeric', month: 'short',
  });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getBadgeClass(type: string): string {
  const map: Record<string, string> = {
    Push: 'badge-push', Pull: 'badge-pull', Leg: 'badge-leg',
    'Full Body': 'badge-full', Custom: 'badge-custom',
  };
  return map[type] || 'badge-custom';
}
