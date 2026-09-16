import { AlertCircle, Focus, Pencil, X } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDecimal, formatInteger } from '@/lib/format'
import { effectiveOrientations, type OrientationRules } from '@/domain/geometry'
import { useFormat, useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import type { ConstraintIssue } from '@/domain/constraints'
import { formatIssue } from '@/lib/i18n'
import type { SceneStop, ScenePlacement } from '@/features/viewer3d/scene-input'
import { findAbove, findBelow, layerOf } from './placement-relations'

/** Panel phải: chi tiết kiện đang chọn, hướng xoay, vị trí, ghim. */
export function SelectedPackagePanel({
  placement,
  placements,
  orientationRules,
  totalSteps,
  stops,
  tripId,
  issues = [],
  onClose,
  onEdit,
  onFocus,
}: {
  placement: ScenePlacement | undefined
  placements: ScenePlacement[]
  /** Luật xoay của kiện gốc (LM-032); vắng thì chỉ hiện hướng hiện tại. */
  orientationRules?: OrientationRules
  totalSteps: number
  stops: readonly SceneStop[]
  tripId: string
  /** Lỗi/cảnh báo ràng buộc của phương án; panel lọc theo kiện đang chọn (LM-049) */
  issues?: readonly ConstraintIssue[]
  onClose: () => void
  onEdit: () => void
  onFocus: () => void
}) {
  return (
    <aside
      aria-label="Kiện đang chọn"
      className="flex w-full xl:w-90 flex-none flex-col overflow-hidden border-l border-border bg-bg"
    >
      <div className="flex h-14 xl:h-11 flex-none items-center justify-between border-b border-border pr-2 pl-4">
        <span className="text-body-lg xl:text-body font-medium">Kiện đang chọn</span>
        {placement ? (
          <button
            type="button"
            aria-label="Bỏ chọn"
            onClick={onClose}
            className="grid size-14 xl:size-11 place-items-center rounded-md text-text-3 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
      </div>

      {placement ? (
        <PackageDetails
          placement={placement}
          placements={placements}
          orientationRules={orientationRules}
          totalSteps={totalSteps}
          stops={stops}
          tripId={tripId}
          issues={issues}
          onEdit={onEdit}
          onFocus={onFocus}
        />
      ) : (
        <p className="p-4 text-body-lg xl:text-body text-text-3">
          Bấm vào một kiện trong khung 3D để xem chi tiết.
        </p>
      )}
    </aside>
  )
}

function PackageDetails({
  placement,
  placements,
  orientationRules,
  totalSteps,
  stops,
  tripId,
  issues,
  onEdit,
  onFocus,
}: {
  placement: ScenePlacement
  placements: ScenePlacement[]
  /** Luật xoay của kiện gốc (LM-032); vắng thì chỉ hiện hướng hiện tại. */
  orientationRules?: OrientationRules
  totalSteps: number
  stops: readonly SceneStop[]
  tripId: string
  issues: readonly ConstraintIssue[]
  onEdit: () => void
  onFocus: () => void
}) {
  const format = useFormat()
  const t = useT()
  const stopName = stops.find((s) => s.number === placement.stop)?.name ?? ''
  const layer = layerOf(placement, placements)
  const below = findBelow(placement, placements)
  const above = findAbove(placement, placements)
  const ownIssues = issues.filter((issue) => issue.packageInstanceId === placement.id || issue.relatedIds?.includes(placement.id))

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex items-start gap-3">
          <span
            className="grid size-11 flex-none place-items-center rounded-md font-mono text-body-lg xl:text-body font-semibold leading-none"
            style={{ background: stopColor(placement.stop), color: stopForeground(placement.stop) }}
          >
            <span className="sr-only">Điểm giao </span>
            {placement.stop}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 className="font-mono text-h2 font-semibold tracking-[-0.02em]">{placement.id}</h2>
            <div className="flex flex-wrap gap-1.5">
              {placement.fragile ? (
                <Badge tone="warning">
                  <AlertCircle className="size-3" strokeWidth={2} aria-hidden />
                  Dễ vỡ
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <dl className="flex flex-col border-t border-border">
          <Row label="Kích thước (D × R × C)">
            <span className="font-mono font-medium">
              {format.dimensions(placement.lengthCm, placement.widthCm, placement.heightCm)}
            </span>
          </Row>
          <Row label="Khối lượng">
            <span className="font-mono font-medium">
              {formatDecimal(placement.weightKg)} <span className="font-normal text-text-3">kg</span>
            </span>
          </Row>
          <Row label="Kiện gốc">
            <Link to={`/chuyen/${tripId}?kien=${encodeURIComponent(placement.packageId)}`} className="font-mono font-medium text-primary">
              {placement.packageId}
            </Link>
          </Row>
          <Row label="Điểm giao">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: stopColor(placement.stop) }} />
              {placement.stop} · {stopName}
            </span>
          </Row>
          <Row label={t('viewer.plan.detail.supportRatio')}>
            <span className="font-mono font-medium">{format.percent(placement.supportRatio * 100)}</span>
          </Row>
          <Row label={t('viewer.operations.loadingOrder')}>
            <span className="font-mono font-medium">
              {formatInteger(placement.step)}{' '}
              <span className="font-normal text-text-3">/ {formatInteger(totalSteps)}</span>
            </span>
          </Row>
          {/* Spec 7.11: thứ tự dỡ riêng; phương án cũ không có `unloadingOrder` thì không hiện số */}
          <Row label={t('viewer.operations.unloadingOrder')} last>
            <span className="font-mono font-medium">
              {placement.unloadingOrder > 0 ? formatInteger(placement.unloadingOrder) : '—'}{' '}
              {placement.unloadingOrder > 0 ? <span className="font-normal text-text-3">/ {formatInteger(placements.length)}</span> : null}
            </span>
          </Row>
        </dl>

        <section className="flex flex-col gap-2" aria-label={t('viewer.plan.detail.issues')}>
          <span className="text-body-lg xl:text-caption font-medium text-text-3">{t('viewer.plan.detail.issues')}</span>
          {ownIssues.length === 0 ? <span className="text-body text-text-2">{t('viewer.plan.detail.noIssues')}</span> : (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {ownIssues.map((issue, index) => (
                <li key={`${issue.code}-${index}`} className={cn('text-body', issue.severity === 'error' ? 'text-danger' : 'text-badge-warning-fg')}>
                  {formatIssue(issue, t, format)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-2">
          <span className="text-body-lg xl:text-caption font-medium text-text-3">Hướng xoay</span>
          <span className="font-mono text-body">{placement.orientation}</span>
          {orientationRules ? <span className="text-body-lg xl:text-caption text-text-2">
            {t('viewer.orientation.allowed', { codes: format.list(effectiveOrientations(orientationRules)) })}
            {orientationRules.keepUpright ? ` · ${t('viewer.orientation.keepUpright')}` : ''}
          </span> : null}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-body-lg xl:text-caption font-medium text-text-3">Vị trí (từ vách trước · vách trái · sàn)</span>
          <div className="grid grid-cols-3 gap-1.5">
            <Coordinate axis="X" value={format.length(placement.position.x)} />
            <Coordinate axis="Y" value={format.length(placement.position.y)} />
            <Coordinate axis="Z" value={format.length(placement.position.z)} />
          </div>
          <span className="text-body-lg xl:text-caption text-text-3">
            Lớp {layer} · {below ? `đặt trên ${below.id}` : 'nằm trên sàn'}
            {above ? ` · phía trên: ${above.id} (${formatDecimal(above.weightKg)} kg)` : ''}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-4 pt-3 pb-4">
        <span className="text-body">{placement.pinned ? 'Đã ghim vị trí' : 'Chưa ghim'}</span>
        <Button variant="secondary" className="h-14 text-body-lg xl:h-11 xl:text-body" block onClick={onEdit}><Pencil strokeWidth={1.5} />Chỉnh sửa kiện</Button>
        <Button variant="ghost" className="h-14 text-body-lg xl:h-11 xl:text-body" block onClick={onFocus}><Focus strokeWidth={1.5} />Tập trung vào kiện</Button>
      </div>
    </>
  )
}

function Row({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-3 py-2.5 text-body', !last && 'border-b border-border')}>
      <dt className="text-text-2">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

function Coordinate({ axis, value }: { axis: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-surface px-2.5 py-2">
      <span className="text-body-lg xl:text-caption text-text-3">{axis}</span>
      <span className="font-mono text-body-lg xl:text-body font-medium">{value}</span>
    </div>
  )
}
