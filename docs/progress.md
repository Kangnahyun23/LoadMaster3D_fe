# Theo dõi tiến độ — LoadMaster FE MVP

Cập nhật lần cuối: **15/09/2026**

Tài liệu liên quan: [PRD](prd.md) · [Gói issue](issues/README.md) · [Build Spec](../LoadMaster_FE_MVP_Build_Spec.md) · [AGENTS.md](../AGENTS.md) · [handoff.md](../handoff.md)

**Cách cập nhật:** mỗi phiên làm việc thêm một mục vào *Nhật ký* (mới nhất ở trên), đổi trạng thái issue ở mục 3 và ghi ngày bắt đầu / xong theo định dạng `dd/mm/yyyy`. Sửa "Cập nhật lần cuối" ở đầu file.

Trạng thái: ⬜ Chưa bắt đầu · 🟦 Đang làm · 🟨 Chờ / bị chặn · ✅ Xong · ⛔ Huỷ

---

## 1. Tổng quan

| Phase | Nội dung | Xong / Tổng | Ước lượng | Trạng thái |
|---|---|---|---|---|
| — | Chuẩn bị: đọc repo, chốt quyết định, PRD, gói issue | 4 / 4 | — | ✅ Xong 14/09/2026 |
| 0 | Git, luật, Vitest, Playwright, CI | 3 / 6 | ~4 ngày | 🟦 Đang làm |
| 1 | Domain, constraint engine, mock service, dữ liệu mẫu, i18n nền | 4 / 19 | ~18,5 ngày | 🟦 Đang làm |
| 2 | Engine 3D sang cm, 6 hướng, vật cản, editor | 0 / 9 | ~10 ngày | ⬜ |
| 3 | Đội xe, kiện, thiết lập tối ưu, Planner, Duyệt, Dashboard | 0 / 15 | ~16,5 ngày | ⬜ |
| 4 | Kho, tài xế, dọn mock mm | 0 / 3 | ~2,5 ngày | ⬜ |
| 5 | i18n phần còn lại, nghiệm thu | 0 / 3 | ~3,5 ngày | ⬜ |
| **Tổng** | | **7 / 56 issue** | **~55,5 ngày công** | |

**Đang làm song song (15/09/2026):** LM-005 (Playwright) — agent trong git worktree riêng. LM-010 và LM-027 đã gộp.

**Làm được ngay:** LM-012, LM-013, LM-014, LM-016 (đủ phụ thuộc) · LM-055 (bug màu chữ nút, mới mở). Chờ: LM-006 (cần LM-005) · LM-028 (cần LM-014).

**Đang chặn:** không. LM-002 (contract backend) chờ nhóm backend nhưng không chặn phase 0–3.

---

## 2. Nhật ký

### 15/09/2026 — Gộp LM-027: hạ tầng i18n; mở LM-055

**Đã làm**

- Agent LM-027 xong (commit `241fa26`, `013b4d4`); xem diff rồi cherry-pick vào `feat/spec-mvp` → `e00b097`, `53a205e`.
- `@/lib/i18n`: `I18nProvider` bọc ngoài cùng, `useT` (key và tham số có kiểu, số nhiều), `useFormat`, `useLocale`; thiếu hoặc thừa key ở `en.ts` là lỗi build (TS2741 / TS2353). Ngôn ngữ: `?lang` → `sessionStorage['loadmaster.ngon-ngu']` → `vi`.
- `@/lib/format`: `createFormatter('vi-VN' | 'en-US')` cho cm, kg, cm³/m³, %, tỷ lệ, ngày, giờ; hàm cũ còn nơi gọi giữ nguyên đầu ra vi-VN.
- `LanguageSwitch` trong nav rail; dịch mẫu nav rail, trang đăng nhập, 404. `AuthError` mang mã thay câu.
- Kiểm chứng lỗi agent phát hiện: `cn()` bỏ `text-white`/`text-text` của nút khi gặp `text-body`/`text-body-lg` → mở **LM-055** (phase 0, 0,5 ngày).

**Kiểm tra trên nhánh gộp**

- `pnpm test`: 116/116 ✅ (92 + 24 mới) · `pnpm lint`: ✅ · `pnpm build`: ✅

**Vướng mắc / quyết định mới**

- Agent chốt: ngày tiếng Anh dạng `Sep 14, 2026`, giờ 24h ở cả hai ngôn ngữ; formatter là object (`format.weight`) thay tên `formatWeight`. Ghi trong issue LM-027.
- Chưa có nút chuyển ngôn ngữ trên trang đăng nhập (chỉ `?lang`), header Planner 3D (LM-070), kho và tài xế (LM-071).

### 15/09/2026 — Gộp LM-010: domain models + zod

**Đã làm**

- Agent LM-010 xong trên nhánh worktree (commit `3900fa2`); xem diff rồi cherry-pick vào `feat/spec-mvp` → `4901e6f`.
- `src/domain/models`: 10 type Spec §6 sinh từ schema, 5 schema zod, `placementToBox`/`obstacleToBox`, 34 mã lỗi `<phạm vi>.<chủ thể>.<quy tắc>`. `src/domain/fixtures/spec-samples.ts` chứa dữ liệu mẫu Spec §12.
- Test type so khớp nguyên văn Spec §6 chạy trong `tsc -b`.
- Chuyển các việc agent hoãn sang issue tương ứng: LM-002 (`null` ở trường tuỳ chọn), LM-012 (dùng chung tập hướng đứng), LM-019 (vật cản chịu tải bỏ trống `maxTopLoadKg`), LM-041 (`.omit` với schema có refinement, lỗi nhiều trường hiện muộn, `name` rỗng).

**Kiểm tra trên nhánh gộp**

- `pnpm test`: 92/92 ✅ (53 + 39 mới, 36 vòng red → green) · `pnpm lint`: ✅ · `pnpm build`: ✅

**Vướng mắc / quyết định mới**

- Agent chốt: trường ngoài hợp đồng bị bỏ khi parse; lỗi trường chặn lỗi nhiều trường (`abort`); vật cản không chịu tải khai `maxTopLoadKg > 0` bị từ chối. Ghi trong issue LM-010, cần nhóm xem lại khi chốt contract (LM-002).
- Máy thiếu RAM khi 3 agent cùng chạy Vite/Vitest; worker Vitest của agent từng crash giữa chừng, agent đã chạy lại với 1 worker để xác nhận.

### 15/09/2026 — Làm song song: LM-003 xong; LM-005, LM-010, LM-027 giao agent

**Đã làm**

- Chốt seam TDD: LM-010 test qua `@/domain/models`, lỗi zod là mã i18n; LM-027 hai seam — `@/lib/format` (unit) và `I18nProvider` qua RTL (dom).
- Giao 3 agent chạy nền, mỗi agent một worktree từ `fa7a68c`: LM-005, LM-010, LM-027. Agent không sửa file này; gộp và cập nhật tiến độ do người điều phối làm.
- LM-003 (tự làm): cập nhật AGENTS.md mục 1, 2, 3, 6, 7, 9, 12 theo PRD — đơn vị cm/kg *(đã điều chỉnh)* kèm trạng thái chuyển đổi, i18n + mã lỗi, ẩn nút chưa hoạt động *(đã điều chỉnh)*, đích tích hợp engine, mock repository + revision, quy trình kiểm thử và làm song song. CLAUDE.md chỉ còn `@AGENTS.md`.

**Kiểm tra**

- LM-003 chỉ sửa tài liệu; không chạy lại test.

**Việc tiếp theo**

- Chờ 3 agent báo cáo → kiểm tra từng nhánh → gộp → chạy lint/build/test trên nhánh gộp → cập nhật tiến độ.

### 14/09/2026 — LM-011 + LM-015: TDD helper số và geometry

**Đã làm** (nhánh `feat/spec-mvp`, theo skill TDD: một test → một cài đặt tối thiểu mỗi vòng)

- Chốt seam: test chỉ import từ `@/domain/geometry`. Chốt quy tắc làm tròn: nửa xa số 0, bù EPSILON, không trả `-0`.
- `src/domain/geometry/`: `numeric.ts` (`EPSILON`, `roundCm`, `roundKg`, `eq`, `lt`, `gt`), `box.ts` (`Box`, `volumeCm3`, `overlaps`), `boundary.ts` (`vehicleBoundaryExcess`, `VehicleInterior`), `index.ts`.
- 14 test trong `geometry.test.ts`, 11 vòng red → green + 3 test chặn hồi quy. Kiểm test chặn hồi quy bằng cách cố ý đổi `<` thành `<=` → test đỏ, rồi khôi phục.
- Chuyển phần chưa có nơi dùng: adapter `PackagePlacement`/`VehicleObstacle → Box` sang LM-010; `overlapArea2D`/`overlapVolume` sang LM-018; bọc mã `EXCEEDS_BOUNDARY` sang LM-014; `lte`/`gte` hoãn; quy ước `roundCm` tại biên + cấm so sánh trực tiếp ghi vào AGENTS ở LM-003.

**Kiểm tra**

- `pnpm test`: 53/53 ✅ (39 cũ + 14 mới) · `pnpm lint`: ✅ · `pnpm build`: ✅

**Vướng mắc / quyết định mới**

- Ba ví dụ dấu phẩy động viết trong issue gốc là sai khi kiểm bằng Node: `45.1 + 45.1 + 45.1 = 135.3`, `0.15 * 10 = 1.5`, và `100.1 + 60.3` trôi **xuống** nên không gây chồng lấn giả. Đã thay bằng ca kiểm chứng thật: `262.45 − 250 = 12.449999…`, `100.4 + 120.7 = 221.10000000000002`, `1.005 * 100 = 100.4999…`. Quy tắc từ nay: mọi ví dụ số trong test phải chạy thử bằng máy trước.
- Công thức thô Spec 7.2 báo chồng lấn giả với toạ độ trôi lên → `overlaps` so qua `lt/gt` EPSILON, vẫn giữ nghĩa chạm mặt không chồng lấn.

**Việc tiếp theo**

- LM-010 → LM-014.

### 14/09/2026 — LM-004: Vitest + React Testing Library

**Đã làm** (nhánh `feat/spec-mvp`)

- LM-004: thêm vitest 5.0.0, @testing-library/react 16.3.3, user-event 14.6.7, jest-dom 7.0.1, @testing-library/dom 10.4.1, jsdom 30.0.1.
- `vitest.config.ts` gộp `vite.config.ts`, hai project `unit` (node) và `dom` (jsdom, `*.dom.test.tsx`); setup `src/test/setup-dom.ts`.
- Script `test`, `test:watch`, `test:bench`.
- Codemod AST chuyển 4 file test cũ: 171 `assert.*` → `expect`, import sang alias `@/`.
- Bỏ đuôi `.ts` trong import của 8 file viewer3d.
- Test RTL mẫu cho `VehicleFormDialog` (form trống báo lỗi; form hợp lệ lưu và đóng).
- `handoff.md` đổi lệnh test sang `pnpm test`.

**Kiểm tra**

- `pnpm test`: 39/39 ✅ (37 cũ + 2 RTL) · `pnpm lint`: ✅ · `pnpm build`: ✅, `dist/` không chứa code test.

**Vướng mắc / quyết định mới**

- Vitest 5 và jest-dom 7 là bản major mới: đã đọc type trong `node_modules` để dùng `test.projects` (thay `environmentMatchGlobs` cũ).
- `vitest bench` thoát mã 1 khi chưa có file bench → thêm `--passWithNoTests`.
- Test RTL mẫu gắn với `VehicleFormDialog` sẽ bị gỡ ở LM-040/041; chuyển test sang form mới lúc đó.

**Việc tiếp theo**

- TDD LM-011 + LM-015.

### 14/09/2026 — LM-001: commit scene-first, tạo nhánh

**Đã làm**

- LM-001: kiểm tra trên working tree trước khi commit, rồi commit đợt scene-first lên `main` — commit `d737f93` (55 file, gồm code viewer3d, test, `AGENTS.md`, `handoff.md`, benchmark JSON, 12 ảnh, báo cáo scene-first).
- Dọn ký tự escape markdown trong `LoadMaster_FE_MVP_Build_Spec.md` (không còn `\#`, `\-`, `\~`, `\_`), bỏ khoảng trắng cuối dòng.
- Commit riêng tài liệu kế hoạch: Spec, PRD, gói issue, file tiến độ này.
- Tạo nhánh `feat/spec-mvp` từ `main` cho toàn bộ tích hợp Spec.
- Không commit `.claude/settings.json` (chỉ còn `{"enabledPlugins": {}}` sau khi cài lại plugin ở phạm vi user).

**Kiểm tra** (trước commit `d737f93`)

- `pnpm lint`: ✅ · `pnpm build`: ✅ (còn cảnh báo chunk > 500 kB, `SceneCanvas` 668 kB / 184 kB gzip, như trước) · test TypeScript: 37/37 ✅
- Chưa chạy 7 suite trình duyệt (cần Playwright ngoài repo; sẽ đưa vào repo ở LM-005).

**Quyết định mới**

- Chọn TDD cho phase 1, bắt đầu bằng LM-011 + LM-015 sau khi xong LM-004.

**Việc tiếp theo**

- LM-004 → TDD LM-011 + LM-015.

### 14/09/2026 — Phiên chuẩn bị

**Đã làm**

1. Đọc codebase và toàn bộ tài liệu: `CLAUDE.md`, `AGENTS.md`, `handoff.md`, 4 báo cáo trong `docs/`. Nắm kiến trúc engine 3D (LoadPlan bất biến → ViewerSceneModel + ViewerDraft → SceneCanvas dùng chung Planner/Kho/Tài xế).
2. Phát hiện ban đầu: `operations/OperationsToolbar.tsx` không còn nơi import; `leftOpen`/`toggleLeft` thừa; một số chỗ lệch luật AGENTS (hardcode hex, nhiều nút primary, nút không làm gì, format số tự nối chuỗi, mock import chéo feature).
3. Cài lại plugin `mattpocock-skills` ở phạm vi **user**: bản cài phạm vi project ghi đường dẫn `E:\` trong khi VS Code chạy ở `e:\`, nên plugin không nạp. `.claude/settings.json` còn lại `{"enabledPlugins": {}}`.
4. Đọc `LoadMaster_FE_MVP_Build_Spec.md`, hỏi đáp chốt **22 quyết định** (D-01 → D-22): tích hợp vào repo, chuyển toàn bộ sang cm, contract Spec + view model FE, map vào màn có sẵn, mock repo + TanStack Query, i18n vi/en tự viết, giữ editor với constraint engine, Vitest + RTL, `src/domain` + `src/services`, ẩn nút chưa hoạt động, làm theo phase.
5. Viết [docs/prd.md](prd.md).
6. Chất vấn PRD, chốt thêm **17 quyết định** (D-23 → D-39): vượt tải là cảnh báo; mustLoad chưa xếp chặn Duyệt; tự đồng bộ trường xung đột; định nghĩa LIFO che kín 100%; `roundCm` + EPSILON; mã lỗi + tham số; ngân sách hiệu năng 50 ms / 8 ms với lưới không gian; mock trong Web Worker; revision bất biến; tính lại thứ tự khi Duyệt; quy tắc ID instance; debounce xem trước xe; bảng kiện ảo hoá + panel form; ngưỡng trọng tâm 10% / 50%; So sánh revision; route mới; Playwright + GitHub Actions.
7. Sinh gói **55 issue** trong [docs/issues/](issues/README.md); kiểm tra bằng script: không thiếu phụ thuộc, không vòng lặp, không phụ thuộc phase sau. Đường găng ~26 ngày.
8. Dời hạ tầng i18n (LM-027, LM-028) lên phase 1 vì editor ở phase 2 cần từ điển thông báo lỗi.

**Chưa làm / lưu ý**

- Chưa sửa code ứng dụng. (Commit và dọn escape Spec đã làm ở mục LM-001 phía trên.)
- LM-044 cần thêm dependency `@tanstack/react-virtual`, hoặc dùng phân trang 50 dòng nếu nhóm không đồng ý.

---

## 3. Trạng thái issue

### Phase 0 — Nền tảng

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-001](issues/LM-001-commit-scene-first-tao-nhanh.md) | Commit scene-first, tạo nhánh | ✅ | 14/09/2026 | 14/09/2026 | `d737f93`, nhánh `feat/spec-mvp` |
| [LM-002](issues/LM-002-chot-contract-backend.md) | Chốt contract backend | 🟨 | 14/09/2026 | | Chờ nhóm backend, không chặn |
| [LM-003](issues/LM-003-cap-nhat-agents-claude-md.md) | Cập nhật AGENTS.md, CLAUDE.md | ✅ | 15/09/2026 | 15/09/2026 | CLAUDE.md import `@AGENTS.md` |
| [LM-004](issues/LM-004-them-vitest-rtl.md) | Vitest + RTL | ✅ | 14/09/2026 | 14/09/2026 | 39/39 test, Vitest 5.0.0 |
| [LM-005](issues/LM-005-them-playwright-test.md) | Playwright | 🟦 | 15/09/2026 | | Agent trong worktree |
| [LM-006](issues/LM-006-github-actions-ci.md) | GitHub Actions | ⬜ | | | |
| [LM-055](issues/LM-055-tailwind-merge-bo-mau-chu.md) | Bug `cn()` bỏ màu chữ nút | ⬜ | | | Mở 15/09/2026, phát hiện ở LM-027 |

### Phase 1 — Domain, service, dữ liệu, i18n nền

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-010](issues/LM-010-domain-models-schema.md) | Domain models + zod | ✅ | 15/09/2026 | 15/09/2026 | `4901e6f`, 39 test, 34 mã lỗi |
| [LM-011](issues/LM-011-numeric-roundcm-epsilon.md) | `roundCm` + EPSILON | ✅ | 14/09/2026 | 14/09/2026 | TDD 6 test; quy ước AGENTS chờ LM-003 |
| [LM-012](issues/LM-012-orientation-6-huong.md) | 6 hướng đặt | ⬜ | | | |
| [LM-013](issues/LM-013-mo-rong-quantity-instance-id.md) | Mở rộng quantity, ID | ⬜ | | | |
| [LM-014](issues/LM-014-mo-hinh-loi-ma-tham-so.md) | Mô hình lỗi | ⬜ | | | Nhận thêm bọc `EXCEEDS_BOUNDARY` |
| [LM-015](issues/LM-015-geometry-boundary-overlap-volume.md) | Biên, chồng lấn, thể tích | ✅ | 14/09/2026 | 14/09/2026 | TDD 8 test; phần diện tích giao → LM-018 |
| [LM-016](issues/LM-016-luoi-khong-gian.md) | Lưới không gian | ⬜ | | | |
| [LM-017](issues/LM-017-validation-dau-vao-xe-kien.md) | Validation đầu vào | ⬜ | | | |
| [LM-018](issues/LM-018-vat-can-va-ty-le-do-day.md) | Vật cản, tỷ lệ đỡ đáy | ⬜ | | | Nhận thêm `overlapArea2D`/`overlapVolume` |
| [LM-019](issues/LM-019-tai-xep-chong-toan-stack.md) | Truyền tải toàn stack | ⬜ | | | |
| [LM-020](issues/LM-020-kiem-tra-lifo.md) | Kiểm tra LIFO | ⬜ | | | |
| [LM-021](issues/LM-021-metrics-trong-tam.md) | Metrics, trọng tâm | ⬜ | | | |
| [LM-022](issues/LM-022-thu-tu-xep-kha-thi.md) | Thứ tự xếp khả thi | ⬜ | | | |
| [LM-023](issues/LM-023-constraint-engine-facade-benchmark.md) | Constraint engine + benchmark | ⬜ | | | |
| [LM-024](issues/LM-024-mock-optimization-service.md) | MockOptimizationService | ⬜ | | | |
| [LM-025](issues/LM-025-worker-tien-trinh-huy-loi.md) | Web Worker | ⬜ | | | |
| [LM-026](issues/LM-026-mock-repository-revision.md) | Mock repository, revision | ⬜ | | | |
| [LM-027](issues/LM-027-ha-tang-i18n.md) | Hạ tầng i18n | ✅ | 15/09/2026 | 15/09/2026 | `e00b097`, `53a205e`, 24 test |
| [LM-028](issues/LM-028-tu-dien-thong-bao-rang-buoc.md) | Thông báo ràng buộc vi/en | ⬜ | | | |

### Phase 2 — Engine 3D sang cm

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-030](issues/LM-030-view-model-scene-cm.md) | View model từ result | ⬜ | | | |
| [LM-031](issues/LM-031-engine-doi-don-vi-cm.md) | Engine sang cm | ⬜ | | | Rủi ro cao |
| [LM-032](issues/LM-032-engine-6-huong-dat.md) | 6 hướng trong engine | ⬜ | | | |
| [LM-033](issues/LM-033-ve-vat-can-3d.md) | Vẽ vật cản | ⬜ | | | |
| [LM-034](issues/LM-034-editor-do-chinh-xac-cm.md) | Editor theo cm | ⬜ | | | |
| [LM-035](issues/LM-035-editor-dung-constraint-engine.md) | Editor dùng constraint engine | ⬜ | | | |
| [LM-036](issues/LM-036-timeline-thu-tu-service-lifo.md) | Timeline, LIFO | ⬜ | | | |
| [LM-037](issues/LM-037-tai-truc-se-co-sau.md) | Tải trục "Sẽ có sau" | ⬜ | | | |
| [LM-038](issues/LM-038-e2e-3d-sang-cm-hieu-nang.md) | E2E 3D, hồi quy hiệu năng | ⬜ | | | |

### Phase 3 — Màn luồng Spec

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-040](issues/LM-040-vehicles-api-danh-sach-doi-xe.md) | Danh sách Đội xe | ⬜ | | | |
| [LM-041](issues/LM-041-trang-chi-tiet-xe-form-vat-can.md) | Chi tiết xe, vật cản | ⬜ | | | |
| [LM-042](issues/LM-042-xem-truoc-3d-xe.md) | Xem trước 3D xe | ⬜ | | | |
| [LM-043](issues/LM-043-trips-packages-api.md) | API chuyến và kiện | ⬜ | | | |
| [LM-044](issues/LM-044-bang-kien-ao-hoa-tong-hop.md) | Bảng kiện | ⬜ | | | Cần duyệt dependency mới |
| [LM-045](issues/LM-045-panel-form-kien.md) | Panel form kiện | ⬜ | | | |
| [LM-046](issues/LM-046-diem-giao-danh-so-lai.md) | Điểm giao ↔ deliveryStop | ⬜ | | | |
| [LM-047](issues/LM-047-man-thiet-lap-toi-uu.md) | Thiết lập tối ưu | ⬜ | | | |
| [LM-048](issues/LM-048-chay-job-trang-thai.md) | Chạy job, trạng thái | ⬜ | | | |
| [LM-049](issues/LM-049-planner-mock-badge-metrics-unplaced.md) | Planner hiển thị kết quả | ⬜ | | | |
| [LM-050](issues/LM-050-duyet-phuong-an-revision.md) | Duyệt phương án | ⬜ | | | |
| [LM-051](issues/LM-051-so-sanh-revision.md) | So sánh revision | ⬜ | | | |
| [LM-052](issues/LM-052-dashboard-kpi-spec.md) | Dashboard | ⬜ | | | |
| [LM-053](issues/LM-053-an-nut-chua-hoat-dong.md) | Ẩn nút chưa hoạt động | ⬜ | | | |
| [LM-054](issues/LM-054-e2e-luong-spec.md) | E2E luồng Spec | ⬜ | | | |

### Phase 4 — Kho, tài xế, dọn dẹp

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-060](issues/LM-060-kho-doc-revision-duyet.md) | Kho đọc revision duyệt | ⬜ | | | |
| [LM-061](issues/LM-061-tai-xe-doc-revision-duyet.md) | Tài xế đọc revision duyệt | ⬜ | | | |
| [LM-062](issues/LM-062-go-mock-mm-code-thua.md) | Gỡ mock mm, code thừa | ⬜ | | | |

### Phase 5 — i18n và nghiệm thu

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-070](issues/LM-070-i18n-dot-1-con-lai.md) | i18n đợt 1 phần còn lại | ⬜ | | | |
| [LM-071](issues/LM-071-i18n-dot-2.md) | i18n đợt 2 | ⬜ | | | |
| [LM-072](issues/LM-072-nghiem-thu-tai-lieu.md) | Nghiệm thu, bàn giao | ⬜ | | | |

---

## 4. Câu hỏi còn mở

| Ngày mở | Câu hỏi | Người trả lời | Trạng thái |
|---|---|---|---|
| 14/09/2026 | FE gọi thẳng FastAPI hay qua Spring Boot? Ai sở hữu contract? | Nhóm backend | 🟨 Chờ |
| 14/09/2026 | Tên điểm giao, revision, trạng thái duyệt có nằm trong contract? | Nhóm backend | 🟨 Chờ |
| 14/09/2026 | `constraintWarnings` đổi sang mã lỗi có cấu trúc? | Nhóm backend | 🟨 Chờ |
| 14/09/2026 | Ngưỡng trọng tâm 10% ngang / 50% cao có được nghiệp vụ xác nhận? | Nghiệp vụ | 🟨 Chờ |
| 14/09/2026 | Đồng ý thêm `@tanstack/react-virtual` cho bảng kiện? | Nhóm FE | 🟨 Chờ |

## 5. Mẫu mục nhật ký

```markdown
### dd/mm/yyyy — <tên phiên>

**Đã làm**
- LM-0xx: <việc đã xong> — commit `<hash>`

**Kiểm tra**
- pnpm lint: ✅ / ❌ · pnpm build: ✅ / ❌ · pnpm test: x/y · pnpm test:e2e: x/y

**Vướng mắc / quyết định mới**
- ...

**Việc tiếp theo**
- LM-0xx
```
