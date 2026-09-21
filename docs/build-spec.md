# LoadMaster FE MVP – Build Specification

## 1. Mục tiêu

Xây dựng Frontend MVP cho LoadMaster – hệ thống nhập thông số xe và kiện hàng, kiểm tra dữ liệu, nhận phương án xếp từ một optimization service và hiển thị phương án tương tác trong không gian 3D.

Giai đoạn này ưu tiên FE-first. Chưa triển khai backend FastAPI, thuật toán tối ưu thật hoặc training BBMP-DCS/PQNet. Frontend phải dùng mock service có cùng contract với API tương lai. Mọi kết quả mock phải có nhãn “MOCK RESULT”, không được mô tả là kết quả AI thật.

## 2. Đơn vị bắt buộc

Áp dụng thống nhất cho cả xe, hàng, obstacle và placement:

| Đại lượng | Đơn vị |
|---|---|
| Length, width, height | centimet (cm) |
| Tọa độ X, Y, Z | centimet (cm) |
| Clearance/safety gap | centimet (cm) |
| Package weight | kilogram (kg) |
| Vehicle payload | kilogram (kg) |
| Max top load/load bearing | kilogram (kg) |
| Axle load | kilogram (kg) |
| Volume | cubic centimet (cm³) |

Quy tắc:

- Không trộn cm với mm hoặc m trong application state và API payload.
- Không trộn kg với g hoặc ton.
- JSON lưu số, ví dụ 'lengthCm: 120', không lưu chuỗi '120 cm'.
- Mọi input, table, tooltip và validation message phải hiển thị đơn vị.
- Bước nhập đề xuất: 0.1 cm và 0.01 kg.
- Sử dụng EPSILON = 1e-6 khi so sánh số thực.
- Chỉ chuyển đổi scale tại lớp Three.js; dữ liệu nghiệp vụ luôn giữ cm/kg.

## 3. Hệ tọa độ

Gốc (0,0,0) là góc trong cùng – bên trái – dưới sàn thùng xe khi nhìn từ cửa sau vào.

- +X: từ trong thùng hướng ra cửa sau; tương ứng chiều dài.
- +Y: từ trái sang phải; tương ứng chiều rộng.
- +Z: từ sàn đi lên; tương ứng chiều cao.
- Cửa sau nằm ở phía X = vehicle.innerLengthCm.

Kiện tại (x,y,z), sau khi xoay có kích thước (l,w,h), chiếm:

~~~text
X: [x, x + l)
Y: [y, y + w)
Z: [z, z + h)
~~~

Hai kiện được phép chạm mặt. Nếu kiện A kết thúc tại x = 120 thì kiện B được bắt đầu tại x = 120, không phải 121. Chỉ cộng thêm khoảng hở khi clearance được cấu hình.

Extreme Points cơ bản của kiện A:

~~~text
Sau kiện:  (A.x + A.length, A.y, A.z)
Bên phải:  (A.x, A.y + A.width, A.z)
Phía trên: (A.x, A.y, A.z + A.height)
~~~

## 4. Phạm vi MVP

Luồng chính:

1. Dashboard.
2. Tạo/chọn cấu hình xe.
3. Thêm, sửa, xóa, nhân bản kiện hàng.
4. Kiểm tra dữ liệu và tổng tải trọng.
5. Cấu hình optimization job.
6. Gọi MockOptimizationService.
7. Hiển thị loading result bằng Three.js.
8. Xem kiện đã xếp, kiện chưa xếp và lý do.
9. Xem volume utilization và payload utilization.

Ngoài phạm vi hiện tại:

- Camera scan hoặc tự đo kiện hàng.
- AI training trong frontend.
- Backend optimization thật.
- Route optimization và GPS.
- ERP/WMS integration.
- Mô phỏng vật lý động.
- Tuyên bố mock placement là phương án tối ưu.

## 5. Công nghệ đề xuất

- React + TypeScript + Vite.
- React Router.
- React Three Fiber + Drei.
- React Hook Form + Zod.
- Zustand hoặc Redux Toolkit.
- Tailwind CSS hoặc UI library nhất quán.
- Vitest + React Testing Library.

## 6. Domain model TypeScript

~~~typescript
export type OrientationCode =
  | "LWH" | "LHW" | "WLH"
  | "WHL" | "HLW" | "HWL";

export type FragilityLevel =
  | "NONE" | "LOW" | "MEDIUM" | "HIGH";

export interface VehicleConfig {
  id: string;
  name: string;
  innerLengthCm: number;
  innerWidthCm: number;
  innerHeightCm: number;
  maxPayloadKg: number;
  doorWidthCm: number;
  doorHeightCm: number;
  doorPosition: "REAR";
  clearanceCm: number;
  floorMaxLoadKg?: number;
  floorPressureLimitKgPerCm2?: number;
  obstacles: VehicleObstacle[];
  axles?: VehicleAxle[];
}

export interface VehicleObstacle {
  id: string;
  type: "WHEEL_ARCH" | "COOLING_UNIT" |
        "PARTITION" | "RESERVED_ZONE";
  xCm: number;
  yCm: number;
  zCm: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  loadBearing: boolean;
  maxTopLoadKg?: number;
}

export interface VehicleAxle {
  id: string;
  name: string;
  positionXCm: number;
  emptyLoadKg: number;
  maxLoadKg: number;
}

export interface CargoPackage {
  id: string;
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  quantity: number;
  allowedOrientations: OrientationCode[];
  keepUpright: boolean;
  fragilityLevel: FragilityLevel;
  stackable: boolean;
  maxTopLoadKg: number;
  maxStackCount?: number;
  minSupportRatio: number;
  deliveryStop: number;
  priority: number;
  mustLoad: boolean;
  groupId?: string;
  notes?: string;
}

export interface PackagePlacement {
  packageInstanceId: string;
  orientation: OrientationCode;
  xCm: number;
  yCm: number;
  zCm: number;
  placedLengthCm: number;
  placedWidthCm: number;
  placedHeightCm: number;
  loadingOrder: number;
  unloadingOrder: number;
  supportRatio: number;
  constraintWarnings: string[];
}

export interface UnplacedPackage {
  packageInstanceId: string;
  reasonCode:
    | "NO_SPACE"
    | "OVER_PAYLOAD"
    | "DOOR_TOO_SMALL"
    | "NO_ALLOWED_ORIENTATION"
    | "STACKING_VIOLATION"
    | "LIFO_VIOLATION"
    | "UNKNOWN";
  message: string;
}

export interface OptimizationRequest {
  vehicle: VehicleConfig;
  packages: CargoPackage[];
  settings: {
    method: "MOCK" | "EP_DBLF" | "GA" |
            "SA" | "BBMP_DCS_PQNET";
    timeLimitSeconds: number;
    randomSeed?: number;
    enforceLifo: boolean;
    prioritizeLowCenterOfGravity: boolean;
  };
}

export interface OptimizationResult {
  jobId: string;
  status: "COMPLETED" | "FAILED";
  method: string;
  isMockResult: boolean;
  placements: PackagePlacement[];
  unplacedPackages: UnplacedPackage[];
  metrics: {
    totalVehicleVolumeCm3: number;
    usedVolumeCm3: number;
    volumeUtilizationPercent: number;
    maxPayloadKg: number;
    usedPayloadKg: number;
    payloadUtilizationPercent: number;
    placedCount: number;
    unplacedCount: number;
    centerOfGravityCm?: {
      x: number;
      y: number;
      z: number;
    };
    runtimeMs: number;
  };
}
~~~

Quy tắc dữ liệu:

- minSupportRatio nằm trong khoảng 0..1.
- Nếu stackable = false thì maxTopLoadKg = 0.
- quantity phải lớn hơn hoặc bằng 1.
- quantity > 1 phải được mở rộng thành các instance có ID riêng trước khi tối ưu.
- keepUpright = true chỉ cho phép orientation giữ nguyên mặt đáy/chiều đứng.
- Mọi package instance phải được truy vết về CargoPackage gốc.

## 7. Ràng buộc bắt buộc

### 7.1. Vehicle boundary

~~~text
0 <= x
0 <= y
0 <= z
x + placedLength <= vehicle.innerLength
y + placedWidth <= vehicle.innerWidth
z + placedHeight <= vehicle.innerHeight
~~~

### 7.2. Non-overlap

Hai kiện chạm mặt không được xem là overlap.

~~~typescript
function overlaps(a: PackagePlacement, b: PackagePlacement) {
  return (
    a.xCm < b.xCm + b.placedLengthCm &&
    a.xCm + a.placedLengthCm > b.xCm &&
    a.yCm < b.yCm + b.placedWidthCm &&
    a.yCm + a.placedWidthCm > b.yCm &&
    a.zCm < b.zCm + b.placedHeightCm &&
    a.zCm + a.placedHeightCm > b.zCm
  );
}
~~~

Không đổi dấu > thành >=.

### 7.3. Payload

~~~text
sum(package.weightKg × package.quantity)
<= vehicle.maxPayloadKg
~~~

Nếu vượt tải trọng, hiển thị lỗi/warning rõ tổng kg và mức vượt kg.

### 7.4. Door clearance

Kiện phải có ít nhất một orientation đi qua cửa:

~~~text
orientedWidth + clearance <= doorWidth
orientedHeight + clearance <= doorHeight
~~~

MVP kiểm tra mặt cắt cửa. Insertion path hoàn chỉnh thuộc giai đoạn backend nâng cao.

### 7.5. Allowed orientations

- Mỗi kiện phải có ít nhất một orientation.
- UI phải cho người dùng chọn rõ từng orientation.
- Không chỉ sử dụng một boolean canRotate.
- Kích thước placement phải phản ánh orientation đã chọn.

### 7.6. Obstacles

Placement không được overlap với WHEEL_ARCH, COOLING_UNIT, PARTITION hoặc RESERVED_ZONE.

Nếu obstacle có loadBearing = false, không cho đặt kiện trực tiếp phía trên như một bề mặt hỗ trợ.

### 7.7. Support ratio

~~~text
supportRatio =
supportedBaseArea / totalPackageBaseArea
~~~

~~~text
supportRatio >= package.minSupportRatio
~~~

MVP có thể nhận supportRatio từ mock fixture nhưng phải hiển thị warning nếu thấp hơn yêu cầu.

### 7.8. Stacking strength

Tổng tải truyền xuống một kiện không được vượt maxTopLoadKg. Không chỉ kiểm tra kiện nằm trực tiếp phía trên; backend tương lai phải tính tải truyền qua toàn bộ stack.

Các quy tắc:

- stackable = false: không có kiện nào được đặt phía trên.
- fragilityLevel = HIGH và maxTopLoadKg = 0: tuyệt đối không chịu tải.
- maxStackCount: không vượt số tầng được cho phép.

### 7.9. Center of gravity

~~~text
Xcg = sum(weight_i × centerX_i) / sum(weight_i)
Ycg = sum(weight_i × centerY_i) / sum(weight_i)
Zcg = sum(weight_i × centerZ_i) / sum(weight_i)
~~~

FE MVP tính và hiển thị marker trọng tâm. Chỉ hiển thị warning lệch tâm; chưa mô phỏng động lực học.

### 7.10. Axle load

MVP chuẩn bị VehicleAxle và vị trí UI nhưng được phép hiển thị “Coming later” nếu backend chưa trả kết quả đáng tin cậy. Không tạo số tải trọng trục giả và trình bày như dữ liệu thật.

### 7.11. LIFO

Cửa xe ở phía +X:

- Điểm giao sớm nên nằm gần cửa hơn, tức thường có X lớn hơn.
- Hàng giao muộn được đặt sâu vào trong và được xếp lên trước.
- Khi enforceLifo = true, hiển thị lỗi nếu hàng giao muộn chặn hoàn toàn hàng giao sớm.
- Loading order và unloading order phải hiển thị riêng.

## 8. Ràng buộc mềm và metric

- Tối đa hóa volume utilization.
- Tối đa hóa payload utilization nhưng không vượt tải.
- Tối đa hóa số kiện được xếp.
- Ưu tiên mustLoad và priority cao.
- Giữ trọng tâm gần giữa chiều rộng xe.
- Giữ trọng tâm càng thấp càng tốt.
- Giảm tải lệch giữa các trục.
- Giảm không gian bị phân mảnh.
- Giảm số lần rehandling.
- Giảm runtime.

Frontend chỉ hiển thị score/metric do service trả về, không tuyên bố tối ưu toàn cục.

## 9. Màn hình bắt buộc

### 9.1. Dashboard

- Số xe.
- Tổng số kiện.
- Tổng khối lượng kg.
- Optimization job gần nhất.
- Nút Create Loading Plan.
- Recent plans dùng mock data.

### 9.2. Vehicle Configuration

Form:

- Vehicle name.
- Inner length (cm).
- Inner width (cm).
- Inner height (cm).
- Maximum payload (kg).
- Door width (cm).
- Door height (cm).
- Clearance (cm).
- Danh sách obstacle tùy chọn.

Validation:

- Tất cả kích thước > 0.
- maxPayloadKg > 0.
- doorWidthCm <= innerWidthCm.
- doorHeightCm <= innerHeightCm.
- Obstacle phải nằm trong thùng xe.

### 9.3. Cargo Management

- Bảng danh sách kiện.
- Add/edit/delete/duplicate.
- Quantity.
- Allowed orientations.
- Fragility.
- Stackable và maxTopLoadKg.
- minSupportRatio.
- Delivery stop.
- Priority và mustLoad.
- Tổng số package instance.
- Tổng thể tích cm³.
- Tổng khối lượng kg.
- Import CSV chỉ hiển thị khi hoạt động; không tạo nút giả.

### 9.4. Optimization Setup

- Chọn xe.
- Xem danh sách kiện.
- Method mặc định là MOCK trong FE-first.
- Time limit.
- Random seed.
- Enforce LIFO.
- Prioritize low center of gravity.
- Validation summary.
- Disable Optimize khi dữ liệu đầu vào có hard error.

### 9.5. Loading Result

- Three.js viewer là vùng chính.
- Metrics panel.
- Package list/filter.
- Selected package details.
- Volume utilization.
- Payload utilization.
- Placed/unplaced count.
- Runtime.
- Badge MOCK RESULT.
- Unplaced packages và lý do.
- Reset camera.
- Replay loading sequence.

## 10. Yêu cầu Three.js

- React Three Fiber và Drei.
- Thùng xe dạng wireframe hoặc trong suốt.
- Vẽ sàn, hệ trục và cửa sau.
- BoxGeometry cho kiện hàng.
- Màu theo deliveryStop.
- Click kiện để highlight và xem thông tin.
- OrbitControls: rotate, zoom, pan.
- Góc nhìn perspective, top, side, rear-door.
- Obstacle có màu khác kiện.
- Legend theo delivery stop.
- Marker center of gravity.
- Loading sequence replay.
- Không cho kéo thả kiện trong MVP, trừ khi mọi thay đổi đều được validation lại.

Dữ liệu giữ cm. Scale chỉ khi render:

~~~typescript
export const SCENE_SCALE = 0.01; // 100 cm = 1 scene unit
~~~

Three.js thường dùng Y làm chiều cao, trong khi domain dùng Z làm chiều cao. Ánh xạ mesh:

~~~typescript
const meshPosition = [
  (xCm + placedLengthCm / 2) * SCENE_SCALE,
  (zCm + placedHeightCm / 2) * SCENE_SCALE,
  (yCm + placedWidthCm / 2) * SCENE_SCALE
];
~~~

Không ghi meshPosition trở lại domain state.

## 11. Mock optimization service

~~~typescript
export interface OptimizationService {
  optimize(
    request: OptimizationRequest
  ): Promise<OptimizationResult>;
}
~~~

Tạo MockOptimizationService:

- isMockResult luôn bằng true.
- Có thể dùng fixture hoặc shelf/row packing đơn giản.
- Placement trả về phải hợp lệ theo vehicle boundary.
- Metrics phải được tính từ placement, không hard-code tùy ý.
- Trả unplacedPackages và reasonCode.
- Không đặt tên mock service là AIService.
- Không hiển thị “AI optimized successfully”.

Backend tương lai triển khai ApiOptimizationService nhưng giữ nguyên interface.

## 12. Dữ liệu mẫu

### Vehicle

~~~json
{
  "id": "VEHICLE-001",
  "name": "Truck 6m",
  "innerLengthCm": 600,
  "innerWidthCm": 240,
  "innerHeightCm": 250,
  "maxPayloadKg": 5000,
  "doorWidthCm": 220,
  "doorHeightCm": 230,
  "doorPosition": "REAR",
  "clearanceCm": 0,
  "obstacles": [
    {
      "id": "OBS-001",
      "type": "WHEEL_ARCH",
      "xCm": 0,
      "yCm": 0,
      "zCm": 0,
      "lengthCm": 120,
      "widthCm": 30,
      "heightCm": 45,
      "loadBearing": false
    }
  ]
}
~~~

### Package

~~~json
{
  "id": "PKG-001",
  "name": "Carton A",
  "lengthCm": 120,
  "widthCm": 60,
  "heightCm": 45,
  "weightKg": 30,
  "quantity": 4,
  "allowedOrientations": ["LWH", "WLH"],
  "keepUpright": true,
  "fragilityLevel": "LOW",
  "stackable": true,
  "maxTopLoadKg": 90,
  "maxStackCount": 3,
  "minSupportRatio": 0.8,
  "deliveryStop": 2,
  "priority": 1,
  "mustLoad": true
}
~~~

### Placement

~~~json
{
  "packageInstanceId": "PKG-001-01",
  "orientation": "LWH",
  "xCm": 120,
  "yCm": 0,
  "zCm": 0,
  "placedLengthCm": 120,
  "placedWidthCm": 60,
  "placedHeightCm": 45,
  "loadingOrder": 1,
  "unloadingOrder": 4,
  "supportRatio": 1,
  "constraintWarnings": []
}
~~~

## 13. Validation messages

- Inner length must be greater than 0 cm.
- Door width 250 cm cannot exceed vehicle inner width 240 cm.
- Package PKG-001 has no allowed orientation.
- Total cargo weight 5,320 kg exceeds vehicle payload 5,000 kg.
- Package PKG-003 cannot pass through the 220 × 230 cm door.
- Placement PKG-004 exceeds vehicle height by 12.5 cm.
- PKG-006 overlaps PKG-007.
- PKG-008 support ratio 0.62 is below the required 0.80.

Hiển thị lỗi tại field và validation summary; không dùng browser alert cho lỗi chính.

## 14. Kiến trúc code

~~~text
src/
  components/
  features/
    vehicles/
    cargo/
    optimization/
    viewer3d/
  domain/
    models/
    constraints/
    geometry/
  services/
    optimization/
  fixtures/
  stores/
  routes/
  utils/
~~~

Quy tắc:

- Tách domain model, validation, service, state và UI.
- Không đặt toàn bộ logic vào một component.
- Volume, orientation, boundary, overlap và payload là pure functions.
- Viết unit test cho các pure functions.
- Mock fixture nằm riêng.
- Không hard-code kích thước xe trong viewer.
- Three.js không quyết định tính hợp lệ của placement.
- Responsive cho desktop và tablet.

## 15. Acceptance criteria

- [ ] Tạo xe bằng cm/kg.
- [ ] Thêm/sửa/xóa/nhân bản kiện.
- [ ] Mọi field hiển thị đơn vị.
- [ ] Validation chặn dữ liệu không hợp lệ.
- [ ] Tự tính tổng khối lượng và thể tích.
- [ ] Quantity được mở rộng thành instance riêng.
- [ ] Mock service trả đúng OptimizationResult.
- [ ] Viewer hiển thị đúng tỷ lệ xe, hàng và obstacle.
- [ ] Rotate, zoom, pan và reset camera hoạt động.
- [ ] Click kiện hiển thị đúng thông tin cm/kg.
- [ ] Hai kiện chạm mặt không bị báo overlap.
- [ ] Kiện vượt biên hoặc overlap obstacle bị cảnh báo.
- [ ] Hiển thị kiện chưa xếp và lý do.
- [ ] Hiển thị volume/payload utilization.
- [ ] Mock result có nhãn rõ ràng.
- [ ] Unit test cho volume, orientation, boundary và overlap.
- [ ] Thay MockOptimizationService bằng API service mà không sửa UI chính.

## 16. Prompt giao cho AI coding

Build a complete frontend MVP for LoadMaster based strictly on this specification.

Use React, TypeScript, Vite, React Three Fiber and Drei. Use centimeters (cm) for every vehicle/package dimension and coordinate, and kilograms (kg) for every weight, payload and load-bearing value. Never mix units in application state or API payloads.

Implement Dashboard, Vehicle Configuration, Cargo Management, Optimization Setup and Loading Result. Create a MockOptimizationService behind an OptimizationService interface. Clearly label every mock result and do not claim that AI optimization or backend integration is complete.

Implement reusable domain types, validation functions, orientation handling, vehicle-boundary checking, collision checking, obstacle checking, payload validation and metrics. Render the truck, obstacles and package placements in an interactive Three.js scene with rotate, zoom, pan, package selection, delivery-stop colors, camera reset and loading-sequence replay.

Use the coordinate system in this document: origin at the inner-left-bottom corner, +X toward the rear door, +Y left to right and +Z upward. Two boxes may share a face; do not add 1 cm between adjacent placements unless clearance is explicitly configured.

Produce working source code, not pseudocode. Keep domain logic separate from UI and Three.js. Add unit tests for volume, orientation, boundary and overlap. Use the sample vehicle, package and placement data as fixtures. Support desktop and tablet. Include empty, loading, validation-error, service-error, success and partial-result states.

## 17. Hướng mở rộng

1. Kết nối FastAPI.
2. Triển khai EP + DBLF baseline.
3. Thêm GA/SA với time limit.
4. Hoàn thiện Constraint Engine backend.
5. Tính tải trọng trục và vùng trọng tâm an toàn.
6. Kiểm tra insertion path.
7. Thử nghiệm BBMP-DCS/PQNet.
8. Import CSV/Excel và lưu loading plan.

Mọi phương pháp tối ưu phải trả cùng OptimizationResult để frontend không phụ thuộc thuật toán cụ thể.
