import type { PositionCm } from '@/features/viewer3d/scene-input'
import type { GeometryResult } from './geometry'
import type { SnapTarget } from './snapping'

export type EditorPreview = {
  id: string
  position: PositionCm
  result: GeometryResult
  sources: string[]
  targets?: SnapTarget[]
  dragging: boolean
  message?: string
}

/** Imperative drag data stays outside React. Only this store's small status panel subscribes. */
export function createPreviewStore() {
  let latest: EditorPreview | null = null
  let snapshot: EditorPreview | null = null
  let lastPublish = 0
  const listeners = new Set<() => void>()
  return {
    getLatest: () => latest,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    publish: (preview: EditorPreview | null, force = false) => {
      latest = preview
      const now = performance.now()
      if (!force && preview?.dragging === snapshot?.dragging && now - lastPublish < 100) return
      snapshot = preview
      lastPublish = now
      listeners.forEach((listener) => listener())
    },
  }
}
export type PreviewStore = ReturnType<typeof createPreviewStore>
