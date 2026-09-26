import { useT } from '@/lib/i18n'
import { STOP_COLORS } from '@/lib/stops'
import { readToken } from '@/lib/tokens'
import { SheetSection } from '../SheetLayout'

type SwatchKey =
  | 'bg' | 'surface' | 'border' | 'disabled' | 'text' | 'text2' | 'text3' | 'primary' | 'primaryHover' | 'primaryBg'
  | 'success' | 'warning' | 'danger' | 'info' | 'inkStrong' | 'ink1' | 'ink2' | 'ink3'

type Swatch = { key: SwatchKey; token: `--${string}` }

const GROUPS: ReadonlyArray<{ key: 'base' | 'text' | 'ink' | 'primary' | 'semantic'; items: Swatch[] }> = [
  {
    key: 'base',
    items: [
      { key: 'bg', token: '--bg' },
      { key: 'surface', token: '--surface' },
      { key: 'border', token: '--border' },
      { key: 'disabled', token: '--text-disabled' },
    ],
  },
  {
    key: 'text',
    items: [
      { key: 'text', token: '--text' },
      { key: 'text2', token: '--text-2' },
      { key: 'text3', token: '--text-3' },
    ],
  },
  {
    key: 'ink',
    items: [
      { key: 'inkStrong', token: '--ink-strong' },
      { key: 'ink1', token: '--ink-1' },
      { key: 'ink2', token: '--ink-2' },
      { key: 'ink3', token: '--ink-3' },
    ],
  },
  {
    key: 'primary',
    items: [
      { key: 'primary', token: '--primary' },
      { key: 'primaryHover', token: '--primary-hover' },
      { key: 'primaryBg', token: '--primary-bg' },
    ],
  },
  {
    key: 'semantic',
    items: [
      { key: 'success', token: '--success' },
      { key: 'warning', token: '--warning' },
      { key: 'danger', token: '--danger' },
      { key: 'info', token: '--info' },
    ],
  },
]

/** Năm cặp tint (V2): nghĩa cố định. Class viết tường minh để Tailwind quét thấy. */
const TINTS = [
  { key: 'blue', className: 'bg-tint-blue text-tint-blue-fg' },
  { key: 'green', className: 'bg-tint-green text-tint-green-fg' },
  { key: 'amber', className: 'bg-tint-amber text-tint-amber-fg' },
  { key: 'violet', className: 'bg-tint-violet text-tint-violet-fg' },
  { key: 'slate', className: 'bg-tint-slate text-tint-slate-fg' },
] as const

export function PaletteSection() {
  const t = useT()
  return (
    <SheetSection id="mau" number="01" title={t('designSystem.style.palette.title')}>
      {GROUPS.map((group) => (
        <PaletteGroup key={group.key} name={t(`designSystem.style.palette.${group.key}.name`)} note={t(`designSystem.style.palette.${group.key}.note`)}>
          {group.items.map((item) => (
            <SwatchCard key={item.token} name={t(`designSystem.style.palette.swatches.${item.key}`)} token={item.token} />
          ))}
        </PaletteGroup>
      ))}

      <PaletteGroup name={t('designSystem.style.palette.tint.name')} note={t('designSystem.style.palette.tint.note')}>
        {TINTS.map((tint) => (
          <div key={tint.key} className="flex flex-col gap-2">
            <div className={`grid h-14 place-items-center rounded-md text-h3 font-semibold ${tint.className}`}>Aa</div>
            <div className="flex flex-col gap-0.5">
              <span className="text-caption font-medium">{t(`designSystem.style.palette.tints.${tint.key}`)}</span>
              <span className="font-mono text-caption text-text-3">--tint-{tint.key}</span>
            </div>
          </div>
        ))}
      </PaletteGroup>

      <PaletteGroup name={t('designSystem.style.palette.material.name')} note={t('designSystem.style.palette.material.note')}>
        <div className="col-span-full flex flex-col gap-3 rounded-md border border-border bg-(image:--field) p-4">
          <div className="flex h-10 items-center rounded-md border border-border bg-chrome px-4 font-mono text-caption text-ink-2">
            --chrome · {readToken('--chrome')}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            <div className="glass-tile flex flex-col gap-1 rounded-xl px-4.5 py-3.5">
              <span className="text-caption font-medium text-ink-1">{t('designSystem.style.palette.materials.glass')}</span>
              <span className="font-mono text-caption text-ink-3">.glass-tile · --r-xl {readToken('--r-xl')}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4.5 py-3.5">
              <span aria-hidden className="hero-icon size-11 flex-none rounded-lg" />
              <span className="font-mono text-caption text-ink-3">.hero-icon</span>
            </div>
          </div>
          <span className="font-mono text-caption text-ink-2">--field · {t('designSystem.style.palette.materials.field')}</span>
        </div>
      </PaletteGroup>

      <PaletteGroup name={t('designSystem.style.palette.stops.name')} note={t('designSystem.style.palette.stops.note')}>
        {STOP_COLORS.map((color, index) => (
          <div key={color} className="flex flex-col gap-2">
            <div className="h-14 rounded-md border border-text/8" style={{ background: color }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-caption font-medium">{t('designSystem.style.palette.stop', { number: index + 1 })}</span>
              <span className="font-mono text-caption text-text-3">--stop-{index + 1}</span>
            </div>
          </div>
        ))}
      </PaletteGroup>

      <PaletteGroup name={t('designSystem.style.palette.canvas.name')} note={t('designSystem.style.palette.canvas.note')}>
        <div className="col-span-full flex h-30 items-end justify-between rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-caption font-medium text-white">Viewport 3D</span>
            <span className="font-mono text-caption text-white/60">
              {readToken('--canvas-1')} → {readToken('--canvas-2')}
            </span>
          </div>
          <span className="font-mono text-caption text-white/60">{t('designSystem.style.palette.panels')}</span>
        </div>
      </PaletteGroup>
    </SheetSection>
  )
}

function PaletteGroup({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_minmax(0,1fr)] items-start gap-6">
      <div className="flex flex-col gap-1 pt-0.5">
        <span className="text-body font-medium">{name}</span>
        <span className="text-caption text-pretty text-text-3">{note}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-3">{children}</div>
    </div>
  )
}

function SwatchCard({ name, token }: { name: string; token: `--${string}` }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-14 rounded-md border border-text/8" style={{ background: `var(${token})` }} />
      <div className="flex flex-col gap-0.5">
        <span className="text-caption font-medium">{name}</span>
        <span className="font-mono text-caption text-text-3">
          {token} · {readToken(token)}
        </span>
      </div>
    </div>
  )
}
