# PRD — LoadMaster FE MVP (tích hợp Build Spec)

| | |
|---|---|
| Ngày | 14/09/2026 |
| Trạng thái | Đã hiện thực trên `feat/spec-mvp` (16/09/2026) — nghiệm thu: [acceptance.md](acceptance.md); còn chờ backend: mục 14 |
| Nguồn | [LoadMaster_FE_MVP_Build_Spec.md](../LoadMaster_FE_MVP_Build_Spec.md) (gọi tắt **Spec**), [AGENTS.md](../AGENTS.md), buổi chốt quyết định 14/09/2026 |
| Phạm vi repo | Frontend `E:\SEP490\LoadMaster` |

Tài liệu này mô tả **sản phẩm cần xây** khi đưa Spec vào repo đang có. Spec là nguồn cho quy tắc nghiệp vụ; PRD này ghi lại cách áp Spec vào repo và các quyết định đã chốt. Khi PRD và Spec lệch nhau ở phần nghiệp vụ bắt buộc (mục 3.1), Spec thắng và PRD phải được sửa.

---

## 1. Bối cảnh

LoadMaster là hệ thống lập kế hoạch và tối ưu chất xếp hàng hoá 3D cho doanh nghiệp vận tải vừa và nhỏ tại Việt Nam. Repo frontend hiện có:

- Các màn điều phối (chuyến hàng, so sánh phương án, đội xe, người dùng, dashboard), màn kho và màn tài xế, toàn bộ bằng tiếng Việt với dữ liệu mẫu.
- Engine 3D dùng chung cho Planner, Kho và Tài xế: instancing 1.000 kiện, render theo nhu cầu, editor kéo thả, mô phỏng xếp/dỡ, quality tier.
- Chưa có backend, chưa phân quyền. Dữ liệu nghiệp vụ dùng **mm**, 3 hướng đặt kiện, và mô hình `LoadPlan` gắn với chuyến.

Spec yêu cầu một luồng MVP khác về dữ liệu: **cm/kg**, 6 hướng đặt, cấu hình xe có cửa và vật cản, kiện có số lượng và ràng buộc xếp chồng, contract `OptimizationRequest/OptimizationResult`, và mock service thay cho bộ tối ưu thật.

## 2. Mục tiêu và không phải mục tiêu

### Mục tiêu

1. Người điều phối nhập được xe và kiện hàng bằng cm/kg, được kiểm tra dữ liệu ngay khi nhập.
2. Gửi job tối ưu qua `OptimizationService`; giai đoạn này là `MockOptimizationService` có nhãn **MOCK RESULT** rõ ràng.
3. Xem kết quả trong 3D: kiện đã xếp, kiện chưa xếp kèm lý do, tỷ lệ sử dụng thể tích và tải trọng, trọng tâm, phát lại thứ tự xếp.
4. Thay mock bằng API thật mà không sửa UI chính.
5. Giữ nguyên chất lượng engine 3D, design system và luật trong AGENTS.md.
6. Giao diện chuyển được giữa tiếng Việt và tiếng Anh.

### Không phải mục tiêu (giai đoạn này)

- Backend, thuật toán tối ưu thật (EP-DBLF, GA, SA, BBMP-DCS/PQNet), training AI.
- Tính tải trục thật, kiểm tra đường đưa kiện vào (insertion path), mô phỏng vật lý.
- Quét camera, GPS, tối ưu tuyến, tích hợp ERP/WMS.
- Import CSV/Excel, lưu kế hoạch lên server, phân quyền theo vai trò.
- Tuyên bố bất kỳ kết quả mock nào là phương án tối ưu.

## 3. Nguyên tắc

### 3.1. Bắt buộc theo Spec

| Nhóm | Nội dung |
|---|---|
| Đơn vị | cm cho kích thước, toạ độ, clearance; kg cho khối lượng, payload, tải; cm³ cho thể tích. Không trộn đơn vị trong state và payload. JSON lưu số, không lưu chuỗi. |
| Hệ toạ độ | Gốc tại góc trong cùng – trái – sàn khi nhìn từ cửa sau vào. +X ra cửa sau, +Y trái sang phải, +Z lên. Cửa sau tại `X = innerLengthCm`. Kiện chiếm `[x, x+l) × [y, y+w) × [z, z+h)`; hai kiện chạm mặt không phải chồng lấn. |
| Mô hình dữ liệu | Đúng type ở Spec mục 6. |
| Contract | `OptimizationService.optimize(OptimizationRequest): Promise<OptimizationResult>`. |
| Validation | Đúng các ràng buộc Spec mục 7; lỗi hiện tại field và trong validation summary, không dùng `alert`. |
| Nhãn mock | Mọi kết quả mock có badge **MOCK RESULT**; không có chữ kiểu "AI optimized successfully"; không đặt tên `AIService`. |
| Nghiệm thu | Toàn bộ checklist Spec mục 15. |

### 3.2. Được điều chỉnh cho khớp repo

Cấu trúc thư mục, component giao diện, thư viện, cách bố trí màn. Mọi điều chỉnh vẫn phải theo AGENTS.md (token, thang chữ, một nút primary mỗi màn, lazy route, không `any`, v.v.).

## 4. Người dùng

| Vai trò | Thiết bị | Dùng gì trong MVP |
|---|---|---|
| Điều phối (chính) | Desktop, tablet | Cấu hình xe, nhập kiện, thiết lập job, xem và chỉnh kết quả |
| Quản lý | Desktop, tablet | Dashboard |
| Công nhân kho | Tablet | Làm theo thứ tự xếp của kết quả đã duyệt |
| Tài xế | Điện thoại | Xem vị trí hàng và thứ tự dỡ tại điểm giao |

Spec chỉ bắt buộc responsive desktop và tablet; màn tài xế giữ yêu cầu điện thoại hiện có.

## 5. Quyết định đã chốt

| Mã | Quyết định |
|---|---|
| D-01 | Tích hợp Spec vào repo hiện tại, không viết lại, không tách app. Chỉ refactor phần cần cho tích hợp. |
| D-02 | Contract backend **chưa chốt**. FE giữ interface `OptimizationService`; hình dạng payload sẽ thống nhất với backend sau. |
| D-03 | **Chuyển toàn bộ repo sang cm**: domain, engine 3D, editor, kho, tài xế, mock, test. Chỉ `viewer3d/scene/units.ts` đổi scale (`SCENE_SCALE = 0.01`). |
| D-04 | API và mock dùng đúng type Spec, không thêm trường. FE dựng **view model nội bộ** (placement + `CargoPackage` gốc + thông tin chuyến và điểm giao) cho engine 3D. Tính năng cần trường ngoài Spec thì lấy từ dữ liệu chuyến ở FE hoặc ẩn đi. |
| D-05 | Năm màn của Spec **gắn vào màn có sẵn** (xem mục 7). |
| D-06 | State dùng chung: mock repository in-memory → `features/<tên>/<tên>-api.ts` → hook TanStack Query (`useQuery`, `useMutation` + invalidate). Không thêm Zustand/Redux. Dữ liệu mất khi tải lại trang. |
| D-07 | Giao diện **vi + en**, có nút chuyển. Từ điển TypeScript tự viết, kiểm tra thiếu key lúc build, không thêm dependency. Lựa chọn lưu trong `sessionStorage` và tham số `?lang`. Số và ngày format theo locale (`vi-VN` / `en-US`). |
| D-08 | i18n toàn app, làm theo đợt: đợt 1 là nav, các màn thuộc luồng Spec và mọi validation message; đợt 2 là kho, tài xế, admin, design system. |
| D-09 | Giữ editor 3D; mỗi lần thả hoặc xoay chạy lại **toàn bộ constraint engine**. Xoay chỉ vòng qua `allowedOrientations`. Hard error chặn commit. |
| D-10 | Độ chính xác: làm tròn về bội **0,1 cm** khi commit, so sánh bằng `EPSILON = 1e-6`. Nudge 1 / 5 / 10 cm, lưới 5 cm, ngưỡng snap 2 cm. |
| D-11 | Mock service dùng **shelf/row packing tất định** theo `randomSeed`. |
| D-12 | Trạng thái demo: partial-result xảy ra tự nhiên từ dữ liệu; service-error bật bằng tham số URL `?mo-phong=loi`, không có công tắc trên UI vận hành. |
| D-13 | Timeline dùng `loadingOrder` / `unloadingOrder` của kết quả. FE vẫn phát hiện blocker theo hành lang +X để kiểm tra LIFO: báo lỗi khi `enforceLifo = true`, chỉ cảnh báo khi `false`. |
| D-14 | Kho và tài xế đọc **kết quả đã duyệt** của chuyến qua mock repo + Query. Seed sẵn một chuyến mẫu đã tối ưu. |
| D-15 | Thêm **Vitest + React Testing Library**; chuyển các test `node --test` hiện có sang Vitest. |
| D-16 | Kiện thuộc chuyến; `deliveryStop` chọn từ danh sách điểm giao của chuyến và cập nhật theo khi đổi thứ tự điểm giao. Bảng đơn hàng cũ thay bằng bảng kiện. |
| D-17 | Cấu hình xe là trang chi tiết `/doi-xe/:vehicleId` với form, bảng vật cản và **xem trước 3D** (lazy-load từ `viewer3d`). |
| D-18 | Tải xếp chồng tính **truyền qua toàn stack, chia theo diện tích tiếp xúc**. Ghi rõ là ước tính của FE, không phải mô phỏng vật lý. |
| D-19 | Code thuần đặt ở `src/domain/{models,geometry,constraints,metrics}` và `src/services/optimization/`. Không import React hay Three.js trong hai thư mục này. |
| D-20 | Nút chưa hoạt động **bị ẩn** khỏi UI vận hành (Import, Xuất báo cáo, bộ lọc giả…). Riêng tải trục giữ vị trí với nhãn "Coming later" / "Sẽ có sau", không bấm được. Luật `notifyPendingFeature()` trong AGENTS.md được sửa tương ứng. |
| D-21 | Commit đợt scene-first đang dở lên `main`, làm toàn bộ tích hợp trên nhánh `feat/spec-mvp`. |
| D-22 | Làm theo phase (mục 11); mỗi phase phải lint, build, test xanh và dừng cho nhóm duyệt. |
| D-23 | Tổng khối lượng vượt tải trọng là **cảnh báo**, vẫn cho tối ưu. Service xếp theo `mustLoad` rồi `priority` tới khi chạm tải, phần còn lại trả `OVER_PAYLOAD`. Chỉ chặn nút Tối ưu khi riêng các kiện `mustLoad` đã vượt tải. |
| D-24 | Kiện `mustLoad` không xếp được: kết quả vẫn `COMPLETED` (kết quả một phần), Planner hiện lỗi nổi bật và **vô hiệu nút Duyệt** cho tới khi sửa dữ liệu và tối ưu lại. |
| D-25 | Form tự đồng bộ trường xung đột và báo rõ: bật `keepUpright` thì bỏ chọn và khoá 4 hướng nằm nghiêng; tắt `stackable` thì đặt `maxTopLoadKg = 0` và khoá ô. Schema zod vẫn từ chối dữ liệu xung đột đến từ API. |
| D-26 | LIFO: kiện giao sớm A **vi phạm** khi mặt cắt Y–Z của A bị các kiện giao muộn hơn nằm giữa A và cửa sau che phủ 100% (hợp diện tích, có EPSILON). Che một phần là cảnh báo. |
| D-27 | Mọi giá trị đi qua `roundCm` (bội 0,1 cm) tại biên nhập liệu, service và editor commit. Domain so sánh qua helper `lt/gt/eq` có EPSILON, không dùng `<` `>` trực tiếp. |
| D-28 | Domain trả lỗi dạng `{ code, severity, packageInstanceId?, field?, params }`. UI dịch bằng từ điển và format số theo locale. Test so `code`, không so chuỗi. `constraintWarnings: string[]` của contract chứa mã, UI ánh xạ sang câu. |
| D-29 | Ngân sách constraint engine: toàn bộ 1.000 kiện **p95 ≤ 50 ms**; một lần thả/xoay **p95 ≤ 8 ms**. Dùng lưới không gian theo X–Y dựng một lần mỗi snapshot; editor chỉ tính lại kiện bị kéo và cột xếp chồng ở vị trí cũ và mới. Benchmark Vitest là cổng kiểm tra. |
| D-30 | `MockOptimizationService` chạy trong **Web Worker**; tiến trình gửi qua message, huỷ được theo `timeLimitSeconds`. Domain vẫn thuần nên test trực tiếp không cần worker. |
| D-31 | Kết quả là **revision bất biến**: mỗi lần tối ưu tạo revision mới theo `jobId`. Duyệt lưu revision đã áp draft thành bản approved mới, giữ `isMockResult` và đánh dấu đã chỉnh tay. Sửa xe/kiện sau khi tối ưu thì kết quả hiện tại bị đánh dấu lỗi thời và chặn Duyệt. Tối ưu lại khi còn draft phải xác nhận bỏ draft. |
| D-32 | Trong editor giữ thứ tự gốc và cảnh báo khi thứ tự xếp không còn khả thi (kiện được xếp trước kiện đỡ nó). Khi Duyệt, FE tính lại `loadingOrder` (sắp xếp topo theo quan hệ đỡ, ưu tiên điểm giao muộn và vị trí sâu) và `unloadingOrder`, gắn nhãn là thứ tự tính lại ở FE. |
| D-33 | ID instance = `{packageId}-{số thứ tự 1-based}`, đệm tối thiểu 2 chữ số và dài theo `quantity`. Truy vết bằng `Map instanceId → packageId` sinh cùng lúc, không tách chuỗi. Kiểm tra trùng ID trong toàn request. Nhân bản kiện sinh `packageId` mới. |
| D-34 | Xem trước xe: `useWatch` + debounce 250 ms; chỉ đẩy vào scene khi phần dữ liệu đó hợp lệ, giữ hình hợp lệ gần nhất kèm nhãn chờ. Camera chỉ fit lại khi kích thước thùng đổi. Canvas demand, tier low mặc định. |
| D-35 | Bảng kiện chỉ đọc (cột chính và cờ lỗi), ảo hoá dòng khi > 100 kiện. Chọn dòng mở panel form bên phải (tablet: sheet dưới) cho một kiện. Tổng hợp và validation summary tính từ dữ liệu đã lưu. |
| D-36 | Ngưỡng trọng tâm là hằng số trong domain: lệch ngang `|Ycg − W/2| > 10%` chiều rộng trong thùng; `Zcg > 50%` chiều cao trong thùng. Ghi rõ là ngưỡng tạm của FE, chờ nghiệp vụ xác nhận. |
| D-37 | Màn **So sánh phương án** chuyển thành so sánh các revision của chuyến bằng metric thật từ `OptimizationResult`, mỗi thẻ có badge MOCK RESULT. Bỏ dữ liệu thuật toán giả. |
| D-38 | Route: `/doi-xe/moi`, `/doi-xe/:vehicleId`, `/chuyen/:tripId/toi-uu` (màn riêng, có nav rail), kết quả mở `/chuyen/:tripId/phuong-an?revision=<jobId>`. "Coming later" dịch "Sẽ có sau"; riêng "MOCK RESULT" giữ nguyên ở mọi ngôn ngữ. |
| D-39 | Thêm `@playwright/test` làm devDependency, chuyển 7 suite trình duyệt sang cm, thêm E2E cho luồng Spec. GitHub Actions chạy lint, typecheck, Vitest (gồm benchmark domain), build và E2E. Benchmark FPS 3D vẫn chạy tay. |

## 6. Luồng chính

```text
Dashboard
  └─ "Tạo kế hoạch xếp" ─→ Chuyến hàng (tạo / chọn chuyến)
                              ├─ Chọn xe  ←── Đội xe › Chi tiết xe (cấu hình, vật cản)
                              ├─ Điểm giao (kéo thả thứ tự)
                              ├─ Bảng kiện (thêm / sửa / xoá / nhân bản, validation)
                              └─ Thiết lập tối ưu ─→ MockOptimizationService
                                                        └─ Planner 3D (kết quả, MOCK RESULT)
                                                              └─ Duyệt ─→ Kho ─→ Tài xế
```

## 7. Yêu cầu chức năng theo màn

Route dùng slug tiếng Việt không dấu (AGENTS.md mục 9). Route đánh dấu *(đề xuất)* chưa chốt tên.

### 7.1. Dashboard — `/` (Spec 9.1)

- Số xe, tổng số kiện, tổng khối lượng (kg), job tối ưu gần nhất (trạng thái, phương pháp, thời gian chạy, badge MOCK nếu là mock).
- Danh sách kế hoạch gần đây (dữ liệu mẫu).
- Nút primary duy nhất: **Tạo kế hoạch xếp** / **Create Loading Plan**.
- KPI và biểu đồ hiện có được giữ nếu không trùng; bộ lọc và "Xuất báo cáo" chưa hoạt động bị ẩn (D-20).

### 7.2. Cấu hình xe — `/doi-xe`, `/doi-xe/moi`, `/doi-xe/:vehicleId` (Spec 9.2)

- Danh sách xe giữ bảng hiện có, chuyển sang đọc qua Query (D-06).
- Trang chi tiết có form: tên, dài / rộng / cao trong thùng (cm), tải trọng tối đa (kg), rộng / cao cửa (cm), clearance (cm).
- Bảng vật cản: loại (`WHEEL_ARCH`, `COOLING_UNIT`, `PARTITION`, `RESERVED_ZONE`), toạ độ và kích thước (cm), `loadBearing`, `maxTopLoadKg`.
- Trục xe (`VehicleAxle`) nhập được nhưng gắn nhãn chưa dùng tính toán.
- Xem trước 3D thùng và vật cản, cập nhật theo giá trị đang nhập (D-17).
- Validation: mọi kích thước > 0; `maxPayloadKg > 0`; cửa không lớn hơn thùng; vật cản nằm trong thùng; vật cản không chồng lấn nhau.

### 7.3. Quản lý kiện — trong chi tiết chuyến `/chuyen/:tripId` (Spec 9.3)

- Bảng kiện thay bảng đơn hàng: thêm, sửa, xoá, nhân bản. Bảng chỉ đọc; sửa trong panel form bên phải, tablet dùng sheet dưới (D-35).
- Form tự đồng bộ `keepUpright` ↔ hướng đặt và `stackable` ↔ `maxTopLoadKg` (D-25).
- Trường: tên, dài / rộng / cao (cm), khối lượng (kg), số lượng, hướng đặt cho phép (chọn từng mã trong 6 mã), `keepUpright`, mức dễ vỡ, `stackable`, `maxTopLoadKg`, `maxStackCount`, `minSupportRatio`, điểm giao, độ ưu tiên, `mustLoad`, ghi chú.
- Tổng hợp tự tính: số package instance, tổng thể tích (cm³), tổng khối lượng (kg), so với tải trọng xe.
- Kiện có `quantity > 1` được mở thành instance có ID riêng (ví dụ `PKG-001-01`) trước khi tối ưu, truy vết được về kiện gốc.
- Không hiện nút Import CSV (D-20).

### 7.4. Thiết lập tối ưu — `/chuyen/:tripId/toi-uu` (Spec 9.4)

- Chọn xe, xem danh sách kiện của chuyến.
- Phương pháp: mặc định `MOCK`; các phương pháp khác hiển thị nhưng không chọn được cho tới khi có service thật.
- Thời gian giới hạn (giây), random seed, Enforce LIFO, Ưu tiên trọng tâm thấp.
- Validation summary gom lỗi từ xe và kiện, bấm vào lỗi thì đi tới field.
- Nút **Tối ưu** bị vô hiệu khi còn hard error. Vượt tải chỉ là cảnh báo, trừ khi riêng kiện `mustLoad` đã vượt (D-23).
- Tối ưu lại khi revision hiện tại còn draft chưa duyệt phải xác nhận bỏ draft (D-31).
- Trạng thái: đang chạy (tiến trình từ worker, huỷ được), lỗi service (thử lại), thành công, kết quả một phần. Xong thì mở `/chuyen/:tripId/phuong-an?revision=<jobId>`.

### 7.5. Kết quả xếp — Planner `/chuyen/:tripId/phuong-an` (Spec 9.5, 10)

- Khung 3D là vùng chính. Giữ scene-first, HUD, inspector, timeline, editor, mô phỏng xếp/dỡ đang có.
- Badge **MOCK RESULT** luôn hiện khi `isMockResult = true`.
- Panel chỉ số: tỷ lệ sử dụng thể tích và tải trọng, số kiện đã xếp / chưa xếp, thời gian chạy.
- Danh sách kiện có lọc; chi tiết kiện đang chọn hiển thị cm/kg, hướng đặt, `supportRatio`, `constraintWarnings`, thứ tự xếp và thứ tự dỡ riêng.
- Danh sách kiện chưa xếp kèm `reasonCode` và thông báo.
- Vật cản vẽ bằng màu khác kiện; màu kiện theo điểm giao, có chú giải; marker trọng tâm; nút về góc nhìn mặc định; phát lại thứ tự xếp.
- Góc nhìn: phối cảnh, trên, bên hông, cửa sau.
- Tải trục hiển thị "Sẽ có sau", không có số (Spec 7.10).
- Mọi chỉnh sửa trong editor chạy lại constraint engine (D-09); chỉnh sửa không đổi `isMockResult`.
- Cảnh báo khi thứ tự xếp không còn khả thi sau chỉnh tay; thứ tự được tính lại khi Duyệt (D-32).
- Nút Duyệt bị vô hiệu khi: còn hard error, kiện `mustLoad` chưa xếp (D-24), hoặc revision đã lỗi thời do xe/kiện bị sửa (D-31). Lý do hiển thị cạnh nút.

### 7.8. So sánh phương án — `/chuyen/:tripId/so-sanh` (D-37)

- So sánh các revision của chuyến: phương pháp, seed, thiết lập, tỷ lệ thể tích và tải trọng, số kiện đã/chưa xếp, thời gian chạy, trạng thái duyệt.
- Mỗi thẻ có badge MOCK RESULT khi là kết quả mock; ảnh thu nhỏ SVG đẳng cự dựng từ placement thật.

### 7.6. Kho `/kho` và Tài xế `/tai-xe/*`

- Đọc kết quả đã duyệt của chuyến (D-14), không giữ mock riêng.
- Kho làm theo `loadingOrder`; tài xế làm theo `unloadingOrder` tại điểm giao hiện tại.
- Giữ nguyên hành vi màn hiện có, chỉ đổi dữ liệu và đơn vị.

### 7.7. Chuyển ngôn ngữ

- Nút chuyển vi / en đặt trong nav rail (màn desktop) và trong header các màn toàn màn hình.
- Chuyển ngôn ngữ không tải lại trang, không mất dữ liệu đang nhập.

## 8. Quy tắc nghiệp vụ và constraint engine

Tất cả là pure function trong `src/domain`, có unit test. Three.js không quyết định tính hợp lệ.

| Ràng buộc | Mức | Ghi chú |
|---|---|---|
| Biên thùng (Spec 7.1) | Lỗi | So sánh có EPSILON |
| Không chồng lấn (7.2) | Lỗi | Nghĩa `<` / `>` như Spec qua helper EPSILON (D-27), chạm mặt hợp lệ |
| Tải trọng (7.3) | Cảnh báo | Hiện tổng kg và mức vượt kg; lỗi chỉ khi riêng kiện `mustLoad` vượt tải (D-23) |
| Qua cửa (7.4) | Lỗi | Có ít nhất một hướng cho phép đi qua mặt cắt cửa kể cả clearance |
| Hướng đặt (7.5) | Lỗi | Ít nhất một hướng; `keepUpright` chỉ cho `LWH`, `WLH`; kích thước placement khớp hướng |
| Vật cản (7.6) | Lỗi | Không chồng lấn vật cản; không tựa lên vật cản `loadBearing = false` |
| Tỷ lệ đỡ đáy (7.7) | Cảnh báo | Diện tích tiếp xúc hợp nhất, không đếm trùng |
| Sức chịu tải xếp chồng (7.8) | Lỗi | Truyền tải toàn stack theo diện tích (D-18); `stackable = false`; `HIGH` + `maxTopLoadKg = 0`; `maxStackCount` |
| Trọng tâm (7.9) | Cảnh báo | Tính từ placement; ngưỡng lệch ngang 10% chiều rộng, cao 50% chiều cao (D-36) |
| LIFO (7.11) | Lỗi hoặc cảnh báo | Che kín mặt sau là vi phạm, che một phần là cảnh báo (D-26); vi phạm là lỗi khi `enforceLifo = true`, cảnh báo khi `false` (D-13) |
| Kiện bắt buộc | Chặn Duyệt | Kiện `mustLoad` nằm trong `unplacedPackages` (D-24) |
| Thứ tự xếp khả thi | Cảnh báo | Kiện không được xếp trước kiện đỡ nó; tính lại khi Duyệt (D-32) |

Engine trả mã lỗi kèm tham số, không trả câu chữ (D-28). Hiệu năng theo ngân sách D-29.

Quy tắc dữ liệu kiện: `minSupportRatio ∈ [0, 1]`; `stackable = false` thì `maxTopLoadKg = 0`; `quantity ≥ 1`.

Thông báo lỗi có đủ bản vi và en, giữ nguyên nội dung và số liệu của Spec mục 13. Ví dụ:

| en (Spec) | vi |
|---|---|
| Door width 250 cm cannot exceed vehicle inner width 240 cm. | Chiều rộng cửa 250 cm không được lớn hơn chiều rộng trong thùng 240 cm. |
| Total cargo weight 5,320 kg exceeds vehicle payload 5,000 kg. | Tổng khối lượng hàng 5.320 kg vượt tải trọng xe 5.000 kg. |
| PKG-008 support ratio 0.62 is below the required 0.80. | PKG-008 có tỷ lệ đỡ đáy 0,62, thấp hơn mức yêu cầu 0,80. |

## 9. Mock optimization service

- Hiện thực `OptimizationService`; tên `MockOptimizationService`.
- `isMockResult` luôn `true`, `method = "MOCK"`.
- Shelf/row packing tất định theo seed (D-11): mở rộng `quantity` theo quy tắc ID D-33, ưu tiên `mustLoad` rồi `priority`, sắp theo điểm giao (giao muộn vào sâu trước), thử lần lượt các hướng cho phép, tránh vật cản, kiểm tra cửa, tải trọng và xếp chồng.
- Kiện không xếp được trả về `unplacedPackages` với `reasonCode` phù hợp; hết tải trọng là `OVER_PAYLOAD` (D-23).
- Metric tính từ placement, không gõ cứng. Placement đi qua `roundCm` (D-27).
- Chạy trong Web Worker, gửi tiến trình, huỷ theo `timeLimitSeconds` (D-30).
- Có độ trễ giả và hỗ trợ `?mo-phong=loi` để trả lỗi (D-12).
- Mọi placement trả về phải qua được constraint engine; test tự động kiểm tra điều này.

## 10. Yêu cầu phi chức năng

| Nhóm | Yêu cầu |
|---|---|
| Hiệu năng 3D | Giữ mục tiêu AGENTS.md: 1.000 placements, dưới 100 draw call, số mesh và nhãn không tăng theo số kiện. Vật cản dùng số draw call cố định. |
| Hiệu năng domain | Constraint engine 1.000 kiện p95 ≤ 50 ms; một lần thả/xoay p95 ≤ 8 ms (D-29). Mock service không chặn main thread (D-30). |
| Hiệu năng form | Bảng kiện ảo hoá khi > 100 dòng; xem trước xe debounce 250 ms (D-34, D-35). |
| Cổng chất lượng | GitHub Actions: lint, typecheck, Vitest + benchmark domain, build, E2E Playwright (D-39). |
| Chia chunk | Mọi màn `lazy()`. Three.js chỉ tải ở Planner, xem trước xe, kho và khi tài xế mở "Xem vị trí hàng". |
| Truy cập | Tương phản ≥ 4,5:1; vùng chạm 44px desktop, 56px tablet/điện thoại; bàn phím đầy đủ cho màn điều phối; màu điểm giao luôn kèm số hoặc tên. |
| Responsive | Desktop và tablet cho luồng Spec; tài xế trên điện thoại. |
| Mã nguồn | TypeScript strict, không `any`, file ≤ 250 dòng, token từ `index.css`, format qua `lib/format.ts` theo locale. |
| Lưu trữ | Không `localStorage`; phiên và ngôn ngữ trong `sessionStorage`. |

## 11. Lộ trình

| Phase | Nội dung | Điều kiện xong |
|---|---|---|
| 0 | Commit scene-first lên `main`, tạo nhánh `feat/spec-mvp`; cập nhật AGENTS.md và CLAUDE.md; Vitest, Playwright, GitHub Actions | Tài liệu được duyệt, CI chạy |
| 1 | `src/domain` (models, geometry, orientation, constraints, metrics); `MockOptimizationService` trong worker; mock repository; hạ tầng i18n và nút chuyển ngôn ngữ | Unit test cho volume, orientation, boundary, overlap, payload, door, obstacle, stacking, LIFO; benchmark đạt D-29; mock trả placement hợp lệ |
| 2 | Engine 3D sang cm, 6 hướng đặt, vật cản, view model từ `OptimizationResult`, editor dùng constraint engine | Browser suite 3D hiện có vẫn xanh; draw call không tăng theo số kiện |
| 3 | Màn mới viết bằng từ điển i18n ngay từ đầu; Đội xe + chi tiết xe; bảng kiện trong chuyến; thiết lập tối ưu; Planner hiển thị kết quả, MOCK RESULT, metric, unplaced; Duyệt; So sánh revision; Dashboard | Checklist Spec mục 15 đạt trên luồng điều phối |
| 4 | Kho và tài xế đọc kết quả đã duyệt; gỡ mock mm và code thừa | Hai màn chạy đúng với dữ liệu cm |
| 5 | i18n: dịch phần còn lại của đợt 1, rồi đợt 2 | Không thiếu key ở cả vi và en |

Chi tiết từng việc: [docs/issues/](issues/README.md).

Mỗi phase: `pnpm lint`, `pnpm build`, test xanh, rồi dừng cho nhóm duyệt.

## 12. Tiêu chí nghiệm thu

Toàn bộ checklist Spec mục 15, cộng thêm:

- [x] Không còn giá trị mm trong state, payload, mock hay test; chỉ `scene/units.ts` đổi scale.
- [x] Planner, kho và tài xế cùng đọc một kết quả đã duyệt.
- [x] Editor chặn commit khi constraint engine báo lỗi; hoàn tác được mọi lệnh.
- [x] Chuyển vi ↔ en ở mọi màn thuộc đợt 1 mà không mất dữ liệu đang nhập.
- [x] Không còn nút nào bấm vào mà không làm gì hoặc chỉ báo "đang chờ".
- [x] Tải trục hiện "Sẽ có sau", không có số giả.
- [x] Draw call vẫn dưới 100 ở 1.000 kiện.

## 13. Rủi ro

| Rủi ro | Cách giảm |
|---|---|
| Chuyển mm → cm gây lỗi âm thầm ở engine 3D (nhầm hệ số 10) | Làm ở phase riêng; kiểm tra bằng test browser và ảnh chụp hiện có trước khi đổi màn |
| Contract backend thay đổi sau khi FE làm xong | Chỉ `services/optimization` và `-api.ts` biết hình dạng payload; view model tách khỏi contract |
| Constraint engine toàn stack chậm với 1.000 kiện | Lưới không gian + tính lại cục bộ, benchmark làm cổng CI (D-29) |
| Sai số số thực làm chạm mặt thành chồng lấn | `roundCm` + helper EPSILON, test các ca biên cộng dồn (D-27) |
| Draft chỉnh tay lệch với dữ liệu xe/kiện đã sửa | Revision bất biến, đánh dấu lỗi thời, chặn Duyệt (D-31) |
| Thứ tự xếp sai sau chỉnh tay khiến kho làm sai | Cảnh báo trong editor, tính lại khi Duyệt (D-32) |
| i18n làm phình phạm vi | Chia hai đợt; đợt 2 không chặn nghiệm thu luồng Spec |
| Xem trước 3D ở Đội xe kéo Three.js vào màn danh sách | Chỉ lazy-load ở trang chi tiết xe |

## 14. Câu hỏi còn mở

Cần nhóm backend trả lời (theo dõi ở issue LM-002):

1. FE gọi thẳng FastAPI hay đi qua Spring Boot? Ai sở hữu `OptimizationRequest/Result`?
2. Tên điểm giao, thông tin chuyến, revision và trạng thái duyệt có đưa vào contract không, hay FE luôn ghép từ dữ liệu chuyến?
3. `constraintWarnings` có chuyển sang mã lỗi có cấu trúc (D-28) không?
4. Ngưỡng trọng tâm D-36 có được nghiệp vụ xác nhận không?

Đã chốt trong buổi hỏi đáp 14/09/2026: ngưỡng trọng tâm (D-36), route (D-38), màn So sánh (D-37), nhãn "Sẽ có sau" (D-38).
