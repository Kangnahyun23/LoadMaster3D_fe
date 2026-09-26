/** Lớp kiểu dáng của `DataTable` (AGENTS mục 5, "Bảng dữ liệu"): căn cột, chiều cao dòng, kiểu tiêu đề, lề ô. */

export const ALIGN = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const

export const ROW_HEIGHT = {
  /** Rộng — 72px, cho bảng có ô hai dòng kèm icon hoặc badge (tên + mã, trạng thái + ghi chú) — V2, Đội xe */
  spacious: 'h-18',
  /** Vừa — 56px, cho ô hai dòng chữ không icon (tên + tuyến, số kiện + số điểm) — V2, Danh sách chuyến */
  roomy: 'h-14',
  /** Thoáng — 48px */
  comfortable: 'h-12',
  /** Gọn — 36px, dùng cho danh sách dài */
  compact: 'h-9',
} as const

/**
 * Kiểu tiêu đề cột. `paper` (V2): nền `--table-head`, chữ 12px/600 màu mực 2, cao 40px, lề ngang 14px — bảng nằm trong một thẻ
 * cùng thanh tìm/lọc. Đang thử ở Đội xe trước khi lan sang bảng khác (bước 6).
 */
export const APPEARANCE = {
  default: { head: 'h-8 bg-surface font-medium text-text-3', padX: null },
  paper: { head: 'h-10 bg-table-head font-semibold text-ink-2', padX: 'px-3.5' },
} as const

/** Cảm ứng: hàng 56px (mục 8 style sheet) */
export const TOUCH_ROW_HEIGHT = 'h-14'

/** Bảng hẹp (cột phụ 360px) cần padding sát hơn để tiêu đề không xuống dòng. */
export const CELL_PADDING = {
  normal: 'px-3',
  tight: 'px-2.5',
} as const
