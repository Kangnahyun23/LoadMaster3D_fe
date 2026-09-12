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
    <div className="flex w-70 flex-col gap-2 rounded-md border border-border bg-bg p-3 shadow-e2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption font-medium text-text-3">
          Cắt lớp theo chiều dài
        </span>
        <span className="font-mono text-caption font-medium">{label}</span>
      </div>
      <input
        type="range"
        className="lm-range"
        min={0}
        max={maxMm}
        step={SLICE_STEP_MM}
        value={sliceMm}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Cắt lớp theo chiều dài"
        aria-valuetext={label}
        style={{ '--lm-range-fill': `${percent}%` } as CSSProperties}
      />
      <div className="flex justify-between font-mono text-[11px] leading-3.5 text-text-3">
        <span>Vách trước</span>
        <span>Cửa sau</span>
      </div>
    </div>
  )
}
