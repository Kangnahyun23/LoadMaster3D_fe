// Selected rows from seed-trips.ts, anchored to 22/09/2026 for this design review.
// Counts are sums of seed line quantities (TRIP-013 includes staleEdit).
// tone theo nghĩa vận hành: chờ người khác làm = warning, đã xong một chặng = success,
// đang chạy = info, chưa bắt đầu = neutral. Không tô màu theo cảm tính.
export const trips = [
  { id: 'TRIP-2026-0914', name: 'Q.7 → Thủ Dầu Một → Dĩ An → Biên Hoà', date: '22/09/2026', vehicle: 'Hyundai HD210', plate: '60C-446.32', stops: 4, count: 132, state: 'approved', label: 'Chờ kho bắt đầu', tone: 'warning' },
  { id: 'TRIP-009', name: 'Thủ Dầu Một → Sóng Thần', date: '22/09/2026', vehicle: 'VEHICLE-006', plate: '', stops: 3, count: 160, state: 'delivering', label: 'Đang giao', tone: 'info' },
  { id: 'TRIP-010', name: 'Thủ Đức → An Phú → Phú Nhuận', date: '22/09/2026', vehicle: 'Isuzu NQR 550', plate: '51C-284.19', stops: 3, count: 210, state: 'loaded', label: 'Đã xếp xong', tone: 'success' },
  { id: 'TRIP-011', name: 'Tân Bình → Q.1 → Q.7', date: '22/09/2026', vehicle: 'VEHICLE-007', plate: '', stops: 4, count: 280, state: 'loading', label: 'Đang xếp', tone: 'info' },
  { id: 'TRIP-012', name: 'Bình Chánh → Biên Hoà', date: '23/09/2026', vehicle: 'VEHICLE-005', plate: '', stops: 2, count: 70, state: 'optimized', label: 'Chờ duyệt', tone: 'warning' },
  { id: 'TRIP-013', name: 'Biên Hoà → Long Bình Tân', date: '23/09/2026', vehicle: 'Truck 6m', plate: '', stops: 2, count: 206, state: 'stale', label: 'Cần duyệt lại', tone: 'warning' },
  { id: 'TRIP-014', name: 'Tân An → Dĩ An', date: '24/09/2026', vehicle: 'Truck 6m', plate: '', stops: 2, count: 140, state: 'draft', label: 'Đang lập', tone: 'neutral' },
];
export const screenNames = { trips: 'Danh sách chuyến', create: 'Tạo chuyến', optimize: 'Thiết lập tối ưu', planner: 'Planner 3D', driver: 'Tài xế · Điểm giao', warehouse: 'Kho · Đối chiếu kiện', queue: 'Hàng đợi gửi lại' };
Object.assign(screenNames, { cargo: 'Kiện hàng & nhập dữ liệu', compare: 'So sánh phương án', dashboard: 'Tổng quan vận hành', fleet: 'Đội xe', vehicle: 'Chi tiết xe', users: 'Người dùng & phân quyền', audit: 'Nhật ký hệ thống', profile: 'Hồ sơ cá nhân', components: 'Bảng thành phần V2' });
