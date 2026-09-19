import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFormat, useT } from '@/lib/i18n'
import { ChartCard, ChartTable } from './ChartCard'
import { BAR_FILL, ChartTooltip, HOVER_CURSOR, INITIAL_SIZE, rowsHeight, TICK, VALUE_LABEL } from './chart-style'
import type { DashboardSummary } from './dashboard-summary'

/**
 * Khối lượng đã giao theo xe trong kỳ, xe giao nhiều nhất trên cùng. Tổng các cột bằng KPI "Khối lượng đã giao". Xe có chuyến
 * trong kỳ nhưng chưa giao kiện nào không có cột (số 0 vẫn nằm trong sheet "Theo xe" của báo cáo).
 */
export function WeightByVehicleChart({ vehicles }: { vehicles: DashboardSummary['byVehicle'] }) {
  const t = useT()
  const format = useFormat()
  const title = t('manager.charts.vehicles.title')
  const data = vehicles
    .filter((vehicle) => vehicle.deliveredWeightKg > 0)
    .map((vehicle) => ({ label: vehicle.vehicleName, weight: vehicle.deliveredWeightKg }))

  return (
    <ChartCard
      title={title}
      note={t('manager.charts.vehicles.note')}
      empty={data.length === 0 ? t('manager.charts.vehicles.empty') : undefined}
      table={
        <ChartTable
          title={title}
          headers={[t('manager.charts.vehicles.vehicle'), t('manager.charts.vehicles.weight')]}
          rows={data.map((entry) => [entry.label, format.weight(entry.weight)])}
        />
      }
    >
      <ResponsiveContainer width="100%" height={rowsHeight(data.length)} initialDimension={INITIAL_SIZE}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 88, bottom: 4, left: 0 }} accessibilityLayer={false}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={240} tick={TICK} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={HOVER_CURSOR}
            isAnimationActive={false}
            content={<ChartTooltip formatLabel={(label) => label} formatValue={(value) => format.weight(value)} />}
          />
          <Bar dataKey="weight" fill={BAR_FILL} maxBarSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="weight"
              position="right"
              formatter={(value) => (typeof value === 'number' ? format.weight(value) : value)}
              {...VALUE_LABEL}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
