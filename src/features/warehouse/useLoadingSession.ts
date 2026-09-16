import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import { useT } from '@/lib/i18n'

/** Thời gian hiện lớp phủ "Đã xếp" trước khi chuyển bước kế tiếp. */
const CONFIRMED_OVERLAY_MS = 1200

/**
 * Phiên xếp hàng tại kho: đi tuần tự theo `step` (= `loadingOrder` của revision đã duyệt, LM-060).
 * Xác nhận xong hiện lớp phủ xanh rồi tự chuyển sang kiện kế tiếp.
 */
export function useLoadingSession(placements: readonly ScenePlacement[], initialStep = 1) {
  const t = useT()
  const totalSteps = placements.length
  const [step, setStep] = useState(initialStep)
  const [confirmedId, setConfirmedId] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const byStep = useMemo(() => new Map(placements.map((p) => [p.step, p])), [placements])
  const current = byStep.get(step)
  const next = byStep.get(step + 1)
  const finished = step > totalSteps

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const confirm = useCallback(() => {
    if (!current || confirmedId) return
    setConfirmedId(current.id)
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      setStep((s) => s + 1)
      setConfirmedId(null)
      timerRef.current = null
    }, CONFIRMED_OVERLAY_MS)
  }, [current, confirmedId, clearTimer])

  const reportMissing = useCallback(() => {
    if (!current) return
    // Chưa có nơi lưu báo cáo thiếu kiện (D-20): toast chỉ nói việc thật sự xảy ra — bỏ qua bước này.
    toast.warning(t('warehouse.skipped', { id: current.id }), { description: t('warehouse.skippedDescription') })
    setStep((s) => s + 1)
  }, [current, t])

  useEffect(() => clearTimer, [clearTimer])

  return {
    step,
    totalSteps,
    current,
    next,
    finished,
    confirmedId,
    confirm,
    reportMissing,
  }
}
