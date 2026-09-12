/** Xe tải với hai kiện nét đứt — minh hoạ cho trạng thái chưa có chuyến. */
export function EmptyTripsIllustration() {
  return (
    <svg width="120" height="84" viewBox="0 0 120 84" fill="none" className="block" aria-hidden>
      <path d="M10 66h100" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 30h56a4 4 0 0 1 4 4v28H18z" fill="var(--bg)" stroke="var(--text-disabled)" strokeWidth="1.5" />
      <path d="M78 42h14l10 12v8H78z" fill="var(--bg)" stroke="var(--text-disabled)" strokeWidth="1.5" />
      <path d="M82 45h9l7 9h-16z" fill="var(--primary-bg)" />
      <circle cx="32" cy="64" r="6" fill="var(--bg)" stroke="var(--text-disabled)" strokeWidth="1.5" />
      <circle cx="88" cy="64" r="6" fill="var(--bg)" stroke="var(--text-disabled)" strokeWidth="1.5" />
      <rect x="26" y="40" width="14" height="14" rx="2" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 2" />
      <rect x="44" y="40" width="14" height="14" rx="2" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M62 47h8M66 43v8" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
