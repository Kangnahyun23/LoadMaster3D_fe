import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useFormat, useT } from '@/lib/i18n'
import type { OptimizationProgress } from '@/services/optimization'

/**
 * Tiến trình tối ưu thật (LM-048): số kiện đã xét trên tổng và thời gian đã chạy. Không còn "vòng tối ưu" hay tỷ lệ
 * lấp đầy giả lập — service mock chỉ báo số kiện đã xét (AGENTS mục 6 "Không bịa số"). Đóng hộp thoại là huỷ job.
 */
export function OptimizationRunDialog({ progress, onCancel }: { progress: OptimizationProgress | null; onCancel: () => void }) {
  const t = useT()
  const format = useFormat()
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const placed = progress?.placed ?? 0
  const total = progress?.total ?? 0
  const percent = total > 0 ? (placed / total) * 100 : 0

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent>
        <div className="flex flex-col gap-4 px-7 pt-6">
          <DialogTitle className="text-h2 font-semibold">{t('optimization.running.title')}</DialogTitle>
          <DialogDescription className="text-body text-text-2">
            {t('optimization.running.progress', { placed: format.integer(placed), total: format.integer(total) })}
          </DialogDescription>
          <ProgressBar value={percent} />
          <p role="status" className="font-mono text-caption text-text-3">
            {t('optimization.running.elapsed', { seconds: format.integer(Math.floor((now - startedAt) / 1000)) })}
          </p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>{t('optimization.running.cancel')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
