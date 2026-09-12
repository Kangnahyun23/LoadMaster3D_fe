import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { LoadPlan, Placement } from '@/types/load-plan'

/** Thời gian hiện lớp phủ "Đã xếp" trước khi chuyển bước kế tiếp. */
const CONFIRMED_OVERLAY_MS = 1200

/**
 * Phiên xếp hàng tại kho: đi tuần tự theo `step` của phương án.
 * Xác nhận xong hiện lớp phủ xanh rồi tự chuyển sang kiện kế tiếp.
 */
export function useLoadingSession(plan: LoadPlan, initialStep: number) {
  const totalSteps = plan.placements.length
  const [step, setStep] = useState(initialStep)
  const [confirmedId, setConfirmedId] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const byStep = useCallback(
    (n: number): Placement | undefined => plan.placements.find((p) => p.step === n),
    [plan.placements],
  )

  const current = byStep(step)
  const next = byStep(step + 1)
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

  const reportDeviation = useCallback(() => {
    if (!current) return
    toast.warning(`Đã ghi nhận sai lệch cho ${current.id}`, {
      description: 'Điều phối viên sẽ thấy trong mục "Cần xem lại" của chuyến.',
    })
  }, [current])

  const reportMissing = useCallback(() => {
    if (!current) return
    toast.error(`${current.id} được đánh dấu không có ở kho`, {
      description: 'Bỏ qua kiện này và chuyển sang bước kế tiếp.',
    })
    setStep((s) => s + 1)
  }, [current])

  useEffect(() => clearTimer, [clearTimer])

  return {
    step,
    totalSteps,
    current,
    next,
    finished,
    confirmedId,
    confirm,
    reportDeviation,
    reportMissing,
  }
}
