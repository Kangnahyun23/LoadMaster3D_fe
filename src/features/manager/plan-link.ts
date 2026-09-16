import type { DashboardPlan } from './dashboard-summary'

/** Đường dẫn Planner của một job: `?revision=<jobId>` để mở đúng revision đó (LM-030). */
export function plannerPath({ tripId, jobId }: Pick<DashboardPlan, 'tripId' | 'jobId'>): string {
  return `/chuyen/${encodeURIComponent(tripId)}/phuong-an?revision=${encodeURIComponent(jobId)}`
}
