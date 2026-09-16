/**
 * Đường dẫn Planner: `?revision=` nhận mã revision (mở đúng bản đó) hoặc `jobId` (bản mới nhất của job, bản đã duyệt thắng).
 * Bảng điều khiển (LM-052) mở theo job; So sánh phương án (LM-051) mở đúng revision đang chọn.
 */
export function plannerPath({ tripId, jobId, revisionId }: { readonly tripId: string; readonly jobId: string; readonly revisionId?: string }): string {
  return `/chuyen/${encodeURIComponent(tripId)}/phuong-an?revision=${encodeURIComponent(revisionId ?? jobId)}`
}
