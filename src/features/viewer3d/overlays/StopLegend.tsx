import { formatDecimal, formatInteger } from '@/lib/format'
import { stopColor } from '@/lib/stops'
import { weightColor, type ColorContext } from '../colors'
import type { ColorMode, PlanStop } from '@/types/load-plan'

/**
 * Chú thích màu nổi góc trên phải. Theo điểm giao / đơn hàng: bảng 8 màu
 * kèm tên và số kiện — màu luôn đi cùng số (mục 10). Theo khối lượng: dải
 * một sắc với hai đầu min/max.
 */
export function StopLegend({
  stops,
  colorMode,
  colorContext,
}: {
  stops: PlanStop[]
  colorMode: ColorMode
  colorContext: ColorContext
}) {
  if (colorMode === 'khoi-luong') {
    const ramp = [0, 0.25, 0.5, 0.75, 1].map(weightColor).join(', ')
    return (
      <div className="flex min-w-50 flex-col gap-2 rounded-md border border-border bg-bg px-3 py-2.5">
        <span className="text-body-lg xl:text-caption text-text-2">Khối lượng mỗi kiện</span>
        <div
          aria-hidden
          className="h-2.5 rounded-xs"
          style={{ background: `linear-gradient(90deg, ${ramp})` }}
        />
        <div className="flex justify-between font-mono text-body-lg xl:text-caption text-text-3">
          <span>{formatDecimal(colorContext.minWeightKg)} kg</span>
          <span>{formatDecimal(colorContext.maxWeightKg)} kg</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-50 flex-col gap-1.5 rounded-md border border-border bg-bg px-3 py-2.5">
      {colorMode === 'don-hang' ? (
        <span className="pb-0.5 text-body-lg xl:text-caption text-text-3">
          Cùng điểm giao, đơn sau tối hơn một nấc
        </span>
      ) : null}
      {stops.map((stop) => (
        <span key={stop.number} className="flex items-center gap-2 text-body-lg xl:text-caption">
          <span
            aria-hidden
            className="size-2.5 flex-none rounded-[3px]"
            style={{ background: stopColor(stop.number) }}
          />
          <span className="flex-1">
            Điểm {stop.number} · {stop.name}
          </span>
          <span className="font-mono text-text-3">
            {formatInteger(stop.packageCount)}
          </span>
        </span>
      ))}
    </div>
  )
}
