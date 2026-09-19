import { useQuery } from '@tanstack/react-query'
import { fetchSamplePackageRows } from './design-system-api'

/** Kiện của mọi chuyến cho mẫu bảng `/thanh-phan`; component gọi hook, không gọi `design-system-api.ts` (mục 9). */
export function useSamplePackagesQuery() {
  return useQuery({ queryKey: ['design-system', 'packages'], queryFn: fetchSamplePackageRows })
}
