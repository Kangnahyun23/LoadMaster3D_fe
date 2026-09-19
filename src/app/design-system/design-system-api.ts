import { expandPackages } from '@/domain/cargo'
import { getMockDb } from '@/lib/mock-db'

/**
 * Dữ liệu cho mẫu bảng ở `/thanh-phan` (LM-085): đọc thẳng kho như `-api.ts` của các màn, để mẫu dùng số thật
 * (AGENTS mục 6 "Không bịa số") và đủ nhiều dòng để thấy phân trang.
 */

/** Một kiện vật lý của một chuyến trong kho. */
export type SamplePackageRow = {
  readonly tripId: string
  readonly tripName: string
  /** Ngày chạy `YYYY-MM-DD` */
  readonly scheduledDate: string
  /** Mã instance sau khi mở rộng `quantity`, ví dụ `PKG-001-07`. Trùng nhau giữa các chuyến. */
  readonly packageId: string
  readonly goods: string
  readonly stop: number
  readonly weightKg: number
}

export async function fetchSamplePackageRows(): Promise<SamplePackageRow[]> {
  const trips = await getMockDb().listTrips()
  return trips.flatMap((trip) => {
    const { instances, packageIdByInstanceId } = expandPackages(trip.packages)
    const goodsById = new Map(trip.packages.map((pkg) => [pkg.id, pkg.name]))
    return instances.map((instance) => ({
      tripId: trip.id,
      tripName: trip.name,
      scheduledDate: trip.scheduledDate,
      packageId: instance.packageInstanceId,
      goods: goodsById.get(packageIdByInstanceId.get(instance.packageInstanceId) ?? '') ?? '',
      stop: instance.deliveryStop,
      weightKg: instance.weightKg,
    }))
  })
}
