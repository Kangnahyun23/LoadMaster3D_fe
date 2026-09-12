import { Calendar, ChevronLeft, FileUp, Play, Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { OptimizationDialog } from '@/features/optimization/OptimizationDialog'
import { OptimizationErrorDialog } from '@/features/optimization/OptimizationErrorDialog'
import { useOptimizationJob } from '@/features/optimization/useOptimizationJob'
import { formatInteger } from '@/lib/format'
import { notifyPendingFeature } from '@/lib/pending-feature'
import { CargoSummaryCard } from './CargoSummaryCard'
import { OrdersTable } from './OrdersTable'
import { StopList } from './StopList'
import { ORDERS, TRIP, VEHICLE } from './trip-detail.mock'
import { VehicleCard } from './VehicleCard'

/**
 * Chi tiết chuyến hàng — ba cột: phương tiện & hàng hoá, thứ tự điểm giao,
 * đơn hàng. Hành động chính duy nhất là "Chạy tối ưu" (CLAUDE.md mục 5).
 * Thêm `?mo-phong=loi` vào URL để xem hộp thoại lỗi tối ưu (chưa có backend).
 */
export function TripDetailPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const { progress, start, cancel } = useOptimizationJob()
  const navigate = useNavigate()
  const simulateFailure = searchParams.get('mo-phong') === 'loi'

  function handleRunOptimization() {
    start({ simulateFailure })
    setDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    // Đóng khi đang chạy chỉ ẩn modal; job vẫn tiếp tục như ghi chú trong design.
    // Đóng hộp thoại lỗi thì bỏ job để lần chạy sau bắt đầu sạch.
    if (!open && (progress.phase === 'idle' || progress.phase === 'error')) cancel()
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-bg px-8">
        <Link
          to="/chuyen"
          aria-label="Quay lại danh sách chuyến"
          className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
        </Link>

        <div className="flex min-w-0 items-center gap-3">
          <h1 className="font-mono text-[22px] leading-8 font-semibold tracking-[-0.02em]">
            {TRIP.id}
          </h1>
          <StatusBadge status={TRIP.status} />
          <span aria-hidden className="h-5 w-px bg-border" />
          <span className="inline-flex items-center gap-1.5 text-body text-text-2">
            <Calendar className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="font-mono">{TRIP.date}</span>
          </span>
          <span className="text-body text-text-3">{TRIP.depot}</span>
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => toast.success(`Đã lưu nháp ${TRIP.id}`)}
          >
            <Save strokeWidth={1.5} />
            Lưu nháp
          </Button>
          <Button variant="primary" onClick={handleRunOptimization}>
            <Play strokeWidth={1.5} />
            Chạy tối ưu
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] items-start gap-6 overflow-auto px-8 pt-6">
        <div className="flex flex-col gap-4">
          <VehicleCard vehicle={VEHICLE} tripId={TRIP.id} />
          <CargoSummaryCard />
        </div>

        <StopList />

        <div className="flex h-full min-w-0 flex-col gap-3">
          <div className="flex items-baseline gap-2 px-1">
            <h2 className="text-h3 font-semibold">Đơn hàng</h2>
            <span className="font-mono text-caption text-text-3">
              {formatInteger(ORDERS.length)} đơn
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              className="h-9 px-3"
              onClick={() => notifyPendingFeature('Thêm đơn hàng', 'Cần API đơn hàng của backend.')}
            >
              <Plus strokeWidth={1.5} />
              Thêm đơn hàng
            </Button>
            <Button
              variant="secondary"
              className="h-9 px-3"
              onClick={() => notifyPendingFeature('Nhập đơn từ Excel', 'Cần dịch vụ đọc file phía máy chủ.')}
            >
              <FileUp strokeWidth={1.5} />
              Nhập từ Excel
            </Button>
          </div>

          <OrdersTable />

          <div className="flex-1" />

          <p className="px-1 pb-6 text-right text-caption text-text-3">
            Lần tối ưu gần nhất:{' '}
            <span className="text-text-2">
              {TRIP.lastOptimisedAt ?? 'chưa có'}
            </span>
          </p>
        </div>
      </div>

      {progress.phase === 'error' && progress.failure ? (
        <OptimizationErrorDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          failure={progress.failure}
          onAdjustTrip={() => handleDialogOpenChange(false)}
        />
      ) : (
        <OptimizationDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          progress={progress}
          onViewPlan={() => {
            setDialogOpen(false)
            void navigate(`/chuyen/${TRIP.id}/phuong-an`)
          }}
        />
      )}
    </div>
  )
}
