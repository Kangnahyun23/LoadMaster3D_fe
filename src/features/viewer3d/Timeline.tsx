import { ChevronLeft, ChevronRight, Pause, Play, SkipBack } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { formatInteger } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { stopColor } from '@/lib/stops'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { PlaybackSpeed } from '@/features/viewer3d/viewer-types'
import { timelineBins } from './operations/operations-model'

export type TimelineProps = {
  placements: readonly ScenePlacement[]; step: number; totalSteps: number; playing: boolean; speed: PlaybackSpeed
  onStepChange: (step: number) => void; onStepForward: () => void; onStepBackward: () => void
  onGoToStart: () => void; onTogglePlaying: () => void; onSpeedChange: (speed: PlaybackSpeed) => void
  kind?: 'loading' | 'unloading'; orderedOverride?: readonly ScenePlacement[]
  /** Thứ tự dỡ do FE suy ra (phương án cũ không có `unloadingOrder`): nhãn ghi "gợi ý" */
  suggested?: boolean
}

/** Equal-height operation cells; density follows available rail width, never cargo count. */
export function Timeline({ placements, step, totalSteps, playing, speed, onStepChange, onStepForward,
  onStepBackward, onGoToStart, onTogglePlaying, onSpeedChange, kind = 'loading', orderedOverride, suggested = false }: TimelineProps) {
  const t = useT()
  const rail = useRef<HTMLDivElement>(null)
  const [budget, setBudget] = useState(32)
  useEffect(() => {
    if (!rail.current) return
    const observer = new ResizeObserver(([entry]) => setBudget(Math.max(8, Math.min(64, Math.floor((entry?.contentRect.width ?? 400) / 18)))))
    observer.observe(rail.current); return () => observer.disconnect()
  }, [])
  const ordered = useMemo(() => orderedOverride ?? [...placements].sort((a, b) => a.step - b.step), [placements, orderedOverride])
  const bins = useMemo(() => timelineBins(ordered, budget), [ordered, budget])
  const progress = kind === 'unloading' ? step : ordered.filter((p) => p.step <= step).length
  const currentIndex = kind === 'unloading' ? progress : progress - 1
  const minimum = kind === 'loading' && totalSteps ? 1 : 0
  const percent = totalSteps ? Math.round(step / totalSteps * 100) : 0
  const label = kind === 'loading' ? 'Bước xếp' : t(suggested ? 'viewer.operations.suggestedUnloaded' : 'viewer.operations.unloaded')
  const current = ordered[currentIndex], next = ordered[currentIndex + 1]
  return <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-bg px-3 py-2 text-body-lg sm:flex-nowrap xl:px-5 xl:text-body" data-operation-timeline>
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label="Về đầu" onClick={onGoToStart} disabled={!totalSteps}><SkipBack strokeWidth={1.5} /></Button>
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label="Lùi một bước" onClick={onStepBackward} disabled={step <= minimum}><ChevronLeft strokeWidth={1.5} /></Button>
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label={playing ? 'Tạm dừng' : 'Phát'} aria-pressed={playing} onClick={onTogglePlaying} disabled={!totalSteps}>
        {playing ? <Pause strokeWidth={1.5} /> : <Play strokeWidth={1.5} />}
      </Button>
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label="Tiến một bước" onClick={onStepForward} disabled={step >= totalSteps}><ChevronRight strokeWidth={1.5} /></Button>
    </div>
    <div className="ml-auto shrink-0 sm:ml-0"><span className="block text-text-2">{label}</span><span className="font-mono">{formatInteger(step)} / {formatInteger(totalSteps)}</span></div>
    <div className="order-last min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-auto">
      <div className="mb-2 hidden justify-between gap-4 text-caption text-text-2 lg:flex">
        <span>{current ? `Hiện tại · Điểm ${current.stop} · ${current.id}` : 'Hoàn tất mô phỏng'}</span>
        <span>{next ? `Tiếp theo · Điểm ${next.stop}` : ''}</span>
      </div>
      <div ref={rail} aria-hidden className="relative flex h-8 items-center gap-0.5" data-timeline-bins={bins.length}>
        {bins.map((bin, i) => {
          const dominant = [...bin.stops].sort((a, b) => b.ratio - a.ratio)[0]!
          const active = currentIndex >= bin.start && currentIndex < bin.end
          const boundary = i > 0 && bins[i - 1]!.stops.at(-1)?.stop !== bin.stops[0]?.stop
          return <span key={bin.start} data-sequence-cell data-current={active} title={bin.stops.map((s) => `Điểm ${s.stop}`).join(' / ')}
            className="relative h-8 min-w-0 flex-1 rounded-sm border border-border"
            style={{ background: stopColor(dominant.stop), opacity: active || bin.end <= progress ? 1 : 0.35, marginLeft: boundary ? 4 : 0 }}>
            {bin.stops.length > 1 ? <span className="absolute inset-x-1 bottom-1 h-1 rounded-sm bg-bg" /> : null}
            {active ? <span className="absolute -inset-0.5 rounded-sm border-2 border-text"><span className="absolute -top-1.5 left-1/2 h-1 w-2 -translate-x-1/2 bg-text" /></span> : null}
          </span>
        })}
      </div>
      <input type="range" className="lm-range min-h-8 xl:min-h-5" min={minimum} max={totalSteps || minimum} step={1} value={step}
        disabled={!totalSteps} onChange={(e) => onStepChange(Number(e.target.value))} aria-label={label}
        aria-valuetext={`${label}: ${formatInteger(step)} trên ${formatInteger(totalSteps)}`}
        style={{ '--lm-range-fill': `${percent}%` } as CSSProperties} />
    </div>
    <label className="hidden shrink-0 flex-col text-caption text-text-2 sm:flex">Tốc độ
      <select aria-label="Tốc độ phát" value={speed} onChange={(e) => onSpeedChange(Number(e.target.value) as PlaybackSpeed)}
        className="h-14 rounded-md border border-border bg-bg px-2 font-mono text-body-lg text-text xl:h-11 xl:text-body">
        <option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
      </select>
    </label>
  </div>
}
