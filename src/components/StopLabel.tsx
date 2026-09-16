import { useT } from '@/lib/i18n'

/** Nhãn mặc định cho điểm giao ("Điểm 3" · "Stop 3"), dịch theo ngôn ngữ đang chọn (LM-070). */
export function StopLabel({ number }: { number: number }) {
  const t = useT()
  return <>{t('common.stop', { number })}</>
}
