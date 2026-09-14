/**
 * Từ điển nguồn. Mọi ngôn ngữ khác khai báo `satisfies Dictionary<typeof vi>`,
 * nên thêm key ở đây mà quên dịch là `tsc -b` báo lỗi.
 *
 * - Tham số viết `{ten}` và phải xuất hiện đủ trong mọi bản dịch.
 * - Câu đổi theo số lượng là object đúng hai key `one` / `other`, tham số `{count}`.
 * - Tên riêng không dịch (LoadMaster, MOCK RESULT) thì để thẳng trong JSX, không đưa vào đây.
 */
export const vi = {
  language: {
    label: 'Ngôn ngữ giao diện',
  },
  nav: {
    label: 'Điều hướng chính',
    dashboard: 'Bảng điều khiển',
    trips: 'Chuyến hàng',
    warehouse: 'Máy tính bảng kho',
    driver: 'Màn hình tài xế',
    fleet: 'Đội xe',
    users: 'Người dùng',
    settings: 'Cài đặt',
    account: 'Tài khoản {name}',
    signOut: 'Đăng xuất',
  },
  roles: {
    dispatcher: 'Điều phối viên',
    warehouse: 'Nhân viên kho',
    driver: 'Tài xế',
    manager: 'Quản lý',
    admin: 'Quản trị hệ thống',
  },
  auth: {
    login: {
      title: 'Đăng nhập',
      subtitle: 'Hệ thống lập kế hoạch và tối ưu chất xếp hàng hoá 3D.',
      email: 'Email',
      emailPlaceholder: 'ten@loadmaster.vn',
      password: 'Mật khẩu',
      submit: 'Đăng nhập',
      emailRequired: 'Nhập email',
      emailInvalid: 'Email không đúng định dạng',
      passwordRequired: 'Nhập mật khẩu',
      invalidCredentials: 'Email hoặc mật khẩu không đúng',
      accountSuspended: 'Tài khoản đã bị khoá. Liên hệ quản trị hệ thống.',
      serverUnreachable: 'Không kết nối được máy chủ. Thử lại sau.',
    },
    showcase: {
      tagline: 'Mỗi chuyến xe chở được nhiều hơn, và dỡ hàng đúng thứ tự.',
      fillRate: 'Tăng tỷ lệ lấp đầy xe, giảm số chuyến phải chạy',
      reverseOrder: 'Xếp ngược thứ tự giao — tới điểm nào lấy hàng điểm đó',
      axleLoad: 'Kiểm soát tải trọng từng trục trước khi xe lăn bánh',
      artworkLabel: 'Mô phỏng thùng xe được xếp hàng theo thứ tự dỡ',
    },
    demo: {
      title: 'Tài khoản dùng thử',
      password: 'mật khẩu {password}',
    },
  },
  notFound: {
    errorCode: 'Lỗi',
    title: 'Không tìm thấy trang',
    description:
      'Đường dẫn không tồn tại hoặc đã bị đổi. Kiểm tra lại liên kết hoặc quay về danh sách chuyến.',
    errorTitle: 'Đã xảy ra lỗi',
    errorDescription:
      'Màn hình gặp sự cố khi tải. Thử tải lại trang; nếu vẫn lỗi, báo cho quản trị hệ thống.',
    backToTrips: 'Về danh sách chuyến',
    reload: 'Tải lại trang',
  },
  common: {
    /** Mẫu số nhiều, dùng lại ở bảng kiện và kết quả tối ưu (LM-044, LM-049). */
    packageCount: { one: '{count} kiện', other: '{count} kiện' },
  },
} as const
