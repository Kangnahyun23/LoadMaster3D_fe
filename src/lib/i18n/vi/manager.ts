/** Bảng điều khiển của quản lý (LM-052). Mọi số trên màn đều truy được về kho dữ liệu. */
export const manager = {
  title: 'Bảng điều khiển',
  createPlan: 'Tạo kế hoạch xếp',
  loading: 'Đang tải số liệu…',
  errorTitle: 'Không tải được số liệu',
  errorDescription: 'Kho dữ liệu không trả lời. Thử lại sau giây lát.',
  retry: 'Thử lại',
  /** Ngày giờ ghép từ hai phần đã format theo ngôn ngữ, không nối chuỗi trong code. */
  dateTime: '{time} {date}',
  runtime: '{value} ms',
  kpi: {
    vehicles: 'Xe trong đội',
    vehiclesUnit: 'xe',
    vehiclesNote: 'Cấu hình xe đang có trong kho dữ liệu',
    packages: 'Tổng số kiện',
    packagesUnit: 'kiện',
    packagesNote: {
      one: 'Đã tách theo số lượng của {count} chuyến',
      other: 'Đã tách theo số lượng của {count} chuyến',
    },
    weight: 'Tổng khối lượng hàng',
    weightNote: 'Cộng khối lượng từng kiện của mọi chuyến',
  },
  latest: {
    title: 'Lần tối ưu gần nhất',
    method: 'Phương pháp',
    status: 'Trạng thái',
    volume: 'Tỷ lệ lấp đầy',
    payload: 'Tỷ lệ tải trọng',
    runtimeLabel: 'Thời gian chạy',
    createdAt: 'Thời điểm',
    open: 'Mở phương án',
    emptyTitle: 'Chưa có lần tối ưu nào',
    emptyDescription:
      'Tạo kế hoạch xếp cho một chuyến rồi chạy tối ưu, kết quả sẽ hiện ở đây.',
  },
  status: {
    COMPLETED: 'Hoàn thành',
    FAILED: 'Thất bại',
    approved: 'Đã duyệt',
  },
  recent: {
    title: 'Kế hoạch gần đây',
    subtitle: 'Tối đa {count} lần tối ưu mới nhất',
    trip: 'Chuyến',
    createdAt: 'Thời điểm',
    method: 'Phương pháp',
    volume: 'Lấp đầy',
    placed: 'Kiện đã xếp',
    empty: 'Chưa có kế hoạch nào',
  },
} as const
