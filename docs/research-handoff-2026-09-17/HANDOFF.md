# LoadMaster — bàn giao nghiên cứu frontend

Ngày chuẩn bị: **17/09/2026**. Baseline: `feat/spec-mvp` tại `b1fa061c9676d8688538b1e6b20be1e225cef393`.

Đây là bản bổ sung cho `handoff.md` ở gốc repo, phục vụ chuyển giao nghiên cứu. Không thay đổi code sản phẩm và không đánh dấu lại các issue đã nghiệm thu.

## 1. Gói bàn giao

- `PROMPT.md`: nội dung có thể gửi nguyên văn cho nhóm/AI nghiên cứu.
- `GALLERY.md` và `images/`: ảnh giao diện chụp mới từ ứng dụng chạy local, không phải mockup hoặc ảnh AI.
- `reference/`: bản sao tài liệu nền từ baseline, dùng khi người nhận chưa có repo.
- Repo là nguồn cần thiết để kiểm tra sâu code và chạy lại test; gói này không chứa toàn bộ source/dependencies.

## 2. Hiện trạng chức năng

| Mảng | Đã có trong code | Giới hạn |
|---|---|---|
| Đội xe | Form cm/kg, cửa, clearance, vật cản, preview 3D | Dữ liệu in-memory |
| Chuyến và kiện | CRUD, quantity, hướng đặt, ràng buộc stack, điểm giao, tổng hợp | Bảng phân trang 50 dòng; chưa import CSV/Excel |
| Tối ưu | Interface service, mock tất định, Worker, progress, hủy, lỗi, partial result | Không phải optimizer thật; badge MOCK RESULT |
| Planner | Inspect, màu, slice, camera, editor, validation, undo/redo, loading/unloading, LIFO, CoM | Draft theo phiên; chưa có vật lý động |
| Duyệt | Bản approved mới, metrics và thứ tự tính lại; chặn lỗi, mustLoad chưa xếp, stale | Chưa lưu server |
| Kho | Bản đã duyệt, loadingOrder, hướng/vị trí kiện, current/next | Tiến độ theo phiên; chưa đo bản kho mới với 1.000 kiện |
| Tài xế | Bản đã duyệt, điểm giao, danh sách dỡ, mở 3D theo nhu cầu | Không GPS/offline/backend sync |
| Chung | vi/en, lazy routes, typed schemas, test unit/DOM/E2E | Auth mock, chưa RBAC; Admin còn state cục bộ |

## 3. Bản đồ kỹ thuật

```text
Form + schema → feature API → mock-db / OptimizationService (Worker)
                                  ↓
                         immutable revision
                                  ↓
                       adaptResult / SceneModel
                                  + ViewerDraft (Planner)
                                  ↓
                       effective placements
                                  ↓
              SceneCanvas dùng chung + UI theo vai trò

Domain constraint engine → kiểm editor, tính đỡ/tải/LIFO, kiểm Duyệt
```

Điểm vào nên đọc: `src/app/App.tsx`, `src/domain/models`, `src/domain/constraints/engine.ts`,
`src/services/optimization`, `src/lib/mock-db/{mock-db,revisions}.ts`,
`src/features/viewer3d/{scene-input,viewer-draft,viewer-api}.ts`,
`src/features/viewer3d/editor/editor-engine.ts`, `src/features/viewer3d/scene/SceneCanvas.tsx`,
`src/features/warehouse/warehouse-api.ts`, `src/features/driver/driver-api.ts`.

Đơn vị nghiệp vụ cm/kg; domain Z là chiều cao, Three Y là chiều cao. Chỉ đổi scale tại `viewer3d/scene/units.ts`.
Six orientations áp lên kích thước danh nghĩa; snapshot + draft không mutate nguồn. Pin chỉ là state editor, không phải field trong contract placement đã duyệt.

## 4. Bằng chứng và giới hạn kiểm chứng

Đợt này đã đọc tài liệu và đối chiếu code các luồng cốt lõi. Việc chụp ảnh kiểm tra khả năng mở và hiển thị các màn được chụp;
không thay cho full regression. Không chạy lại full lint/build/Vitest/E2E và không đo benchmark mới.

Theo báo cáo nghiệm thu 16/09: 520 unit/DOM tests; suite E2E 55 tests. Handoff/LM-072 ghi CI xanh;
progress ghi hai lượt local 54/55, lỗi khác nhau (`addEventListener`, `ERR_NO_BUFFER_SPACE`), chạy riêng không tái hiện.
Đây là bằng chứng lịch sử, chưa xác nhận lại CI từ xa.

Số đo đã lưu ngày 16/09, Ryzen 7 5800H; viewer Chromium SwiftShader, desktop giả lập 1600 × 1000:

| Đo | Kết quả |
|---|---|
| Engine dựng + evaluateAll 1.000 kiện | p95 30,775 ms |
| evaluateMove / commitMove 1.000 kiện | p95 1,781 / 1,471 ms |
| Viewer low 132 / 300 / 500 / 1.000 | 16 draw calls; 60 / 60 / 60 / 42 FPS |
| Viewer balanced / high 1.000 | 25 / 33 draw calls; 14 / 8 FPS |

Không suy ra FPS thiết bị thật từ SwiftShader. Draw call thấp không có nghĩa mọi tier đạt 60 FPS.
Nguồn JSON được kèm trong `reference/docs/benchmarks/`.

## 5. Những điểm cần tiếp tục nghiên cứu

1. LM-073: bổ sung E2E editor chồng vật cản, kiểm feedback, không commit vị trí và không thêm history.
2. CI hiện chưa chạy `test:bench`; cần quyết định đưa cổng ngân sách vào workflow và xử lý độ nhiễu runner.
3. Giữ tài liệu khớp thực tế: phân trang thay ảo hóa; dispatcher desktop-only; ngày/header tiến độ còn cũ.
4. Kiểm tra và cải thiện bố cục chi tiết chuyến ở 1.440 px, độ rõ thao tác editor/timeline và mô phỏng trên cảm ứng.
5. Đo thiết bị thật trước khi nâng chất lượng xe, vật liệu, hiệu ứng hoặc animation mặc định.
6. Chốt backend contract, revision approval, lưu draft, tiến độ kho/tài xế, auth/RBAC; schema optional hiện không nhận null.
7. Tải trục, trọng tâm toàn xe, insertion path và optimizer thật vẫn ngoài phạm vi FE hiện tại.

Các ngưỡng CoM FE (lệch ngang 10% chiều rộng, cao 50% chiều cao) cần nghiệp vụ xác nhận.
LIFO và tải truyền qua stack là mô hình kiểm tra FE, không chứng nhận an toàn vận hành thực tế.

## 6. Chạy lại

Node ≥22, pnpm ≥11 (repo khóa pnpm 11.2.2).

```powershell
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5175 --strictPort
# Khi cần xác nhận code, không bắt buộc chỉ để đọc tài liệu:
pnpm lint
pnpm build
pnpm test
pnpm test:bench
pnpm test:e2e
```

Tài khoản demo local: `dieuphoi@loadmaster.vn` / `loadmaster` (mock seed, không phải credential production).
Route và điều kiện tạo từng ảnh nằm trong `GALLERY.md`. Có thể dùng `?lang=en` để nghiên cứu bản tiếng Anh.
