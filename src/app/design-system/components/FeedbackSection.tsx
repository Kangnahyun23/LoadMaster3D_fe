import { CloudOff, Package, Plus, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyTripsIllustration } from '@/features/trips/EmptyTripsIllustration'
import { ConfirmedOverlay } from '@/features/warehouse/ConfirmedOverlay'
import { Sample, SheetRow, SheetSection } from '../SheetLayout'

export function FeedbackSection() {
  return (
    <SheetSection id="feedback" number="04" title="Phản hồi">
      <SheetRow name="Toast · InlineNote · OfflinePill" note="Toast tông: success · warning · danger (± link hành động), góc trên phải, tự ẩn sau 5 giây. InlineNote: cảnh báo cam (dễ vỡ) · trung tính. OfflinePill: cam." className="flex-col items-start gap-5">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => toast.success('Đã duyệt phương án C', { description: 'Phiếu xếp hàng đã gửi tới máy tính bảng kho Long Bình.' })}>Toast success</Button>
          <Button variant="secondary" onClick={() => toast.warning('Trục sau đạt 93% tải trọng cho phép', { description: 'Cân nhắc dời 2 kiện nặng về phía vách trước.', action: { label: 'Xem tải trọng trục', onClick: () => undefined } })}>Toast warning</Button>
          <Button variant="secondary" onClick={() => toast.error('Mất kết nối máy chủ tối ưu', { description: 'Tiến trình đã dừng ở vòng 64. Kết quả tạm thời được giữ lại.', action: { label: 'Thử lại', onClick: () => undefined }, cancel: { label: 'Xem kết quả tạm', onClick: () => undefined } })}>Toast error</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <div role="note" className="flex items-center gap-3 rounded-md border border-badge-warning-border bg-badge-warning-bg px-4 py-3.5 text-badge-warning-fg"><TriangleAlert className="size-6" strokeWidth={2} /><span className="text-[18px] leading-6 font-semibold">Dễ vỡ — không đặt vật nặng lên trên</span></div>
          <div role="note" className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5 text-text-2"><Package className="size-6" strokeWidth={2} /><span className="text-[18px] leading-6 font-semibold">Nhẹ — được đặt lên kiện dễ vỡ</span></div>
          <span className="inline-flex h-8 items-center gap-1.5 self-center rounded-full border border-badge-warning-border bg-badge-warning-bg px-2.5 text-body-lg font-medium text-badge-warning-fg"><CloudOff className="size-4" strokeWidth={2} />3 thao tác chờ đồng bộ</span>
        </div>
      </SheetRow>

      <SheetRow name="EmptyState · Skeleton · Spinner · ConfirmedOverlay" note="Trạng thái rỗng khung nét đứt với đúng một nút primary. Skeleton dải sáng chạy ngang (nền sáng) hoặc nhấp nháy (nền tối). Spinner 16px. Lớp phủ xác nhận ở kho." className="flex-col items-stretch gap-6">
        <div className="w-140">
          <EmptyState illustration={<EmptyTripsIllustration />} title="Chưa có chuyến hàng nào" description="Tạo chuyến, thêm đơn hàng rồi chạy tối ưu để nhận phương án xếp hàng 3D." action={<Button variant="primary"><Plus strokeWidth={1.5} />Tạo chuyến đầu tiên</Button>} />
        </div>
        <div className="flex flex-wrap items-end gap-8">
          <Sample label="skeleton · nền sáng"><div className="flex w-60 flex-col gap-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-52" /><Skeleton className="h-[22px] w-21 rounded-full" /></div></Sample>
          <Sample label="skeleton · nền tối"><div className="flex w-60 gap-1 rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] p-3"><Skeleton dark className="h-7 w-13 rounded-sm" /><Skeleton dark className="h-7 w-16 rounded-sm" /><Skeleton dark className="h-7 w-18 rounded-sm" /></div></Sample>
          <Sample label="spinner dark / light"><div className="flex items-center gap-4"><Spinner /><span className="rounded-md bg-primary p-2"><Spinner tone="light" /></span></div></Sample>
        </div>
        <Sample label="ConfirmedOverlay · 1,2 giây rồi tự ẩn">
          <div className="relative h-80 w-140 overflow-hidden rounded-md border border-border"><ConfirmedOverlay confirmedId="PKG-00147" nextStep={48} /></div>
        </Sample>
      </SheetRow>
    </SheetSection>
  )
}
