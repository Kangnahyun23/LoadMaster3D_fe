# LoadMaster Frontend — Bàn giao hiện trạng

Ngày cập nhật: 20/09/2026. Repo `E:\SEP490\LoadMaster`. `main` = MVP theo Build Spec (nghiệm thu 16/09); nhánh `feat/ui-complete` = đợt 6
hoàn thiện 5 vai trò (bảo vệ SEP490). Luật code: [AGENTS.md](../AGENTS.md). Phạm vi và quyết định: [docs/prd.md](prd.md) (D-01 → D-57).
Tiến độ: [docs/progress.md](progress.md). Nghiệm thu: [docs/acceptance.md](acceptance.md) (mục 5 là đợt 6).
Rà soát giao diện trước đợt 6: [docs/ui-audit-2026-09-19.md](ui-audit-2026-09-19.md).

## 1. Kết luận

- Cả 5 vai trò có luồng đầu-cuối trên cùng một kho dữ liệu: điều phối lập kế hoạch → kho xếp theo `loadingOrder` → tài xế giao theo
  `unloadingOrder` → quản lý xem số liệu và xuất báo cáo → quản trị quản lý tài khoản và đọc nhật ký. Kịch bản một ngày làm việc có E2E
  (`e2e/workday.spec.ts`).
- **Chưa nối backend.** Kho in-memory (`src/lib/mock-db`), mất khi tải lại trang (D-41: giả lập phân quyền, không giả lập lưu bền).
  Đăng nhập, phân quyền, nhật ký đều là giả lập ở FE — server thật phải kiểm lại. Mọi kết quả tối ưu mang badge **MOCK RESULT**.
- Toàn app cm/kg, giao diện vi/en, không chuỗi tiếng Việt cứng ngoài từ điển (có test chặn).

## 2. Chạy và xem thử

```powershell
# Node >= 22, pnpm 11 (packageManager trong package.json)
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5175
```

Tài khoản demo (mật khẩu chung `loadmaster`; màn đăng nhập có nút chọn nhanh):

| Vai trò | Email | Mở ra sau đăng nhập |
|---|---|---|
| Điều phối | `dieuphoi@loadmaster.vn` | `/chuyen` |
| Quản lý | `quanly@loadmaster.vn` | `/` (bảng điều khiển) |
| Kho | `kho@loadmaster.vn` | `/kho` (chuyến cần xếp) |
| Tài xế | `taixe@loadmaster.vn` | `/tai-xe` (chuyến của tôi) |
| Quản trị | `quantri@loadmaster.vn` | `/nguoi-dung` |

Seed neo theo **hôm nay** (giờ Việt Nam): 8 xe (VEHICLE-008 bảo dưỡng), 12 người dùng, 15 chuyến trải 27 ngày trước tới 2 ngày sau.
Chuyến chính `TRIP-2026-0914` đã duyệt, chờ kho xếp, gán tài xế demo; `TRIP-010` đã xếp xong cho tài xế demo; `TRIP-011` đang xếp;
`TRIP-009` đang giao; `TRIP-012` đã tối ưu; `TRIP-013` cần xem lại; `TRIP-014` nháp; 7 chuyến hoàn thành, 1 huỷ. Thêm `?lang=en` để mở
bằng tiếng Anh.

| Màn | Đường dẫn |
|---|---|
| Bảng điều khiển (lọc kỳ, 3 biểu đồ, xuất .xlsx) | `/` (`?ky=7-ngay\|30-ngay\|thang-nay\|tuy-chon`) |
| Chuyến / chi tiết / tạo | `/chuyen`, `/chuyen/TRIP-009`, `/chuyen/moi` |
| Thiết lập tối ưu | `/chuyen/TRIP-012/toi-uu` (`?mo-phong=loi` giả lập lỗi service) |
| Planner 3D / so sánh | `/chuyen/TRIP-2026-0914/phuong-an`, `/chuyen/TRIP-2026-0914/so-sanh` |
| Đội xe / chi tiết xe | `/doi-xe`, `/doi-xe/VEHICLE-008` |
| Kho (tablet) | `/kho`, `/kho?chuyen=TRIP-011` |
| Tài xế (điện thoại) | `/tai-xe`, `/tai-xe/diem-giao?chuyen=TRIP-010` |
| Người dùng / nhật ký | `/nguoi-dung`, `/nhat-ky` |
| Hồ sơ cá nhân | `/ho-so` |
| Tìm nhanh | Ctrl+K / ⌘K ở màn có thanh điều hướng |
| Đo hiệu năng 3D | `/chuyen/TRIP-2026-0914/phuong-an?debug&packages=1000&quality=low` |
| Tài liệu UI | `/kieu-dang`, `/thanh-phan` |

Ảnh bàn giao vi/en: [docs/screenshots/handoff/](screenshots/handoff/) — chụp lại bằng `node tests/handoff-screenshots.mjs` (cần dev server).

## 3. Kiến trúc

```text
src/domain            logic thuần theo Spec: hình học cm (EPSILON), 6 hướng đặt, constraint engine (mã lỗi + tham số), metrics
src/services/optimization   interface OptimizationService; mock tất định trong Web Worker; bản giả lập sự cố
src/lib/mock-db       kho in-memory thay backend: xe (+ bảo dưỡng), chuyến (pha planning → loading → loaded → delivering → completed,
                      cancelled), revision bất biến, người dùng + mật khẩu + phiên, nhật ký sự kiện; seed neo theo ngày
src/features/auth     đăng nhập qua kho, ma trận quyền (permissions.ts), RequirePermission + màn 403, hồ sơ
src/lib/i18n          từ điển vi/en mỗi nhánh một file (vi/, en/), formatIssue, dataErrorMessage (lỗi kho), cổng chuỗi cứng
features/<màn>        <màn>-api.ts (nơi duy nhất biết kho) → hook TanStack Query → component
features/viewer3d     toàn bộ Three.js; SceneCanvas dùng chung cho Planner, kho (PositionViewer), tài xế (DriverCargoViewer)
```

Nối backend thật: thay thân hàm trong `features/*/*-api.ts`, `features/auth/auth-api.ts` và `createOptimizationService`; hook và component
giữ nguyên. Pha chuyến, khoá sửa, luật người dùng và nhật ký hiện nằm trong `src/lib/mock-db/db-*.ts` — backend phải làm lại ở server.

## 4. Kiểm thử

```powershell
pnpm lint
pnpm build
pnpm test            # Vitest: unit (node) + dom (jsdom)
pnpm test:bench      # cổng constraint engine D-29 (chạy tay; CI chưa gọi — nợ N-15)
pnpm test:e2e        # Playwright desktop/tablet/phone, tự bật Vite ở 127.0.0.1:5175 (E2E_PORT để đổi)
node tests/viewer-benchmark.mjs          # draw call / FPS theo tier (cần dev server)
node tests/handoff-screenshots.mjs       # bộ ảnh bàn giao vi/en (cần dev server)
```

E2E nên đọc trước: `workday.spec.ts` (5 vai trò đầu-cuối), `spec-flow.spec.ts` (luồng Spec §15), `rbac.spec.ts`,
`warehouse-progress.spec.ts`, `driver-delivery.spec.ts`, `manager-dashboard.spec.ts`, `admin-audit.spec.ts`. Kho in-memory: E2E đổi
người dùng bằng đăng xuất/đăng nhập trong app và đổi route phía client (`navigateInApp`), **không** tải lại trang giữa kịch bản.

Số đo hiệu năng (16/09/2026, Ryzen 7 5800H, Chromium SwiftShader — không phải thiết bị thật): constraint engine 1.000 kiện p95 30,8 ms
(ngân sách 50), một lần thả p95 1,8 ms (ngân sách 8); viewer low 16 draw call ở 132 → 1.000 kiện. Chi tiết: `docs/benchmarks/`.

## 5. Làm việc song song

Đợt 6 làm bằng agent theo nhóm màn, mỗi nhóm một git worktree (`.claude/worktrees/`, đã bỏ qua trong git); người điều phối gộp nhánh,
giải xung đột, áp đề xuất luật vào AGENTS và cập nhật tiến độ (AGENTS mục 12). Từ điển tách theo nhánh để các nhóm ít đụng nhau.

## 6. Nợ và phần chờ backend

Danh sách có ID: [docs/acceptance.md mục 4 và 5](acceptance.md). Quan trọng nhất:

1. **Backend (LM-002):** contract `OptimizationRequest/Result`, revision và duyệt, pha chuyến, người dùng/phiên thật (cookie HttpOnly),
   phân quyền ở server, nhật ký, lưu bền.
2. **Thiết bị thật:** thử màn tài xế trên điện thoại thật (D-57, chờ người dùng); màn kho chỉ thử bằng giả lập.
3. **CI chưa chạy cổng benchmark** `pnpm test:bench`.
