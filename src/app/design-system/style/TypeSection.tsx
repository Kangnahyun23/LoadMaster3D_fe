import { SheetSection } from '../SheetLayout'

const ROWS: Array<{ style: string; size: string; className: string; sample: string }> = [
  { style: 'Display · 600', size: '32 / 40', className: 'text-display font-semibold tracking-[-0.02em]', sample: 'Xếp hàng lên xe tải — nhanh và chuẩn' },
  { style: 'H1 · 600', size: '24 / 32', className: 'text-h1 font-semibold tracking-[-0.01em]', sample: 'Kế hoạch chuyến giao ở Hồ Chí Minh' },
  { style: 'H2 · 600', size: '20 / 28', className: 'text-h2 font-semibold', sample: 'Từng lớp kiện hàng, từng điểm dỡ' },
  { style: 'H3 · 500', size: '16 / 24', className: 'text-h3 font-medium', sample: 'Mẫu dấu: ẫ ộ ở ừ ẳ ễ ỡ ự ệ ầ ẩ ố' },
  { style: 'Body-lg · 400', size: '16 / 24', className: 'text-body-lg', sample: 'Kiện dễ vỡ được xếp ở lớp trên cùng; kiện nặng đặt sát vách và giữa trục để giữ trọng tâm ổn định.' },
  { style: 'Body · 400', size: '14 / 20', className: 'text-body', sample: 'Chuyến TRIP-2026-0914 gồm 7 đơn hàng, 132 kiện, giao 4 điểm từ Q.7 tới Biên Hoà.' },
  { style: 'Caption · 400', size: '12 / 16', className: 'text-caption text-text-2', sample: 'Cập nhật lúc 14:30 · 14/09/2026' },
]

const MONO_SAMPLES = [
  { label: 'Mã chuyến', value: 'TRIP-2026-0914' },
  { label: 'Khối lượng', value: '8.240 kg' },
  { label: 'Kích thước', value: '7.200 × 2.350 × 2.400 mm' },
  { label: 'Phần trăm', value: '87,4%' },
]

export function TypeSection() {
  return (
    <SheetSection
      id="chu"
      number="02"
      title="Chữ"
      description="Be Vietnam Pro cho giao diện, JetBrains Mono (tabular figures) cho số, mã kiện và kích thước. Trọng lượng dùng: 400 / 500 / 600."
    >
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[120px_120px_minmax(0,1fr)] gap-6 border-b border-border bg-surface px-5 py-2.5 text-caption font-medium text-text-3">
          <span>Kiểu</span>
          <span>Cỡ / dòng</span>
          <span>Mẫu tiếng Việt có dấu</span>
        </div>
        {ROWS.map((row) => (
          <div key={row.style} className="grid grid-cols-[120px_120px_minmax(0,1fr)] items-baseline gap-6 border-b border-border p-5 last:border-b-0">
            <span className="text-caption font-medium text-text-2">{row.style}</span>
            <span className="font-mono text-caption text-text-3">{row.size}</span>
            <span className={`${row.className} text-pretty`}>{row.sample}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        {MONO_SAMPLES.map((sample) => (
          <div key={sample.label} className="flex flex-col gap-1 rounded-md border border-border p-4">
            <span className="text-caption text-text-3">{sample.label}</span>
            <span className="font-mono text-h2 font-medium">{sample.value}</span>
          </div>
        ))}
      </div>
    </SheetSection>
  )
}
