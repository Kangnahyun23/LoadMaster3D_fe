import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import type { CameraPreset, LoadPlan } from '@/types/load-plan'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import { adaptLoadPlan } from '@/features/viewer3d/scene-input'
import { deriveSceneSemantics } from './operations/scene-semantics'
import { SceneCanvas } from './scene/SceneCanvas'
import { usePerformanceFlags } from './usePerformanceFlags'
import { CAMERA_PRESETS, debugQualityTier } from './viewer-options'
import { createPerfStore, DebugOverlay } from './DebugOverlay'

/** Warehouse uses the same scene/units/instances as Planner, without editor UI. */
export function PositionViewer({ plan, current }: { plan: LoadPlan; current: Pick<ScenePlacement, 'id' | 'step' | 'stop'> }) {
  const model = useMemo(() => adaptLoadPlan(plan), [plan])
  const [preset, setPreset] = useState<CameraPreset>('goc-cheo')
  const [isolate, setIsolate] = useState(false)
  const [search] = useSearchParams()
  const flags = usePerformanceFlags(debugQualityTier(search), 'warehouse')
  const perf = useMemo(() => createPerfStore(), [])
  const semantics = useMemo(() => deriveSceneSemantics(model.placements, {
    kind: 'loading', step: current.step, isolateId: isolate ? current.id : null,
  }), [model, current.id, current.step, isolate])
  const next = model.placements.find((p) => p.id === semantics.nextId)
  return <div className="relative h-full min-h-80 overflow-hidden rounded-md bg-canvas-1">
    <SceneCanvas experience="warehouse" model={model} placements={model.placements} flags={flags} preset={preset}
      selectedId={current.id} onSelect={() => {}} step={current.step} semantics={semantics}
      decoration={false} xraySelection onPerfSample={search.has('debug') ? perf.publish : undefined} />
    <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-col gap-1 rounded-md bg-panel-dark p-3 text-body-lg text-bg">
      <span className="font-medium">Hiện tại: {current.id} · Điểm {current.stop}</span>
      <span>{next ? `Tiếp theo: ${next.id} · Điểm ${next.stop}` : 'Kiện cuối cùng'}</span>
    </div>
    <div className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-col items-center gap-2">
      <div className="pointer-events-auto flex max-w-full gap-2">
        <Button variant="secondary" className="h-14 px-3 text-body-lg" aria-pressed={isolate} onClick={() => setIsolate(!isolate)}>
          {isolate ? 'Hiện xung quanh' : 'Chỉ kiện này'}
        </Button>
        <select aria-label="Góc nhìn thùng xe" value={preset} onChange={(e) => setPreset(e.target.value as CameraPreset)}
          className="h-14 min-w-0 rounded-md border border-border bg-bg px-2 text-body-lg focus-visible:outline-2 focus-visible:outline-primary">
          {CAMERA_PRESETS.filter((p) => p.value !== 'truoc').map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <span className="text-center text-body-lg text-bg">Trầm: đã xếp · Mờ: tiếp theo · Viền: kiện đang xếp</span>
    </div>
    {search.has('debug') ? <DebugOverlay store={perf} className="bottom-28" /> : null}
  </div>
}
