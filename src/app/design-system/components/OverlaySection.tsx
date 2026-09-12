import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { OptimizationDialog } from '@/features/optimization/OptimizationDialog'
import { OptimizationErrorDialog } from '@/features/optimization/OptimizationErrorDialog'
import type { OptimizationProgress } from '@/features/optimization/useOptimizationJob'
import { ApprovePlanDialog } from '@/features/viewer3d/ApprovePlanDialog'
import { SheetRow, SheetSection } from '../SheetLayout'

const RUNNING: OptimizationProgress = { phase: 'running', percent: 60, generation: 128, totalGenerations: 200, bestFillRate: 87.4, elapsedSeconds: 42 }
const DONE: OptimizationProgress = { phase: 'done', percent: 100, generation: 200, totalGenerations: 200, bestFillRate: 89.2, elapsedSeconds: 58 }

export function OverlaySection() {
  const [open, setOpen] = useState<'running' | 'done' | 'error' | 'approve' | null>(null)

  return (
    <SheetSection id="overlay" number="05" title="Lớp phủ">
      <SheetRow name="Modal · ConfirmDialog · ErrorDialog · ProgressModal" note="Rộng 640 (tiến trình, lỗi) · 560 (xác nhận). Radius 12px, bóng --e3, lớp phủ rgba(17,24,39,.45), mở 220ms. Chân: nút phụ trái hoặc cặp nút phải.">
        <Button variant="secondary" onClick={() => setOpen('running')}>Đang tối ưu · 60%</Button>
        <Button variant="secondary" onClick={() => setOpen('done')}>Hoàn tất tối ưu</Button>
        <Button variant="secondary" onClick={() => setOpen('error')}>Lỗi tối ưu</Button>
        <Button variant="secondary" onClick={() => setOpen('approve')}>Xác nhận duyệt</Button>
      </SheetRow>

      <SheetRow name="Tooltip · Dropdown" note="Tooltip nền tối, chữ 12px, radius 6px, bóng --e2; hiện sau 200ms. Dropdown/Select: viền 1px, bóng --e2, mục 36px.">
        <Tooltip>
          <TooltipTrigger asChild><Button variant="secondary">Rê chuột vào đây</Button></TooltipTrigger>
          <TooltipContent side="right">Máy tính bảng kho</TooltipContent>
        </Tooltip>
      </SheetRow>

      <OptimizationDialog open={open === 'running'} onOpenChange={(o) => setOpen(o ? 'running' : null)} progress={RUNNING} onViewPlan={() => setOpen(null)} />
      <OptimizationDialog open={open === 'done'} onOpenChange={(o) => setOpen(o ? 'done' : null)} progress={DONE} onViewPlan={() => setOpen(null)} />
      <OptimizationErrorDialog
        open={open === 'error'}
        onOpenChange={(o) => setOpen(o ? 'error' : null)}
        failure={{ generations: 200, seconds: 31, vehicleName: 'Hyundai HD210', oversizedCount: 12, totalKg: 9840, payloadKg: 9500 }}
        onAdjustTrip={() => setOpen(null)}
      />
      <ApprovePlanDialog
        open={open === 'approve'}
        onOpenChange={(o) => setOpen(o ? 'approve' : null)}
        planLabel="Phương án C — GA có ràng buộc LIFO"
        fillRate={87.4}
        weightKg={8240}
        placedCount={132}
        totalCount={132}
        checks={[
          { tone: 'success', text: 'Tuân thủ thứ tự dỡ 4 điểm giao' },
          { tone: 'success', text: 'Tải trọng trục trong giới hạn (trục sau 93%)' },
          { tone: 'warning', text: '2 kiện đã ghim thủ công, không được tối ưu lại' },
        ]}
        onConfirm={() => setOpen(null)}
      />
    </SheetSection>
  )
}
