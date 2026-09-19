import { skipToken, useQuery } from '@tanstack/react-query'
import type { SearchGroup } from './quick-search'
import { fetchSearchSources } from './search-api'

/**
 * Dữ liệu để tìm nhanh (LM-099). Hộp thoại chỉ gắn khi mở, nên chỉ đọc kho lúc mở; `staleTime: 0` để mỗi lần mở đọc lại — chuyến, xe,
 * người dùng vừa thêm có trong kết quả, trong lúc chờ vẫn tìm trên dữ liệu lần trước. Lọc theo từ khoá chạy trên máy, không gọi kho
 * mỗi lần gõ.
 */
export function useSearchSourcesQuery(groups: readonly SearchGroup[]) {
  return useQuery({
    queryKey: ['quick-search', groups],
    queryFn: groups.length > 0 ? () => fetchSearchSources(groups) : skipToken,
    staleTime: 0,
  })
}
