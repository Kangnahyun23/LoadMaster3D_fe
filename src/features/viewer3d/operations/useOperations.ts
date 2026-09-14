import { useMemo, useState } from 'react'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { deriveSceneSemantics } from './scene-semantics'
import { useUnloadPlayback } from './useUnloadPlayback'

export function useOperations(state: LoadPlanViewerState) {
  const [kind, setKindState] = useState<'loading' | 'unloading'>('loading')
  const [loadingFocus, setLoadingFocus] = useState<number | null>(null)
  const [showMass, setShowMass] = useState(false)
  const [showDistribution, setShowDistribution] = useState(true)
  const [inspectBlockers, setInspectBlockers] = useState(false)
  const unload = useUnloadPlayback(state.placements, state.speed)
  const stop = () => { state.stopPlaying(); unload.stop() }
  const setKind = (next: 'loading' | 'unloading') => {
    stop(); setKindState(next); setInspectBlockers(next === 'unloading')
    if (next === 'unloading') {
      unload.setCursor(0); state.setCameraPreset('cua-sau')
      state.select(unload.ordered[0]?.id ?? null)
    }
  }
  const focusStop = kind === 'loading' ? loadingFocus : unload.current?.stop ?? unload.ordered.at(-1)?.stop ?? null
  const setFocusStop = (value: number | null) => {
    stop()
    if (kind === 'loading') setLoadingFocus(value)
    else {
      const index = unload.ordered.findIndex((p) => p.stop === value)
      if (index >= 0) { unload.setCursor(index); state.select(unload.ordered[index]!.id) }
    }
    if (value !== null) state.setCameraPreset('cua-sau')
  }
  const inspected = state.selected && !unload.unloadedIds.has(state.selected.id) && (focusStop == null || state.selected.stop >= focusStop)
    ? state.selected.id : kind === 'unloading' ? unload.current?.id : state.selectedId
  const semantics = useMemo(() => deriveSceneSemantics(state.placements, state.sceneModel.vehicle, {
    kind, step: state.step, focusStop, unloadedIds: kind === 'unloading' ? unload.unloadedIds : undefined,
    currentId: unload.current?.id, nextId: unload.next?.id, inspectId: inspectBlockers ? inspected : null,
  }), [state.placements, state.sceneModel.vehicle, state.step, inspected, kind, focusStop, unload.unloadedIds, unload.current, unload.next, inspectBlockers])
  const current = state.placements.find((p) => p.id === semantics.currentId)
  const next = state.placements.find((p) => p.id === semantics.nextId)
  const togglePlaying = kind === 'loading' ? state.togglePlaying : unload.toggle
  const stepForward = kind === 'loading' ? state.stepForward : () => unload.setCursor(unload.cursor + 1)
  const stepBackward = kind === 'loading' ? state.stepBackward : () => unload.setCursor(unload.cursor - 1)
  const goToStart = () => { stop(); if (kind === 'loading') state.goToStart(); else unload.setCursor(0) }
  return { kind, setKind, focusStop, setFocusStop, showMass, setShowMass, showDistribution, setShowDistribution,
    inspectBlockers, setInspectBlockers, semantics, current, next, unload, stop,
    playing: kind === 'loading' ? state.playing : unload.playing, togglePlaying, stepForward, stepBackward, goToStart }
}
export type OperationsState = ReturnType<typeof useOperations>
