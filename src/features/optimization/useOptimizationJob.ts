import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Theo dõi một lần chạy tối ưu.
 *
 * Thiết kế cuối cùng là nhận tiến trình qua WebSocket từ service FastAPI.
 * Backend chưa có nên ở đây mô phỏng tiến trình cục bộ; chỗ cần thay là
 * phần đặt `setInterval` trong `start` — phần còn lại của hook và mọi
 * component dùng nó không đổi khi nối WebSocket thật.
 */

export type OptimizationPhase = 'idle' | 'running' | 'done' | 'error'

/** Lý do bộ tối ưu bó tay, trả về khi phase = 'error'. */
export type OptimizationFailure = {
  generations: number
  seconds: number
  vehicleName: string
  /** Số kiện vượt kích thước lòng thùng */
  oversizedCount: number
  /** Tổng khối lượng hàng và tải trọng cho phép, kg */
  totalKg: number
  payloadKg: number
}

export type OptimizationProgress = {
  phase: OptimizationPhase
  /** 0–100 */
  percent: number
  generation: number
  totalGenerations: number
  /** Tỷ lệ lấp đầy tốt nhất tới thời điểm hiện tại, % */
  bestFillRate: number
  elapsedSeconds: number
  failure?: OptimizationFailure
}

const TOTAL_GENERATIONS = 200
const TARGET_FILL_RATE = 89.2
const START_FILL_RATE = 62
/** Tổng thời gian chạy mô phỏng, khớp con số trong bản design. */
const TOTAL_SECONDS = 58
/** Khi mô phỏng thất bại, dừng sớm để xem hộp thoại lỗi ngay. */
const FAILURE_AFTER_SECONDS = 3
const TICK_MS = 300

const MOCK_FAILURE: Omit<OptimizationFailure, 'generations' | 'seconds'> = {
  vehicleName: 'Hyundai HD210',
  oversizedCount: 12,
  totalKg: 9840,
  payloadKg: 9500,
}

const IDLE: OptimizationProgress = {
  phase: 'idle',
  percent: 0,
  generation: 0,
  totalGenerations: TOTAL_GENERATIONS,
  bestFillRate: START_FILL_RATE,
  elapsedSeconds: 0,
}

export function useOptimizationJob() {
  const [progress, setProgress] = useState<OptimizationProgress>(IDLE)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(
    ({ simulateFailure = false }: { simulateFailure?: boolean } = {}) => {
      clearTimer()
      setProgress({ ...IDLE, phase: 'running' })
      const startedAt = Date.now()

      timerRef.current = window.setInterval(() => {
        const elapsedSeconds = (Date.now() - startedAt) / 1000
        const ratio = Math.min(1, elapsedSeconds / TOTAL_SECONDS)
        const generation = Math.round(ratio * TOTAL_GENERATIONS)

        if (simulateFailure && elapsedSeconds >= FAILURE_AFTER_SECONDS) {
          clearTimer()
          setProgress((current) => ({
            ...current,
            phase: 'error',
            failure: { ...MOCK_FAILURE, generations: generation, seconds: Math.round(elapsedSeconds) },
          }))
          return
        }

        // Đường hội tụ giảm dần, khớp dáng sparkline trong bản design.
        const bestFillRate =
          ratio >= 1
            ? TARGET_FILL_RATE
            : START_FILL_RATE +
              (TARGET_FILL_RATE - START_FILL_RATE) *
                (1 - Math.exp(-generation / (TOTAL_GENERATIONS * 0.28)))

        setProgress({
          phase: ratio >= 1 ? 'done' : 'running',
          percent: Math.round(ratio * 100),
          generation,
          totalGenerations: TOTAL_GENERATIONS,
          bestFillRate,
          elapsedSeconds: Math.round(elapsedSeconds),
        })

        if (ratio >= 1) clearTimer()
      }, TICK_MS)
    },
    [clearTimer],
  )

  const cancel = useCallback(() => {
    clearTimer()
    setProgress(IDLE)
  }, [clearTimer])

  useEffect(() => clearTimer, [clearTimer])

  return { progress, start, cancel }
}
