import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { formatInteger } from '@/lib/format'
import { ORIENTATION_LABELS, type CameraPreset, type LoadPlan, type Placement, type PlaybackSpeed } from '@/types/load-plan'
import { SceneCanvas } from './scene/SceneCanvas'
import { usePerformanceFlags } from './usePerformanceFlags'
import { adaptLoadPlan } from './viewer-scene-model'
import { deriveSceneSemantics } from './operations/scene-semantics'
import { useUnloadPlayback } from './operations/useUnloadPlayback'
import { BlockerPanel } from './operations/BlockerPanel'
import { placementMeasurements } from './operations/placement-measurements'
import { createPerfStore, DebugOverlay } from './DebugOverlay'
import { benchmarkCountFromSearch, createBenchmarkPlan } from './benchmark.mock'
import { debugQualityTier } from './viewer-options'
import { Timeline } from './Timeline'

export function DriverCargoViewer({ plan: source, stopNumber, doneIds, retainedIds }: {
  plan: LoadPlan; stopNumber: number; doneIds: ReadonlySet<string>; retainedIds: ReadonlySet<string>
}) {
  const [search] = useSearchParams()
  const count = benchmarkCountFromSearch(search.toString())
  const plan = useMemo(() => count ? createBenchmarkPlan(count) : source, [count, source])
  const model = useMemo(() => adaptLoadPlan(plan), [plan])
  const available = useMemo(() => model.placements.filter((p) => p.stop === stopNumber && !doneIds.has(p.id) && !retainedIds.has(p.id)),
    [model, stopNumber, doneIds, retainedIds])
  const [speed, setSpeed] = useState<PlaybackSpeed>(2)
  const unload = useUnloadPlayback(available, speed)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preset, setPreset] = useState<CameraPreset>('cua-sau')
  const [focus, setFocus] = useState<{ placement: Placement; request: number } | null>(null)
  const [inspect, setInspect] = useState(true)
  const flags = usePerformanceFlags(debugQualityTier(search), 'driver')
  const perf = useMemo(() => createPerfStore(), [])
  const removed = useMemo(() => new Set([...doneIds, ...unload.unloadedIds]), [doneIds, unload.unloadedIds])
  const selected = model.placements.find((p) => p.id === selectedId && !removed.has(p.id) && p.stop >= stopNumber) ?? unload.current
  const semantics = useMemo(() => deriveSceneSemantics(model.placements, model.vehicle, {
    kind: 'unloading', step: 0, focusStop: stopNumber, unloadedIds: removed,
    currentId: unload.current?.id, nextId: unload.next?.id, inspectId: inspect ? selected?.id : null,
  }), [model, stopNumber, removed, unload.current, unload.next, inspect, selected])
  const measurements = selected ? placementMeasurements(selected, model.placements, model.vehicle) : null
  const stop = model.stops.find((s) => s.number === stopNumber)
  const handleFocus = (p: Placement) => { setSelectedId(p.id); setFocus((f) => ({ placement: p, request: (f?.request ?? 0) + 1 })) }
  return <div className="flex min-h-0 flex-1 flex-col text-body-lg">
    <div className="flex flex-none flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
      <p>Điểm {stopNumber} / {model.stops.length} · {stop?.name}</p>
      <select aria-label="Góc nhìn hàng" value={preset} onChange={(e) => setPreset(e.target.value as CameraPreset)}
        className="h-14 rounded-md border border-border bg-bg px-2 focus-visible:outline-2 focus-visible:outline-primary">
        <option value="cua-sau">Cửa sau</option><option value="tren">Trên</option><option value="goc-cheo">Góc chéo</option><option value="ben-hong">Bên hông</option>
      </select>
    </div>
    <div className="relative min-h-48 flex-1 bg-canvas-1">
      <SceneCanvas experience="driver" model={model} placements={model.placements} flags={flags} preset={preset} focus={focus}
        selectedId={selected?.id ?? null} onSelect={setSelectedId} step={0} semantics={semantics} animateLoading={false}
        decoration={false} showDistribution onPerfSample={search.has('debug') ? perf.publish : undefined}
        unloadMotion={{ cursor: unload.cursor, placement: unload.ordered[unload.cursor - 1], durationMs: 520 / speed }} />
      {search.has('debug') ? <DebugOverlay store={perf} className="top-2 bottom-auto left-2 translate-x-0" /> : null}
    </div>
    <div className="max-h-[30dvh] shrink-0 overflow-y-auto border-t border-border p-3">
      <p className="font-medium">Thứ tự dỡ gợi ý · Mô phỏng không đánh dấu giao hàng</p>
      <p className="mt-1">{unload.current ? `Hiện tại ${unload.current.id}` : 'Đã xem hết các kiện cần dỡ'}{unload.next ? ` · Tiếp theo ${unload.next.id}` : ''}</p>
      {selected && measurements ? <>
        <div className="my-2 flex flex-wrap gap-2">
          <Button variant="secondary" size="touch" onClick={() => handleFocus(selected)}>Tập trung vào kiện</Button>
          <Button variant="secondary" size="touch" aria-pressed={inspect} onClick={() => setInspect(!inspect)}>{inspect ? 'Ẩn' : 'Xem'} kiện có thể cản đường</Button>
        </div>
        <p>{selected.id} · Điểm {selected.stop} · {ORIENTATION_LABELS[selected.orientation]}</p>
        <p>Cách cửa {formatInteger(measurements.rearMm)} mm · vách trái {formatInteger(measurements.leftMm)} mm · Lớp {measurements.layer}</p>
        {retainedIds.has(selected.id) ? <p>Kiện khách từ chối, còn trên xe; không đưa vào mô phỏng dỡ.</p> : null}
        {inspect ? <BlockerPanel target={selected} blockers={semantics.blockers} onSelect={handleFocus} /> : null}
      </> : null}
    </div>
    <Timeline placements={available} orderedOverride={unload.ordered} kind="unloading" step={unload.cursor} totalSteps={unload.ordered.length}
      playing={unload.playing} speed={speed} onSpeedChange={setSpeed} onStepChange={unload.setCursor}
      onStepForward={() => unload.setCursor(unload.cursor + 1)} onStepBackward={() => unload.setCursor(unload.cursor - 1)}
      onGoToStart={() => { unload.stop(); unload.setCursor(0) }} onTogglePlaying={unload.toggle} />
  </div>
}
