import type { CSSProperties } from 'react'
import { formatInteger } from '@/lib/format'

const SLICE_STEP_MM = 50

/**
 * Panel nổi góc dưới phải: thanh trượt cắt lớp theo chiều dài thùng.
 * Kéo về trái là bỏ dần các kiện gần cửa sau để nhìn vào trong.
 */
export function SlicePanel({
  sliceMm,
  maxMm,
  onChange,
}: {
  sliceMm: number
  maxMm: number
  onChange: (sliceMm: number) => void
}) {
  const percent = (sliceMm / maxMm) * 100
  const label = sliceMm >= maxMm ? 'Toàn bộ' : `${formatInteger(sliceMm)} mm`

  return (
    <div className="flex w-full max-w-80 flex-col gap-2 rounded-md border border-border bg-bg p-3 xl:w-70">
      <div className="flex items-center justify-between gap-3">
        <span className="text-body-lg font-medium text-text-2 xl:text-caption">
          Cắt lớp theo chiều dài
        </span>
        <span className="font-mono text-body-lg font-medium xl:text-caption">{label}</span>
      </div>
      <input
        type="range"
        className="lm-range min-h-14 xl:min-h-0"
        min={0}
        max={maxMm}
        step={SLICE_STEP_MM}
        value={sliceMm}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Cắt lớp theo chiều dài"
        aria-valuetext={label}
        style={{ '--lm-range-fill': `${percent}%` } as CSSProperties}
      />
      <div className="flex justify-between font-mono text-body-lg text-text-2 xl:text-caption">
        <span>Vách trước</span>
        <span>Cửa sau</span>
      </div>
    </div>
  )
}
