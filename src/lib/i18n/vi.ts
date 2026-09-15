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
  /**
   * Câu cho mã ràng buộc của `@/domain/constraints` (LM-028), key trùng tên mã. Chỉ gọi qua `formatIssue`:
   * số có đơn vị đã được format theo ngôn ngữ trước khi điền vào.
   */
  issues: {
    DIMENSION_NOT_POSITIVE: {
      vehicle: '{field} phải lớn hơn 0 cm.',
      obstacle: '{field} của vật cản {obstacleId} phải lớn hơn 0 cm.',
      package: '{field} của kiện {packageId} phải lớn hơn 0 cm.',
    },
    DOOR_EXCEEDS_INNER: {
      y: 'Chiều rộng cửa {doorCm} không được lớn hơn chiều rộng lòng thùng {innerCm}.',
      z: 'Chiều cao cửa {doorCm} không được lớn hơn chiều cao lòng thùng {innerCm}.',
    },
    NO_ALLOWED_ORIENTATION: 'Kiện {packageId} chưa có hướng đặt nào được phép.',
    PAYLOAD_EXCEEDED: 'Tổng khối lượng hàng {totalKg} vượt tải trọng xe {maxPayloadKg}.',
    MUST_LOAD_PAYLOAD_EXCEEDED: 'Riêng các kiện bắt buộc đã nặng {totalKg}, vượt tải trọng xe {maxPayloadKg}.',
    DOOR_TOO_SMALL: 'Kiện {packageId} không lọt qua cửa {door}.',
    EXCEEDS_BOUNDARY: {
      x: {
        beforeOrigin: 'Kiện {id} lấn qua vách đầu thùng {overCm}.',
        beyondInterior: 'Kiện {id} vượt chiều dài thùng {overCm}.',
      },
      y: {
        beforeOrigin: 'Kiện {id} lấn qua vách trái {overCm}.',
        beyondInterior: 'Kiện {id} vượt chiều rộng thùng {overCm}.',
      },
      z: {
        beforeOrigin: 'Kiện {id} thấp hơn sàn thùng {overCm}.',
        beyondInterior: 'Kiện {id} vượt chiều cao thùng {overCm}.',
      },
    },
    OVERLAP: '{id} chồng lấn {related}.',
    OBSTACLE_OVERLAP: '{id} chồng lấn vật cản {obstacleId}.',
    NON_BEARING_SUPPORT: '{id} đặt lên vật cản {obstacleId} không chịu tải.',
    SUPPORT_BELOW_MIN: '{id} có tỷ lệ đỡ đáy {ratio}, thấp hơn mức yêu cầu {required}.',
    TOP_LOAD_EXCEEDED: '{id} chịu {loadKg} bên trên, vượt mức chịu tải {maxKg}.',
    NOT_STACKABLE: '{id} không được xếp chồng nhưng đang đỡ {related}.',
    STACK_COUNT_EXCEEDED: '{id} nằm trong chồng {layers} tầng, vượt giới hạn {maxStackCount} tầng.',
    LIFO_BLOCKED: '{id} bị kiện giao sau che kín lối dỡ.',
    LIFO_PARTIAL: '{id} bị kiện giao sau che {coverage} lối dỡ.',
    COG_LATERAL: 'Trọng tâm hàng lệch {offsetCm} khỏi đường giữa thùng, vượt ngưỡng {limitCm}.',
    COG_HIGH: 'Trọng tâm hàng cao {heightCm} so với sàn, vượt ngưỡng {limitCm}.',
    MUST_LOAD_UNPLACED: 'Kiện bắt buộc {packageId} chưa được xếp lên xe.',
    LOADING_ORDER_INFEASIBLE: '{id} được xếp trước kiện đỡ nó: {related}.',
    DUPLICATE_INSTANCE_ID: 'Mã {id} bị trùng ở {occurrences} dòng kiện: {related}.',
    ORIENTATION_MISMATCH: 'Kích thước đã xếp của {id} không khớp hướng {orientation}.',
  },
  /** Tên trường dữ liệu, không kèm đơn vị; dùng trong câu lỗi và nhãn form. */
  fields: {
    innerLengthCm: 'Chiều dài lòng thùng',
    innerWidthCm: 'Chiều rộng lòng thùng',
    innerHeightCm: 'Chiều cao lòng thùng',
    doorWidthCm: 'Chiều rộng cửa',
    doorHeightCm: 'Chiều cao cửa',
    lengthCm: 'Chiều dài',
    widthCm: 'Chiều rộng',
    heightCm: 'Chiều cao',
  },
} as const
