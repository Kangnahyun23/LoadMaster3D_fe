import { VehicleName } from '@/components/VehicleName'
import { useFormat, useT } from '@/lib/i18n'
import { ChartCard, ChartTable } from './ChartCard'
import type { DashboardSummary } from './dashboard-summary'
import { ShareBars } from './ShareBars'

/**
 * Khối lượng đã giao theo xe trong kỳ, xe giao nhiều nhất trên cùng; tổng các hàng bằng KPI "Khối lượng đã giao". Dạng hàng thanh
 * xếp chồng (V2): tên xe có biển số một dòng riêng nên cột hẹp không cắt biển số. Xe có chuyến trong kỳ nhưng chưa giao kiện nào
 * không có hàng (số 0 vẫn nằm trong sheet "Theo xe" của báo cáo).
 */
export function WeightByVehicleChart({ vehicles, className }: { vehicles: DashboardSummary['byVehicle']; className?: string }) {
  const t = useT()
  const format = useFormat()
  const title = t('manager.charts.vehicles.title')
  const delivered = vehicles.filter((vehicle) => vehicle.deliveredWeightKg > 0)
  const total = delivered.reduce((sum, vehicle) => sum + vehicle.deliveredWeightKg, 0)
  const rows = delivered.map((vehicle) => {
    const share = (vehicle.deliveredWeightKg / total) * 100
    return {
      key: vehicle.vehicleId,
      name: vehicle.vehicleName,
      value: format.weight(vehicle.deliveredWeightKg),
      share,
      shareLabel: format.percent(share),
    }
  })

  return (
    <ChartCard
      className={className}
      title={title}
      note={t('manager.charts.vehicles.note')}
      empty={rows.length === 0 ? t('manager.charts.vehicles.empty') : undefined}
      table={
        <ChartTable
          title={title}
          headers={[t('manager.charts.vehicles.vehicle'), t('manager.charts.vehicles.weight'), t('manager.charts.vehicles.share')]}
          rows={rows.map((row) => [row.name, row.value, row.shareLabel])}
        />
      }
    >
      <ShareBars
        layout="stacked"
        rows={rows.map((row) => ({ ...row, label: <VehicleName name={row.name} className="line-clamp-2" /> }))}
      />
    </ChartCard>
  )
}
