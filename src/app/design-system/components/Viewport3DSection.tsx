import { useMemo, useState } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { createColorContext } from '@/features/viewer3d/colors'
import { AxleLoadPanel } from '@/features/viewer3d/overlays/AxleLoadPanel'
import { SlicePanel } from '@/features/viewer3d/overlays/SlicePanel'
import { StopLegend } from '@/features/viewer3d/overlays/StopLegend'
import { Timeline } from '@/features/viewer3d/Timeline'
import { LOAD_PLAN } from '@/lib/load-plan.mock'
import type { CameraPreset, ColorMode, PlaybackSpeed } from '@/types/load-plan'
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
  { value: 'don-hang', label: 'Theo đơn hàng' },
  { value: 'khoi-luong', label: 'Theo khối lượng' },
]

export function Viewport3DSection() {
  const plan = LOAD_PLAN
  const colorContext = useMemo(() => createColorContext(plan), [plan])
  const [camera, setCamera] = useState<CameraPreset>('goc-cheo')
  const [mode, setMode] = useState<ColorMode>('diem-giao')
  const [slice, setSlice] = useState(plan.vehicle.innerLengthMm)
  const [step, setStep] = useState(47)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(2)
  const total = plan.placements.length

  return (
    <SheetSection id="viewport" number="06" title="Thành phần 3D" description="Thẻ trắng nổi trên nền tối cho mọi điều khiển vùng 3D — nơi duy nhất được dùng bóng --e2 ngoài dropdown/modal/toast.">
      <SheetRow name="FloatingPanel · CameraBar · ColorModeBar · Legend" note="CameraBar 5 góc. ColorMode 3 chế độ; chú thích đổi theo chế độ (điểm giao / đơn hàng / dải khối lượng)." className="items-stretch">
        <DarkStage className="flex min-h-56 items-start justify-between">
          <SegmentedControl ariaLabel="Góc nhìn" options={CAMERAS} value={camera} onChange={setCamera} />
          <div className="flex flex-col items-end gap-2">
            <SegmentedControl ariaLabel="Chế độ tô màu" options={MODES} value={mode} onChange={setMode} />
            <StopLegend stops={plan.stops} colorMode={mode} colorContext={colorContext} />
          </div>
        </DarkStage>
      </SheetRow>

      <SheetRow name="AxleLoadGauge · SliceSlider · CalloutLabel" note="Gauge 2 thanh; thanh ≥ 90% chuyển warning, số cùng màu. Slider 0–7.200 mm bước 50, nhãn “Toàn bộ” khi tối đa. CalloutLabel gắn trên kiện đang chọn." className="items-stretch">
        <DarkStage className="flex min-h-56 items-end justify-between">
          <AxleLoadPanel front={plan.vehicle.frontAxle} rear={plan.vehicle.rearAxle} />
          <div className="mb-10 flex flex-col items-center">
            <span className="rounded-sm bg-bg px-2 py-1 font-mono text-[11px] leading-3.5 font-semibold text-text">PKG-00147</span>
            <span aria-hidden className="h-[34px] w-px bg-bg" />
          </div>
          <SlicePanel sliceMm={slice} maxMm={plan.vehicle.innerLengthMm} onChange={setSlice} />
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
