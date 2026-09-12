import { useMemo } from 'react'

/**
 * Cờ bật/tắt hiệu ứng theo năng lực thiết bị (CLAUDE.md mục 7).
 * Mọi hiệu ứng nâng cao phải đi qua đây; mặc định ưu tiên giữ ≥30 FPS.
 */
export type PerformanceFlags = {
  /** Bóng đổ từ đèn chính xuống sàn thùng */
  shadows: boolean
  /** Viền tối quanh kiện (inverted hull) — thêm 1 draw call */
  outlines: boolean
  /** Post-processing — tắt hẳn, chưa cần và tốn nhất */
  postprocessing: boolean
  /** Người dùng bật "giảm chuyển động" ở hệ điều hành */
  reducedMotion: boolean
  /** Giới hạn devicePixelRatio cho Canvas */
  dpr: [number, number]
}

function detect(): PerformanceFlags {
  if (typeof window === 'undefined') {
    return {
      shadows: false,
      outlines: true,
      postprocessing: false,
      reducedMotion: false,
      dpr: [1, 1],
    }
  }

  const cores = navigator.hardwareConcurrency ?? 4
  const memoryGb =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const capable = cores >= 8 && memoryGb >= 8

  return {
    shadows: capable,
    outlines: true,
    postprocessing: false,
    reducedMotion,
    dpr: capable ? [1, 2] : [1, 1.5],
  }
}

export function usePerformanceFlags(): PerformanceFlags {
  return useMemo(() => detect(), [])
}
