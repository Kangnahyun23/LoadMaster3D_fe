import { TRIPS, type TripSummary } from './trip-list.mock'

/**
 * Lớp gọi API cho chuyến hàng. Backend Spring Boot chưa có nên trả dữ liệu
 * mẫu sau một khoảng trễ giống mạng thật; khi nối API chỉ thay thân hàm,
 * mọi hook và component giữ nguyên.
 */

const NETWORK_DELAY_MS = 900

export async function fetchTrips({ empty = false }: { empty?: boolean } = {}): Promise<TripSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  return empty ? [] : TRIPS
}
