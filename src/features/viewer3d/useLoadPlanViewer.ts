import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  CameraPreset,
  ColorMode,
  LoadPlan,
  Orientation,
  Placement,
  PlaybackSpeed,
} from '@/types/load-plan'

/**
 * Toàn bộ state tương tác của màn xem phương án 3D.
 * Scene chỉ nhận giá trị và callback từ đây, không tự giữ state nghiệp vụ.
 */

/** Một bước phát lại ở tốc độ 1× — trong khoảng 400–700ms của mục 8. */
export const STEP_DURATION_MS = 600

export type LeftTab = 'unplaced' | 'pinned'

export function useLoadPlanViewer(
  plan: LoadPlan,
  { initialSelectedId }: { initialSelectedId?: string } = {},
) {
  const totalSteps = plan.placements.length
  const initialSelected = plan.placements.find((p) => p.id === initialSelectedId)

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('goc-cheo')
  const [colorMode, setColorMode] = useState<ColorMode>('diem-giao')
  const [sliceMm, setSliceMm] = useState(plan.vehicle.innerLengthMm)
  // Mở màn là thấy trọn phương án; timeline chỉ tua khi người dùng chủ động.
  const [step, setStepState] = useState(totalSteps)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(2)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelected?.id ?? null,
  )
  const [leftOpen, setLeftOpen] = useState(true)
  const [leftTab, setLeftTab] = useState<LeftTab>('unplaced')
  const [orientationOverrides, setOrientationOverrides] = useState<
    ReadonlyMap<string, Orientation>
  >(new Map())

  const setStep = useCallback(
    (next: number) => setStepState(Math.min(totalSteps, Math.max(1, next))),
    [totalSteps],
  )

  const stepForward = useCallback(() => setStepState((s) => Math.min(totalSteps, s + 1)), [totalSteps])
  const stepBackward = useCallback(() => setStepState((s) => Math.max(1, s - 1)), [])
  const goToStart = useCallback(() => {
    setPlaying(false)
    setStepState(1)
  }, [])

  const togglePlaying = useCallback(() => {
    setPlaying((current) => {
      // Bấm phát khi đã ở cuối thì xem lại từ đầu.
      if (!current && step >= totalSteps) setStepState(1)
      return !current
    })
  }, [step, totalSteps])

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setStepState((s) => {
        if (s >= totalSteps) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, STEP_DURATION_MS / speed)
    return () => window.clearInterval(id)
  }, [playing, speed, totalSteps])

  const toggleLeft = useCallback(() => setLeftOpen((o) => !o), [])

  const setOrientation = useCallback(
    (id: string, orientation: Orientation) =>
      setOrientationOverrides((current) => {
        const next = new Map(current)
        next.set(id, orientation)
        return next
      }),
    [],
  )

  const [pinnedOverrides, setPinnedOverrides] = useState<
    ReadonlyMap<string, boolean>
  >(new Map())

  const togglePinned = useCallback(
    (id: string) =>
      setPinnedOverrides((current) => {
        const base = plan.placements.find((p) => p.id === id)?.pinned ?? false
        const next = new Map(current)
        next.set(id, !(current.get(id) ?? base))
        return next
      }),
    [plan.placements],
  )

  /** Placement đã áp hướng xoay và trạng thái ghim người dùng chọn. */
  const placements = useMemo<Placement[]>(
    () =>
      plan.placements.map((p) => {
        const orientation = orientationOverrides.get(p.id)
        const pinned = pinnedOverrides.get(p.id)
        const rotated =
          orientation === undefined || orientation === p.orientation
            ? p
            : applyOrientation(p, orientation)
        return pinned === undefined || pinned === rotated.pinned
          ? rotated
          : { ...rotated, pinned }
      }),
    [plan.placements, orientationOverrides, pinnedOverrides],
  )

  const selected = useMemo(
    () => placements.find((p) => p.id === selectedId),
    [placements, selectedId],
  )

  return {
    placements,
    totalSteps,
    cameraPreset,
    setCameraPreset,
    colorMode,
    setColorMode,
    sliceMm,
    setSliceMm,
    step,
    setStep,
    stepForward,
    stepBackward,
    goToStart,
    playing,
    togglePlaying,
    speed,
    setSpeed,
    selectedId,
    selected,
    select: setSelectedId,
    leftOpen,
    toggleLeft,
    leftTab,
    setLeftTab,
    setOrientation,
    togglePinned,
  }
}

export type LoadPlanViewerState = ReturnType<typeof useLoadPlanViewer>

/**
 * Hoán vị kích thước theo hướng đặt, giữ nguyên góc gốc của kiện.
 * Luôn nhận placement gốc từ `plan.placements` (bộ tối ưu trả về ở hướng 0),
 * nên chỉ cần hoán vị một lần, không cần đảo ngược hướng cũ.
 * 0 D×R×C giữ nguyên · 1 R×D×C đổi dài↔rộng · 2 C×R×D đổi dài↔cao
 */
function applyOrientation(p: Placement, orientation: Orientation): Placement {
  switch (orientation) {
    case 0:
      return { ...p, orientation }
    case 1:
      return { ...p, orientation, lengthMm: p.widthMm, widthMm: p.lengthMm }
    case 2:
      return { ...p, orientation, lengthMm: p.heightMm, heightMm: p.lengthMm }
  }
}
