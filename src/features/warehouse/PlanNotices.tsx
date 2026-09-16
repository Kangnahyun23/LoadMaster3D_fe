import { TriangleAlert } from 'lucide-react'
import type { ViewerSceneModel } from '@/features/viewer3d/scene-input'
import { useT } from '@/lib/i18n'

/**
 * Dải nhãn của phương án đang xếp (LM-060): MOCK RESULT (Spec, không dịch), thứ tự tính lại ở FE khi Duyệt (D-32) và cảnh báo
 * bản duyệt lỗi thời (D-31). Chữ 16px như phần còn lại của màn tablet (mục 10), nên không dùng `Badge` 12px.
 */
export function PlanNotices({ model, stale }: { model: ViewerSceneModel; stale: boolean }) {
  const t = useT()
  if (!model.isMockResult && !model.ordersRecomputed && !stale) return null
  return (
    <div className="flex flex-none flex-wrap items-center gap-2 px-3 pt-3">
      {model.isMockResult ? <Tag className="border-badge-warning-border bg-badge-warning-bg text-badge-warning-fg">MOCK RESULT</Tag> : null}
      {model.ordersRecomputed ? <Tag className="border-badge-info-border bg-badge-info-bg text-badge-info-fg">{t('warehouse.ordersRecomputed')}</Tag> : null}
      {stale ? (
        <p role="alert" className="flex w-full items-center gap-3 rounded-md border border-badge-danger-border bg-badge-danger-bg px-4 py-3 font-semibold text-badge-danger-fg">
          <TriangleAlert className="size-6 flex-none" strokeWidth={2} aria-hidden />
          {t('warehouse.stale')}
        </p>
      ) : null}
    </div>
  )
}

function Tag({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`inline-flex min-h-8 items-center rounded-full border px-3 text-body-lg font-medium ${className}`}>{children}</span>
}
