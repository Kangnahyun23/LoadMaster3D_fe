import { useMemo, useState } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { createColorContext } from '@/features/viewer3d/colors'
import { AxleLoadPanel } from '@/features/viewer3d/overlays/AxleLoadPanel'
import { SlicePanel } from '@/features/viewer3d/overlays/SlicePanel'
import { StopLegend } from '@/features/viewer3d/overlays/StopLegend'
import { adaptResult } from '@/features/viewer3d/scene-input'
import { Timeline } from '@/features/viewer3d/Timeline'
import { seedRevisions } from '@/lib/mock-db/seed-revisions'
import { seedTrip } from '@/lib/mock-db/seed-trip'
import type { CameraPreset, ColorMode, PlaybackSpeed } from '@/features/viewer3d/viewer-types'
import { DarkStage, SheetRow, SheetSection } from '../SheetLayout'

const CAMERAS: ReadonlyArray<{ value: CameraPreset; label: string }> = [
  { value: 'truoc', label: 'Trước' },
  { value: 'cua-sau', label: 'Cửa sau' },
  { value: 'ben-hong', label: 'Bên hông' },
  { value: 'tren', label: 'Trên' },
  { value: 'goc-cheo', label: 'Góc chéo' },
]
const MODES: ReadonlyArray<{ value: ColorMode; label: string }> = [
  { value: 'diem-giao', label: 'Theo điểm giao' },
  { value: 'kien-goc', label: 'Theo kiện gốc' },
  { value: 'khoi-luong', label: 'Theo khối lượng' },
]

export function Viewport3DSection() {
  // Revision đã duyệt của chuyến seed — cùng dữ liệu Planner mở mặc định, không dựng phương án riêng cho trang tài liệu.
  const plan = useMemo(() => {
    const approved = seedRevisions().findLast((revision) => revision.approvedAt !== undefined)
    if (!approved) throw new Error('seed has no approved revision')
    return adaptResult({ trip: seedTrip(), revision: approved })
  }, [])
  const colorContext = useMemo(() => createColorContext(plan), [plan])
  const [camera, setCamera] = useState<CameraPreset>('goc-cheo')
  const [mode, setMode] = useState<ColorMode>('diem-giao')
  const [slice, setSlice] = useState(plan.vehicle.innerLengthCm)
  const [step, setStep] = useState(47)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(2)
  const total = plan.placements.length

  return (
    <SheetSection id="viewport" number="06" title="Thành phần 3D" description="Thẻ trắng nổi trên nền tối cho mọi điều khiển vùng 3D — nơi duy nhất được dùng bóng --e2 ngoài dropdown/modal/toast.">
      <SheetRow name="FloatingPanel · CameraBar · ColorModeBar · Legend" note="CameraBar 5 góc. ColorMode 3 chế độ; chú thích đổi theo chế độ (điểm giao / kiện gốc / dải khối lượng)." className="items-stretch">
        <DarkStage className="flex min-h-56 items-start justify-between">
          <SegmentedControl ariaLabel="Góc nhìn" options={CAMERAS} value={camera} onChange={setCamera} />
          <div className="flex flex-col items-end gap-2">
            <SegmentedControl ariaLabel="Chế độ tô màu" options={MODES} value={mode} onChange={setMode} />
            <StopLegend stops={plan.stops} colorMode={mode} colorContext={colorContext} />
          </div>
        </DarkStage>
      </SheetRow>

      <SheetRow name="AxleLoadGauge · SliceSlider · CalloutLabel" note="Tải trục chỉ nhãn “Sẽ có sau” và cấu hình trục, không số tải (Spec 7.10). Slider 0–720 cm bước 5, nhãn “Toàn bộ” khi tối đa. CalloutLabel gắn trên kiện đang chọn." className="items-stretch">
        <DarkStage className="flex min-h-56 items-end justify-between">
          <AxleLoadPanel compact axles={[{ id: 'AXLE-01', name: 'Trục trước', positionXCm: -120, emptyLoadKg: 2100, maxLoadKg: 4000 }, { id: 'AXLE-02', name: 'Trục sau', positionXCm: 430, emptyLoadKg: 2900, maxLoadKg: 5500 }]} />
          <div className="mb-10 flex flex-col items-center">
            <span className="rounded-sm bg-bg px-2 py-1 font-mono text-[11px] leading-3.5 font-semibold text-text">PKG-00147</span>
            <span aria-hidden className="h-[34px] w-px bg-bg" />
          </div>
          <SlicePanel sliceCm={slice} maxCm={plan.vehicle.innerLengthCm} onChange={setSlice} />
        </DarkStage>
      </SheetRow>

      <SheetRow name="TimelineBar" note="Điều khiển phát: Về đầu · Lùi · Phát/Tạm dừng · Tiến. Dải 132 bước tô theo điểm giao, bước tương lai mờ .28, vạch hiện tại 2px. Phím tắt Space, ←/→, Home." className="items-stretch">
        <div className="w-full overflow-hidden rounded-md border border-border">
          <Timeline
            placements={plan.placements}
            step={step}
            totalSteps={total}
            playing={playing}
            speed={speed}
            onStepChange={setStep}
            onStepForward={() => setStep((s) => Math.min(total, s + 1))}
            onStepBackward={() => setStep((s) => Math.max(1, s - 1))}
            onGoToStart={() => setStep(1)}
            onTogglePlaying={() => setPlaying((p) => !p)}
            onSpeedChange={setSpeed}
          />
        </div>
      </SheetRow>
    </SheetSection>
  )
}
