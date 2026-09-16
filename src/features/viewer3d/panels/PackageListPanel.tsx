import { ChevronLeft, Pin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { ConstraintIssue } from '@/domain/constraints'
import { TabCount, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatInteger } from '@/lib/format'
import { useFormat, useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import { describeWhere } from './placement-relations'
import type { ScenePlacement, SceneStop, SceneUnplaced } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import type { LeftTab } from '../useLoadPlanViewer'
import { PlacedPackageList } from './PlacedPackageList'

/**
 * Danh sách kiện: chưa xếp (lọc theo lý do), đã ghim, đã xếp (LM-049: tìm, lọc điểm giao, chỉ kiện có cảnh báo).
 * Lệch có chủ ý: bản design gợi ý "kéo vào vùng 3D để xếp thủ công" —
 * thao tác đó chưa được nối nên không hiện cursor kéo lẫn câu gợi ý.
 */
export function PackageListPanel({
  unplaced,
  pinned,
  placements,
  vehicle,
  open,
  onToggle,
  tab,
  onTabChange,
  selectedId,
  onSelect,
  stops,
  issues,
  tripId,
}: {
  unplaced: readonly SceneUnplaced[]
  pinned: ScenePlacement[]
  placements: ScenePlacement[]
  vehicle: VehicleConfig
  open: boolean
  onToggle: () => void
  tab: LeftTab
  onTabChange: (tab: LeftTab) => void
  selectedId: string | null
  onSelect: (id: string) => void
  stops: readonly SceneStop[]
  issues: readonly ConstraintIssue[]
  /** Mở kiện gốc trong Chi tiết chuyến (`?kien=`, LM-046) */
  tripId: string
}) {
  const t = useT()
  const format = useFormat()
  const [reason, setReason] = useState('')
  const reasons = useMemo(() => [...new Set(unplaced.flatMap((item) => item.reasonCode ? [item.reasonCode] : []))], [unplaced])
  const shownUnplaced = reason === '' ? unplaced : unplaced.filter((item) => item.reasonCode === reason)
  return (
    <aside
      aria-label="Danh sách kiện"
      className={cn(
        'flex flex-none flex-col overflow-hidden border-r border-border bg-bg',
        'transition-[width] duration-(--dur-md) ease-standard',
        open ? 'w-70' : 'w-12',
      )}
    >
      <div className="flex h-11 flex-none items-center justify-between border-b border-border pr-2 pl-4">
        {open ? (
          <span className="text-body font-medium whitespace-nowrap">Danh sách kiện</span>
        ) : null}
        <button
          type="button"
          aria-label={open ? 'Thu gọn danh sách kiện' : 'Mở danh sách kiện'}
          aria-expanded={open}
          onClick={onToggle}
          className="grid size-8 place-items-center rounded-md text-text-3 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft
            className={cn('size-4 transition-transform duration-(--dur-md) ease-standard', !open && 'rotate-180')}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
      </div>

      {open ? (
        <Tabs
          value={tab}
          onValueChange={(value) => onTabChange(value === 'pinned' || value === 'placed' ? value : 'unplaced')}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList>
            <TabsTrigger value="unplaced">
              Kiện chưa xếp <TabCount tone="danger">{unplaced.length}</TabCount>
            </TabsTrigger>
            <TabsTrigger value="pinned">
              Kiện đã ghim <TabCount>{pinned.length}</TabCount>
            </TabsTrigger>
            <TabsTrigger value="placed">
              {t('viewer.plan.filters.placedTab')} <TabCount>{placements.length}</TabCount>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unplaced" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3">
            <p className="px-1 pb-1 text-caption text-text-3">
              Không vừa chỗ trống còn lại.
            </p>
            {reasons.length > 1 ? (
              <select aria-label={t('viewer.plan.filters.reason')} value={reason} onChange={(event) => setReason(event.target.value)}
                className="h-14 rounded-md border border-border bg-bg px-2 text-body-lg xl:h-10 xl:text-body">
                <option value="">{t('viewer.plan.filters.allReasons')}</option>
                {reasons.map((code) => <option key={code} value={code}>{t(`viewer.unplacedReasons.${code}`)}</option>)}
              </select>
            ) : null}
            {shownUnplaced.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-md border border-dashed border-switch-off bg-bg p-3"
              >
                <StopSquare stop={item.stop} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Link to={`/chuyen/${tripId}?kien=${encodeURIComponent(item.packageId)}`} className="font-mono text-body font-medium text-primary">{item.id}</Link>
                  <span className="truncate font-mono text-caption text-text-3">
                    {format.dimensions(item.lengthCm, item.widthCm, item.heightCm)} · {format.weight(item.weightKg)}
                  </span>
                  <span className="text-caption text-badge-warning-fg">{item.reasonText ?? t(`viewer.unplacedReasons.${item.reasonCode ?? 'UNKNOWN'}`)}</span>
                  {/* `message` của service thật có thể khác mã lý do; mock ghi lại đúng mã nên không lặp */}
                  {item.message && item.message !== item.reasonCode ? <span className="text-caption text-text-2">{item.message}</span> : null}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="pinned" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3">
            <p className="px-1 pb-1 text-caption text-text-3">
              Kiện đã ghim giữ nguyên vị trí khi chạy tối ưu lại.
            </p>
            {pinned.map((item) => {
              const selected = item.id === selectedId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-pressed={selected}
                  className={cn(
                    'flex gap-3 rounded-md border p-3 text-left transition-colors duration-(--dur-fast) ease-standard',
                    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    selected ? 'border-primary bg-primary-bg' : 'border-border bg-bg hover:bg-surface',
                  )}
                >
                  <StopSquare stop={item.stop} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 font-mono text-body font-medium">
                      {item.id}
                      <Pin className="size-3.5 fill-warning text-warning" strokeWidth={1.5} aria-label="Đã ghim" />
                    </span>
                    <span className="font-mono text-caption text-text-3">
                      {format.dimensions(item.lengthCm, item.widthCm, item.heightCm)} · {format.weight(item.weightKg)}
                    </span>
                    <span className="text-caption text-text-2">
                      {describeWhere(item, placements, vehicle)}
                    </span>
                  </div>
                </button>
              )
            })}
          </TabsContent>

          <TabsContent value="placed" className="flex min-h-0 flex-1 flex-col">
            <PlacedPackageList placements={placements} stops={stops} issues={issues} selectedId={selectedId} onSelect={onSelect} />
          </TabsContent>
        </Tabs>
      ) : null}
    </aside>
  )
}

function StopSquare({ stop }: { stop: number }) {
  return (
    <span
      className="grid size-9 flex-none place-items-center rounded-sm font-mono text-caption font-semibold leading-none"
      style={{ background: stopColor(stop), color: stopForeground(stop) }}
    >
      <span className="sr-only">Điểm giao </span>
      {formatInteger(stop)}
    </span>
  )
}
