# LoadMaster Frontend — Bàn giao hiện trạng

Ngày cập nhật: 16/09/2026. Repo `E:\SEP490\LoadMaster`, nhánh `feat/spec-mvp` (tích hợp Build Spec, 5 phase, 56/57 issue;
LM-002 chờ backend). Luật code: [AGENTS.md](../AGENTS.md). Phạm vi và quyết định: [docs/prd.md](prd.md).
Tiến độ theo ngày: [docs/progress.md](progress.md). Nghiệm thu từng dòng: [docs/acceptance.md](acceptance.md).

Bản bàn giao 14/09/2026 (đợt scene-first, dữ liệu mm) đã lỗi thời; các báo cáo `docs/viewer-*-report.md` là lịch sử.

## 1. Kết luận

- MVP theo [Build Spec](build-spec.md) chạy đủ luồng: đội xe (cm/kg, vật cản, xem trước 3D) → chuyến và kiện
  → thiết lập tối ưu → chạy mock trong Web Worker → Planner 3D (chỉ số, kiện chưa xếp, editor có constraint engine) → Duyệt
  → kho làm theo `loadingOrder`, tài xế theo `unloadingOrder`. So sánh revision và bảng điều khiển đọc cùng kho dữ liệu.
- Toàn app dùng **cm/kg**; không còn dữ liệu mm. Giao diện chuyển **vi / en**, không chuỗi tiếng Việt cứng ngoài từ điển (có test chặn).
- **Chưa nối backend.** Dữ liệu nằm trong kho in-memory (`src/lib/mock-db`), mất khi tải lại trang. Đăng nhập là mock,
  chưa phân quyền theo vai trò. Mọi kết quả tối ưu mang badge **MOCK RESULT**.
- Kiểm tra lúc chốt: lint, build xanh; Vitest 520 test; Playwright 55 test (desktop, tablet, phone); CI GitHub xanh.

## 2. Chạy và xem thử

```powershell
# Node >= 22, pnpm 11 (packageManager trong package.json)
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5175
```

Tài khoản demo: `dieuphoi@loadmaster.vn` / `loadmaster` (`features/auth/auth.mock.ts`). Thêm `?lang=en` để mở bằng tiếng Anh.

| Màn | Đường dẫn |
|---|---|
| Bảng điều khiển | `/` |
| Đội xe / chi tiết xe | `/doi-xe`, `/doi-xe/VEHICLE-002` |
| Chuyến / chi tiết + kiện | `/chuyen`, `/chuyen/TRIP-2026-0914` |
| Thiết lập tối ưu | `/chuyen/TRIP-2026-0914/toi-uu` (thêm `?mo-phong=loi` để giả lập lỗi service) |
| Planner 3D | `/chuyen/TRIP-2026-0914/phuong-an` (`?revision=<mã revision hoặc jobId>`) |
| So sánh revision | `/chuyen/TRIP-2026-0914/so-sanh` |
| Kho (tablet) | `/kho` (`?chuyen=<mã chuyến>`) |
| Tài xế (điện thoại) | `/tai-xe/diem-giao` (`?chuyen=<mã chuyến>`) |
| Đo hiệu năng | `/chuyen/TRIP-2026-0914/phuong-an?debug&packages=1000&quality=low` |
| Tài liệu UI | `/kieu-dang`, `/thanh-phan` |

Seed kho: 3 xe, chuyến `TRIP-2026-0914` (4 điểm giao, 132 kiện), revision `REV-001` (kết quả) và `REV-002` (đã duyệt).

Ảnh bàn giao vi/en ở [docs/screenshots/handoff/](screenshots/handoff/) — chụp lại bằng `node tests/handoff-screenshots.mjs`
(cần dev server). Ví dụ: [Planner](screenshots/handoff/vi-planner-success.png) ·
[kết quả một phần](screenshots/handoff/en-planner-partial.png) · [lỗi thời](screenshots/handoff/vi-planner-stale.png) ·
[kho](screenshots/handoff/en-warehouse-tablet.png) · [tài xế](screenshots/handoff/vi-driver-phone.png).

## 3. Kiến trúc

```text
src/domain            logic thuần theo Spec: hình học cm (EPSILON), 6 hướng đặt, constraint engine (mã lỗi + tham số),
                      metrics, mở quantity → instance. Không React, không Three.
src/services/optimization   interface OptimizationService; mock tất định, chạy trong Web Worker; bản giả lập sự cố
src/lib/mock-db       kho in-memory: xe, chuyến, revision bất biến, Duyệt tạo revision mới, lỗi thời theo inputVersion
src/lib/i18n          từ điển vi (nguồn) / en, formatIssue cho mã ràng buộc, cổng chặn chuỗi cứng
features/<màn>        <màn>-api.ts (nơi duy nhất biết kho/mạng) → hook TanStack Query → component
features/viewer3d     toàn bộ Three.js: adaptResult → ViewerSceneModel (cm) → SceneCanvas dùng chung cho
                      Planner (ViewerSession), kho (PositionViewer), tài xế (DriverCargoViewer)
```

Nối backend thật: thay thân hàm trong các `features/*/*-api.ts` và `createOptimizationService`; hook và component giữ nguyên.
Chi tiết luật 3D (instancing, draw call cố định, render-on-demand, editor, operations): AGENTS mục 7.

## 4. Kiểm thử và số đo

```powershell
pnpm lint
pnpm build
pnpm test            # Vitest: unit (node) + dom (jsdom)
pnpm test:bench      # cổng constraint engine D-29 (p95 1.000 kiện ≤ 50 ms, một lần thả ≤ 8 ms)
pnpm test:e2e        # Playwright, tự bật Vite ở 127.0.0.1:5175 (E2E_PORT để đổi)
# Chạy tay, cần dev server riêng:
node tests/viewer-benchmark.mjs          # draw call / FPS theo tier
node tests/handoff-screenshots.mjs       # bộ ảnh bàn giao vi/en
```

Số đo 16/09/2026 (Ryzen 7 5800H; Chromium headless + SwiftShader — **không phải thiết bị thật**):

| Đo | Kết quả | Dữ liệu |
|---|---|---|
| Constraint engine `evaluateAll` 1.000 kiện | p95 30,8 ms (ngân sách 50) | [constraint-engine-2026-09-16.json](benchmarks/constraint-engine-2026-09-16.json) |
| `evaluateMove` / `commitMove` 1.000 kiện | p95 1,8 / 1,5 ms (ngân sách 8) | như trên |
| Viewer low, 132 / 300 / 500 / 1.000 kiện | 16 draw call; 60 / 60 / 60 / 42 FPS khi kéo | [viewer-2026-09-16.json](benchmarks/viewer-2026-09-16.json) |
| Viewer 1.000 kiện balanced / high | 25 / 33 draw call; 14 / 8 FPS | như trên |

E2E đáng đọc trước: `spec-flow.spec.ts` (luồng Spec đầu cuối, gắn từng dòng Spec §15), `plan-approval.spec.ts`,
`warehouse.spec.ts`, `driver-approved-plan.spec.ts`, `i18n-en.spec.ts`. Kho in-memory: E2E sửa dữ liệu qua
`import('/src/lib/mock-db/index.ts')` trong trang rồi đổi route phía client, **không** tải lại trang.

Hai lỗi E2E ngẫu nhiên đã gặp khi chạy cả bộ trên máy Windows (không tái hiện khi chạy riêng, CI xanh):
`warehouse.spec.ts` desktop báo "Cannot read properties of null (reading 'addEventListener')" và
`net::ERR_NO_BUFFER_SPACE` (hết socket cục bộ). Nếu lặp lại trên CI, bắt stack bằng `page.on('pageerror')`.

## 5. Nguồn dữ liệu trên màn

| Loại | Nội dung |
|---|---|
| Từ kho / kết quả | Xe, chuyến, kiện, điểm giao; placements, `loadingOrder`, `unloadingOrder`, `metrics`, kiện chưa xếp và mã lý do |
| FE tính | Tổng thể tích/khối lượng, lỗi ràng buộc (domain), lỗi thời, tỷ lệ đỡ, LIFO, tâm khối lượng hàng; thứ tự tính lại khi Duyệt (nhãn "tính lại ở FE") |
| Không hiện số | Tải trục ("Sẽ có sau"), trọng tâm toàn xe, so sánh với kỳ trước, số thực tế |

## 6. Nợ kỹ thuật và phần chờ backend

Danh sách đầy đủ có ID: [docs/acceptance.md mục 4](acceptance.md#4-nợ-kỹ-thuật-và-phần-chờ-backend). Quan trọng nhất:

1. **Backend (LM-002):** chốt contract `OptimizationRequest/Result`, revision và trạng thái duyệt, lưu draft, RBAC, phiên thật.
2. **Thiết bị thật:** đo FPS và thao tác chạm trên tablet kho, điện thoại tài xế; số hiện tại chỉ là SwiftShader.
3. **Màn điều phối chỉ desktop** (quyết định 16/09/2026); chi tiết chuyến chật ở 1.440 px.
4. **E2E kéo kiện vào vật cản** chưa có (logic có test ở engine) — [LM-073](issues/LM-073-e2e-keo-kien-vao-vat-can.md).
