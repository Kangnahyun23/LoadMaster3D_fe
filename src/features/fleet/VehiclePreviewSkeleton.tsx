import { useMemo } from 'react'
import type { VehicleConfig } from '@/domain/models'
import { createProjector, roofOutline, type IsoSize } from '@/lib/isometric'

const VIEW_WIDTH = 320
const VIEW_HEIGHT = 200
const PAD = 24
const COS_30 = Math.cos(Math.PI / 6)
/** Khi chưa có xe hợp lệ: thùng 6 m phổ biến. */
const FALLBACK: IsoSize = { length: 6, width: 2.4, height: 2.5 }

/**
 * Phác thảo SVG đẳng cự của lòng thùng theo đúng tỉ lệ đang nhập (LM-042), không kéo Three.js vào chunk (AGENTS mục 7).
 * `loading` bật nhịp mờ khi đang tải chunk 3D; tắt khi trình duyệt không có WebGL và phác thảo là hình cuối cùng.
 */
export function VehiclePreviewSkeleton({ vehicle, loading }: { vehicle: VehicleConfig | null; loading: boolean }) {
  const shape = useMemo(() => {
    const size: IsoSize = vehicle
      ? { length: vehicle.innerLengthCm / 100, width: vehicle.innerWidthCm / 100, height: vehicle.innerHeightCm / 100 }
      : FALLBACK
    const { length: l, width: w, height: h } = size
    const scale = Math.min((VIEW_WIDTH - 2 * PAD) / ((l + w) * COS_30), (VIEW_HEIGHT - 2 * PAD) / ((l + w) / 2 + h))
    const project = createProjector(scale, VIEW_WIDTH / 2 - ((l - w) * COS_30 * scale) / 2, VIEW_HEIGHT / 2 - (((l + w) / 2 - h) * scale) / 2)
    const faces = [
      [project(0, 0, 0), project(l, 0, 0), project(l, w, 0), project(0, w, 0)],
      [project(0, 0, 0), project(0, w, 0), project(0, w, h), project(0, 0, h)],
      [project(0, 0, 0), project(l, 0, 0), project(l, 0, h), project(0, 0, h)],
    ].map((points) => points.join(' '))
    return { faces, roof: roofOutline(size, project) }
  }, [vehicle])

  return (
    <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
      {shape.faces.map((points, index) => (
        <polygon
          key={index}
          points={points}
          fill="rgba(255,255,255,.08)"
          stroke="rgba(255,255,255,.18)"
          strokeWidth={0.8}
          strokeLinejoin="round"
          className={loading ? 'animate-[lm-pulse_1.8s_ease-in-out_infinite]' : undefined}
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
      <polyline points={shape.roof} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth={1} strokeDasharray="3 3" />
    </svg>
  )
}
