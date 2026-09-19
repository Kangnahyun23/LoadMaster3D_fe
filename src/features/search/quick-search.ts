import type { Permission } from '@/features/auth/permissions'
import { matchesQuery, normalizeSearchText } from '@/lib/list-filter'
import type { Role } from '@/types/user'

/**
 * Tìm nhanh Ctrl+K (LM-099, D-55): chuyến, kiện, xe, người dùng. Hàm thuần: `search-api.ts` đọc kho, màn gọi `searchSources` mỗi lần
 * gõ. Tìm không phân biệt dấu và hoa thường, mọi từ phải có (`matchesQuery` của danh sách, LM-085).
 */
export const SEARCH_GROUPS = ['trips', 'packages', 'vehicles', 'users'] as const
export type SearchGroup = (typeof SEARCH_GROUPS)[number]

/** Quyền để thấy một nhóm — trùng quyền mở màn đích. Kiện mở trong chi tiết chuyến nên theo quyền xem chuyến. */
export const GROUP_PERMISSION: Readonly<Record<SearchGroup, Permission>> = {
  trips: 'trips.view',
  packages: 'trips.view',
  vehicles: 'fleet.view',
  users: 'users.manage',
}

export const RESULTS_PER_GROUP = 8

export type SearchSources = {
  readonly trips: readonly {
    readonly id: string
    readonly name: string
    /** Tên các điểm giao. */
    readonly stops: readonly string[]
    /** Mã kiện gốc của chuyến. */
    readonly packageIds: readonly string[]
  }[]
  readonly vehicles: readonly { readonly id: string; readonly name: string }[]
  readonly users: readonly { readonly id: string; readonly fullName: string; readonly email: string; readonly role: Role }[]
}

type ResultBase = { readonly key: string; readonly href: string; readonly id: string }

export type SearchResult =
  | (ResultBase & { readonly group: 'trips'; readonly name: string })
  | (ResultBase & { readonly group: 'packages'; readonly tripId: string; readonly tripName: string })
  | (ResultBase & { readonly group: 'vehicles'; readonly name: string })
  | (ResultBase & { readonly group: 'users'; readonly name: string; readonly email: string; readonly role: Role })

export type SearchResultGroup = { readonly group: SearchGroup; readonly results: readonly SearchResult[] }

const path = (value: string) => encodeURIComponent(value)

/**
 * Kết quả theo nhóm, đúng thứ tự `groups` (chỉ nhóm người dùng được xem), mỗi nhóm tối đa `RESULTS_PER_GROUP` theo thứ tự của kho;
 * nhóm không có kết quả thì bỏ. Từ khoá rỗng: không có kết quả nào.
 * - Chuyến: mã, tên, tên điểm giao → chi tiết chuyến.
 * - Kiện: mã kiện gốc → chi tiết chuyến mở đúng kiện (`?kien=`, LM-047).
 * - Xe: mã, tên (tên xe gồm biển số) → chi tiết xe.
 * - Người dùng: họ tên, email, mã → danh sách người dùng lọc đúng mã.
 */
export function searchSources(sources: SearchSources, query: string, groups: readonly SearchGroup[]): SearchResultGroup[] {
  if (normalizeSearchText(query) === '') return []
  const matchers: Record<SearchGroup, () => SearchResult[]> = {
    trips: () =>
      sources.trips
        .filter((trip) => matchesQuery([trip.id, trip.name, ...trip.stops], query))
        .map((trip) => ({ group: 'trips', key: `trip:${trip.id}`, href: `/chuyen/${path(trip.id)}`, id: trip.id, name: trip.name })),
    packages: () =>
      sources.trips.flatMap((trip) =>
        trip.packageIds
          .filter((packageId) => matchesQuery(packageId, query))
          .map((packageId) => ({
            group: 'packages', key: `package:${trip.id}:${packageId}`, href: `/chuyen/${path(trip.id)}?kien=${path(packageId)}`,
            id: packageId, tripId: trip.id, tripName: trip.name,
          })),
      ),
    vehicles: () =>
      sources.vehicles
        .filter((vehicle) => matchesQuery([vehicle.id, vehicle.name], query))
        .map((vehicle) => ({ group: 'vehicles', key: `vehicle:${vehicle.id}`, href: `/doi-xe/${path(vehicle.id)}`, id: vehicle.id, name: vehicle.name })),
    users: () =>
      sources.users
        .filter((user) => matchesQuery([user.fullName, user.email, user.id], query))
        .map((user) => ({
          group: 'users', key: `user:${user.id}`, href: `/nguoi-dung?q=${path(user.id)}`,
          id: user.id, name: user.fullName, email: user.email, role: user.role,
        })),
  }
  return groups
    .map((group) => ({ group, results: matchers[group]().slice(0, RESULTS_PER_GROUP) }))
    .filter((entry) => entry.results.length > 0)
}
