import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { ArrowUp } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DeliveryItemRow } from '@/features/driver/DeliveryItemRow'
import type { DeliveryItem } from '@/features/driver/driver-plan'
import { KpiTile } from '@/features/manager/KpiTile'
import { StopCard } from '@/features/trips/StopCard'
import type { StopRow } from '@/features/trips/trip-summary'
import { formatInteger } from '@/lib/format'
import { stopColor, stopForeground, stopLabel } from '@/lib/stops'
import { SheetRow, SheetSection } from '../SheetLayout'

const DRIVER_ITEM: DeliveryItem = {
  id: 'PKG-002-12', packageId: 'PKG-002', name: 'Thùng sữa tươi tiệt trùng 48 hộp', weightKg: 52, unloadingOrder: 3, area: 'door', layer: 'upper',
}

export function DataSection() {
  const stop: StopRow = {
    id: 'STOP-1', number: 1, name: 'Công ty TNHH Thực phẩm Sài Gòn',
    address: '12 Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh', packageCount: 38, weightKg: 2400,
  }

  return (
    <SheetSection id="data" number="03" title="Hiển thị dữ liệu">
      <SheetRow name="Badge · StopTag · StopDot · DeltaPill" note="Badge tông: neutral · info · cyan · success · warning · danger (± chấm). StopTag: solid · dot · vòng tròn số. DeltaPill mono với mũi tên.">
        <Badge tone="neutral">Nháp</Badge>
        <Badge tone="info" dot>Đang tối ưu</Badge>
        <Badge tone="cyan" dot>Đang giao</Badge>
        <Badge tone="success">Hoàn thành</Badge>
        <Badge tone="warning">Cần xem lại</Badge>
        <Badge tone="danger">Đã huỷ</Badge>
        <span className="inline-flex h-[22px] items-center rounded-[4px] px-2 text-caption font-semibold leading-none" style={{ background: stopColor(2), color: stopForeground(2) }}>{stopLabel(2)}</span>
        <span className="inline-flex items-center gap-2 text-body"><span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: stopColor(3) }} />{stopLabel(3)} · Bách Hoá Xanh</span>
        <span className="grid size-8 place-items-center rounded-full font-mono text-body font-semibold" style={{ background: stopColor(4), color: stopForeground(4) }}>4</span>
        <span className="inline-flex h-[22px] items-center gap-1 rounded-full border border-badge-success-border bg-badge-success-bg px-2 font-mono text-caption font-medium text-badge-success-fg"><ArrowUp className="size-3" strokeWidth={2.5} />+3,1%</span>
      </SheetRow>

      <SheetRow name="Card · KPITile · StatTile · InfoTile" note="Card thường · KPI (số lớn + ghi chú nguồn số) · Stat nhỏ trong card · InfoTile nền surface (tablet, vị trí X/Y/Z)." className="items-stretch">
        <div className="w-80"><KpiTile label="Tổng số kiện" value={formatInteger(132)} unit="kiện" note="Đã tách theo số lượng của 1 chuyến" /></div>
        <div className="flex flex-col gap-0.5"><span className="text-caption text-text-3">Thể tích</span><span className="font-mono text-h2 font-semibold">18,4 <span className="font-sans text-caption font-normal text-text-3">m³</span></span></div>
        <div className="flex flex-col gap-0.5 rounded-md border border-border bg-surface px-2.5 py-2"><span className="text-[11px] leading-3.5 text-text-3">X</span><span className="font-mono text-body font-medium">4.360</span></div>
      </SheetRow>

      <SheetRow name="Trạng thái chuyến" note="10 trạng thái nghiệp vụ, mỗi trạng thái gắn cố định một tông badge.">
        {(['nhap', 'dang_toi_uu', 'da_toi_uu', 'da_duyet', 'dang_xep_hang', 'da_xep_xong', 'dang_giao', 'hoan_thanh', 'can_xem_lai', 'da_huy'] as const).map((s) => <StatusBadge key={s} status={s} />)}
      </SheetRow>

      <SheetRow name="StopCard (kéo thả) · PackageRow · UnplacedCard" note="StopCard: mặc định · đang kéo (viền primary, bóng --e3). PackageRow tài xế: chờ · đã dỡ. UnplacedCard: viền đứt." className="flex-col items-stretch">
        <DndContext><SortableContext items={[stop.id]}><ul className="m-0 w-140 list-none p-0"><StopCard stop={stop} onRemove={() => undefined} /></ul></SortableContext></DndContext>
        <ul className="m-0 w-95 list-none overflow-hidden rounded-md border border-border p-0 text-body-lg">
          <DeliveryItemRow item={DRIVER_ITEM} done={false} onToggle={() => undefined} />
          <DeliveryItemRow item={{ ...DRIVER_ITEM, id: 'PKG-002-11', unloadingOrder: 4 }} done onToggle={() => undefined} />
        </ul>
        <div className="flex w-62 gap-3 rounded-md border border-dashed border-switch-off p-3">
          <span className="grid size-9 flex-none place-items-center rounded-sm font-mono text-caption font-semibold" style={{ background: stopColor(3), color: stopForeground(3) }}>3</span>
          <div className="flex flex-col gap-0.5"><span className="font-mono text-body font-medium">PKG-00233</span><span className="font-mono text-caption text-text-3">600 × 400 × 400 · 28,0 kg</span><span className="text-caption text-badge-warning-fg">Vượt chiều cao còn lại</span></div>
        </div>
      </SheetRow>

      <SheetRow name="UtilizationBar · ProgressBar · StepProgress · Sparkline" note="Thanh 8px pill; >90% chuyển warning. StepProgress 10px cho tablet. Sparkline hội tụ. Bảng điều khiển chưa có biểu đồ: chưa có nguồn số thật (LM-052)." className="flex-col items-stretch gap-6">
        <div className="flex w-80 flex-col gap-3"><ProgressBar label="Thể tích sử dụng" value={78} /><ProgressBar label="Trục sau" value={93} tone="warning" /><ProgressBar label="Quá tải" value={100} tone="danger" /></div>
        <span className="font-mono text-caption text-text-3">{formatInteger(132)} kiện · trục 0–100%</span>
      </SheetRow>
    </SheetSection>
  )
}
