import type { CSSProperties } from 'react'
import { useFormat } from '@/lib/i18n'

const SLICE_STEP_CM = 5

/**
 * Panel nổi góc dưới phải: thanh trượt cắt lớp theo chiều dài thùng.
 * Kéo về trái là bỏ dần các kiện gần cửa sau để nhìn vào trong.
 */
export function SlicePanel({
  sliceCm,
  maxCm,
  onChange,
}: {
  sliceCm: number
  maxCm: number
  onChange: (sliceCm: number) => void
}) {
  const format = useFormat()
  const percent = (sliceCm / maxCm) * 100
  const label = sliceCm >= maxCm ? 'Toàn bộ' : format.length(sliceCm)

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
        max={maxCm}
        step={SLICE_STEP_CM}
        value={sliceCm}
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
