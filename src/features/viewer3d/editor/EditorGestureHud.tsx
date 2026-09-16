import { useEffect, useRef } from 'react'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import { useT } from '@/lib/i18n'
import { readToken } from '@/lib/tokens'
import { formatSnapSource } from './snapping'
import type { ManualEditor } from './useManualEditor'

/** Screen HUD stays outside Canvas; drag messages update DOM without scene rerenders. */
export function EditorGestureHud({ placement, editor }: { placement: ScenePlacement; editor: ManualEditor }) {
  const t = useT()
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    function update() {
      if (!label.current) return
      const preview = editor.preview.getLatest()
      const active = preview?.id === placement.id ? preview : null
      const result = active?.result ?? editor.inspect(placement)
      label.current.textContent = !result.valid ? result.errors[0]! : active?.sources.length
        ? t('viewer.editor.gestureSnap', { sources: active.sources.map((s) => formatSnapSource(s, t)).join(' · ') })
        : t('viewer.editor.gesturePlane', { plane: editor.plane.toUpperCase(), status: t(result.advisories.length ? 'viewer.editor.hasNotes' : 'viewer.editor.canPlace') })
      label.current.style.borderColor = readToken(!result.valid ? '--danger' : result.advisories.length ? '--warning' : '--success')
    }
    update()
    return editor.preview.subscribe(update)
  }, [placement, editor, t])
  return <div className="pointer-events-none absolute bottom-4 left-4 max-w-72">
    <span ref={label} className="inline-block rounded-md border-2 bg-panel-dark px-3 py-2 text-body-lg text-bg xl:text-body" />
  </div>
}
