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
    /** Chủ thể đứng đầu câu: kiện đã xếp, hoặc dòng vật cản trong form xe. */
    subject: { placement: 'Kiện {id}', obstacle: 'Vật cản {id}' },
    DIMENSION_NOT_POSITIVE: {
      vehicle: '{field} phải lớn hơn {zero}.',
      obstacle: '{field} của vật cản {obstacleId} phải lớn hơn {zero}.',
      package: '{field} của kiện {packageId} phải lớn hơn {zero}.',
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
        beforeOrigin: '{subject} lấn qua vách đầu thùng {overCm}.',
        beyondInterior: '{subject} vượt chiều dài thùng {overCm}.',
      },
      y: {
        beforeOrigin: '{subject} lấn qua vách trái {overCm}.',
        beyondInterior: '{subject} vượt chiều rộng thùng {overCm}.',
      },
      z: {
        beforeOrigin: '{subject} thấp hơn sàn thùng {overCm}.',
        beyondInterior: '{subject} vượt chiều cao thùng {overCm}.',
      },
    },
    OVERLAP: '{id} chồng lấn {related}.',
    OBSTACLE_OVERLAP: '{id} chồng lấn vật cản {obstacleId}.',
    NON_BEARING_SUPPORT: '{id} đặt lên vật cản {obstacleId} không chịu tải.',
    SUPPORT_BELOW_MIN: '{id} có tỷ lệ đỡ đáy {ratio}, thấp hơn mức yêu cầu {required}.',
    TOP_LOAD_EXCEEDED: '{subject} chịu {loadKg} bên trên, vượt mức chịu tải {maxKg}.',
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
    ORIENTATION_NOT_ALLOWED: '{id} được đặt theo hướng {orientation}, không thuộc các hướng được phép của kiện.',
  },
  viewer: {
    axles: {
      title: 'Tải trục',
      comingLater: 'Sẽ có sau',
      pending: 'Chờ backend tính tải trục; không hiển thị số ước lượng.',
      axle: '{name} · cách vách trước {position} · tối đa {maxLoad}',
    },
    orientation: {
      allowed: 'Hướng được phép: {codes}',
      keepUpright: 'Giữ thẳng đứng',
    },
    measurements: {
      summary: 'Cách cửa {rear} · vách trái {left} · Lớp {layer}',
    },
    /** Vật cản trong thùng (LM-033). */
    obstacles: {
      types: {
        WHEEL_ARCH: 'Hốc bánh xe',
        COOLING_UNIT: 'Dàn lạnh',
        PARTITION: 'Vách ngăn',
        RESERVED_ZONE: 'Vùng dành riêng',
      },
      corner: 'Góc tại X {x} · Y {y} · Z {z}',
      notBearing: 'Không chịu tải',
      bearing: 'Chịu tải',
      bearingMax: 'Chịu tải tối đa {maxLoad}',
      listLabel: 'Vật cản trong thùng',
      description: '{type} {id}: {corner}, kích thước {size}, {bearing}.',
      legendTitle: 'Vật cản',
      legendNotBearing: 'Vật cản không chịu tải',
      legendBearing: 'Vật cản chịu tải',
      legendReserved: 'Vùng dành riêng: có vạch, nhìn xuyên được',
      legendHint: 'Bấm vào vật cản để xem kích thước và khả năng chịu tải.',
    },
    /** Xếp/dỡ theo thứ tự của kết quả và kiểm LIFO của domain (LM-036). "gợi ý" chỉ khi thứ tự dỡ do FE suy ra cho phương án cũ. */
    operations: {
      loadingOrder: 'Thứ tự xếp',
      unloadingOrder: 'Thứ tự dỡ',
      suggestedUnloadingOrder: 'Thứ tự dỡ gợi ý',
      unloaded: 'Đã dỡ',
      suggestedUnloaded: 'Đã dỡ (gợi ý)',
      unloading: 'Dỡ hàng',
      suggestedUnloading: 'Dỡ hàng gợi ý',
      ordersRecomputed: 'Thứ tự xếp và dỡ được tính lại ở FE khi Duyệt.',
      blockers: {
        title: 'Kiện chắn lối dỡ',
        toggleShow: 'Xem kiện chắn lối dỡ',
        toggleHide: 'Ẩn kiện chắn lối dỡ',
        pick: 'Chọn kiện để xem lối dỡ',
        blocked: { one: '{count} kiện giao sau che kín lối dỡ:', other: '{count} kiện giao sau che kín lối dỡ:' },
        partial: { one: '{count} kiện giao sau che {coverage} lối dỡ:', other: '{count} kiện giao sau che {coverage} lối dỡ:' },
        clear: 'Không có kiện giao sau che lối dỡ.',
        scope: 'Kiểm tra LIFO chỉ xét kiện giao sau nằm giữa kiện và cửa sau. Chưa tính khoảng hở thao tác, người, xe nâng hoặc xoay kiện khi dỡ.',
        callout: { one: '{count} kiện chắn lối dỡ', other: '{count} kiện chắn lối dỡ' },
        paused: 'Lối dỡ bị che kín · Đã tạm dừng',
        corridor: 'Mũi tên về cửa biểu diễn hành lang dỡ thẳng. Mô phỏng tạm dừng khi kiện giao sau che kín lối dỡ; che một phần chỉ được đánh dấu.',
      },
      approval: {
        lifoBlocked: {
          one: '{count} kiện bị kiện giao sau che kín lối dỡ (kiểm tra LIFO)',
          other: '{count} kiện bị kiện giao sau che kín lối dỡ (kiểm tra LIFO)',
        },
        lifoPartial: {
          one: '{count} kiện bị kiện giao sau che một phần lối dỡ (kiểm tra LIFO)',
          other: '{count} kiện bị kiện giao sau che một phần lối dỡ (kiểm tra LIFO)',
        },
        lifoClear: 'Kiểm tra LIFO không thấy kiện giao sau che lối dỡ; chưa xác nhận khả năng dỡ thực tế',
      },
    },
    /** Mã `UnplacedPackage.reasonCode` của Spec. */
    unplacedReasons: {
      NO_SPACE: 'Không còn chỗ trống vừa kiện',
      OVER_PAYLOAD: 'Vượt tải trọng tối đa của xe',
      DOOR_TOO_SMALL: 'Không lọt cửa thùng',
      NO_ALLOWED_ORIENTATION: 'Không có hướng đặt được phép vừa thùng',
      STACKING_VIOLATION: 'Vi phạm luật xếp chồng',
      LIFO_VIOLATION: 'Vi phạm thứ tự dỡ theo điểm giao',
      UNKNOWN: 'Chưa xếp được, không rõ lý do',
    },
  },
  /** Tên trường dữ liệu, không kèm đơn vị; dùng trong câu lỗi và nhãn form. */
  fields: {
    innerLengthCm: 'Chiều dài lòng thùng',
    innerWidthCm: 'Chiều rộng lòng thùng',
    innerHeightCm: 'Chiều cao lòng thùng',
    maxPayloadKg: 'Tải trọng tối đa',
    doorWidthCm: 'Chiều rộng cửa',
    doorHeightCm: 'Chiều cao cửa',
    lengthCm: 'Chiều dài',
    widthCm: 'Chiều rộng',
    heightCm: 'Chiều cao',
  },
} as const
