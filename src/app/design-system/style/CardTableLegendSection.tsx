import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Formatter } from '@/lib/format'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { STOP_COLORS, stopColor, stopForeground, stopLabel } from '@/lib/stops'
import { SheetSection } from '../SheetLayout'

type Row = { code: string; stop: number; weightKg: number; dims: [number, number, number] }

const ROWS: Row[] = [
  { code: 'KIEN-00418', stop: 1, weightKg: 1240, dims: [120, 80, 96] },
  { code: 'KIEN-00419', stop: 2, weightKg: 2880, dims: [100, 100, 60] },
  { code: 'KIEN-00420', stop: 3, weightKg: 415, dims: [60, 40, 40] },
  { code: 'KIEN-00422', stop: 5, weightKg: 640, dims: [80, 60, 60] },
]

const helper = createColumnHelper<BaseTableFeatures, Row>()

/** Tiêu đề và số theo ngôn ngữ đang chọn, nên dựng trong component. */
function createColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('code', { header: t('designSystem.style.card.code'), meta: { width: '36%' } satisfies ColumnMeta, cell: (i) => <span className="font-mono text-caption">{i.getValue()}</span> }),
    helper.accessor('stop', {
      header: t('designSystem.style.card.stop'),
      cell: (i) => (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-xs" style={{ background: stopColor(i.getValue()) }} />
          {stopLabel(i.getValue())}
        </span>
      ),
    }),
    helper.accessor('weightKg', { header: t('designSystem.style.card.weight'), meta: { align: 'right' } satisfies ColumnMeta, cell: (i) => <span className="font-mono text-caption">{format.weight(i.getValue())}</span> }),
    helper.accessor('dims', { header: t('designSystem.style.card.dimensions'), meta: { align: 'right' } satisfies ColumnMeta, cell: (i) => <span className="font-mono text-caption text-text-2">{format.dimensions(...i.getValue())}</span> }),
  ])
}

export function CardTableSection() {
  const t = useT()
  const format = useFormat()
  const columns = useMemo(() => createColumns(t, format), [t, format])

  return (
    <SheetSection
      id="card"
      number="06"
      title={t('designSystem.style.card.title')}
      description={t('designSystem.style.card.description')}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-0.5">
              <CardTitle>Hyundai HD210</CardTitle>
              <span className="font-mono text-caption text-text-3">60C-446.32</span>
            </div>
            <Badge tone="info">{t('designSystem.style.card.optimized')}</Badge>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div className="flex justify-between text-body"><span className="text-text-2">{t('designSystem.style.card.fill')}</span><span className="font-mono font-medium">{format.percent(87.4)}</span></div>
            <div className="flex justify-between text-body"><span className="text-text-2">{t('designSystem.style.card.payload')}</span><span className="font-mono font-medium">{format.integer(8240)} / {format.weight(9500)}</span></div>
            <Button variant="secondary" block>{t('designSystem.style.card.viewPlan')}</Button>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2"><span className="text-body font-medium">{t('designSystem.style.card.comfortable')}</span><span className="font-mono text-caption text-text-3">{t('designSystem.style.card.comfortableRows')}</span></div>
          <div className="overflow-hidden rounded-md border border-border">
            <DataTable data={ROWS.slice(0, 3)} columns={columns} density="comfortable" isRowSelected={(r) => r.stop === 3} />
          </div>
          <span className="text-caption text-text-3">{t('designSystem.style.card.comfortableNote')}</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2"><span className="text-body font-medium">{t('designSystem.style.card.compact')}</span><span className="font-mono text-caption text-text-3">{t('designSystem.style.card.compactRows')}</span></div>
          <div className="overflow-hidden rounded-md border border-border">
            <DataTable data={ROWS} columns={columns} density="compact" isRowSelected={(r) => r.stop === 5} />
          </div>
          <span className="text-caption text-text-3">{t('designSystem.style.card.compactNote')}</span>
        </div>
      </div>
    </SheetSection>
  )
}

export function LegendSection() {
  const t = useT()
  const stops = STOP_COLORS.map((color, index) => ({ number: index + 1, color }))
  return (
    <SheetSection
      id="legend"
      number="07"
      title={t('designSystem.style.legend.title')}
      description={t('designSystem.style.legend.description')}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <div className="flex flex-col gap-4 rounded-md border border-border p-5">
          <span className="text-caption font-medium text-text-3">{t('designSystem.style.legend.light')}</span>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {stops.map((s) => (
              <div key={s.number} className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 flex-none rounded-[3px]" style={{ background: s.color }} />
                <span className="flex-1 text-body">{stopLabel(s.number)}</span>
                <span className="font-mono text-caption text-text-3">{s.color}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] p-5">
          <span className="text-caption font-medium text-white/60">{t('designSystem.style.legend.dark')}</span>
          <div className="flex flex-wrap gap-2">
            {stops.map((s) => (
              <span key={s.number} className="inline-flex h-[22px] items-center rounded-[4px] px-2 text-caption font-semibold leading-none" style={{ background: s.color, color: stopForeground(s.number) }}>
                {stopLabel(s.number)}
              </span>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-8 gap-1">
            {stops.map((s) => <div key={s.number} className="h-10 rounded-[4px]" style={{ background: s.color }} />)}
          </div>
        </div>
      </div>
    </SheetSection>
  )
}
