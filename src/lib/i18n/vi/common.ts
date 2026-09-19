/** Chữ dùng chung ở nhiều màn (đang tải, quay lại, đơn vị đếm). */
export const common = {
  /** Mẫu số nhiều, dùng lại ở bảng kiện và kết quả tối ưu (LM-044, LM-049). */
  packageCount: { one: '{count} kiện', other: '{count} kiện' },
  /** Nhãn điểm giao dùng chung (LM-070): `lib/stops.ts`, Planner, danh sách kiện. */
  stop: 'Điểm {number}',
  stopWithName: 'Điểm {number} · {name}',
  packageAtStop: '{id} · Điểm {stop}',
  loadingScreen: 'Đang tải màn hình',
  processing: 'Đang xử lý',
  noData: 'Chưa có dữ liệu',
  selectPlaceholder: 'Chọn…',
  backToTrips: 'Về danh sách chuyến',
  on: 'Bật',
  off: 'Tắt',
  /** `DataTable` (LM-085): chân bảng phân trang và trạng thái không có kết quả khớp bộ lọc. */
  table: {
    rowsPerPage: 'Số dòng mỗi trang',
    range: '{from}–{to} / {total}',
    previousPage: 'Trang trước',
    nextPage: 'Trang sau',
    noMatch: 'Không có kết quả khớp bộ lọc',
  },
  /** `FilterBar` (LM-085): thanh tìm và lọc của các màn danh sách. */
  filters: {
    region: 'Tìm và lọc',
    all: 'Tất cả',
    from: 'Từ ngày',
    to: 'Đến ngày',
    clear: 'Xoá lọc',
  },
} as const
