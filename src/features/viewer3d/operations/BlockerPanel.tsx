import { Button } from '@/components/ui/Button'
import { formatInteger } from '@/lib/format'
import type { Placement } from '@/types/load-plan'

export function BlockerPanel({ target, blockers, onSelect }: {
  target?: Placement; blockers: readonly Placement[]; onSelect: (placement: Placement) => void
}) {
  return <section aria-label="Kiện có khả năng cản đường" className="flex flex-col gap-2 text-body-lg xl:text-body">
    <h3 className="font-medium">{target?.id ?? 'Chọn kiện để xem đường dỡ'}</h3>
    {target ? <>
      <p>{blockers.length ? `Có ${formatInteger(blockers.length)} kiện có khả năng cản đường:` : 'Chưa thấy kiện giao cắt hành lang dỡ thẳng.'}</p>
      <ul className="max-h-56 overflow-auto">
        {blockers.map((p) => <li key={p.id}><Button variant="ghost" className="h-14 w-full justify-start px-2 font-mono text-body-lg xl:h-11 xl:text-body" onClick={() => onSelect(p)}>
          {p.id} · Điểm {p.stop}
        </Button></li>)}
      </ul>
    </> : null}
    <p className="text-text-2">Chỉ xét hành lang thẳng về cửa sau. Chưa tính khoảng hở thao tác, người, xe nâng hoặc xoay kiện khi dỡ.</p>
  </section>
}
