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
