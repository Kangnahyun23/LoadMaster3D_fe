import { Check, Minus, Plus, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Sample, SheetSection } from '../SheetLayout'

const VARIANTS = [
  { variant: 'primary', name: 'Primary', note: 'một nút mỗi màn', label: 'Chạy tối ưu', loading: 'Đang chạy…' },
  { variant: 'secondary', name: 'Secondary', note: 'viền 1px', label: 'Lưu nháp', loading: 'Đang lưu…' },
  { variant: 'ghost', name: 'Ghost', note: 'trong suốt', label: 'Xem chi tiết', loading: 'Đang tải…' },
  { variant: 'danger', name: 'Danger', note: '--danger', label: 'Huỷ chuyến', loading: 'Đang huỷ…' },
] as const

export function ButtonSection() {
  return (
    <SheetSection
      id="nut"
      number="03"
      title="Nút"
      description="Cao 40px desktop, 56px cảm ứng. Padding ngang 16px, radius 8px, chữ 14px/600. Hover chỉ đổi nền. Loading giữ nguyên chiều rộng, spinner 16px bên trái."
    >
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[140px_repeat(4,minmax(max-content,1fr))] gap-4 border-b border-border bg-surface px-5 py-2.5 text-caption font-medium text-text-3">
          <span>Kiểu</span>
          <span>Default</span>
          <span>Hover</span>
          <span>Disabled</span>
          <span>Loading</span>
        </div>
        {VARIANTS.map((item) => (
          <div key={item.variant} className="grid grid-cols-[140px_repeat(4,minmax(max-content,1fr))] items-center gap-4 border-b border-border p-5 last:border-b-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-body font-medium">{item.name}</span>
              <span className="font-mono text-caption text-text-3">{item.note}</span>
            </div>
            <div><Button variant={item.variant}>{item.label}</Button></div>
            <div><Button variant={item.variant} className={HOVER_CLASS[item.variant]}>{item.label}</Button></div>
            <div><Button variant={item.variant} disabled>{item.label}</Button></div>
            <div><Button variant={item.variant} loading>{item.loading}</Button></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-5">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
          <span className="text-caption font-medium text-text-3">Điện thoại · full width · 56px</span>
          <Button variant="primary" size="touch" block><Check strokeWidth={1.5} />Xác nhận đã xếp xong</Button>
          <Button variant="secondary" size="touch" block>Quét mã kiện tiếp theo</Button>
          <Button variant="ghost" size="touch" block>Bỏ qua kiện này</Button>
          <Button variant="danger" size="touch" block>Báo kiện hư hỏng</Button>
        </div>
        <div className="flex flex-col gap-4 rounded-md border border-border p-5">
          <span className="text-caption font-medium text-text-3">Tablet · nhóm nút &amp; nút icon 48px</span>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="touch">Bắt đầu xếp</Button>
            <Button variant="secondary" size="touch">Xem sơ đồ 3D</Button>
            <Button variant="secondary" size="touch" disabled>Tạm dừng</Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="iconTouch" aria-label="Phóng to"><Plus strokeWidth={1.5} /></Button>
            <Button variant="secondary" size="iconTouch" aria-label="Thu nhỏ"><Minus strokeWidth={1.5} /></Button>
            <Button variant="ghost" size="iconTouch" aria-label="Xoay" className="bg-primary-bg text-primary"><RotateCw strokeWidth={1.5} /></Button>
            <span className="text-caption text-text-3">Nút icon: 48 × 48 · icon 20px, stroke 1.5</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-0.5 border-t border-border pt-3 text-caption text-text-2">
            <span className="text-text-3">Desktop</span><span className="font-mono">nút 40 · icon-btn 36 · hàng 48 / 36</span>
            <span className="text-text-3">Cảm ứng</span><span className="font-mono">nút 56 · icon-btn 48 · hàng 56 · body 16</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <Sample label="icon · 36px desktop"><Button variant="secondary" size="icon" aria-label="Thêm"><Plus strokeWidth={1.5} /></Button></Sample>
        <Sample label="icon ghost"><Button variant="ghost" size="icon" aria-label="Xoay"><RotateCw strokeWidth={1.5} /></Button></Sample>
        <Sample label="primary + icon"><Button variant="primary"><Plus strokeWidth={1.5} />Thêm đơn hàng</Button></Sample>
      </div>
    </SheetSection>
  )
}

/** Ép trạng thái hover để chụp tài liệu; nút thật tự đổi khi rê chuột. */
const HOVER_CLASS = {
  primary: 'bg-primary-hover',
  secondary: 'bg-surface',
  ghost: 'bg-surface',
  danger: 'bg-danger-hover',
} as const
