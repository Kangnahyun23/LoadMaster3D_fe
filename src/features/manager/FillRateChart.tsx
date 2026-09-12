import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { WEEKLY_FILL_RATE } from './dashboard.mock'

const AXIS_TICK = {
  fill: 'var(--text-3)',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
}

/** Tỷ lệ lấp đầy 12 tuần — đường + vùng nền nhạt, chấm tròn mỗi tuần. */
export function FillRateChart() {
  const lastIndex = WEEKLY_FILL_RATE.length - 1

  return (
    <div className="h-55 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={WEEKLY_FILL_RATE}
          margin={{ top: 24, right: 26, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <XAxis
            dataKey="week"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            domain={[74, 88]}
            ticks={[76, 80, 84, 88]}
            tickFormatter={(value: number) => `${value}%`}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Area
            type="linear"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="var(--primary-bg)"
            dot={{
              r: 3,
              fill: 'var(--bg)',
              stroke: 'var(--primary)',
              strokeWidth: 2,
            }}
            activeDot={false}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="value"
              content={({ x, y, index, value }) => {
                if (index !== lastIndex || typeof value !== 'number') return null
                return (
                  <g transform={`translate(${Number(x)}, ${Number(y) - 20})`}>
                    <rect
                      x={-22}
                      y={-10}
                      width={44}
                      height={20}
                      rx={4}
                      fill="var(--primary)"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#FFFFFF"
                      fontSize={11}
                      fontWeight={600}
                      fontFamily="var(--font-mono)"
                    >
                      {value.toFixed(1).replace('.', ',')}%
                    </text>
                  </g>
                )
              }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
