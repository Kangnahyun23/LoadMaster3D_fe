import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchAuditDirectory, fetchAuditEvents, type AuditLogFilter } from './audit-api'

/**
 * Nhật ký qua TanStack Query (mục 9). Đổi bộ lọc giữ bảng cũ trong lúc đọc lại (`keepPreviousData`) nên không nhấp nháy.
 * Mọi thao tác ghi đều thêm sự kiện: mở màn là đọc lại.
 */
export function useAuditEventsQuery(filter: AuditLogFilter) {
  return useQuery({
    queryKey: ['audit', 'events', filter],
    queryFn: () => fetchAuditEvents(filter),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

export function useAuditDirectoryQuery() {
  return useQuery({ queryKey: ['audit', 'directory'], queryFn: fetchAuditDirectory, staleTime: 0 })
}
