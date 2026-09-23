import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFormat, useT } from '@/lib/i18n'
import { ChartCard, ChartTable } from './ChartCard'
import { BAR_FILL, ChartTooltip, HOVER_CURSOR, INITIAL_SIZE, rowsHeight, TICK, VALUE_LABEL } from './chart-style'
import type { DashboardSummary } from './dashboard-summary'
import { vehicleTickLines } from './vehicle-tick-lines'

/** Trục tên xe: đủ cho 22 ký tự cỡ micro; tên dài hơn xuống dòng theo từ (`vehicleTickLines`). */
const AXIS_WIDTH = 148
const TICK_CHARS = 22
const TICK_LINE_HEIGHT = 13
/** Mỗi hàng đủ ba dòng nhãn: hai dòng tên dòng xe và biển số. */
const ROW_HEIGHT = 52

/**
 * Khối lượng đã giao theo xe trong kỳ, cột ngang, xe giao nhiều nhất trên cùng; tổng các cột bằng KPI "Khối lượng đã giao". Tên xe
 * trên trục xuống dòng trước biển số nên thẻ hẹp của lưới V2 không cắt biển số. Xe có chuyến trong kỳ nhưng chưa giao kiện nào
 * không có cột (số 0 vẫn nằm trong sheet "Theo xe" của báo cáo).
 */
export function WeightByVehicleChart({ vehicles, className }: { vehicles: DashboardSummary['byVehicle']; className?: string }) {
  const t = useT()
  const format = useFormat()
  const title = t('manager.charts.vehicles.title')
  const delivered = vehicles.filter((vehicle) => vehicle.deliveredWeightKg > 0)
  const total = delivered.reduce((sum, vehicle) => sum + vehicle.deliveredWeightKg, 0)
  const data = delivered.map((vehicle) => ({
    label: vehicle.vehicleName,
    weight: vehicle.deliveredWeightKg,
    share: format.percent((vehicle.deliveredWeightKg / total) * 100),
  }))
  const shareByLabel = new Map(data.map((entry) => [entry.label, entry.share]))

  return (
    <ChartCard
      className={className}
      title={title}
      note={t('manager.charts.vehicles.note')}
      empty={data.length === 0 ? t('manager.charts.vehicles.empty') : undefined}
      table={
        <ChartTable
          title={title}
          headers={[t('manager.charts.vehicles.vehicle'), t('manager.charts.vehicles.weight'), t('manager.charts.vehicles.share')]}
          rows={data.map((entry) => [entry.label, format.weight(entry.weight), entry.share])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={rowsHeight(data.length, ROW_HEIGHT)} initialDimension={INITIAL_SIZE}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 80, bottom: 4, left: 0 }} accessibilityLayer={false}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={AXIS_WIDTH} tick={<VehicleTick />} tickLine={false} axisLine={false} interval={0} />
          <Tooltip
            cursor={HOVER_CURSOR}
            isAnimationActive={false}
            content={
              <ChartTooltip
                formatLabel={(label) => label}
                formatValue={(value) => format.weight(value)}
                formatDetail={(label) => shareByLabel.get(label)}
              />
            }
          />
          <Bar dataKey="weight" fill={BAR_FILL} maxBarSize={24} radius={[0, 4, 4, 0]} isAnimationActive={false}>
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

/**
 * Nhãn trục tên xe nhiều dòng, căn giữa theo cột. recharts nhân bản phần tử và gắn `x`, `y` (mép phải trục, giữa hàng) cùng
 * `payload` của nhãn.
 */
function VehicleTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value?: unknown } }) {
  const lines = vehicleTickLines(String(payload?.value ?? ''), TICK_CHARS)
  const top = y - ((lines.length - 1) * TICK_LINE_HEIGHT) / 2
  return (
    <text x={x} y={top} textAnchor="end" dominantBaseline="central" fontSize={TICK.fontSize} fill={TICK.fill}>
      {lines.map((line, index) => (
        <tspan key={index} x={x} y={top + index * TICK_LINE_HEIGHT}>{line}</tspan>
      ))}
    </text>
  )
}
