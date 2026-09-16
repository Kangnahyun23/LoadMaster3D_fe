import { useFormat, useT } from '@/lib/i18n'
import { TYPE_SAMPLES } from '../design-system.mock'
import { SheetSection } from '../SheetLayout'

const ROWS: ReadonlyArray<{ style: string; size: string; className: string; sample: keyof typeof TYPE_SAMPLES }> = [
  { style: 'Display · 600', size: '32 / 40', className: 'text-display font-semibold tracking-[-0.02em]', sample: 'display' },
  { style: 'H1 · 600', size: '24 / 32', className: 'text-h1 font-semibold tracking-[-0.01em]', sample: 'h1' },
  { style: 'H2 · 600', size: '20 / 28', className: 'text-h2 font-semibold', sample: 'h2' },
  { style: 'H3 · 500', size: '16 / 24', className: 'text-h3 font-medium', sample: 'h3' },
  { style: 'Body-lg · 400', size: '16 / 24', className: 'text-body-lg', sample: 'bodyLg' },
  { style: 'Body · 400', size: '14 / 20', className: 'text-body', sample: 'body' },
  { style: 'Caption · 400', size: '12 / 16', className: 'text-caption text-text-2', sample: 'caption' },
]

export function TypeSection() {
  const t = useT()
  const format = useFormat()
  const monoSamples = [
    { label: t('designSystem.style.type.tripCode'), value: 'TRIP-2026-0914' },
    { label: t('designSystem.style.type.weight'), value: format.weight(8240) },
    { label: t('designSystem.style.type.dimensions'), value: format.dimensions(720, 235, 240) },
    { label: t('designSystem.style.type.percent'), value: format.percent(87.4) },
  ]

  return (
    <SheetSection
      id="chu"
      number="02"
      title={t('designSystem.style.type.title')}
      description={t('designSystem.style.type.description')}
    >
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[120px_120px_minmax(0,1fr)] gap-6 border-b border-border bg-surface px-5 py-2.5 text-caption font-medium text-text-3">
          <span>{t('designSystem.style.type.style')}</span>
          <span>{t('designSystem.style.type.size')}</span>
          <span>{t('designSystem.style.type.sample')}</span>
        </div>
        {ROWS.map((row) => (
          <div key={row.style} className="grid grid-cols-[120px_120px_minmax(0,1fr)] items-baseline gap-6 border-b border-border p-5 last:border-b-0">
            <span className="text-caption font-medium text-text-2">{row.style}</span>
            <span className="font-mono text-caption text-text-3">{row.size}</span>
            <span lang="vi" className={`${row.className} text-pretty`}>{TYPE_SAMPLES[row.sample]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        {monoSamples.map((sample) => (
          <div key={sample.label} className="flex flex-col gap-1 rounded-md border border-border p-4">
            <span className="text-caption text-text-3">{sample.label}</span>
            <span className="font-mono text-h2 font-medium">{sample.value}</span>
          </div>
        ))}
      </div>
    </SheetSection>
  )
}
