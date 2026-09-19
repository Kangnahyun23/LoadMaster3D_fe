import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { DEFAULT_PERIOD, PERIOD_PARAMS, readPeriodSelection, type DateRange, type PeriodPreset } from './dashboard-period'

/**
 * Kỳ của bảng điều khiển trên URL (D-48, D-52): tải lại hay quay lại vẫn đúng kỳ. Ghi đè mục lịch sử hiện tại như
 * `useListUrlState`, để nút Quay lại không phải lùi qua từng lần đổi kỳ. Kỳ mặc định (30 ngày) không ghi lên URL.
 */
export function useDashboardPeriod() {
  const [params, setParams] = useSearchParams()
  const selection = useMemo(() => readPeriodSelection(params), [params])

  function update(change: (next: URLSearchParams) => void) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      change(next)
      return next
    }, { replace: true })
  }

  return {
    selection,
    /** Chọn kỳ; chuyển sang tuỳ chọn thì hai ô ngày bắt đầu từ khoảng ngày đang xem (`current`). */
    setPreset(preset: PeriodPreset, current: DateRange | undefined) {
      update((next) => {
        if (preset === DEFAULT_PERIOD) next.delete(PERIOD_PARAMS.preset)
        else next.set(PERIOD_PARAMS.preset, preset)
        if (preset === 'tuy-chon' && current) {
          next.set(PERIOD_PARAMS.from, current.from)
          next.set(PERIOD_PARAMS.to, current.to)
        } else if (preset !== 'tuy-chon') {
          next.delete(PERIOD_PARAMS.from)
          next.delete(PERIOD_PARAMS.to)
        }
      })
    },
    /** Một đầu của kỳ tuỳ chọn, `YYYY-MM-DD`; rỗng là xoá. */
    setCustomDate(edge: 'from' | 'to', value: string) {
      update((next) => {
        if (value === '') next.delete(PERIOD_PARAMS[edge])
        else next.set(PERIOD_PARAMS[edge], value)
      })
    },
  }
}
