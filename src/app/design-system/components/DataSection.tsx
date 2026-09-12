import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { ArrowUp } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DeliveryItemRow } from '@/features/driver/DeliveryItemRow'
import { AlgorithmChart } from '@/features/manager/AlgorithmChart'
import { KPIS } from '@/features/manager/dashboard.mock'
import { FillRateChart } from '@/features/manager/FillRateChart'
import { KpiTile } from '@/features/manager/KpiTile'
import { GenerationSparkline } from '@/features/optimization/GenerationSparkline'
import { StopCard } from '@/features/trips/StopCard'
import { STOPS } from '@/features/trips/trip-detail.mock'
import { formatInteger } from '@/lib/format'
import { stopColor, stopForeground, stopLabel } from '@/lib/stops'
import { Sample, SheetRow, SheetSection } from '../SheetLayout'

const DRIVER_ITEM = { id: 'PKG-00194', orderId: 'DH-51031', description: 'Thùng sữa tươi 12 hộp', where: 'Gần cửa, lớp trên' }

export function DataSection() {
  const kpi = KPIS[0]
  const stop = STOPS[0]

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

      <SheetRow name="Card · KPITile · StatTile · InfoTile" note="Card thường · KPI (số lớn + delta) · Stat nhỏ trong card · InfoTile nền surface (tablet, vị trí X/Y/Z)." className="items-stretch">
        {kpi ? <div className="w-80"><KpiTile kpi={kpi} /></div> : null}
        <div className="flex flex-col gap-0.5"><span className="text-caption text-text-3">Thể tích</span><span className="font-mono text-h2 font-semibold">18,4 <span className="font-sans text-caption font-normal text-text-3">m³</span></span></div>
        <div className="flex flex-col gap-0.5 rounded-md border border-border bg-surface px-2.5 py-2"><span className="text-[11px] leading-3.5 text-text-3">X</span><span className="font-mono text-body font-medium">4.360</span></div>
      </SheetRow>

      <SheetRow name="Trạng thái chuyến" note="10 trạng thái nghiệp vụ, mỗi trạng thái gắn cố định một tông badge.">
        {(['nhap', 'dang_toi_uu', 'da_toi_uu', 'da_duyet', 'dang_xep_hang', 'da_xep_xong', 'dang_giao', 'hoan_thanh', 'can_xem_lai', 'da_huy'] as const).map((s) => <StatusBadge key={s} status={s} />)}
      </SheetRow>

      <SheetRow name="StopCard (kéo thả) · PackageRow · UnplacedCard" note="StopCard: mặc định · đang kéo (viền primary, bóng --e3). PackageRow tài xế: chờ · đã dỡ · từ chối. UnplacedCard: viền đứt." className="flex-col items-stretch">
        {stop ? (
          <DndContext><SortableContext items={[stop.id]}><ul className="m-0 w-140 list-none p-0"><StopCard stop={stop} index={0} /></ul></SortableContext></DndContext>
        ) : null}
        <ul className="m-0 w-95 list-none overflow-hidden rounded-md border border-border p-0 text-body-lg">
          <DeliveryItemRow item={DRIVER_ITEM} status="pending" onToggle={() => undefined} />
          <DeliveryItemRow item={{ ...DRIVER_ITEM, id: 'PKG-00193' }} status="done" onToggle={() => undefined} />
          <DeliveryItemRow item={{ ...DRIVER_ITEM, id: 'PKG-00191', description: 'Nước mắm 900 ml × 12' }} status="rejected" onToggle={() => undefined} />
        </ul>
        <div className="flex w-62 gap-3 rounded-md border border-dashed border-switch-off p-3">
          <span className="grid size-9 flex-none place-items-center rounded-sm font-mono text-caption font-semibold" style={{ background: stopColor(3), color: stopForeground(3) }}>3</span>
          <div className="flex flex-col gap-0.5"><span className="font-mono text-body font-medium">PKG-00233</span><span className="font-mono text-caption text-text-3">600 × 400 × 400 · 28,0 kg</span><span className="text-caption text-badge-warning-fg">Vượt chiều cao còn lại</span></div>
        </div>
      </SheetRow>

      <SheetRow name="UtilizationBar · ProgressBar · StepProgress · Sparkline · Chart" note="Thanh 8px pill; >90% chuyển warning. StepProgress 10px cho tablet. Sparkline hội tụ. Biểu đồ dashboard dùng recharts." className="flex-col items-stretch gap-6">
        <div className="flex w-80 flex-col gap-3"><ProgressBar label="Thể tích sử dụng" value={78} /><ProgressBar label="Trục sau" value={93} tone="warning" /><ProgressBar label="Quá tải" value={100} tone="danger" /></div>
        <Sample label="sparkline · 200 vòng → 89,2%"><div className="w-146"><GenerationSparkline generations={200} target={89.2} done /></div></Sample>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md border border-border p-4"><span className="text-body font-medium">Tỷ lệ lấp đầy theo tuần</span><FillRateChart /></div>
          <div className="rounded-md border border-border p-4"><span className="text-body font-medium">So sánh thuật toán</span><AlgorithmChart /></div>
        </div>
        <span className="font-mono text-caption text-text-3">{formatInteger(132)} kiện · trục 0–100%</span>
      </SheetRow>
    </SheetSection>
  )
}
