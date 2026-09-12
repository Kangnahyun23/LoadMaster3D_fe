import { useMemo } from 'react'
import { boxFaces, createProjector } from '@/lib/isometric'
import { stopColor } from '@/lib/stops'
import type { Placement } from '@/types/load-plan'

const SCALE = 34
/** 1 m thật = 4 đơn vị hình để kiện 400 mm hiện to rõ. */
const METRES_TO_UNITS = 4

/**
 * Hình minh hoạ hướng đặt: kiện trên sàn, mũi tên chỉ mặt hướng ra cửa.
 * Kích thước theo đúng tỉ lệ kiện đang xếp.
 */
export function OrientationFigure({ placement }: { placement: Placement }) {
  const figure = useMemo(() => {
    const project = createProjector(SCALE)
    const l = (placement.lengthMm / 1000) * METRES_TO_UNITS
    const w = (placement.widthMm / 1000) * METRES_TO_UNITS
    const h = (placement.heightMm / 1000) * METRES_TO_UNITS
    const color = stopColor(placement.stop)

    const floor = [project(-0.6, -0.6, 0), project(l + 1.6, -0.6, 0), project(l + 1.6, w + 0.6, 0), project(-0.6, w + 0.6, 0)].join(' ')
    const faces = boxFaces({ x: 0, y: 0, z: 0, length: l, width: w, height: h, color }, project, { stroke: 'rgba(0,0,0,.25)', strokeWidth: 0.8, topTint: 0.08 })
    const ax = l + 0.25
    const ay = w / 2
    const arrow = [project(ax, ay, 0.02), project(ax + 1.1, ay, 0.02)].join(' ')
    const head = [project(ax + 1.1, ay - 0.18, 0.02), project(ax + 1.4, ay, 0.02), project(ax + 1.1, ay + 0.18, 0.02)].join(' ')

    return { floor, faces, arrow, head }
  }, [placement])

  return (
    <svg
      width="260"
      height="124"
      viewBox="0 0 260 150"
      className="block flex-none"
      role="img"
      aria-label="Minh hoạ hướng đặt kiện, mũi tên chỉ mặt hướng ra cửa"
    >
      <g transform="translate(110,92)">
        <polygon points={figure.floor} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
        {figure.faces.map((face, index) => (
          <polygon key={index} points={face.points} fill={face.fill} stroke={face.stroke} strokeWidth={face.strokeWidth} strokeLinejoin="round" />
        ))}
        <polyline points={figure.arrow} fill="none" stroke="var(--text)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={figure.head} fill="var(--text)" />
      </g>
      <text x="236" y="126" textAnchor="end" fontFamily="var(--font-sans)" fontSize="16" fontWeight="600" fill="var(--text)">
        Cửa sau
      </text>
      <text x="14" y="30" fontFamily="var(--font-sans)" fontSize="16" fill="var(--text-3)">
        Vách trước
      </text>
    </svg>
  )
}
