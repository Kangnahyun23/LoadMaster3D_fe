import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useFormat, useT, type MessageKey } from '@/lib/i18n'
import { PERIOD_PRESETS, type DateRange, type PeriodPreset, type PeriodSelection } from './dashboard-period'

const PRESET_LABELS = {
  '7-ngay': 'manager.period.presets.last7',
  '30-ngay': 'manager.period.presets.last30',
  'thang-nay': 'manager.period.presets.thisMonth',
  'tuy-chon': 'manager.period.presets.custom',
} as const satisfies Record<PeriodPreset, MessageKey>

/**
 * Hàng lọc kỳ nằm trên mọi KPI, biểu đồ và bảng mà nó áp vào: chọn 7 ngày / 30 ngày / tháng này / tuỳ chọn, cạnh đó là
 * khoảng ngày đã giải để người đọc biết "30 ngày" là từ hôm nào.
 */
export function PeriodFilter({
  selection,
  range,
  onPresetChange,
  onDateChange,
}: {
  selection: PeriodSelection
  /** Khoảng ngày đang xem; vắng khi số liệu chưa tải xong. */
  range: DateRange | undefined
  onPresetChange: (preset: PeriodPreset) => void
  onDateChange: (edge: 'from' | 'to', value: string) => void
}) {
  const t = useT()
  const format = useFormat()

  return (
    <div className="flex flex-none flex-wrap items-end gap-x-4 gap-y-3">
      <div className="flex flex-col gap-1">
        <span className="text-caption font-medium text-text-2">{t('manager.period.label')}</span>
        <SegmentedControl
          ariaLabel={t('manager.period.label')}
          floating={false}
          options={PERIOD_PRESETS.map((value) => ({ value, label: t(PRESET_LABELS[value]) }))}
          value={selection.preset}
          onChange={onPresetChange}
          className="self-start"
        />
      </div>
      {selection.preset === 'tuy-chon' ? (
        <div className="flex items-center gap-2">
          <DateField label={t('manager.period.from')} value={selection.from} max={selection.to} onChange={(value) => onDateChange('from', value)} />
          <span aria-hidden className="text-body text-text-3">–</span>
          <DateField label={t('manager.period.to')} value={selection.to} min={selection.from} onChange={(value) => onDateChange('to', value)} />
        </div>
      ) : null}
      {range ? (
        <span className="pb-2 font-mono text-caption text-text-2">
          {t('manager.period.range', { from: format.date(range.from), to: format.date(range.to) })}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Ô ngày giữ bản nháp tại chỗ như `FilterBar`: router đổi URL trong `startTransition`, ô nối thẳng vào giá trị URL sẽ nhảy về
 * giá trị cũ giữa hai lần gõ. Giá trị ngoài đổi (chọn kỳ khác rồi quay lại) thì ô theo.
 */
function DateField({ label, value, min, max, onChange }: {
  label: string
  value: string
  min?: string
  max?: string
  onChange: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const [source, setSource] = useState(value)
  if (value !== source) {
    setSource(value)
    setDraft(value)
  }
  return (
    <div className="w-40">
      <Input
        type="date"
        aria-label={label}
        value={draft}
        min={min || undefined}
        max={max || undefined}
        onChange={(event) => {
          setDraft(event.target.value)
          onChange(event.target.value)
        }}
      />
    </div>
  )
}
