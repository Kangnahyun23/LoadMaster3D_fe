import { useMemo, useState } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { createColorContext } from '@/features/viewer3d/colors'
import { AxleLoadPanel } from '@/features/viewer3d/overlays/AxleLoadPanel'
import { SlicePanel } from '@/features/viewer3d/overlays/SlicePanel'
import { StopLegend } from '@/features/viewer3d/overlays/StopLegend'
import { adaptResult } from '@/features/viewer3d/scene-input'
import { Timeline } from '@/features/viewer3d/Timeline'
import { useT } from '@/lib/i18n'
import { seedRevisions } from '@/lib/mock-db/seed-revisions'
import { seedTrip } from '@/lib/mock-db/seed-trip'
import type { CameraPreset, ColorMode, PlaybackSpeed } from '@/features/viewer3d/viewer-types'
import { SAMPLE_AXLES } from '../design-system.mock'
import { DarkStage, SheetRow, SheetSection } from '../SheetLayout'

const CAMERAS = [
  { value: 'truoc', key: 'front' },
  { value: 'cua-sau', key: 'rear' },
  { value: 'ben-hong', key: 'side' },
  { value: 'tren', key: 'top' },
  { value: 'goc-cheo', key: 'diagonal' },
] as const satisfies ReadonlyArray<{ value: CameraPreset; key: string }>
const MODES = [
  { value: 'diem-giao', key: 'stop' },
  { value: 'kien-goc', key: 'package' },
  { value: 'khoi-luong', key: 'weight' },
] as const satisfies ReadonlyArray<{ value: ColorMode; key: string }>

export function Viewport3DSection() {
  const t = useT()
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
  const cameras = CAMERAS.map(({ value, key }) => ({ value, label: t(`designSystem.components.navigation.cameras.${key}`) }))
  const modes = MODES.map(({ value, key }) => ({ value, label: t(`designSystem.components.viewport.modes.${key}`) }))

  return (
    <SheetSection id="viewport" number="06" title={t('designSystem.components.nav.viewport')} description={t('designSystem.components.viewport.description')}>
      <SheetRow name="FloatingPanel · CameraBar · ColorModeBar · Legend" note={t('designSystem.components.viewport.panelsNote')} className="items-stretch">
        <DarkStage className="flex min-h-56 items-start justify-between">
          <SegmentedControl<CameraPreset> ariaLabel={t('designSystem.components.navigation.view')} options={cameras} value={camera} onChange={setCamera} />
          <div className="flex flex-col items-end gap-2">
            <SegmentedControl<ColorMode> ariaLabel={t('designSystem.components.viewport.colorMode')} options={modes} value={mode} onChange={setMode} />
            <StopLegend stops={plan.stops} colorMode={mode} colorContext={colorContext} />
          </div>
        </DarkStage>
      </SheetRow>

      <SheetRow name="AxleLoadGauge · SliceSlider · CalloutLabel" note={t('designSystem.components.viewport.axleNote')} className="items-stretch">
        <DarkStage className="flex min-h-56 items-end justify-between">
          <AxleLoadPanel compact axles={SAMPLE_AXLES} />
          <div className="mb-10 flex flex-col items-center">
            <span className="rounded-sm bg-bg px-2 py-1 font-mono text-[11px] leading-3.5 font-semibold text-text">PKG-00147</span>
            <span aria-hidden className="h-[34px] w-px bg-bg" />
          </div>
          <SlicePanel sliceCm={slice} maxCm={plan.vehicle.innerLengthCm} onChange={setSlice} />
        </DarkStage>
      </SheetRow>

      <SheetRow name="TimelineBar" note={t('designSystem.components.viewport.timelineNote')} className="items-stretch">
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
