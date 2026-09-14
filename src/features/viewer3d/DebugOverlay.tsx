import { useSyncExternalStore } from 'react'
import { formatDecimal, formatInteger } from '@/lib/format'
import type { PerfSample } from './scene/PerfProbe'
import { cn } from '@/lib/utils'

/** Debug có subscription riêng để mẫu FPS không render lại trang hoặc Canvas. */
export function createPerfStore() {
  let snapshot: PerfSample | null = null
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    publish: (sample: PerfSample) => {
      snapshot = sample
      listeners.forEach((listener) => listener())
    },
  }
}

export type PerfStore = ReturnType<typeof createPerfStore>

export function DebugOverlay({ store, className }: { store: PerfStore; className?: string }) {
  const sample = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  if (!sample) return null

  return (
    <output
      data-viewer-performance
      data-fps={sample.fps ?? ''}
      data-frame-time-ms={sample.frameTimeMs ?? ''}
      data-draw-calls={sample.drawCalls}
      data-triangles={sample.triangles}
      data-placement-count={sample.placementCount}
      data-dpr={sample.dpr}
      data-quality-tier={sample.qualityTier}
      data-rendered-frames={sample.renderedFrames}
      data-idle={sample.idle}
      aria-live="off"
      title="FPS và khoảng cách frame chỉ đo khi có chuyển động; không phải thời gian GPU. Scene nghỉ sẽ ngừng vẽ."
      className={cn('pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col gap-1 rounded-sm border border-border-dark bg-panel-dark px-3 py-2 font-mono text-caption whitespace-nowrap text-bg', className)}
    >
      <span>
        {sample.idle ? 'Đang nghỉ' : sample.fps === null ? 'Đang lấy mẫu FPS' : `${formatInteger(sample.fps)} FPS`}
        {' · '}{sample.frameTimeMs === null ? '—' : formatDecimal(sample.frameTimeMs)} ms/frame
      </span>
      <span>{formatInteger(sample.drawCalls)} draw calls · {formatInteger(sample.triangles)} tam giác</span>
      <span>{formatInteger(sample.placementCount)} kiện · DPR {formatDecimal(sample.dpr)} · {sample.qualityTier}</span>
    </output>
  )
}
