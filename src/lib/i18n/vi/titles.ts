/**
 * Tên màn trên tab trình duyệt (`document.title`, LM-100): "<tên màn> · LoadMaster". Màn có mã thì kèm mã (`{id}`).
 * Khai trên `handle` của route trong `app/App.tsx`, đặt bởi `app/route-title.ts`.
 */
export const titles = {
  login: 'Đăng nhập',
  dashboard: 'Bảng điều khiển',
  trips: 'Chuyến hàng',
  trip: 'Chuyến {id}',
  newTrip: 'Tạo chuyến mới',
  editTrip: 'Sửa chuyến {id}',
  optimize: 'Thiết lập tối ưu {id}',
  compare: 'So sánh phương án {id}',
  plan: 'Phương án {id}',
  fleet: 'Đội xe',
  vehicle: 'Xe {id}',
  newVehicle: 'Thêm xe',
  users: 'Người dùng',
  audit: 'Nhật ký hệ thống',
  warehouse: 'Chuyến cần xếp',
  loading: 'Xếp hàng {id}',
  driverTrips: 'Chuyến của tôi',
  delivery: 'Giao hàng {id}',
  styleSheet: 'Kiểu dáng',
  componentSheet: 'Thành phần',
  notFound: 'Không tìm thấy trang',
  error: 'Đã xảy ra lỗi',
  forbidden: 'Không có quyền truy cập',
} as const
