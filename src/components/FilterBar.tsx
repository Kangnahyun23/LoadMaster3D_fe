import { Search, X } from 'lucide-react'
import { useId, useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import type { SelectOption } from '@/components/ui/SelectField'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Chọn một giá trị; dòng đầu "Tất cả" là không lọc. */
export type FilterSelectField<TName extends string> = {
  kind: 'select'
  name: TName
  label: string
  options: readonly SelectOption[]
  /** Nhãn dòng không lọc; mặc định "Tất cả". */
  allLabel?: string
  /** Bố cục toolbar: đặt ở hàng lọc thứ hai (dưới ô tìm) thay vì cạnh ô tìm. */
  secondary?: boolean
}

/** Khoảng ngày: hai ô `type="date"`, giá trị `YYYY-MM-DD`, mỗi đầu một tham số (`tu`, `den`). */
export type FilterDateRangeField<TName extends string> = {
  kind: 'dateRange'
  label: string
  from: TName
  to: TName
  /** Bố cục toolbar: đặt ở hàng lọc thứ hai (dưới ô tìm) thay vì cạnh ô tìm. */
  secondary?: boolean
}

export type FilterField<TName extends string> = FilterSelectField<TName> | FilterDateRangeField<TName>

/** Radix Select không cho `SelectItem` mang `value=""`, nên dòng "Tất cả" dùng giá trị riêng rồi đổi về `''`. */
const ALL = '*'

/**
 * Thanh tìm và lọc dùng chung của màn danh sách (LM-085). Chỉ trình bày: không biết dữ liệu, màn truyền định nghĩa bộ lọc
 * và giá trị (thường từ `useListUrlState`) rồi tự lọc dòng bằng `@/lib/list-filter`.
 * Nút "Xoá lọc" chỉ hiện khi đang tìm hoặc lọc; bấm xong tiêu điểm về ô tìm để bàn phím không mất chỗ.
 */
export function FilterBar<TName extends string = never>({
  query,
  onQueryChange,
  searchLabel,
  fields = [],
  values,
  onValueChange,
  onClear,
  layout = 'stacked',
  className,
}: {
  query: string
  onQueryChange: (query: string) => void
  /** Nhãn và chữ gợi ý của ô tìm, nói tìm theo gì: "Tìm theo mã, tên chuyến, điểm giao". */
  searchLabel: string
  fields?: readonly FilterField<TName>[]
  values?: Readonly<Record<TName, string>>
  onValueChange?: (name: TName, value: string) => void
  onClear: () => void
  /**
   * `stacked`: nhãn trên ô, các ô nối tiếp. `toolbar` (V2): một hàng trong đầu thẻ bảng — ô tìm giãn bên trái, bộ lọc có nhãn
   * nằm cạnh dồn sang phải. Đang thử ở Đội xe (bước 5) trước khi lan sang màn khác.
   */
  layout?: 'stacked' | 'toolbar'
  className?: string
}) {
  const t = useT()
  const searchRef = useRef<HTMLInputElement>(null)
  const valueOf = (name: TName) => values?.[name] ?? ''
  const setValue = (name: TName, value: string) => onValueChange?.(name, value)
  const isFiltering = query.trim() !== '' || Object.values<string>(values ?? {}).some((value) => value !== '')

  function handleClear() {
    onClear()
    searchRef.current?.focus()
  }

  const toolbar = layout === 'toolbar'
  const render = (field: FilterField<TName>) => field.kind === 'select' ? (
    <SelectFilter key={field.name} field={field} value={valueOf(field.name)} onChange={(value) => setValue(field.name, value)} inline={toolbar} />
  ) : (
    <DateRangeFilter
      key={`${field.from}/${field.to}`}
      label={field.label}
      from={valueOf(field.from)}
      to={valueOf(field.to)}
      onFromChange={(value) => setValue(field.from, value)}
      onToChange={(value) => setValue(field.to, value)}
      inline={toolbar}
    />
  )
  const clear = isFiltering ? (
    <Button variant="ghost" onClick={handleClear}>
      <X strokeWidth={1.5} />
      {t('common.filters.clear')}
    </Button>
  ) : null

  if (!toolbar) {
    return (
      <div role="search" aria-label={t('common.filters.region')} className={cn('flex flex-wrap items-end gap-3', className)}>
        <SearchField ref={searchRef} value={query} onChange={onQueryChange} label={searchLabel} grow={false} />
        {fields.map(render)}
        {clear}
      </div>
    )
  }

  const secondary = fields.filter((field) => field.secondary)
  return (
    <div role="search" aria-label={t('common.filters.region')} className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <SearchField ref={searchRef} value={query} onChange={onQueryChange} label={searchLabel} grow />
        <div className="ml-auto flex flex-wrap items-center gap-3">{clear}{fields.filter((field) => !field.secondary).map(render)}</div>
      </div>
      {secondary.length > 0 ? <div className="flex flex-wrap items-center gap-x-5 gap-y-2">{secondary.map(render)}</div> : null}
    </div>
  )
}

/**
 * Chữ đang nhập giữ tại chỗ. Router đổi URL trong `startTransition`, nên ô nối thẳng vào giá trị URL bị React trả về
 * giá trị cũ giữa hai lần gõ (mất chữ, ô ngày nhảy về trống). Giá trị ngoài đổi (xoá lọc, quay lại trang) thì ô theo.
 */
function useDraft(value: string) {
  const [draft, setDraft] = useState(value)
  const [source, setSource] = useState(value)
  if (value !== source) {
    setSource(value)
    setDraft(value)
  }
  return [draft, setDraft] as const
}

function SearchField({ value, onChange, label, grow, ref }: {
  value: string
  onChange: (value: string) => void
  label: string
  /** Thanh công cụ: ô tìm giãn theo chỗ trống, tối đa 480px. */
  grow: boolean
  ref: Ref<HTMLInputElement>
}) {
  const [draft, setDraft] = useDraft(value)
  return (
    <div className={cn('relative max-w-full', grow ? 'min-w-64 flex-1 sm:max-w-120' : 'w-80')}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-3" strokeWidth={1.5} />
      <Input
        ref={ref}
        type="search"
        aria-label={label}
        placeholder={label}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
          onChange(event.target.value)
        }}
        className="pl-9"
      />
    </div>
  )
}

const FIELD_LABEL = 'text-caption font-medium text-text-2'

function SelectFilter<TName extends string>({ field, value, onChange, inline }: {
  field: FilterSelectField<TName>
  value: string
  onChange: (value: string) => void
  /** Thanh công cụ: nhãn nằm cạnh ô chọn thay vì phía trên. */
  inline: boolean
}) {
  const t = useT()
  const id = useId()
  return (
    <div className={inline ? 'flex items-center gap-2' : 'flex flex-col gap-1'}>
      <label htmlFor={id} className={FIELD_LABEL}>{field.label}</label>
      <Select value={value === '' ? ALL : value} onValueChange={(next) => onChange(next === ALL ? '' : next)}>
        {/* Radix bỏ `className` của SelectValue (chữ của nó được dời sang từ dòng đã chọn), nên cắt chữ dài từ trigger. */}
        <SelectTrigger id={id} className="w-52 text-left [&>span]:min-w-0 [&>span]:truncate">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{field.allLabel ?? t('common.filters.all')}</SelectItem>
          {field.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function DateRangeFilter({ label, from, to, onFromChange, onToChange, inline }: {
  label: string
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  /** Thanh công cụ: nhãn nằm cạnh hai ô ngày thay vì phía trên. */
  inline: boolean
}) {
  const t = useT()
  const labelId = useId()
  const [fromDraft, setFromDraft] = useDraft(from)
  const [toDraft, setToDraft] = useDraft(to)
  return (
    <div role="group" aria-labelledby={labelId} className={inline ? 'flex items-center gap-2' : 'flex flex-col gap-1'}>
      <span id={labelId} className={FIELD_LABEL}>{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-40">
          <Input
            type="date"
            aria-label={t('common.filters.from')}
            value={fromDraft}
            max={toDraft || undefined}
            onChange={(event) => {
              setFromDraft(event.target.value)
              onFromChange(event.target.value)
            }}
          />
        </div>
        <span aria-hidden className="text-body text-text-3">–</span>
        <div className="w-40">
          <Input
            type="date"
            aria-label={t('common.filters.to')}
            value={toDraft}
            min={fromDraft || undefined}
            onChange={(event) => {
              setToDraft(event.target.value)
              onToChange(event.target.value)
            }}
          />
        </div>
      </div>
    </div>
  )
}
