import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { OptimizationErrorDialog } from '@/features/optimization/OptimizationErrorDialog'
import { OptimizationRunDialog } from '@/features/optimization/OptimizationRunDialog'
import { ApprovePlanDialog } from '@/features/viewer3d/ApprovePlanDialog'
import { SheetRow, SheetSection } from '../SheetLayout'


export function OverlaySection() {
  const [open, setOpen] = useState<'running' | 'failed' | 'error' | 'approve' | null>(null)

  return (
    <SheetSection id="overlay" number="05" title="Lớp phủ">
      <SheetRow name="Modal · ConfirmDialog · ErrorDialog · ProgressModal" note="Rộng 640 (tiến trình, lỗi) · 560 (xác nhận). Radius 12px, bóng --e3, lớp phủ rgba(17,24,39,.45), mở 220ms. Chân: nút phụ trái hoặc cặp nút phải.">
        <Button variant="secondary" onClick={() => setOpen('running')}>Đang tối ưu · 80 / 132 kiện</Button>
        <Button variant="secondary" onClick={() => setOpen('failed')}>Đầu vào không hợp lệ</Button>
        <Button variant="secondary" onClick={() => setOpen('error')}>Lỗi tối ưu</Button>
        <Button variant="secondary" onClick={() => setOpen('approve')}>Xác nhận duyệt</Button>
      </SheetRow>

      <SheetRow name="Tooltip · Dropdown" note="Tooltip nền tối, chữ 12px, radius 6px, bóng --e2; hiện sau 200ms. Dropdown/Select: viền 1px, bóng --e2, mục 36px.">
        <Tooltip>
          <TooltipTrigger asChild><Button variant="secondary">Rê chuột vào đây</Button></TooltipTrigger>
          <TooltipContent side="right">Máy tính bảng kho</TooltipContent>
        </Tooltip>
      </SheetRow>

      {open === 'running' ? <OptimizationRunDialog progress={{ placed: 80, total: 132 }} onCancel={() => setOpen(null)} /> : null}
      {open === 'error' ? <OptimizationErrorDialog failure={{ kind: 'service', code: 'SERVICE_UNAVAILABLE' }} onRetry={() => setOpen(null)} onClose={() => setOpen(null)} /> : null}
      {open === 'failed' ? <OptimizationErrorDialog failure={{ kind: 'failed', messages: ['PKG-009 không có hướng đặt nào được phép.'] }} onRetry={() => setOpen(null)} onClose={() => setOpen(null)} /> : null}
      <ApprovePlanDialog
        open={open === 'approve'}
        onOpenChange={(o) => setOpen(o ? 'approve' : null)}
        // Số của revision đã duyệt trong seed (chuyến TRIP-2026-0914): 132 kiện, 5.844 / 9.500 kg.
        metrics={{
          totalVehicleVolumeCm3: 40_608_000, usedVolumeCm3: 16_568_064, volumeUtilizationPercent: 40.8, maxPayloadKg: 9500,
          usedPayloadKg: 5844, payloadUtilizationPercent: 61.5, placedCount: 132, unplacedCount: 0, runtimeMs: 0,
        }}
        canSubmit
        approval={{ blockers: { canApprove: true, issues: [], stale: false }, warnings: [], patches: [] }}
        checks={[{ tone: 'success', text: 'Thứ tự xếp phù hợp thứ tự điểm giao' }]}
        pending={false}
        onConfirm={() => setOpen(null)}
      />
    </SheetSection>
  )
}
