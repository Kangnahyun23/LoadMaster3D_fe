import type { TripStatus } from '@/types/trip'

/** Dữ liệu mẫu cho bảng điều khiển, lấy nguyên từ bản design. */

export type KpiTone = 'good' | 'bad'

export type Kpi = {
  label: string
  value: number
  unit: string
  /** Chênh lệch so với kỳ trước, đã định dạng sẵn vì có cả đơn vị giây */
  delta: string
  /** Mũi tên chỉ xuống khi giá trị giảm */
  direction: 'up' | 'down'
  tone: KpiTone
  note: string
}

export const KPIS: Kpi[] = [
  {
    label: 'Tỷ lệ lấp đầy trung bình',
    value: 84.2,
    unit: '%',
    delta: '+3,1%',
    direction: 'up',
    tone: 'good',
    note: 'Kỳ trước 81,1%',
  },
  {
    label: 'Tỷ lệ tải trọng trung bình',
    value: 79.5,
    unit: '%',
    delta: '+1,4%',
    direction: 'up',
    tone: 'good',
    note: 'Kỳ trước 78,1%',
  },
  {
    label: 'Thời gian tối ưu trung bình',
    value: 38,
    unit: 'giây',
    delta: '−6 giây',
    direction: 'down',
    tone: 'good',
    note: 'Kỳ trước 44 giây',
  },
  {
    label: 'Chênh lệch kế hoạch với thực tế',
    value: 6.3,
    unit: '%',
    delta: '−1,2%',
    direction: 'down',
    tone: 'good',
    note: 'Kỳ trước 7,5% · thấp hơn là tốt',
  },
]

/** Tỷ lệ lấp đầy 12 tuần gần nhất, nhãn trục là tuần T27…T38. */
export const WEEKLY_FILL_RATE = [
  79.1, 80.4, 79.8, 81.6, 82.3, 81.9, 83.4, 84.0, 83.6, 84.8, 85.1, 84.2,
].map((value, index) => ({ week: `T${27 + index}`, value }))

export const ALGORITHMS = [
  { key: 'heuristic', name: 'Heuristic', color: 'var(--text-disabled)' },
  { key: 'ga', name: 'GA', color: 'var(--primary)' },
  { key: 'gaLifo', name: 'GA có LIFO', color: 'var(--info)' },
] as const

export const ALGORITHM_COMPARISON = [
  {
    metric: 'Tỷ lệ lấp đầy trung bình',
    heuristic: 78.4,
    ga: 86.9,
    gaLifo: 85.2,
  },
  {
    metric: 'Tỷ lệ tải trọng trung bình',
    heuristic: 72.1,
    ga: 81.3,
    gaLifo: 80.6,
  },
]

export type PlanVsActualRow = {
  id: string
  date: string
  truck: string
  plate: string
  /** Tỷ lệ lấp đầy theo kế hoạch, % */
  plan: number
  /** Tỷ lệ lấp đầy thực tế, % */
  actual: number
  /** Số kiện xếp sai so với kế hoạch */
  deviations: number
  status: TripStatus
}

export const PLAN_VS_ACTUAL: PlanVsActualRow[] = [
  {
    id: 'TRIP-2026-0911',
    date: '11/09/2026',
    truck: 'Hyundai HD210',
    plate: '60C-446.32',
    plan: 87.4,
    actual: 86.1,
    deviations: 1,
    status: 'dang_giao',
  },
  {
    id: 'TRIP-2026-0910',
    date: '10/09/2026',
    truck: 'Isuzu NQR 550',
    plate: '51C-284.19',
    plan: 84.9,
    actual: 84.2,
    deviations: 0,
    status: 'hoan_thanh',
  },
  {
    id: 'TRIP-2026-0909',
    date: '09/09/2026',
    truck: 'Hino FC9J',
    plate: '51C-190.07',
    plan: 89.6,
    actual: 82.3,
    deviations: 4,
    status: 'can_xem_lai',
  },
  {
    id: 'TRIP-2026-0908',
    date: '08/09/2026',
    truck: 'Hyundai HD210',
    plate: '60C-446.32',
    plan: 83.1,
    actual: 83.0,
    deviations: 0,
    status: 'hoan_thanh',
  },
  {
    id: 'TRIP-2026-0907',
    date: '07/09/2026',
    truck: 'Thaco Ollin 720',
    plate: '51D-118.62',
    plan: 78.2,
    actual: 76.8,
    deviations: 2,
    status: 'hoan_thanh',
  },
  {
    id: 'TRIP-2026-0906',
    date: '06/09/2026',
    truck: 'Isuzu NQR 550',
    plate: '51C-284.19',
    plan: 86.0,
    actual: 79.4,
    deviations: 5,
    status: 'can_xem_lai',
  },
  {
    id: 'TRIP-2026-0905',
    date: '05/09/2026',
    truck: 'Hino FC9J',
    plate: '51C-190.07',
    plan: 81.7,
    actual: 81.5,
    deviations: 1,
    status: 'hoan_thanh',
  },
]

export const TOTAL_TRIPS = 86
export const PERIOD_LABEL = '13/08 – 11/09/2026 · so với 30 ngày trước đó'
