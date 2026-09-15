import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { potentialBlockers } from './operations-model'

export type CargoAppearance = {
  visibility: 'opaque' | 'dim' | 'hidden'
  tone: 'normal' | 'muted' | 'current' | 'blocker'
  state: 'loaded' | 'current' | 'next' | 'future' | 'removed'
}
export type SceneSemantics = {
  appearanceById: ReadonlyMap<string, CargoAppearance>
  currentId: string | null
  nextId: string | null
  blockers: readonly ScenePlacement[]
  massPlacements: readonly ScenePlacement[]
  inspectionId: string | null
}
export type OperationsInput = {
  kind: 'loading' | 'unloading'
  step: number
  unloadedIds?: ReadonlySet<string>
  currentId?: string | null
  nextId?: string | null
  focusStop?: number | null
  inspectId?: string | null
  isolateId?: string | null
}

/** Shared semantic state for planner/warehouse/driver, with no Three.js or role-specific branches. */
export function deriveSceneSemantics(placements: readonly ScenePlacement[], vehicle: VehicleConfig, input: OperationsInput): SceneSemantics {
  const currentId = input.kind === 'loading' ? placements.find((p) => p.step === input.step)?.id ?? null : input.currentId ?? null
  const nextId = input.kind === 'loading'
    ? [...placements].filter((p) => p.step > input.step).sort((a, b) => a.step - b.step)[0]?.id ?? null : input.nextId ?? null
  const massPlacements = placements.filter((p) => !input.unloadedIds?.has(p.id) &&
    (input.focusStop != null ? p.stop >= input.focusStop : input.kind === 'loading' ? p.step <= input.step : true))
  const appearanceById = new Map<string, CargoAppearance>()
  for (const p of placements) {
    const removed = input.unloadedIds?.has(p.id) || (input.focusStop != null && p.stop < input.focusStop)
    const current = p.id === currentId, next = p.id === nextId
    let visibility: CargoAppearance['visibility'] = removed ? 'hidden'
      : input.kind === 'loading' && p.step > input.step ? next ? 'dim' : 'hidden' : 'opaque'
    if (!removed && input.focusStop != null) visibility = p.stop === input.focusStop ? 'opaque' : 'dim'
    const tone = current ? 'current' : input.focusStop != null && p.stop === input.focusStop ? 'normal' : 'muted'
    appearanceById.set(p.id, { visibility, tone, state: removed ? 'removed' : current ? 'current' : next ? 'next'
      : input.kind === 'loading' && p.step < input.step ? 'loaded' : 'future' })
  }
  const target = placements.find((p) => p.id === input.inspectId && appearanceById.get(p.id)?.visibility !== 'hidden')
  const blockers = target ? potentialBlockers(target, placements.filter((p) => appearanceById.get(p.id)?.visibility !== 'hidden'), vehicle) : []
  if (target) {
    const ids = new Set(blockers.map((p) => p.id))
    for (const [id, appearance] of appearanceById) {
      if (appearance.visibility === 'hidden') continue
      appearance.visibility = id === target.id || ids.has(id) ? 'opaque' : 'dim'
      appearance.tone = id === target.id ? 'current' : ids.has(id) ? 'blocker' : 'muted'
    }
  }
  if (input.isolateId) for (const [id, appearance] of appearanceById) {
    appearance.visibility = id === input.isolateId ? 'opaque' : 'hidden'
  }
  return { appearanceById, currentId, nextId, blockers, massPlacements, inspectionId: target?.id ?? null }
}
