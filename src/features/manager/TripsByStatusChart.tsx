import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFormat, useT } from '@/lib/i18n'
import { ChartCard, ChartTable } from './ChartCard'
import { BAR_FILL, ChartTooltip, HOVER_CURSOR, INITIAL_SIZE, rowsHeight, TICK, VALUE_LABEL } from './chart-style'
import type { DashboardSummary } from './dashboard-summary'

/**
 * Chuyến theo trạng thái, cột ngang theo thứ tự vòng đời (nháp → hoàn thành → huỷ). Nhãn trạng thái nằm trên trục, số chuyến ở
 * đầu mỗi cột nên không cần trục số. Một màu cho mọi cột: màu badge trạng thái để dành cho badge, không mượn làm màu chuỗi.
 */
export function TripsByStatusChart({ entries }: { entries: DashboardSummary['tripsByStatus'] }) {
  const t = useT()
  const format = useFormat()
  const title = t('manager.charts.status.title')
  const data = entries.map((entry) => ({ label: t(`status.${entry.status}`), count: entry.count }))

  return (
    <ChartCard
      title={title}
      note={t('manager.charts.status.note')}
      table={
        <ChartTable
          title={title}
          headers={[t('manager.charts.status.status'), t('manager.charts.status.count')]}
          rows={data.map((entry) => [entry.label, format.integer(entry.count)])}
        />
      }
    >
      <ResponsiveContainer width="100%" height={rowsHeight(data.length)} initialDimension={INITIAL_SIZE}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 40, bottom: 4, left: 0 }} accessibilityLayer={false}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={120} tick={TICK} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={HOVER_CURSOR}
            isAnimationActive={false}
            content={<ChartTooltip formatLabel={(label) => label} formatValue={(value) => format.integer(value)} />}
          />
          <Bar dataKey="count" fill={BAR_FILL} maxBarSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="count"
              position="right"
              formatter={(value) => (typeof value === 'number' ? format.integer(value) : value)}
              {...VALUE_LABEL}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
