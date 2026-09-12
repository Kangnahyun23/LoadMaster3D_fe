import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { ALGORITHM_COMPARISON, ALGORITHMS } from './dashboard.mock'

const AXIS_TICK = {
  fill: 'var(--text-3)',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
}

const VALUE_LABEL = {
  fill: 'var(--text)',
  fontSize: 11,
  fontWeight: 500,
  fontFamily: 'var(--font-mono)',
}

/** recharts không export kiểu này ở gốc package nên khai lại cho khớp. */
type RenderableText = string | number | boolean | null | undefined

const formatPercentLabel = (value: RenderableText): RenderableText =>
  typeof value === 'number' ? `${value.toFixed(1).replace('.', ',')}%` : value

/** So sánh 3 thuật toán trên 2 chỉ số — cột nhóm, nhãn giá trị trên đầu cột. */
export function AlgorithmChart() {
  return (
    <div className="h-55 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={ALGORITHM_COMPARISON}
          margin={{ top: 24, right: 12, bottom: 0, left: 0 }}
          barGap={12}
          barCategoryGap="20%"
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <XAxis
            dataKey="metric"
            tick={{
              fill: 'var(--text-2)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[60, 90]}
            ticks={[60, 70, 80, 90]}
            tickFormatter={(value: number) => `${value}%`}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          {ALGORITHMS.map((algorithm) => (
            <Bar
              key={algorithm.key}
              dataKey={algorithm.key}
              name={algorithm.name}
              fill={algorithm.color}
              radius={[3, 3, 0, 0]}
              maxBarSize={56}
              isAnimationActive={false}
            >
              <LabelList
                dataKey={algorithm.key}
                position="top"
                offset={6}
                formatter={formatPercentLabel}
                {...VALUE_LABEL}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Chú thích màu ba thuật toán, đặt cạnh tiêu đề biểu đồ. */
export function AlgorithmLegend() {
  return (
    <div className="flex gap-3.5 text-caption text-text-2">
      {ALGORITHMS.map((algorithm) => (
        <span key={algorithm.key} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-xs"
            style={{ background: algorithm.color }}
          />
          {algorithm.name}
        </span>
      ))}
    </div>
  )
}
