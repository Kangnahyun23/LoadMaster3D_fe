const WIDTH = 584
const HEIGHT = 56
/** Trục dọc cố định để hai trạng thái so sánh được với nhau. */
const LOW = 60
const HIGH = 91

/** Tỷ lệ lấp đầy tốt nhất ở vòng tối ưu đầu tiên. */
export const START_FILL_RATE = 62

/**
 * Đường tốt-nhất-đến-hiện-tại qua từng vòng tối ưu.
 * Đơn điệu tăng: mỗi vòng chỉ giữ lại kết quả tốt hơn vòng trước.
 */
function bestSoFarPoints(generations: number, target: number) {
  const points: Array<[number, number]> = []
  let best = START_FILL_RATE

  for (let i = 0; i < generations; i++) {
    const base =
      START_FILL_RATE +
      (target - START_FILL_RATE) * (1 - Math.exp(-i / (generations * 0.28)))
    const noise = Math.sin(i * 1.7) * 0.8 + Math.sin(i * 0.37) * 0.5
    best = Math.max(best, Math.min(target, base + noise))
    if (i === generations - 1) best = target

    points.push([
      (i / (generations - 1)) * WIDTH,
      HEIGHT - ((best - LOW) / (HIGH - LOW)) * HEIGHT,
    ])
  }

  return points
}

export function GenerationSparkline({
  generations,
  target,
  /** Chấm cuối đổi sang xanh lá khi đã chạy xong. */
  done = false,
}: {
  generations: number
  target: number
  done?: boolean
}) {
  const points = bestSoFarPoints(generations, target)
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1] ?? [0, HEIGHT]
  const area = `0,${HEIGHT} ${line} ${last[0].toFixed(1)},${HEIGHT}`

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block w-full overflow-visible"
      aria-hidden
    >
      <polygon points={area} fill="var(--primary-bg)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={last[0].toFixed(1)}
        cy={last[1].toFixed(1)}
        r={3}
        fill={done ? 'var(--success)' : 'var(--primary)'}
        stroke="var(--bg)"
        strokeWidth={1.5}
      />
    </svg>
  )
}
