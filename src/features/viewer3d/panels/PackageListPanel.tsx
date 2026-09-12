import { ChevronLeft, Pin } from 'lucide-react'
import { TabCount, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatDecimal, formatDimensions, formatInteger } from '@/lib/format'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import { describeWhere } from '@/lib/placement'
import type { Placement, UnplacedPackage, VehicleSpec } from '@/types/load-plan'
import type { LeftTab } from '../useLoadPlanViewer'

/**
 * Panel trái: kiện chưa xếp và kiện đã ghim. Thu gọn còn 48px.
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
}: {
  unplaced: UnplacedPackage[]
  pinned: Placement[]
  placements: Placement[]
  vehicle: VehicleSpec
  open: boolean
  onToggle: () => void
  tab: LeftTab
  onTabChange: (tab: LeftTab) => void
  selectedId: string | null
  onSelect: (id: string) => void
}) {
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
          onValueChange={(value) => onTabChange(value === 'pinned' ? 'pinned' : 'unplaced')}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList>
            <TabsTrigger value="unplaced">
              Kiện chưa xếp <TabCount tone="danger">{unplaced.length}</TabCount>
            </TabsTrigger>
            <TabsTrigger value="pinned">
              Kiện đã ghim <TabCount>{pinned.length}</TabCount>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unplaced" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3">
            <p className="px-1 pb-1 text-caption text-text-3">
              Không vừa chỗ trống còn lại.
            </p>
            {unplaced.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-md border border-dashed border-switch-off bg-bg p-3"
              >
                <StopSquare stop={item.stop} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-mono text-body font-medium">{item.id}</span>
                  <span className="truncate font-mono text-caption text-text-3">
                    {formatDimensions(item.lengthMm, item.widthMm, item.heightMm).replace(' mm', '')} ·{' '}
                    {formatDecimal(item.weightKg)} kg
                  </span>
                  <span className="text-caption text-badge-warning-fg">{item.reason}</span>
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
                      {formatDimensions(item.lengthMm, item.widthMm, item.heightMm).replace(' mm', '')} ·{' '}
                      {formatDecimal(item.weightKg)} kg
                    </span>
                    <span className="text-caption text-text-2">
                      {describeWhere(item, placements, vehicle)}
                    </span>
                  </div>
                </button>
              )
            })}
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
