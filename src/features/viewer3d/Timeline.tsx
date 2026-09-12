import { ChevronLeft, ChevronRight, Pause, Play, SkipBack } from 'lucide-react'
import { useMemo, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { formatInteger } from '@/lib/format'
import { stopColor } from '@/lib/stops'
import type { Placement, PlaybackSpeed } from '@/types/load-plan'

const SPEEDS = [
  { value: 1 as PlaybackSpeed, label: '1×' },
  { value: 2 as PlaybackSpeed, label: '2×' },
  { value: 4 as PlaybackSpeed, label: '4×' },
] as const

/** Cột thấp nhất và cao nhất của dải thời gian, px */
const BAR_MIN = 14
const BAR_MAX = 44

/**
 * Thanh phát lại thứ tự xếp. Mỗi cột là một kiện, màu theo điểm giao,
 * chiều cao theo chiều cao kiện; cột đã xếp tới bước hiện tại thì đậm.
 */
export function Timeline({
  placements,
  step,
  totalSteps,
  playing,
  speed,
  onStepChange,
  onStepForward,
  onStepBackward,
  onGoToStart,
  onTogglePlaying,
  onSpeedChange,
}: {
  placements: Placement[]
  step: number
  totalSteps: number
  playing: boolean
  speed: PlaybackSpeed
  onStepChange: (step: number) => void
  onStepForward: () => void
  onStepBackward: () => void
  onGoToStart: () => void
  onTogglePlaying: () => void
  onSpeedChange: (speed: PlaybackSpeed) => void
}) {
  const ordered = useMemo(
    () => [...placements].sort((a, b) => a.step - b.step),
    [placements],
  )
  const maxHeight = useMemo(
    () => Math.max(...ordered.map((p) => p.heightMm), 1),
    [ordered],
  )
  const first = ordered[0]
  const last = ordered[ordered.length - 1]
  const percent = Math.round((step / totalSteps) * 100)
  const markerLeft = `${(((step - 0.5) / totalSteps) * 100).toFixed(2)}%`

  return (
    <div className="flex h-30 flex-none items-center gap-5 border-t border-border bg-bg px-5">
      <div className="flex flex-none items-center gap-1">
        <Button variant="secondary" size="icon" aria-label="Về đầu" onClick={onGoToStart}>
          <SkipBack className="size-4" strokeWidth={1.5} />
        </Button>
        <Button variant="secondary" size="icon" aria-label="Lùi một bước" onClick={onStepBackward} disabled={step <= 1}>
          <ChevronLeft className="size-4" strokeWidth={1.5} />
        </Button>
        <Button
          variant="primary"
          size="icon"
          className="mx-1 size-11"
          aria-label={playing ? 'Tạm dừng' : 'Phát'}
          aria-pressed={playing}
          onClick={onTogglePlaying}
        >
          {playing ? <Pause className="size-4.5 fill-current" strokeWidth={0} /> : <Play className="size-4.5 fill-current" strokeWidth={0} />}
        </Button>
        <Button variant="secondary" size="icon" aria-label="Tiến một bước" onClick={onStepForward} disabled={step >= totalSteps}>
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="flex min-w-30 flex-none flex-col gap-0.5">
        <span className="text-[11px] leading-3.5 text-text-3">Bước xếp</span>
        <span className="font-mono text-[18px] leading-6 font-semibold tracking-[-0.01em]">
          {formatInteger(step)}{' '}
          <span className="text-body font-normal text-text-3">/ {formatInteger(totalSteps)}</span>
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div aria-hidden className="relative flex h-11 items-end gap-px px-px">
          {ordered.map((p) => (
            <span
              key={p.id}
              className="min-w-0 flex-1 rounded-px transition-opacity duration-(--dur-fast)"
              style={{
                height: BAR_MIN + (BAR_MAX - BAR_MIN) * (p.heightMm / maxHeight),
                background: stopColor(p.stop),
                opacity: p.step <= step ? 1 : 0.28,
              }}
            />
          ))}
          <span className="absolute -top-1 -bottom-1 w-0.5 rounded-px bg-text" style={{ left: markerLeft }} />
        </div>

        <input
          type="range"
          className="lm-range lm-range-thin"
          min={1}
          max={totalSteps}
          step={1}
          value={step}
          onChange={(event) => onStepChange(Number(event.target.value))}
          aria-label="Bước xếp"
          aria-valuetext={`Bước ${step} trên ${totalSteps}`}
          style={{ '--lm-range-fill': `${percent}%` } as CSSProperties}
        />

        <div className="flex justify-between text-[11px] leading-3.5 text-text-3">
          {first ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-xs" style={{ background: stopColor(first.stop) }} />
              Điểm {first.stop} xếp trước
            </span>
          ) : <span />}
          <span className="font-mono">{percent}%</span>
          {last ? (
            <span className="inline-flex items-center gap-1.5">
              Điểm {last.stop} xếp sau cùng
              <span aria-hidden className="size-2 rounded-xs" style={{ background: stopColor(last.stop) }} />
            </span>
          ) : <span />}
        </div>
      </div>

      <div className="flex min-w-24 flex-none flex-col items-end gap-0.5">
        <span className="text-[11px] leading-3.5 text-text-3">Tốc độ</span>
        <SegmentedControl
          ariaLabel="Tốc độ phát"
          size="sm"
          mono
          floating={false}
          options={SPEEDS}
          value={speed}
          onChange={onSpeedChange}
        />
      </div>
    </div>
  )
}
