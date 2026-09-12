import { useMemo } from 'react'
import {
  boxFaces,
  containerShell,
  createProjector,
  groundShadow,
  roofOutline,
  shellColors,
  sortByDepth,
} from '@/lib/isometric'
import { formatInteger } from '@/lib/format'
import {
  THUMBNAIL_CONTAINER,
  thumbnailBoxes,
  type PackingStyle,
} from '@/lib/plan-comparison.mock'

const SCALE = 21
const VIEW_WIDTH = 360
const VIEW_HEIGHT = 190

/** Ảnh thu nhỏ 190px nền tối của một phương án, kèm số kiện đã xếp. */
export function PlanThumbnail({
  style,
  placedCount,
  totalCount,
}: {
  style: PackingStyle
  placedCount: number
  totalCount: number
}) {
  const { faces, roof, shadow } = useMemo(() => {
    const project = createProjector(SCALE)
    const colors = shellColors()
    const shell = containerShell(THUMBNAIL_CONTAINER, project, colors)
    const cargo = thumbnailBoxes(style).flatMap((box) =>
      boxFaces(box, project, { strokeWidth: 0.5, topTint: 0.08 }),
    )
    return {
      faces: sortByDepth([...shell, ...cargo]),
      roof: roofOutline(THUMBNAIL_CONTAINER, project),
      shadow: groundShadow(THUMBNAIL_CONTAINER, project),
    }
  }, [style])

  return (
    <div className="relative h-[190px] flex-none bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)]">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full"
        role="img"
        aria-label={`Sơ đồ xếp hàng, ${formatInteger(placedCount)} trên ${formatInteger(totalCount)} kiện`}
      >
        <defs>
          <filter id="lm-thumb-blur" x="-30%" y="-60%" width="160%" height="240%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g transform="translate(132,92)">
          <polygon points={shadow} fill="#000" opacity={0.55} filter="url(#lm-thumb-blur)" />
          {faces.map((face, index) => (
            <polygon
              key={index}
              points={face.points}
              fill={face.fill}
              stroke={face.stroke}
              strokeWidth={face.strokeWidth}
              strokeLinejoin="round"
            />
          ))}
          <polyline
            points={roof}
            fill="none"
            stroke="rgba(255,255,255,.28)"
            strokeWidth={0.8}
            strokeDasharray="2 2"
          />
        </g>
      </svg>
      <span className="absolute top-2.5 right-3 rounded-[4px] bg-black/35 px-1.5 py-0.5 font-mono text-[11px] leading-3.5 text-white/65">
        {formatInteger(placedCount)} / {formatInteger(totalCount)} kiện
      </span>
    </div>
  )
}
