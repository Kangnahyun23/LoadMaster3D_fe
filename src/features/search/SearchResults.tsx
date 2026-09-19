import { Package, Truck, UserRound, Warehouse, type LucideIcon } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { useT, type TFunction } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { SearchGroup, SearchResult, SearchResultGroup } from './quick-search'

/** Icon trùng mục nav của màn đích (chuyến: xe tải, đội xe: nhà kho, người dùng). */
const GROUP_ICONS: Readonly<Record<SearchGroup, LucideIcon>> = {
  trips: Truck,
  packages: Package,
  vehicles: Warehouse,
  users: UserRound,
}

/**
 * Danh sách kết quả của tìm nhanh (LM-099): listbox chia nhóm theo loại, mỗi nhóm có tiêu đề. Con trỏ nằm ở ô nhập
 * (`aria-activedescendant`), nên ở đây chỉ vẽ dòng đang chọn và nhận chuột; bàn phím do ô nhập xử lý.
 */
export function SearchResults({ listId, groups, activeIndex, indexOf, optionId, onHover, onOpen }: {
  listId: string
  groups: readonly SearchResultGroup[]
  activeIndex: number
  /** Vị trí của kết quả trong danh sách phẳng (thứ tự mũi tên). */
  indexOf: ReadonlyMap<string, number>
  optionId: (index: number) => string
  onHover: (key: string) => void
  onOpen: (result: SearchResult) => void
}) {
  const t = useT()
  return (
    <div role="listbox" id={listId} aria-label={t('search.results')} className="flex flex-col gap-2 p-2">
      {groups.map(({ group, results }) => (
        <ResultGroup key={group} group={group}>
          {results.map((result) => {
            const index = indexOf.get(result.key) ?? -1
            return (
              <ResultOption
                key={result.key}
                id={optionId(index)}
                result={result}
                active={index === activeIndex}
                onHover={() => onHover(result.key)}
                onOpen={() => onOpen(result)}
              />
            )
          })}
        </ResultGroup>
      ))}
    </div>
  )
}

function ResultGroup({ group, children }: { group: SearchGroup; children: ReactNode }) {
  const t = useT()
  const labelId = useId()
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col">
      <div id={labelId} className="px-3 pt-1 pb-1.5 text-caption font-medium text-text-3">
        {t(`search.groups.${group}`)}
      </div>
      {children}
    </div>
  )
}

function ResultOption({ id, result, active, onHover, onOpen }: {
  id: string
  result: SearchResult
  active: boolean
  onHover: () => void
  onOpen: () => void
}) {
  const t = useT()
  const Icon = GROUP_ICONS[result.group]
  const { title, detail } = describeResult(result, t)
  return (
    <div
      role="option"
      id={id}
      aria-selected={active}
      onMouseMove={active ? undefined : onHover}
      onClick={onOpen}
      className={cn(
        'flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-3 py-2',
        active ? 'bg-primary-bg' : 'hover:bg-surface',
      )}
    >
      <Icon className={cn('size-5 flex-none', active ? 'text-primary-hover' : 'text-text-3')} strokeWidth={1.5} aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn('truncate text-body font-medium text-text', result.group === 'packages' && 'font-mono')}>{title}</span>
        <span className={cn('truncate text-caption text-text-2', result.group !== 'users' && result.group !== 'packages' && 'font-mono')}>
          {detail}
        </span>
      </span>
    </div>
  )
}

function describeResult(result: SearchResult, t: TFunction): { title: string; detail: string } {
  switch (result.group) {
    case 'trips':
    case 'vehicles':
      return { title: result.name, detail: result.id }
    case 'packages':
      return { title: result.id, detail: t('search.inTrip', { trip: result.tripId, name: result.tripName }) }
    case 'users':
      return { title: result.name, detail: `${result.email} · ${t(`roles.${result.role}`)}` }
  }
}
