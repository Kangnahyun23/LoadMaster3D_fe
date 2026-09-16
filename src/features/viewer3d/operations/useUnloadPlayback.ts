import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { PlaybackSpeed } from '@/features/viewer3d/viewer-types'
import { createLifoIndex, unloadSequence } from './unloading'

/**
 * Mô phỏng dỡ theo `unloadingOrder` của kết quả (LM-036). Trước mỗi bước, kiểm LIFO của domain trên các kiện còn lại của
 * `context`: `LIFO_BLOCKED` dừng mô phỏng và giữ kiện đích; `LIFO_PARTIAL` chỉ được đánh dấu trong scene, mô phỏng đi tiếp.
 * `context` phải chứa `placements` (tài xế: mọi kiện chưa giao, kể cả điểm sau).
 */
export function useUnloadPlayback(placements: readonly ScenePlacement[], speed: PlaybackSpeed = 2, context: readonly ScenePlacement[] = placements) {
  const { ordered, fromResult } = useMemo(() => unloadSequence(placements), [placements])
  const lifo = useMemo(() => createLifoIndex(context), [context])
  const [session, setSession] = useState({ source: placements, cursor: 0, playing: false, warning: 0 })
  // Geometry/order changes start a fresh simulation; history stays in ViewerDraft.
  if (session.source !== placements) setSession({ source: placements, cursor: 0, playing: false, warning: 0 })
  const cursor = Math.min(session.cursor, ordered.length)
  const setCursor = useCallback((value: number) => setSession((s) => ({ ...s, warning: 0, cursor: Math.max(0, Math.min(ordered.length, value)) })), [ordered.length])
  const advance = useCallback(() => setSession((s) => {
    const p = ordered[s.cursor]
    if (p && lifo.blockage(p, new Set(ordered.slice(0, s.cursor).map((q) => q.id)))?.code === 'LIFO_BLOCKED') {
      return { ...s, playing: false, warning: s.warning + 1 }
    }
    const next = Math.min(s.cursor + 1, ordered.length)
    return { ...s, warning: 0, cursor: next, playing: s.playing && next < ordered.length }
  }), [ordered, lifo])
  const stop = useCallback(() => setSession((s) => s.playing ? { ...s, playing: false } : s), [])
  const toggle = useCallback(() => setSession((s) => ({ ...s, playing: !s.playing,
    cursor: !s.playing && s.cursor >= ordered.length ? 0 : s.cursor })), [ordered.length])
  useEffect(() => {
    if (!session.playing || !ordered.length) return
    const timer = window.setInterval(advance, 600 / speed)
    return () => window.clearInterval(timer)
  }, [session.playing, ordered.length, speed, advance])
  const unloadedIds = useMemo(() => new Set(ordered.slice(0, cursor).map((p) => p.id)), [ordered, cursor])
  return { ordered, fromResult, lifo, cursor, setCursor, unloadedIds, current: ordered[cursor], next: ordered[cursor + 1],
    playing: session.playing, stop, toggle, advance, warning: session.warning }
}
