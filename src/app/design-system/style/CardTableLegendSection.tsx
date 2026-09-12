import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDimensions, formatInteger } from '@/lib/format'
import { STOP_COLORS, stopColor, stopForeground, stopLabel } from '@/lib/stops'
import { SheetSection } from '../SheetLayout'

type Row = { code: string; stop: number; weightKg: number; dims: [number, number, number] }

const ROWS: Row[] = [
  { code: 'KIEN-00418', stop: 1, weightKg: 1240, dims: [120, 80, 96] },
  { code: 'KIEN-00419', stop: 2, weightKg: 2880, dims: [100, 100, 60] },
  { code: 'KIEN-00420', stop: 3, weightKg: 415, dims: [60, 40, 40] },
  { code: 'KIEN-00422', stop: 5, weightKg: 640, dims: [80, 60, 60] },
]

const helper = createColumnHelper<BaseTableFeatures, Row>()
const columns = helper.columns([
  helper.accessor('code', { header: 'Mã kiện', meta: { width: '36%' } satisfies ColumnMeta, cell: (i) => <span className="font-mono text-caption">{i.getValue()}</span> }),
  helper.accessor('stop', {
    header: 'Điểm',
    cell: (i) => (
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="size-2 rounded-xs" style={{ background: stopColor(i.getValue()) }} />
        {stopLabel(i.getValue())}
      </span>
    ),
  }),
  helper.accessor('weightKg', { header: 'Khối lượng', meta: { align: 'right' } satisfies ColumnMeta, cell: (i) => <span className="font-mono text-caption">{formatInteger(i.getValue())} kg</span> }),
  helper.accessor('dims', { header: 'Kích thước', meta: { align: 'right' } satisfies ColumnMeta, cell: (i) => <span className="font-mono text-caption text-text-2">{formatDimensions(...i.getValue()).replace(' mm', '')}</span> }),
])

export function CardTableSection() {
  return (
    <SheetSection
      id="card"
      number="06"
      title="Card & hàng bảng"
      description="Card: viền 1px, radius 8px, padding 20px, không bóng. Bảng: tiêu đề 12px/500 xám trên nền surface, số canh phải bằng mono, không kẻ sọc."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-0.5">
              <CardTitle>Hyundai HD210</CardTitle>
              <span className="font-mono text-caption text-text-3">60C-446.32</span>
            </div>
            <Badge tone="info">Đã tối ưu</Badge>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div className="flex justify-between text-body"><span className="text-text-2">Lấp đầy</span><span className="font-mono font-medium">87,4%</span></div>
            <div className="flex justify-between text-body"><span className="text-text-2">Tải trọng</span><span className="font-mono font-medium">8.240 / 9.500 kg</span></div>
            <Button variant="secondary" block>Xem phương án</Button>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2"><span className="text-body font-medium">Chế độ thoáng</span><span className="font-mono text-caption text-text-3">hàng 48px</span></div>
          <div className="overflow-hidden rounded-md border border-border">
            <DataTable data={ROWS.slice(0, 3)} columns={columns} density="comfortable" isRowSelected={(r) => r.stop === 3} />
          </div>
          <span className="text-caption text-text-3">Hàng cuối: trạng thái đã chọn (nền primary-bg)</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2"><span className="text-body font-medium">Chế độ gọn</span><span className="font-mono text-caption text-text-3">hàng 36px</span></div>
          <div className="overflow-hidden rounded-md border border-border">
            <DataTable data={ROWS} columns={columns} density="compact" isRowSelected={(r) => r.stop === 5} />
          </div>
          <span className="text-caption text-text-3">Dùng cho danh sách dài (kiện hàng, lịch sử)</span>
        </div>
      </div>
    </SheetSection>
  )
}

export function LegendSection() {
  const stops = STOP_COLORS.map((color, index) => ({ number: index + 1, color }))
  return (
    <SheetSection
      id="legend"
      number="07"
      title="Chú thích màu điểm giao"
      description="Bảng 8 màu Okabe–Ito, an toàn cho người mù màu. Chỉ dùng để định danh điểm giao. Chữ trên nền màu 1, 2, 4 là tối; còn lại là trắng."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
        <div className="flex flex-col gap-4 rounded-md border border-border p-5">
          <span className="text-caption font-medium text-text-3">Trên nền sáng · dạng dot</span>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {stops.map((s) => (
              <div key={s.number} className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 flex-none rounded-[3px]" style={{ background: s.color }} />
                <span className="flex-1 text-body">{stopLabel(s.number)}</span>
                <span className="font-mono text-caption text-text-3">{s.color}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] p-5">
          <span className="text-caption font-medium text-white/60">Trong vùng 3D · dạng tag</span>
          <div className="flex flex-wrap gap-2">
            {stops.map((s) => (
              <span key={s.number} className="inline-flex h-[22px] items-center rounded-[4px] px-2 text-caption font-semibold leading-none" style={{ background: s.color, color: stopForeground(s.number) }}>
                {stopLabel(s.number)}
              </span>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-8 gap-1">
            {stops.map((s) => <div key={s.number} className="h-10 rounded-[4px]" style={{ background: s.color }} />)}
          </div>
        </div>
      </div>
    </SheetSection>
  )
}
