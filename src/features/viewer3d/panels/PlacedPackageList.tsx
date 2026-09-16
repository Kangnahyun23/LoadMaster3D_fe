import { AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ConstraintIssue } from '@/domain/constraints'
import { useFormat, useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import type { ScenePlacement, SceneStop } from '../scene-input'

/** Giữ danh sách nhẹ ở 1.000 kiện: lọc trước, hiện tối đa bấy nhiêu dòng. */
const MAX_ROWS = 100

/** Kiện dính tới issue: chủ thể hoặc nằm trong `relatedIds`. */
export function issueIdsOf(issues: readonly ConstraintIssue[]): Set<string> {
  const ids = new Set<string>()
  for (const issue of issues) {
    if (issue.packageInstanceId) ids.add(issue.packageInstanceId)
    for (const id of issue.relatedIds ?? []) ids.add(id)
  }
  return ids
}

/** Danh sách kiện đã xếp (LM-049): lọc theo điểm giao, chỉ kiện có cảnh báo, tìm theo mã; bấm để xem chi tiết. */
export function PlacedPackageList({ placements, stops, issues, selectedId, onSelect }: {
  placements: readonly ScenePlacement[]
  stops: readonly SceneStop[]
  issues: readonly ConstraintIssue[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const t = useT()
  const format = useFormat()
  const [query, setQuery] = useState('')
  const [stop, setStop] = useState<number | null>(null)
  const [onlyWarnings, setOnlyWarnings] = useState(false)
  const flagged = useMemo(() => issueIdsOf(issues), [issues])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return placements.filter((p) => (stop === null || p.stop === stop)
      && (!onlyWarnings || flagged.has(p.id))
      && (needle === '' || p.id.toLowerCase().includes(needle)))
  }, [placements, stop, onlyWarnings, flagged, query])
  const control = 'h-14 rounded-md border border-border bg-bg px-2 text-body-lg focus-visible:outline-2 focus-visible:outline-primary xl:h-10 xl:text-body'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
      <input type="search" aria-label={t('viewer.plan.filters.search')} placeholder={t('viewer.plan.filters.search')}
        value={query} onChange={(event) => setQuery(event.target.value)} className={cn(control, 'font-mono')} />
      <select aria-label={t('viewer.plan.filters.allStops')} value={stop ?? ''} className={control}
        onChange={(event) => setStop(event.target.value === '' ? null : Number(event.target.value))}>
        <option value="">{t('viewer.plan.filters.allStops')}</option>
        {stops.map((item) => <option key={item.number} value={item.number}>{item.number} · {item.name}</option>)}
      </select>
      <label className="flex items-center gap-2 text-body-lg xl:text-body">
        <input type="checkbox" checked={onlyWarnings} onChange={(event) => setOnlyWarnings(event.target.checked)} className="size-4 accent-(--primary)" />
        {t('viewer.plan.filters.onlyWarnings')}
      </label>
      <p className="text-caption text-text-3">
        {t('viewer.plan.filters.shown', { shown: format.integer(Math.min(filtered.length, MAX_ROWS)), total: format.integer(filtered.length) })}
      </p>
      <ul className="m-0 flex min-h-0 flex-1 list-none flex-col gap-1 overflow-y-auto p-0">
        {filtered.slice(0, MAX_ROWS).map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => onSelect(p.id)} aria-pressed={p.id === selectedId}
              className={cn('flex min-h-14 w-full items-center gap-2 rounded-md border px-2 text-left xl:min-h-10',
                p.id === selectedId ? 'border-primary bg-primary-bg' : 'border-border bg-bg hover:bg-surface')}>
              <span aria-hidden className="grid size-6 flex-none place-items-center rounded-sm font-mono text-caption font-semibold"
                style={{ background: stopColor(p.stop), color: stopForeground(p.stop) }}>{p.stop}</span>
              <span className="flex-1 truncate font-mono text-body">{p.id}</span>
              {flagged.has(p.id) ? <AlertCircle className="size-4 flex-none text-warning" strokeWidth={1.5} aria-label={t('viewer.plan.detail.issues')} /> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
