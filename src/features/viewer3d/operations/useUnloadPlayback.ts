import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Placement, PlaybackSpeed } from '@/types/load-plan'
import { suggestedUnloadOrder } from './operations-model'

export function useUnloadPlayback(placements: readonly Placement[], speed: PlaybackSpeed = 2) {
  const ordered = useMemo(() => suggestedUnloadOrder(placements), [placements])
  const [session, setSession] = useState({ source: placements, cursor: 0, playing: false })
  // Geometry/order changes start a fresh simulation; history stays in ViewerDraft.
  if (session.source !== placements) setSession({ source: placements, cursor: 0, playing: false })
  const cursor = Math.min(session.cursor, ordered.length)
  const setCursor = useCallback((value: number) => setSession((s) => ({ ...s, cursor: Math.max(0, Math.min(ordered.length, value)) })), [ordered.length])
  const stop = useCallback(() => setSession((s) => s.playing ? { ...s, playing: false } : s), [])
  const toggle = useCallback(() => setSession((s) => ({ ...s, playing: !s.playing,
    cursor: !s.playing && s.cursor >= ordered.length ? 0 : s.cursor })), [ordered.length])
  useEffect(() => {
    if (!session.playing || !ordered.length) return
    const timer = window.setInterval(() => setSession((s) => {
      const next = Math.min(s.cursor + 1, ordered.length)
      return { ...s, cursor: next, playing: next < ordered.length }
    }), 600 / speed)
    return () => window.clearInterval(timer)
  }, [session.playing, ordered.length, speed])
  const unloadedIds = useMemo(() => new Set(ordered.slice(0, cursor).map((p) => p.id)), [ordered, cursor])
  return { ordered, cursor, setCursor, unloadedIds, current: ordered[cursor], next: ordered[cursor + 1],
    playing: session.playing, stop, toggle }
}
