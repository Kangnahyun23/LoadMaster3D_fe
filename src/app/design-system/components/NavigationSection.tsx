import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { NavRail } from '@/app/NavRail'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { TabCount, Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Sample, SheetRow, SheetSection } from '../SheetLayout'

const CAMERAS = [
  { value: 'truoc', label: 'Trước' },
  { value: 'cua-sau', label: 'Cửa sau' },
  { value: 'goc-cheo', label: 'Góc chéo' },
] as const

export function NavigationSection() {
  const [camera, setCamera] = useState<(typeof CAMERAS)[number]['value']>('goc-cheo')
  const [speed, setSpeed] = useState<1 | 2 | 4>(2)

  return (
    <SheetSection id="nav" number="01" title="Điều hướng">
      <SheetRow name="NavRail" note="Biến thể: mặc định · mục active · có tooltip. Rộng 72px, nút 44px, icon 20px stroke 1.5.">
        <div className="flex h-90 overflow-hidden rounded-md border border-border">
          <NavRail />
          <div className="flex-1 bg-bg" />
        </div>
      </SheetRow>

      <SheetRow name="PageHeader" note="Chuẩn 72px (dispatcher) · mỏng 56px (màn 3D) · máy tính bảng 72px có tiến trình." className="flex-col items-stretch">
        <Sample label="chuẩn 72px">
          <div className="flex h-18 items-center gap-4 rounded-md border border-border px-8">
            <Button variant="ghost" size="icon" aria-label="Quay lại"><ChevronLeft strokeWidth={1.5} /></Button>
            <span className="font-mono text-[22px] font-semibold tracking-[-0.02em]">TRIP-2026-0914</span>
            <StatusBadge status="nhap" />
            <div className="flex-1" />
            <Button variant="secondary">Lưu nháp</Button>
            <Button variant="primary">Chạy tối ưu</Button>
          </div>
        </Sample>
        <Sample label="mỏng 56px">
          <div className="flex h-14 items-center gap-4 rounded-md border border-border px-5">
            <Button variant="ghost" size="icon" aria-label="Quay lại"><ChevronLeft strokeWidth={1.5} /></Button>
            <span className="font-mono text-[18px] font-semibold tracking-[-0.02em]">TRIP-2026-0914</span>
            <StatusBadge status="da_toi_uu" />
            <div className="flex-1" />
            <Button variant="primary" className="h-9 px-3.5">Duyệt phương án</Button>
          </div>
        </Sample>
      </SheetRow>

      <SheetRow name="Tabs · SegmentedControl" note="Tabs có đếm · Segmented cho bộ chọn nhỏ (camera, chế độ màu, tốc độ)." className="flex-col items-stretch">
        <Sample label="Tabs có đếm">
          <Tabs defaultValue="unplaced" className="w-70 rounded-md border border-border">
            <TabsList>
              <TabsTrigger value="unplaced">Kiện chưa xếp <TabCount tone="danger">{3}</TabCount></TabsTrigger>
              <TabsTrigger value="pinned">Kiện đã ghim <TabCount>{2}</TabCount></TabsTrigger>
            </TabsList>
          </Tabs>
        </Sample>
        <div className="flex flex-wrap items-end gap-6">
          <Sample label="segmented · md (nổi trên 3D)">
            <SegmentedControl ariaLabel="Góc nhìn" options={CAMERAS} value={camera} onChange={setCamera} />
          </Sample>
          <Sample label="segmented · sm mono">
            <SegmentedControl ariaLabel="Tốc độ" size="sm" mono floating={false} options={[{ value: 1, label: '1×' }, { value: 2, label: '2×' }, { value: 4, label: '4×' }]} value={speed} onChange={setSpeed} />
          </Sample>
        </div>
      </SheetRow>

      <SheetRow name="SidePanel" note="Trái 280px (thu gọn 48px) · phải 360px. Tiêu đề 44px, viền 1px.">
        <div className="flex h-40 w-full overflow-hidden rounded-md border border-border">
          <aside className="flex w-70 flex-none flex-col border-r border-border">
            <div className="flex h-11 items-center justify-between border-b border-border pr-2 pl-4 text-body font-medium">Danh sách kiện<Button variant="ghost" size="icon" className="size-8" aria-label="Thu gọn"><ChevronLeft strokeWidth={1.5} /></Button></div>
          </aside>
          <div className="flex-1 bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)]" />
          <aside className="flex w-90 flex-none flex-col border-l border-border">
            <div className="flex h-11 items-center border-b border-border pl-4 text-body font-medium">Kiện đang chọn</div>
          </aside>
        </div>
      </SheetRow>
    </SheetSection>
  )
}
