import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/Dialog'
import { formatDecimal, formatInteger } from '@/lib/format'
import { cn } from '@/lib/utils'
import { BestPlanPreview } from './BestPlanPreview'
import { GenerationSparkline, START_FILL_RATE } from './GenerationSparkline'
import type { OptimizationProgress } from './useOptimizationJob'

const VEHICLE_CAPTION = 'Hyundai HD210 · 132 kiện'

/** Modal theo dõi tối ưu — một modal, hai trạng thái: đang chạy và hoàn tất. */
export function OptimizationDialog({
  open,
  onOpenChange,
  progress,
  onViewPlan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  progress: OptimizationProgress
  onViewPlan: () => void
}) {
  const done = progress.phase === 'done'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <div className="flex flex-col gap-5 px-7 pt-6">
          <div className="flex items-center gap-3">
            {done ? (
              <span className="grid size-7 flex-none place-items-center rounded-full bg-badge-success-bg text-success">
                <Check className="size-4" strokeWidth={2.5} aria-hidden />
              </span>
            ) : (
              <span
                aria-hidden
                className="inline-block size-5 flex-none animate-[lm-spin_0.8s_linear_infinite] rounded-full border-[2.5px] border-primary border-t-transparent"
              />
            )}
            <DialogTitle className="text-h2 font-semibold text-text">
              {done
                ? 'Đã tối ưu xong phương án xếp hàng'
                : 'Đang tối ưu phương án xếp hàng'}
            </DialogTitle>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="h-2 overflow-hidden rounded-full border border-border bg-surface">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-(--dur-md) ease-decelerate',
                  done ? 'bg-success' : 'bg-primary',
                )}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="flex justify-between text-caption text-text-3">
              <span>{done ? 'Hoàn tất' : 'Tiến trình'}</span>
              <span
                className={cn(
                  'font-mono',
                  done ? 'text-badge-success-fg' : 'text-text',
                )}
              >
                {formatInteger(progress.percent)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 rounded-md border border-border p-4">
              <span className="text-caption text-text-3">Vòng tối ưu</span>
              <span className="font-mono text-display font-semibold tracking-[-0.02em]">
                {formatInteger(progress.generation)}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-md border border-badge-info-border bg-primary-bg p-4">
              <span className="text-caption text-text-2">
                Tỷ lệ lấp đầy tốt nhất
              </span>
              <span className="font-mono text-[40px] leading-10 font-semibold tracking-[-0.02em] text-primary">
                {formatDecimal(progress.bestFillRate)}
                <span className="text-2xl text-primary-hover">%</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-caption text-text-3">
              <span>Lấp đầy tốt nhất qua các vòng</span>
              <span className="font-mono">
                {formatDecimal(START_FILL_RATE)}% →{' '}
                {formatDecimal(progress.bestFillRate)}%
              </span>
            </div>
            <GenerationSparkline
              generations={Math.max(2, progress.generation)}
              target={progress.bestFillRate}
              done={done}
            />
          </div>

          <BestPlanPreview
            title={done ? 'Phương án tốt nhất' : 'Xem trước phương án tốt nhất'}
            caption={VEHICLE_CAPTION}
            fill={done ? 'full' : 'partial'}
          />

          <p className="flex items-center gap-2 text-caption text-text-3">
            <span
              aria-hidden
              className={cn(
                'size-1.5 rounded-full',
                done ? 'bg-success' : 'bg-primary',
              )}
            />
            {done
              ? `Hoàn tất sau ${formatInteger(progress.elapsedSeconds)} giây · ${formatInteger(progress.totalGenerations)} vòng tối ưu · 8.240 kg / 18,4 m³ đã xếp`
              : `Đang chạy vòng ${formatInteger(progress.generation)}… (đã ${formatInteger(progress.elapsedSeconds)} giây)`}
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">{done ? 'Đóng' : 'Huỷ'}</Button>
          </DialogClose>

          {done ? (
            <Button variant="primary" onClick={onViewPlan}>
              Xem phương án
              <ArrowRight strokeWidth={1.5} />
            </Button>
          ) : (
            <span className="text-caption text-text-3">
              Bạn có thể đóng cửa sổ này, quá trình vẫn tiếp tục chạy.
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
