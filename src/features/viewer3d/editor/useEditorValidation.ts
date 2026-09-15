import { useCallback, useMemo } from 'react'
import { formatIssue, useFormat, useT } from '@/lib/i18n'
import type { ScenePlacement, ViewerSceneModel } from '../scene-input'
import { createEditorEngine } from './editor-engine'
import type { GeometryResult } from './geometry'

/**
 * Kiểm một tư thế kiện bằng constraint engine của domain (LM-035) và dịch issue sang câu qua `formatIssue`. Engine dựng một lần
 * cho mỗi snapshot; mỗi lần kiểm đồng bộ engine với placement hiệu lực (sau commit, undo, redo, reset chỉ dời kiện đã đổi).
 * Lời gọi trong lúc kéo đã được `preview-store` giới hạn tần suất.
 */
export function useEditorValidation(model: ViewerSceneModel, placements: readonly ScenePlacement[]) {
  const t = useT()
  const format = useFormat()
  const engine = useMemo(() => createEditorEngine(model), [model])
  return useCallback((p: ScenePlacement): GeometryResult => {
    const source = model.placementById.get(p.id)
    const changed = !source || p.orientation !== source.orientation ||
      p.position.x !== source.position.x || p.position.y !== source.position.y || p.position.z !== source.position.z
    const manualNote = changed ? ['Vị trí hoặc hướng đặt đã chỉnh thủ công'] : []
    if (!engine) return { valid: true, errors: [], advisories: manualNote, supportRatio: 1, overlapIds: [] }
    engine.sync(placements)
    const check = engine.check(p)
    return {
      valid: check.valid,
      errors: check.errors.map((issue) => formatIssue(issue, t, format)),
      advisories: [...check.warnings.map((issue) => formatIssue(issue, t, format)), ...manualNote],
      supportRatio: check.supportRatio,
      overlapIds: check.overlapIds,
    }
  }, [engine, model, placements, t, format])
}
