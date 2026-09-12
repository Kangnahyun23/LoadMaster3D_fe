import { Check } from 'lucide-react'
import { formatInteger } from '@/lib/format'

/**
 * Lớp phủ xác nhận sau khi bấm "Xác nhận đã xếp": vòng tròn xanh lớn,
 * mã kiện vừa xếp và bước kế tiếp. Tự ẩn sau ~1,2 giây.
 * Là lớp nổi nên vòng tròn được phép có bóng (mục 5).
 */
export function ConfirmedOverlay({
  confirmedId,
  nextStep,
}: {
  confirmedId: string
  nextStep: number
}) {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="absolute inset-0 z-5 flex flex-col items-center justify-center gap-5 bg-bg/82 animate-[lm-fade-in_220ms_var(--ease-standard)]"
    >
      <span className="grid size-40 place-items-center rounded-full bg-success shadow-[0_12px_32px_rgb(22_163_74_/_0.35)]">
        <Check className="size-22 text-white" strokeWidth={3} aria-hidden />
      </span>
      <span className="text-[28px] leading-9 font-semibold text-text">
        Đã xếp <span className="font-mono">{confirmedId}</span>
      </span>
      <span className="text-[18px] leading-6 text-text-2">
        Chuyển sang bước {formatInteger(nextStep)}…
      </span>
    </div>
  )
}
