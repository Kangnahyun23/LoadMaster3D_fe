import { stopColor, stopLabel } from '@/lib/stops'
import { cargoFaces, containerFaces, containerOutline } from './isometric'

const STOP_NUMBERS = [1, 2, 3, 4]

/**
 * Ảnh xem trước phương án — nền tối, luôn tối kể cả khi app sáng
 * (CLAUDE.md mục 7). Gradient ở đây là vùng 3D nên không vướng luật
 * cấm gradient cho nút/card/header/nền trang.
 */
export function BestPlanPreview({
  title,
  caption,
  fill,
}: {
  title: string
  caption: string
  fill: 'partial' | 'full'
}) {
  const faces = [...containerFaces(), ...cargoFaces(fill)]

  return (
    <div className="relative h-58 overflow-hidden rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)]">
      <span className="absolute top-3.5 left-4 text-caption font-medium text-white/70">
        {title}
      </span>
      <span className="absolute top-3.5 right-4 font-mono text-caption text-white/50">
        {caption}
      </span>

      <svg
        viewBox="0 0 584 232"
        className="block h-full w-full"
        role="img"
        aria-label={`${title}. ${caption}`}
      >
        <g transform="translate(292,150)">
          {faces.map((face, index) => (
            <polygon
              key={index}
              points={face.points}
              fill={face.fill}
              stroke={face.stroke}
              strokeWidth={0.6}
              strokeLinejoin="round"
            />
          ))}
          <polyline
            points={containerOutline()}
            fill="none"
            stroke="rgba(255,255,255,.35)"
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <div className="absolute bottom-3.5 left-4 flex gap-3">
        {STOP_NUMBERS.map((number) => (
          <span
            key={number}
            className="inline-flex items-center gap-1.5 text-caption text-white/70"
          >
            <span
              aria-hidden
              className="size-2 rounded-xs"
              style={{ background: stopColor(number) }}
            />
            {stopLabel(number)}
          </span>
        ))}
      </div>
    </div>
  )
}
