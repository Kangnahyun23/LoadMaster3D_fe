import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'

/**
 * Đo FPS và draw call mỗi 500ms (mục 7: giữ ≥30 FPS, draw call < 100).
 * Chỉ gắn khi cần đo — không có mặt trong giao diện thường.
 */
export type PerfSample = {
  fps: number
  drawCalls: number
  triangles: number
}

const SAMPLE_INTERVAL_MS = 500

export function PerfProbe({ onSample }: { onSample: (sample: PerfSample) => void }) {
  const gl = useThree((state) => state.gl)
  const frames = useRef(0)
  // Khởi tạo lười: không gọi performance.now() ngay trong thân render.
  const lastSampleAt = useRef(0)

  useFrame(() => {
    const now = performance.now()
    if (lastSampleAt.current === 0) lastSampleAt.current = now
    frames.current += 1
    const elapsed = now - lastSampleAt.current
    if (elapsed < SAMPLE_INTERVAL_MS) return

    onSample({
      fps: Math.round((frames.current * 1000) / elapsed),
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
    })
    frames.current = 0
    lastSampleAt.current = now
  })

  return null
}
