/**
 * Bảng điều khiển (LM-052, LM-090): lọc kỳ, KPI theo kỳ, ba biểu đồ, chuyến trong kỳ, xuất báo cáo .xlsx.
 * Mỗi số trên màn kèm một dòng nói số lấy từ đâu trong kho (AGENTS mục 6 "Không bịa số").
 */
export const manager = {
  title: 'Bảng điều khiển',
  createPlan: 'Tạo kế hoạch xếp',
  loading: 'Đang tải số liệu…',
  errorTitle: 'Không tải được số liệu',
  errorDescription: 'Kho dữ liệu không trả lời. Thử lại sau giây lát.',
  retry: 'Thử lại',
  /** Giá trị trống của KPI khi kỳ chưa có số để tính. */
  noValue: '—',
  /** Ngày giờ ghép từ hai phần đã format theo ngôn ngữ, không nối chuỗi trong code. */
  dateTime: '{time} {date}',
  period: {
    label: 'Kỳ báo cáo',
    presets: { last7: '7 ngày', last30: '30 ngày', thisMonth: 'Tháng này', custom: 'Tuỳ chọn' },
    range: '{from} – {to}',
    from: 'Từ ngày',
    to: 'Đến ngày',
  },
  kpi: {
    trips: 'Chuyến hoàn thành',
    tripsUnit: '/ {total} chuyến',
    tripsNote: 'Chuyến có ngày chạy trong kỳ, tổng gồm cả chuyến đã huỷ',
    fill: 'Lấp đầy thể tích trung bình',
    fillNote: {
      one: 'Bản đã duyệt mới nhất của {count} chuyến, không tính chuyến huỷ',
      other: 'Bản đã duyệt mới nhất của {count} chuyến, không tính chuyến huỷ',
    },
    fillEmpty: 'Chưa có chuyến nào trong kỳ được duyệt phương án',
    delivered: 'Khối lượng đã giao',
    deliveredUnit: 'kg',
    deliveredNote: 'Cộng khối lượng các kiện tài xế đã dỡ ở điểm giao',
    clean: 'Kiện giao không sự cố',
    cleanNote: '{clean} / {total} kiện của các điểm giao đã hoàn tất',
    cleanEmpty: 'Chưa có điểm giao nào hoàn tất trong kỳ',
    vehicles: 'Xe đang phục vụ chuyến',
    vehiclesUnit: '/ {total} xe',
    vehiclesNote: 'Xe có chuyến đang xếp, đã xếp hoặc đang giao — không theo kỳ',
  },
  charts: {
    /** Chú thích của bảng số thay biểu đồ cho trình đọc màn hình. */
    tableCaption: 'Bảng số của biểu đồ {title}',
    /** Nhãn trục phần trăm, số nguyên đã format. */
    percentTick: '{value}%',
    fill: {
      title: 'Lấp đầy theo ngày',
      note: 'Trung bình tỷ lệ lấp đầy thể tích của bản đã duyệt, theo ngày chạy',
      empty: 'Chưa có chuyến nào trong kỳ được duyệt phương án.',
      day: 'Ngày chạy',
      value: 'Lấp đầy thể tích',
      plans: 'Số chuyến',
    },
    status: {
      title: 'Chuyến theo trạng thái',
      note: 'Chuyến có ngày chạy trong kỳ',
      status: 'Trạng thái',
      count: 'Số chuyến',
    },
    vehicles: {
      title: 'Khối lượng đã giao theo xe',
      note: 'Cộng các kiện đã dỡ của những chuyến trong kỳ',
      empty: 'Chưa có kiện nào được giao trong kỳ.',
      vehicle: 'Xe',
      weight: 'Khối lượng đã giao',
    },
  },
  empty: {
    title: 'Không có chuyến nào trong kỳ',
    description: 'Chọn kỳ khác, hoặc tạo chuyến có ngày chạy trong kỳ này.',
  },
  recent: {
    title: 'Chuyến trong kỳ',
    subtitle: 'Tối đa {count} chuyến có ngày chạy gần nhất',
    trip: 'Chuyến',
    date: 'Ngày chạy',
    vehicle: 'Xe',
    status: 'Trạng thái',
    volume: 'Lấp đầy',
    delivered: 'Đã giao',
    plan: 'Phương án',
    openPlan: 'Mở phương án',
    openPlanFor: 'Mở phương án của {name}',
  },
  export: {
    button: 'Xuất báo cáo',
    /** Tên file có kỳ, ngày dạng `YYYY-MM-DD` để sắp đúng thứ tự trong thư mục. */
    fileName: 'bao-cao-van-hanh_{from}_{to}.xlsx',
    /** Mã định dạng ô ngày của Excel theo ngôn ngữ (không phải chữ hiển thị trên màn). */
    excelDateFormat: 'dd/mm/yyyy',
    done: 'Đã tải xuống {name}',
    failed: 'Không tạo được file báo cáo. Thử lại.',
    sheets: { overview: 'Tổng quan', trips: 'Chuyến', vehicles: 'Theo xe' },
    overview: {
      title: 'Báo cáo vận hành',
      period: 'Kỳ',
      exportedAt: 'Xuất lúc',
      metric: 'Chỉ số',
      value: 'Giá trị',
      unit: 'Đơn vị',
      source: 'Nguồn',
      tripCount: 'Chuyến trong kỳ',
      mockNote: 'Tỷ lệ lấp đầy lấy từ kết quả tối ưu mock, không phải kết quả thật.',
    },
    units: { trips: 'chuyến', percent: '%', kg: 'kg', vehicles: 'xe' },
    trips: {
      id: 'Mã chuyến',
      name: 'Tên chuyến',
      date: 'Ngày chạy',
      vehicle: 'Xe',
      driver: 'Tài xế',
      status: 'Trạng thái',
      packages: 'Số kiện',
      cargoWeight: 'Khối lượng hàng (kg)',
      volume: 'Lấp đầy thể tích bản duyệt (%)',
      delivered: 'Khối lượng đã giao (kg)',
      issues: 'Sự cố giao',
    },
    vehicles: {
      id: 'Mã xe',
      name: 'Tên xe',
      trips: 'Số chuyến',
      delivered: 'Khối lượng đã giao (kg)',
      fill: 'Lấp đầy trung bình (%)',
    },
  },
} as const
