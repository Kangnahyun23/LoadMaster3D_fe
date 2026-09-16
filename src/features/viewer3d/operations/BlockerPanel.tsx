import { Button } from '@/components/ui/Button'
import { useFormat, useT } from '@/lib/i18n'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { LifoBlockage } from './unloading'

/** Kiểm LIFO của domain cho kiện đang xem: che kín hoặc che một phần lối dỡ, kèm kiện chắn gần kiện đó trước. */
export function BlockerPanel({ target, lifo, onSelect }: {
  target?: ScenePlacement; lifo: LifoBlockage; onSelect: (placement: ScenePlacement) => void
}) {
  const t = useT()
  const format = useFormat()
  const blockers = lifo?.blockers ?? []
  const summary = !lifo ? t('viewer.operations.blockers.clear')
    : lifo.code === 'LIFO_BLOCKED' ? t('viewer.operations.blockers.blocked', { count: blockers.length })
      : t('viewer.operations.blockers.partial', { count: blockers.length, coverage: format.percent(lifo.coverage * 100) })
  return <section aria-label={t('viewer.operations.blockers.title')} className="flex flex-col gap-2 text-body-lg xl:text-body">
    <h3 className="font-medium">{target?.id ?? t('viewer.operations.blockers.pick')}</h3>
    {target ? <>
      <p>{summary}</p>
      <ul className="max-h-56 overflow-auto">
        {blockers.map((p) => <li key={p.id}><Button variant="ghost" className="h-14 w-full justify-start px-2 font-mono text-body-lg xl:h-11 xl:text-body" onClick={() => onSelect(p)}>
          {t('common.packageAtStop', { id: p.id, stop: p.stop })}
        </Button></li>)}
      </ul>
    </> : null}
    <p className="text-text-2">{t('viewer.operations.blockers.scope')}</p>
  </section>
}
