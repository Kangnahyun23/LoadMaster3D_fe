import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Orientation, Placement, PositionMm } from '@/types/load-plan'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { orientDimensions } from '../viewer-scene-model'
import { integerPosition, validatePlacement, type Axis } from './geometry'
import { createPreviewStore } from './preview-store'
import { snapPosition } from './snapping'

export type DragPlane = 'xy' | 'xz' | 'yz'
export const PLANE_AXES: Record<DragPlane, readonly Axis[]> = { xy: ['x', 'y'], xz: ['x', 'z'], yz: ['y', 'z'] }

export function useManualEditor(state: LoadPlanViewerState) {
  const [mode, setModeState] = useState<'view' | 'edit'>('view')
  const [plane, setPlane] = useState<DragPlane>('xy')
  const [nudgeMm, setNudgeMm] = useState(10)
  const [snapping, setSnapping] = useState(true)
  const [focus, setFocus] = useState<{ placement: Placement; request: number } | null>(null)
  const preview = useMemo(() => createPreviewStore(), [])
  const { selected, placements, sceneModel, draft } = state
  const patch = selected ? draft.patches.get(selected.id) : undefined
  const manual = Boolean(patch?.position || patch?.orientation !== undefined)
  const validation = useMemo(() => selected
    ? validatePlacement(selected, placements, sceneModel.vehicle, manual) : null,
  [selected, placements, sceneModel, manual])

  const setMode = (next: 'view' | 'edit') => {
    state.stopPlaying()
    preview.publish(null, true)
    setModeState(next)
  }
  const inspect = useCallback((p: Placement) => {
    const source = sceneModel.placementById.get(p.id)!
    const changed = p.orientation !== source.orientation ||
      p.position.x !== source.position.x || p.position.y !== source.position.y || p.position.z !== source.position.z
    return validatePlacement(p, placements, sceneModel.vehicle, changed)
  }, [placements, sceneModel])

  const commitMove = (id: string, position: PositionMm) => {
    const p = placements.find((item) => item.id === id)
    if (!p || p.pinned || mode !== 'edit') return false
    const candidate = { ...p, position: integerPosition(position) }
    const result = inspect(candidate)
    preview.publish({ id, position: candidate.position, result, sources: [], dragging: false,
      message: result.valid ? 'Đã đặt kiện' : 'Không thể đặt — đã giữ vị trí trước đó' }, true)
    if (result.valid) state.commitDraft('MOVE', id, { position: candidate.position })
    return result.valid
  }
  const rotate = (orientation: Orientation) => {
    if (!selected || selected.pinned || preview.getLatest()?.dragging) return
    const candidate = { ...selected, ...orientDimensions(sceneModel.baseDimensionsById.get(selected.id)!, orientation), orientation }
    const result = inspect(candidate)
    preview.publish({ id: selected.id, position: selected.position, result, sources: [], dragging: false,
      message: result.valid ? 'Đã đổi hướng đặt' : 'Không thể xoay — đã giữ hướng trước đó' }, true)
    if (result.valid) state.setOrientation(selected.id, orientation)
  }
  const nudge = (axis: Axis, direction: number) => {
    if (!selected || preview.getLatest()?.dragging) return
    commitMove(selected.id, { ...selected.position, [axis]: selected.position[axis] + direction * nudgeMm })
  }
  const snap = () => {
    if (!selected || preview.getLatest()?.dragging) return
    commitMove(selected.id, snapPosition(selected, selected.position, placements, sceneModel.vehicle).position)
  }
  const focusSelected = () => {
    if (selected && !preview.getLatest()?.dragging) setFocus((current) => ({ placement: selected, request: (current?.request ?? 0) + 1 }))
  }
  const focusPlacement = (placement: Placement) => {
    if (!preview.getLatest()?.dragging) setFocus((current) => ({ placement, request: (current?.request ?? 0) + 1 }))
  }
  const undo = () => { if (!preview.getLatest()?.dragging) { preview.publish(null, true); state.undo() } }
  const redo = () => { if (!preview.getLatest()?.dragging) { preview.publish(null, true); state.redo() } }
  const resetPlacement = () => {
    if (!selected || preview.getLatest()?.dragging) return
    const source = sceneModel.placementById.get(selected.id)!
    const result = inspect(source)
    // Other edits can occupy the original slot. Reset all remains an exact snapshot restore.
    preview.publish({ id: source.id, position: source.position, result, sources: [], dragging: false,
      message: result.valid ? 'Đã khôi phục kiện' : 'Không thể khôi phục riêng kiện này; vị trí gốc đang bị chiếm' }, true)
    if (result.valid) state.commitDraft('RESET_PLACEMENT', selected.id)
  }
  const resetDraft = () => { preview.publish(null, true); state.commitDraft('RESET_DRAFT') }
  const togglePin = () => {
    if (selected && !preview.getLatest()?.dragging) { preview.publish(null, true); state.togglePinned(selected.id) }
  }

  useEffect(() => {
    if (mode !== 'edit') return
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
      if (preview.getLatest()?.dragging) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo(); else undo()
      } else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        const movement: Record<string, [Axis, number]> = {
          ArrowRight: ['x', 1], ArrowLeft: ['x', -1], ArrowUp: ['y', 1], ArrowDown: ['y', -1],
          PageUp: ['z', 1], PageDown: ['z', -1],
        }
        const move = movement[event.key]
        if (move) { event.preventDefault(); nudge(...move) }
        if (event.key.toLowerCase() === 'r' && selected) {
          event.preventDefault(); rotate(((selected.orientation + 1) % 3) as Orientation)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    mode, setMode, plane, setPlane, nudgeMm, setNudgeMm, snapping, setSnapping, preview,
    focus, focusSelected, focusPlacement, inspect, commitMove, rotate, nudge, snap, undo, redo, resetPlacement, resetDraft,
    togglePin, validation, manual,
  }
}
export type ManualEditor = ReturnType<typeof useManualEditor>
