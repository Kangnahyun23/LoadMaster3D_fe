import { ChevronLeft, ChevronRight, Pause, Play, SkipBack } from 'lucide-react'
import { useMemo, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { formatInteger } from '@/lib/format'
import { stopColor } from '@/lib/stops'
import type { Placement, PlaybackSpeed } from '@/types/load-plan'
import { timelineBins } from './operations/operations-model'

const SPEEDS = [{ value: 1, label: '1×' }, { value: 2, label: '2×' }, { value: 4, label: '4×' }] as const
export type TimelineProps = {
  placements: readonly Placement[]; step: number; totalSteps: number; playing: boolean; speed: PlaybackSpeed
  onStepChange: (step: number) => void; onStepForward: () => void; onStepBackward: () => void
  onGoToStart: () => void; onTogglePlaying: () => void; onSpeedChange: (speed: PlaybackSpeed) => void
  kind?: 'loading' | 'unloading'
  orderedOverride?: readonly Placement[]
}

/** At most 80 visual bins; the slider retains full step resolution. */
export function Timeline({ placements, step, totalSteps, playing, speed, onStepChange, onStepForward,
  onStepBackward, onGoToStart, onTogglePlaying, onSpeedChange, kind = 'loading', orderedOverride }: TimelineProps) {
  const ordered = useMemo(() => orderedOverride ?? [...placements].sort((a, b) => a.step - b.step), [placements, orderedOverride])
  const bins = useMemo(() => timelineBins(ordered), [ordered])
  const maxHeight = Math.max(...bins.map((bin) => bin.heightMm), 1)
  const progress = kind === 'unloading' ? step : ordered.filter((p) => p.step <= step).length
  const minimum = kind === 'loading' && totalSteps ? 1 : 0
  const percent = totalSteps ? Math.round(step / totalSteps * 100) : 0
  const label = kind === 'loading' ? 'Bước xếp' : 'Đã dỡ (gợi ý)'
  const cue = kind === 'loading' ? 'xếp' : 'dỡ'
  return <div className="flex flex-none flex-wrap items-center gap-2 border-t border-border bg-bg p-2 text-body-lg xl:h-30 xl:flex-nowrap xl:gap-5 xl:px-5 xl:text-body">
    <div className="flex items-center gap-1">
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label="Về đầu" onClick={onGoToStart} disabled={!totalSteps}><SkipBack strokeWidth={1.5} /></Button>
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label="Lùi một bước" onClick={onStepBackward} disabled={step <= minimum}><ChevronLeft strokeWidth={1.5} /></Button>
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label={playing ? 'Tạm dừng' : 'Phát'} aria-pressed={playing} onClick={onTogglePlaying} disabled={!totalSteps}>
        {playing ? <Pause strokeWidth={1.5} /> : <Play strokeWidth={1.5} />}
      </Button>
      <Button variant="secondary" className="size-14 p-0 xl:size-11" aria-label="Tiến một bước" onClick={onStepForward} disabled={step >= totalSteps}><ChevronRight strokeWidth={1.5} /></Button>
    </div>
    <div className="ml-auto flex flex-col xl:ml-0"><span>{label}</span><span className="font-mono">{formatInteger(step)} / {formatInteger(totalSteps)}</span></div>
    <div className="order-last flex min-w-0 basis-full flex-col gap-1 xl:order-none xl:flex-1 xl:basis-auto">
      <div aria-hidden className="relative hidden h-11 items-end gap-px sm:flex" data-timeline-bins={bins.length}>
        {bins.map((bin) => <span key={bin.start} className="flex min-w-0 flex-1 overflow-hidden rounded-sm"
          style={{ height: 14 + 30 * bin.heightMm / maxHeight, opacity: bin.end <= progress ? 1 : 0.3 }}>
          {bin.stops.map((part) => <span key={part.stop} style={{ width: `${part.ratio * 100}%`, background: stopColor(part.stop) }} />)}
        </span>)}
        <span className="absolute inset-y-0 w-0.5 bg-text" style={{ left: `${ordered.length ? progress / ordered.length * 100 : 0}%` }} />
      </div>
      <input type="range" className="lm-range min-h-11 xl:min-h-0" min={minimum} max={totalSteps || minimum} step={1} value={step}
        disabled={!totalSteps} onChange={(e) => onStepChange(Number(e.target.value))} aria-label={label}
        aria-valuetext={`${label}: ${formatInteger(step)} trên ${formatInteger(totalSteps)}`}
        style={{ '--lm-range-fill': `${percent}%` } as CSSProperties} />
      <div className="hidden justify-between text-caption text-text-2 xl:flex">
        <span>{ordered[0] ? `Điểm ${ordered[0].stop} ${cue} trước` : ''}</span><span>{percent}%</span>
        <span>{ordered.at(-1) ? `Điểm ${ordered.at(-1)!.stop} ${cue} sau cùng` : ''}</span>
      </div>
    </div>
    <div className="ml-auto hidden flex-col xl:flex"><span>Tốc độ</span>
      <SegmentedControl ariaLabel="Tốc độ phát" size="sm" mono floating={false} options={SPEEDS} value={speed} onChange={onSpeedChange} />
    </div>
  </div>
}