import { Button } from '@/components/ui/Button'
import type { PlanStop } from '@/types/load-plan'
import type { OperationsState } from './useOperations'

export function OperationsToolbar({ operations, stops }: { operations: OperationsState; stops: readonly PlanStop[] }) {
  return <div className="flex flex-none items-center gap-2 overflow-x-auto border-b border-border bg-bg px-2 py-1 text-body-lg xl:text-body">
    <div role="group" aria-label="Mô phỏng vận hành" className="flex gap-1">
      {(['loading', 'unloading'] as const).map((kind) => <Button key={kind} variant="secondary"
        className="h-14 px-3 text-body-lg aria-pressed:border-primary aria-pressed:bg-primary-bg xl:h-11 xl:text-body"
        aria-pressed={operations.kind === kind} onClick={() => operations.setKind(kind)}>{kind === 'loading' ? 'Xếp hàng' : 'Dỡ hàng'}</Button>)}
    </div>
    <label className="ml-auto flex min-w-0 items-center gap-2">
      <span className="hidden sm:inline">Điểm giao</span>
      <select aria-label="Tập trung điểm giao" value={operations.focusStop ?? ''} onChange={(e) => operations.setFocusStop(e.target.value ? Number(e.target.value) : null)}
        className="h-14 max-w-44 min-w-0 rounded-md border border-border bg-bg px-2 focus-visible:outline-2 focus-visible:outline-primary xl:h-11 xl:max-w-80">
        {operations.kind === 'loading' ? <option value="">Tất cả điểm</option> : null}
        {stops.map((stop) => <option key={stop.number} value={stop.number}>Điểm {stop.number} · {stop.name}</option>)}
      </select>
    </label>
  </div>
}
