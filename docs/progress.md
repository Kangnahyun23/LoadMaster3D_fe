# Theo dõi tiến độ — LoadMaster FE MVP

Cập nhật lần cuối: **19/09/2026**

Tài liệu liên quan: [PRD](prd.md) · [Gói issue](issues/README.md) · [Build Spec](../LoadMaster_FE_MVP_Build_Spec.md) · [AGENTS.md](../AGENTS.md) · [handoff.md](../handoff.md)

**Cách cập nhật:** mỗi phiên làm việc thêm một mục vào *Nhật ký* (mới nhất ở trên), đổi trạng thái issue ở mục 3 và ghi ngày bắt đầu / xong theo định dạng `dd/mm/yyyy`. Sửa "Cập nhật lần cuối" ở đầu file.

Trạng thái: ⬜ Chưa bắt đầu · 🟦 Đang làm · 🟨 Chờ / bị chặn · ✅ Xong · ⛔ Huỷ

---

## 1. Tổng quan

| Phase | Nội dung | Xong / Tổng | Ước lượng | Trạng thái |
|---|---|---|---|---|
| — | Chuẩn bị: đọc repo, chốt quyết định, PRD, gói issue | 4 / 4 | — | ✅ Xong 14/09/2026 |
| 0 | Git, luật, Vitest, Playwright, CI, bug LM-055 | 6 / 7 | ~4,5 ngày | ✅ Xong 15/09/2026 — CI xanh trên GitHub; còn LM-002 chờ backend |
| 1 | Domain, constraint engine, mock service, dữ liệu mẫu, i18n nền | 19 / 19 | ~18,5 ngày | ✅ Xong 15/09/2026 — 403 test, cổng benchmark đạt |
| 2 | Engine 3D sang cm, 6 hướng, vật cản, editor, bug LM-056 | 10 / 10 | ~10,5 ngày | ✅ Xong 15/09/2026 — 427 unit, 28 E2E, draw call không đổi |
| 3 | Đội xe, kiện, thiết lập tối ưu, Planner, Duyệt, Dashboard | 15 / 15 | ~16,5 ngày | ✅ Xong 16/09/2026 — 492 unit/DOM, 45 E2E |
| 4 | Kho, tài xế, dọn mock mm | 3 / 3 | ~2,5 ngày | ✅ Xong 16/09/2026 — 515 unit/DOM, 50 E2E |
| 5 | i18n phần còn lại, nghiệm thu | 3 / 3 | ~3,5 ngày | ✅ Xong 16/09/2026 — 520 unit/DOM, 55 E2E, cổng chuỗi cứng |
| 6 | Hoàn thiện 5 vai trò (bảo vệ SEP490) | 9 / 23 | ~27,5 ngày | 🟦 Đang làm từ 19/09/2026 — nhánh `feat/ui-complete` |
| **Tổng** | | **65 / 80 issue** | **~83,5 ngày công** | |

**Phase 5 xong (16/09/2026) — MVP nghiệm thu.** 56/57 issue; LM-002 chờ backend. Nợ sau nghiệm thu: [acceptance.md mục 4](acceptance.md#4-nợ-kỹ-thuật-và-phần-chờ-backend), LM-073.

**Đợt 6 (19/09/2026):** [rà soát giao diện](ui-audit-2026-09-19.md), [PRD mục 15](prd.md#15-đợt-6--hoàn-thiện-5-vai-trò-1909-2026), issue LM-080 → LM-101 (+ LM-073).

**Đang chặn:** không. LM-002 (contract backend) chờ nhóm backend nhưng không chặn phase 1–3.

---

## 2. Nhật ký

### 19/09/2026 — Rà soát giao diện, chốt đợt 6

**Đã làm**
- Hỏi đáp chốt phạm vi: bảo vệ SEP490, thước đo 5 vai trò AGENTS mục 1, 2–4 tuần, làm hết P0/P1/P2; giả lập phân quyền, không giả lập lưu bền.
- [Báo cáo rà soát](ui-audit-2026-09-19.md): hiện trạng từng vai trò, 8 lỗi UX trên ảnh 17/09, danh sách thiếu của một web hoàn chỉnh.
- PRD mục 15 (D-40 → D-57); 22 issue LM-080 → LM-101 trong [gói issue](issues/README.md#phase-6--hoàn-thiện-5-vai-trò).
- Git: commit gói bàn giao nghiên cứu (`751fdc8`, bỏ file zip qua `.gitignore`), fast-forward `main` ← `feat/spec-mvp`, mở `feat/ui-complete`, push cả ba nhánh.

**Kiểm tra**
- Chỉ tài liệu, không đổi code.

**Việc tiếp theo**
- Đợt nền tuần tự: LM-080 → LM-085; sau đó đợt màn song song.


### 17/09/2026 — Gói bàn giao cho nhóm nghiên cứu

- Đối chiếu tài liệu rebuild với domain, service, repository/revision và core 3D hiện tại; không sửa code sản phẩm.
- Tạo [gói nghiên cứu](research-handoff-2026-09-17/README.md): prompt, hiện trạng, tài liệu nền và gallery 11 PNG chụp mới.
- Chụp dashboard, cấu hình xe, kiện, thiết lập tối ưu, Planner/view/editor/partial/stale, kho tablet và tài xế/list/3D phone bằng Chromium SwiftShader; không ghi nhận `pageerror` ở các phiên chụp.
- Nêu rõ LM-073, benchmark domain chưa nối CI, khác biệt phân trang/ảo hóa và giới hạn dữ liệu mock. Số đo hiệu năng dùng báo cáo 16/09, không đo lại.
- Kiểm tra tài liệu/ảnh; không chạy full lint/build/test vì chỉ bổ sung gói bàn giao, không đổi app. Không xác nhận lại CI từ xa.

### 16/09/2026 — Xong phase 5: i18n toàn `src/`, nghiệm thu và bàn giao (LM-070 → LM-072)

**Đã làm**
- Cổng i18n (`fa9b798`, TDD): `findHardcodedVietnamese` bỏ chú thích và lỗi lập trình viên, test quét toàn `src/`; lúc bắt đầu còn 510 dòng.
- LM-070 (agent, `38d64e0`): Planner 3D, chuyến, component chung, App — 218 dòng → 0; module thuần trả mã (snap, đo khoảng cách, `describeWhere`), `StopLabel` thay `stopLabel()`; sửa tràn chữ en; E2E `i18n-en` ở 1.440/1.024/390 px.
- LM-071 (agent, `2ff95f3`): kho, người dùng, trang tài liệu, `types/user` — 292 dòng → 0; nút ngôn ngữ 56 px ở kho và tài xế, đổi giữa phiên giữ bước/điểm giao. Gộp xung đột `DataSection`, `CardTableLegendSection`, danh sách `PENDING` với LM-070 bằng tay.
- LM-072: [acceptance.md](acceptance.md) đối chiếu Spec §15 + PRD §12; benchmark cuối; 18 ảnh vi/en (`tests/handoff-screenshots.mjs`); viết lại `handoff.md`; PRD và AGENTS cập nhật; mở LM-073 cho E2E chồng vật cản.

**Kiểm tra**
- pnpm lint: ✅ · pnpm build: ✅ · pnpm test: 520/520 · pnpm test:bench: ✅ (1.000 kiện p95 30,8 ms) · pnpm test:e2e cục bộ: 54/55 và 54/55 ở hai lượt, mỗi lượt đỏ một test khác nhau không tái hiện khi chạy riêng (`warehouse` desktop "addEventListener" 16/16 xanh khi lặp; `ERR_NO_BUFFER_SPACE` là hết socket máy) — chờ CI.

**Vướng mắc / quyết định mới**
- Spec §15 dòng 12 (chồng vật cản) chỉ có test ở seam engine → LM-073.
- `DriverStopPage.dom.test.tsx` đỏ một lần khi chạy cả bộ Vitest, xanh 3/3 khi chạy riêng — theo dõi.

**Việc tiếp theo**
- Báo cáo phase 5 và bàn giao.

### 16/09/2026 — Xong phase 4: kho và tài xế đọc revision đã duyệt, gỡ mock mm (LM-060 → LM-062)

**Đã làm**
- Người dùng chốt: màn điều phối tạm thời chỉ desktop (nút 40 px); luật 56 px áp cho kho, tài xế, Planner — ghi AGENTS mục 5 (`a0e0336`).
- LM-060 (agent, `3bc6795`): `/kho` đọc revision đã duyệt mới nhất (`?chuyen=`, không có thì chuyến đầu tiên có bản duyệt), bước theo `loadingOrder`, khoảng cách cm theo locale, 6 hướng đặt, vật cản gần; trạng thái rỗng, cảnh báo lỗi thời. Gộp có xung đột AGENTS mục 6/7 với LM-061, đã hợp nhất tay.
- LM-061 (agent, `93275bc`): màn tài xế đọc revision đã duyệt, danh sách kiện theo `unloadingOrder`, chuyển điểm giao trong phiên, LIFO domain trong mô phỏng; gỡ `driver.mock.ts`, huy hiệu "chờ đồng bộ", nút gọi không có số.
- LM-062 (`66cd09c`): gỡ `load-plan.mock`, `types/load-plan`, `lib/placement`, `adaptLoadPlan`, `createBenchmarkPlan`, `OperationsToolbar`, `formatDimensions` mm; kiểu viewer sang `viewer3d/viewer-types.ts`.

**Kiểm tra**
- pnpm lint: ✅ · pnpm build: ✅ · pnpm test: 515/515 · pnpm test:e2e: 50/50

**Vướng mắc / quyết định mới**
- Kích thước JS cả phase +6,9 kB (+0,3%) vì màn kho/tài xế mới và từ điển; riêng LM-062 −4,2 kB. Tiêu chí "không tăng" của LM-062 chưa đạt theo nghĩa đen.
- `/kho` bỏ fixture `?debug&packages=N`: hiệu năng 3D ở kho chỉ còn đo trên 132 kiện seed (Planner và tài xế vẫn đo 1.000 kiện).
- Chuỗi cũ của màn kho ("Xác nhận đã xếp", toast bỏ qua) chưa qua từ điển → LM-071.

**Việc tiếp theo**
- Báo cáo phase 4, chờ xác nhận phase 5 (LM-070 → LM-072).

### 16/09/2026 — Xong phase 3: màn luồng Spec (LM-040 → LM-054)

**Đã làm**
- Trips (LM-043 → LM-046, `9e4c54a`): chi tiết chuyến, bảng kiện, panel form kiện, điểm giao ↔ `deliveryStop` đọc/ghi kho mock.
- Dashboard (LM-052, agent, `45abf2f`): số từ kho; gỡ biểu đồ và "so với kỳ trước" không có nguồn (AGENTS mục 6 "Không bịa số").
- Đội xe (LM-040/041, `d7f4d52`): agent bị dừng giữa chừng → commit WIP, người điều phối gộp và sửa.
- Thiết lập tối ưu + chạy job (LM-047/048, `07f0b8f`): request thật, nhóm lỗi đầu vào có link, Worker, huỷ, lỗi service, kết quả một phần.
- Planner + Duyệt (LM-049/050, `b953f61`): header metrics, tab Chỉ số, danh sách Đã xếp có lọc, lọc lý do chưa xếp, chi tiết kiện có tỷ lệ đỡ + ràng buộc; Duyệt qua constraint engine theo draft, banner lỗi thời.
- So sánh revision (LM-051, agent, `90f458c`): thẻ từ revision thật; `?revision=` nay nhận **mã revision** (bản duyệt dùng chung `jobId` với bản nguồn nên mở theo job luôn ra bản duyệt).
- Xem trước 3D xe (LM-042, agent, `3224adf`).
- LM-053 (agent `031f9f5` + `23964cc`, `d15f273`): gỡ nút Cài đặt, "Ghi nhận sai lệch", tab đáy tài xế, `pending-feature.ts`; danh sách chuyến và form tạo/sửa chuyến ghi thật vào kho (trước đó báo thành công giả).
- LM-054 (agent, `84f5ead`): `e2e/spec-flow.spec.ts` 7 test, 6 kịch bản; agent dừng trước khi commit → người điều phối commit, sửa lỗi kiểu, chạy lại. Hai bug tìm được: nút Tối ưu kẹt tắt sau khi sửa dữ liệu; form kiện hiện mã lỗi zod thô.

**Kiểm tra**
- pnpm lint: ✅ · pnpm build: ✅ · pnpm test: 492/492 · pnpm test:e2e: 45/45 (desktop, tablet, phone)

**Vướng mắc / quyết định mới**
- Nút primary các màn dispatcher vẫn 40 px trên tablet → người dùng chốt 16/09/2026: màn điều phối tạm thời chỉ desktop (AGENTS mục 5).
- Màn kho và tài xế vẫn đọc mock mm, chưa đọc revision đã duyệt (phase 4: LM-060 → LM-062).

**Việc tiếp theo**
- Báo cáo phase 3, chờ xác nhận phase 4.

### 15/09/2026 — Xong phase 2: engine 3D sang cm (LM-030 → LM-038, LM-056)

**Đã làm**
- LM-030, LM-031, LM-037 (tự làm) — `f02a540`: Planner đọc revision đã duyệt qua `viewer-api` + Query → `adaptResult` (cm, bất biến, MOCK RESULT); toàn engine/editor/operations sang cm, `SCENE_SCALE = 0.01`; fixture benchmark theo contract Spec; tải trục "Sẽ có sau". Kho/tài xế giữ `LoadPlan` mm qua `adaptLoadPlan` tới LM-060.
- LM-056 (agent) — review, cherry-pick sạch → `b12303b`: `CameraRig` `invalidate()` sau mỗi lệnh camera.
- LM-032, LM-034, LM-035 (tự làm, TDD) — `de12ef7`: `editor-engine` bọc constraint engine của domain (`sync` theo placement hiệu lực, `check` = `evaluateMove`); lỗi chặn, cảnh báo vẫn commit; 6 hướng; snap 5/2 cm + mặt vật cản chịu tải. Test mới bắt được chồng lấn giả thật trong `overlaps` của editor (`100,4 + 120,7`) → so qua `lt`.
- LM-033 (agent, worktree) — review, cherry-pick sạch → `5fbc6ba`: vật cản 2 draw call, hatch vùng dành riêng bằng attribute, bấm xem thông tin, legend + `sr-only`, `?debug&obstacles=0|1|20`.
- LM-036 (agent, worktree) — review, cherry-pick có xung đột (`ViewerPage`, `benchmark.mock`, `SelectedPackagePanel`, từ điển vi/en: gộp cả hai phía; giữ `minSupportRatio 0,8` của LM-035 cùng hoán đổi điểm giao của LM-036) → `66dc2e4`: thứ tự dỡ theo `unloadingOrder`, blocker từ `lifoIssues`, fallback thứ tự suy ra cho `LoadPlan` cũ (tài xế).
- LM-038: spec `viewer-benchmark-cm`, số đo `docs/benchmarks/viewer-cm-2026-09-15.json`, báo cáo `docs/viewer-cm-report.md`.

**Kiểm tra**
- pnpm lint: ✅ · pnpm build: ✅ · pnpm test: 427/427 · pnpm test:e2e: 26/26 + spec benchmark 1/1 · CI phase 1 (`e6a60cd`): ✅
- Draw call 16/25/33 ở 132 → 1.000 kiện, trùng 14/09; vật cản +2; kiểm khi thả 1.000 kiện p95 ≈ 2 ms (trình duyệt).

**Vướng mắc / quyết định mới**
- `ScenePlacement` giữ `position {x,y,z}` + `lengthCm…` thay vì tên trường contract (`xCm`, `placedLengthCm`): editor duyệt theo trục; chỉ nằm trong `viewer3d`.
- Chế độ màu "Theo đơn hàng" → "Theo kiện gốc" (contract không có đơn hàng); bỏ badge bao bì ở panel kiện.
- Blocker hẹp hơn trước: chỉ kiện giao sau nằm hẳn sau mặt sau (D-26); hoạt ảnh dỡ vẫn mờ tại chỗ khi có hộp bất kỳ trên hành lang.
- Còn nợ: ảnh so tỷ lệ `docs/screenshots/scene-first/` (LM-031); seed Planner chưa có vật cản và ca LIFO; đo React Profiler (LM-035).

**Trả nợ sau báo cáo (người dùng hỏi "còn nợ không làm được hả")**
- Ảnh so tỷ lệ: bộ `docs/screenshots/viewer-cm/` (`E2E_SCREENSHOT_DIR`), cùng tỷ lệ và góc với `scene-first/`.
- Seed HD210 thêm hai hốc bánh không chịu tải; mock vẫn xếp 132/132, revision duyệt không issue.
- LM-035: E2E `viewer-editor-renders` đếm React commit bằng hook DevTools giả — 31–34 commit/60 lần di chuyển (nhịp 100 ms); đỏ khi bỏ throttle (68).
- Seed không có ca LIFO là đúng (phương án hợp lệ); ca LIFO ở fixture benchmark.
- Kiểm tra: lint ✅ · build ✅ · test 427/427 · E2E 27 pass + 1 flaky do mình xoá thư mục worktree giữa lúc chạy làm dev server tải lại trang (chạy lại riêng: xanh). Không thao tác file lớn trong repo khi E2E đang chạy.
- Dọn worktree agent.

**Việc tiếp theo**
- Push, chờ CI; chờ người dùng xác nhận trước phase 3.


### 15/09/2026 — Xong phase 1: LM-017 → LM-026, LM-028 (domain, engine + cổng benchmark, mock service, worker, mock repository)

**Đã làm**

- LM-016: chạy benchmark khi máy rảnh (`1b0a8af`) — một lần thả editor **0,47 ms** (p99 0,81); xếp kín 1.000 kiện, 2.000 truy vấn **35,1 ms** (quét cặp 129,9 ms). Chưa đạt ước lượng < 5 ms của issue; ngân sách thật đo ở LM-023, tối ưu đầu tiên nếu cần là thêm trục Z vào khoá ô.
- LM-021 theo TDD (seam `@/domain/metrics`, 9 vòng, 15 test): `computeMetrics` (thể tích không trừ vật cản, phần trăm nhân trước rồi chia, thiếu khối lượng là `throw`), trọng tâm có trọng số (không kiện → vắng trường), `COG_THRESHOLDS` + `checkCenterOfGravity` → `COG_LATERAL` / `COG_HIGH` với `params` qua `roundCm`. Mọi số thực trong test đã kiểm bằng Node.
- LM-017 và LM-018 giao 2 agent chạy song song trong worktree riêng từ `1b0a8af`.
- LM-028 theo TDD (seam `@/lib/i18n`, `@/lib/format`; 6 vòng): `formatIssue` cho đủ 22 mã × vi/en, `switch` vét cạn bằng `never`; 8 câu Spec §13 tái tạo đúng từng chữ; snapshot 31 câu × 2 ngôn ngữ đã đọc duyệt; `Formatter` thêm `widthByHeight`, `list`. Bảng Spec §13 gom về `src/test/spec-13.ts`. `issueField` dời sang LM-041. Thêm luật câu thông báo vào AGENTS.md mục 6.
- LM-018 (agent, TDD 19 test): review code và test, cherry-pick sạch → `31b378e`. `overlapArea2D`/`overlapVolume`, `obstacleIssues`, `createPlacementLayout` (Map + lưới dựng một lần), `supportRatio` (hợp diện tích mặt đỡ, không tính trùng, chặn ở 1), `supportIssues`. Đo tham khảo: `supportIssues` × 1.000 kiện 18,9 ms, gần hết nằm ở `queryBelow` của lưới. Sau gộp: test support dùng chung issue PKG-008 với bảng Spec §13 (`SPEC_13_PKG_008_LOW_SUPPORT`).
- LM-017 (agent, TDD 33 test): review, cherry-pick → `dfe2d5f` (xung đột barrel `constraints/index.ts`). `validateVehicle`, `validatePackages`, `checkDoorClearance`, `checkPayload`, `validateRequest` (sắp error → blockApproval → warning). Khi gộp: đổi tên hàm nội bộ trùng tên `obstacleIssues` → `vehicleObstacleIssues`; `formatIssue` khớp dạng issue thật (nhãn theo đoạn cuối `field` dạng react-hook-form, "0 kg" cho `maxPayloadKg`, chủ ngữ dòng vật cản từ `relatedIds[0]`) — bắt được nhờ test mới chạy validator thật rồi dịch mọi issue (đỏ trước khi sửa). Quy ước chủ thể ghi vào JSDoc `ConstraintIssue`.
- LM-020 giao agent (worktree từ `8dc7418`).
- LM-019 theo TDD (seam `@/domain/constraints`, 12 vòng, 14 test + 2 test dịch câu): `createStackGraph` truyền tải toàn stack theo diện tích tiếp xúc (D-18, ghi rõ là ước tính), vật cản chịu tải nhận phần tải của nó; `stackIssues` (`maxTopLoadKg = 0` là không chịu tải, gồm ca HIGH; `stackable = false` chỉ báo `NOT_STACKABLE`; số tầng theo nhánh dài nhất; vật cản chịu tải bỏ trống giới hạn = không giới hạn, chủ thể ở `relatedIds[0]`); `movePlacement` + `recomputeColumn` tính lại cục bộ — bằng dựng lại toàn bộ sau mỗi lần trong 200 lần dời ngẫu nhiên tất định, test đỏ dưới 2 đột biến. Đo tham khảo 1.000 thùng: dựng đồ thị 17,6 ms, dời một kiện + tính lại p95 0,107 ms. Helper test chung `src/test/placements.ts`.
- LM-022 theo TDD (6 test, chỉ cần đồ thị đỡ LM-019 nên làm song song LM-020): `loadingOrderIssues` (kiện đỡ xếp sau hoặc cùng lượt → cảnh báo), `recomputeOrders` sắp xếp topo có ưu tiên cho cả xếp và dỡ, cờ `recomputedOnFrontend`. Bộ dựng tay bản đầu trùng thứ tự ưu tiên nên không bắt được lỗi bỏ ràng buộc đỡ (lộ ra khi thử đột biến) → thêm cặp ngược ưu tiên. Thuộc tính trên 50 phương án ngẫu nhiên; ca biên chạm mặt. Đo 1.000 kiện: 26,7 ms → 5,1 ms sau khi đổi sang đếm kiện chặn.
- LM-020 (agent, TDD 13 test): review, cherry-pick → `42d97ae` (xung đột barrel). `lifoIssues` trên `PlacementLayout` + `queryRearCorridor`, `coveredArea`/`Rect` lên `@/domain/geometry` (tỷ lệ đỡ LM-018 dùng chung, test LM-018 không đổi). Sửa khi gộp: thiếu điểm giao → `throw` thay vì bỏ qua (bỏ qua giấu vi phạm khỏi bước chặn Duyệt; thống nhất với LM-019/021/022). Agent đo `lifoIssues` × 1.000 ≈ 71–76 ms, gần hết ở `candidates()` của lưới sắp trước khi lọc (lọc trước ≈ 34–38 ms) → xử lý ở LM-023. Thay `potentialBlockers` của viewer dời sang LM-036 (engine 3D còn mm).
- `applyPose`/`PlacementPose`/`PlacementPatch` (`e7c9a2a`) dùng chung cho engine, Duyệt và editor; giao **LM-026 phần 1** (store, revision bất biến, `approveRevision`, seed) cho agent từ commit này — revision seed đã duyệt và `supportRatio`/`constraintWarnings` khi Duyệt chờ LM-023/LM-024.
- **LM-023** theo TDD (11 test + cổng bench): `createConstraintEngine` (`evaluateAll`, `evaluateMove`, `commitMove`, `placements`), `approvalBlockers`. Mã mới `ORIENTATION_NOT_ALLOWED` (23 mã; PRD coi hướng ngoài `effectiveOrientations` là lỗi). Tỷ lệ đỡ dùng cạnh đồ thị đỡ. 500 lần commit ngẫu nhiên = dựng lại (đỏ dưới 3 đột biến; bản đầu có assert rỗng với `Set` và bộ sinh không tạo chồng lấn — đã sửa). Cổng benchmark lần đầu **đỏ thật**: dựng + kiểm 1.000 kiện p95 93,5 ms > 50 ms → lưới lọc trước khi sắp + ô 3 chiều → **32,8 ms**; `evaluateMove` p95 1,9 ms, `commitMove` 1,5 ms (`docs/benchmarks/constraint-engine-2026-09-15.json`). `tsconfig.bench.json` cho file bench cần kiểu Node. Chưa đưa cổng vào CI (runner dao động).
- **LM-024** theo TDD (13 test + property 500 request + bench): `OptimizationService`, `runMockOptimization` thuần tất định, `MockOptimizationService`. Xếp kệ vách/cột/chồng với luật xếp chồng khớp engine (chỉ chồng khi đáy nằm gọn trong kiện đỉnh cột); thứ tự LM-022, `supportRatio`/`constraintWarnings` từ engine LM-023, metrics LM-021. `FAILED` chỉ khi sai schema hoặc lỗi toàn cục (contract không có `warnings`); lỗi riêng kiện → `reasonCode`; `message` = `reasonCode`. Mẫu Spec khớp vị trí/metrics/thứ tự tính tay; property: không placement sai, đủ instance, chạy lại giống hệt (đỏ dưới 2 đột biến); 5 test lý do/FAILED đỏ dưới 3 đột biến. 1.000 instance: xếp đủ, 83,3% thể tích, trung bình 49 ms.
- **LM-025** theo TDD (9 test, worker giả + fake timers): `WorkerOptimizationService` (message có kiểu, tiến trình, huỷ, hết giờ → `TIME_LIMIT_EXCEEDED`, độ trễ tối thiểu 600 ms, luôn `terminate`), `UnavailableOptimizationService` (`SERVICE_UNAVAILABLE`, D-12), `createOptimizationService` (Worker / luồng gọi / lỗi). Đột biến "bỏ terminate khi huỷ" ban đầu lọt → sửa test. Kiểm trên Chromium thật: Worker thật, 1.000 kiện, 601 ms, không long task trên main thread. Phần cuộn/bấm khi đang tối ưu cần UI → LM-048.
- LM-026 phần 1 (agent, TDD 28 test): review, cherry-pick sạch → `2050a7b`. Kho in-memory (xe, chuyến, revision bất biến `REV-NNN`, `isStale` theo nội dung, `approveRevision` tạo bản mới, lỗi có mã), seed 4 xe + chuyến 132 kiện. Người điều phối làm nốt phần hoãn: Duyệt tính lại `supportRatio`/`constraintWarnings` qua `annotatePlacements` (dùng chung với mock service); seed `REV-001` (mock, seed cố định) + `REV-002` đã duyệt.
- **Lỗi thật khi seed:** bản "đã duyệt" đầu tiên có 67 `LIFO_BLOCKED` nên không qua chính `approvalBlockers` — mock đặt chỗ theo `priority` trước điểm giao. Sửa LM-024: `priority` chỉ chọn kiện lên xe (dành tải trọng trước), `enforceLifo` thì đặt chỗ theo điểm giao muộn trước. Seed giờ 132/132 kiện, không issue, duyệt được; test seed khoá lại (đỏ khi bỏ thứ tự LIFO). AGENTS.md cập nhật service và `lib/mock-db`.

**Kiểm tra**

- Sau LM-021: `pnpm lint` ✅ · `pnpm build` ✅ · Vitest **182/182** ✅.
- Sau LM-028: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **244/244** ✅.
- Sau gộp LM-018: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **263/263** ✅.
- Sau gộp LM-017: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **298/298** ✅.
- Sau LM-019: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **314/314** ✅.
- Sau LM-022: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **320/320** ✅.
- Sau gộp LM-020: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **333/333** ✅.
- Sau LM-023: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **347/347** ✅ · `pnpm test:bench` ✅ (cổng ngân sách đạt).
- Sau LM-024: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **360/360** ✅ · bench mock ✅.
- Sau LM-025: `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **369/369** ✅.
- **Cuối phase 1:** `pnpm lint` ✅ · `pnpm build` ✅ · `CI=1` Vitest **403/403** ✅ (51 file) · `pnpm test:bench` **7/7** ✅ (cổng engine và mock đạt).

**Việc tiếp theo**

- Báo cáo phase 1 cho người dùng; chờ xác nhận trước khi sang phase 2 (LM-030 → LM-038, LM-056).
- Còn mở: đưa cổng benchmark vào CI (runner dao động); E2E cuộn/bấm khi đang tối ưu (LM-048); push nhánh để CI chạy lượt phase 1.

### 15/09/2026 — Xong nốt phase 0 (CI thật); phase 1: gộp LM-013, hoàn tất LM-014

**Đã làm**

- Người dùng đồng ý làm tiếp việc dở phase 0. Push `feat/spec-mvp` lên `origin` (lần đầu). CI run `34949580777`: **5/5 job xanh** (E2E 8 phút 16 giây trên Linux).
- Kiểm tra CI báo đúng job: nhánh tạm `feat/ci-verify-red` với một kỳ vọng sai trong `src/lib/utils.test.ts` → run `34950525027` **chỉ Unit đỏ**, Lint/Typecheck/Build xanh, E2E huỷ chủ động; xoá nhánh tạm trên remote và worktree tạm. (Nhánh `ci/...` không kích hoạt CI vì workflow chỉ nghe `main`, `feat/**`.)
- Chốt seam phase 1 theo module: `@/domain/constraints` (LM-017/018/019/020/022/023), `@/domain/metrics` (LM-021), `@/services/optimization` (LM-024/025), `@/lib/mock-db` (LM-026), `@/lib/i18n` (LM-028).
- LM-013 (agent đã làm gần xong trước khi dừng): xem code, commit trong worktree, cherry-pick → `e4cad8c`. `expandPackages`, `nextPackageId`, 16 test.
- LM-014: chép phần agent làm dở (boundary, contract warnings, bảng Spec §13) sang nhánh chính và làm tiếp theo TDD — danh mục đủ 22 mã với kiểu tham số theo từng mã (test kiểu đỏ khi mới 8 mã → xanh); thay kiểu lỗi tạm của LM-013 bằng `ConstraintIssue<'DUPLICATE_INSTANCE_ID'>` (test kiểu đỏ → xanh).
- Dọn toàn bộ worktree agent cũ.

**Kiểm tra**

- `pnpm lint` ✅ · `pnpm build` ✅ · Vitest **167/167** ✅.

**Việc tiếp theo**

- LM-017, LM-018 (agent song song, tối đa 2), LM-021, LM-028 (tự làm); chạy benchmark LM-016 khi máy rảnh.

### 15/09/2026 — Hoàn tất phase 0: LM-005, LM-006; sửa E2E đỏ ngẫu nhiên do Tailwind; mở LM-056

**Đã làm**

- Ba agent LM-005, LM-013, LM-014 bị dừng vì hết giới hạn phiên. Kiểm tra worktree: LM-005 gần xong (23/23 E2E trên nền cũ, thiếu lượt CI); LM-013 gần xong; LM-014 một phần. Giữ nguyên LM-013/014 cho phase 1.
- LM-005: commit phần việc trong worktree (bỏ file chẩn đoán `e2e/zz-login-stress.spec.ts`), cherry-pick vào `feat/spec-mvp` → `6c4287a`. `@playwright/test` 1.61.1, 6 spec / 23 test (desktop 15, tablet 3, phone 5), fixture đăng nhập, `waitCameraSettled`, `tsconfig.e2e.json`, script `test:e2e`, xoá 7 file `.mjs`.
- Lượt `CI=1 pnpm test:e2e` đầu trên nhánh gộp: **22/23**, `viewer-operations-ui` đỏ cả lần thử lại. Chẩn đoán theo skill diagnosing-bugs: không tái hiện khi chạy riêng (1/1, 8/8), chạy chuỗi, xoá cache Vite, đốt CPU 16/16 luồng; tái hiện **2/2** khi sửa `AGENTS.md` giữa lúc chạy; script nghe điều hướng cho thấy trang tải lại toàn phần ~40 ms sau khi sửa, và **không** tải lại khi tắt plugin Tailwind.
- Nguyên nhân: `@import 'tailwindcss'` quét cả gốc repo (`AGENTS.md`, `docs/`, `design/`, `.claude/worktrees/`) và bắt trình duyệt tải lại khi file ngoài app đổi. Sửa: `@import 'tailwindcss' source('.')` (chỉ `src/`); CSS 50.583 → 48.144 byte, 10 class bị bỏ đều không được `src/` dùng. Thêm `.claude/worktrees/` vào `.gitignore`. Sau sửa: cùng vòng phản hồi xanh 2/2; quy tắc ghi vào AGENTS.md mục 4.
- LM-006: `.github/workflows/ci.yml` — `lint`, `typecheck` (`tsc -b`), `unit`, `build` (upload `dist`), `e2e` (cài Chromium kèm deps, upload report khi lỗi). Chưa chạy thật: cần push.
- Mở **LM-056** (phase 2): `CameraRig` không `invalidate` sau lệnh camera không transition khi bật giảm chuyển động → đổi góc nhìn có thể không hiện (agent LM-005 đo được).
- AGENTS.md mục 9: cách chạy E2E, `E2E_PORT`, chờ camera vẽ xong, API bench Vitest 5.

**Kiểm tra trên nhánh gộp (sau sửa Tailwind)**

- `pnpm lint` ✅ · `pnpm build` ✅ · Vitest **142/142** ✅ · `CI=1 pnpm test:e2e` **23/23** ✅ (5,5 phút, không lần thử lại nào).

**Vướng mắc / quyết định mới**

- Không có seam test tự động đúng cho lỗi tải lại trang (cần dev server đang chạy và sửa file trong repo lúc test) — bằng chứng là vòng phản hồi, ghi trong issue LM-005.
- Benchmark LM-016 vẫn chưa chạy (để máy rảnh ở phase 1).

**Việc tiếp theo**

- Người dùng: đồng ý push `feat/spec-mvp` để CI chạy lần đầu (LM-006).
- Phase 1: gộp LM-013 (worktree), hoàn tất LM-014, rồi LM-017, LM-018, LM-019, LM-020, LM-021, LM-022, LM-023, LM-024, LM-025, LM-026, LM-028; chạy benchmark LM-016.

### 15/09/2026 — LM-016 xong (tự làm); gộp LM-012

**Đã làm**

- LM-016 (TDD, seam `@/domain/geometry`): `createSpatialGrid` lưới X–Y 50 cm với `queryAabb`, `queryBelow`, `queryAbove` (tiếp xúc trong `CONTACT_TOLERANCE_CM = 0,2`), `queryRearCorridor`, `excludeId`, `update`, `remove`. 8 vòng red → green, trong đó bắt được lỗi thật: thứ tự kết quả trùng sau `remove` rồi thêm (dùng `order.size`) → bộ đếm chỉ tăng. Test đối chiếu lưới 50 cm với lưới một ô trên 1.000 hộp tất định, trước/sau 200 lần dời; đã chứng minh đỏ khi đăng ký thiếu ô. Commit `f26fb1b`.
- Sửa ngay trong lúc làm: bản đầu `candidates` còn duyệt toàn bộ hộp mỗi truy vấn (O(N), mất tác dụng lưới) → chỉ sắp ứng viên.
- Vitest 5 đổi API benchmark: `bench` lấy từ context của `test` (`bench.compare`, `.run()`), không còn `import { bench } from 'vitest'` → viết `spatial-grid.bench.ts` theo API mới. **Chưa chạy benchmark** để không tranh CPU với E2E của LM-005; số đo bổ sung sau.
- Gộp LM-012 (agent, `5986319` → `32012e5`): `ORIENTATION_CODES`, `orientDimensions`, `UPRIGHT_ORIENTATIONS`/`isUpright`, `effectiveOrientations`, `nextOrientation`, `matchesOrientation`; schema LM-010 dựng từ `ORIENTATION_CODES` và dùng `isUpright`. Giải xung đột barrel `geometry/index.ts` với LM-016.
- Hai test nặng (`viewer-foundation` benchmark 1.000, test đối chiếu lưới) timeout 5 s khi máy tải nặng với 3 agent → đặt timeout 30 s. Chạy lại không tải: xanh.
- AGENTS.md mục 3: `geometry/` thêm "6 hướng đặt, lưới không gian".

**Kiểm tra trên nhánh gộp**

- Vitest: 142/142 ✅ (chạy `--maxWorkers=2`) · `tsc -b`: ✅ · `oxlint`: ✅. `pnpm build` đầy đủ chạy lại khi gộp đợt sau.

**Vướng mắc / quyết định mới**

- LM-012: xoay từ hướng không được phép → về hướng cho phép đầu tiên có kích thước khác. Mã `ORIENTATION_MISMATCH` chờ LM-014/LM-023.
- `queryRearCorridor` bỏ tham số vị trí cửa (không cần vì mọi hộp nằm trong thùng).

### 15/09/2026 — LM-055 xong; giao LM-012, LM-013, LM-014

**Đã làm**

- Chốt seam TDD: LM-012 qua `@/domain/geometry`; LM-013 module mới `@/domain/cargo`; LM-014 module mới `@/domain/constraints`; LM-055 qua `cn()` (unit) + `Button` (RTL).
- Giao 3 agent (worktree từ `99f6f99`, Vitest tối đa 2 worker, không dev server) cho LM-012, LM-013, LM-014. LM-013 dùng đúng tên trường `ConstraintIssue` của LM-014 để gộp không phải đổi tên.
- LM-055 (tự làm, TDD): `lib/utils.ts` khai báo 7 token cỡ chữ `@theme` cho tailwind-merge → nút primary/danger giữ `text-white`, secondary/ghost giữ `text-text`. 1 vòng red → green + 4 test chặn (đã chứng minh đỏ khi bỏ token). Thêm quy tắc vào AGENTS.md mục 4; bỏ chú thích né lỗi trong `LanguageSwitch`.
- Dọn 2 worktree đã gộp (LM-010, LM-027), giữ nhánh.

**Kiểm tra**

- `pnpm test`: 121/121 ✅ · `pnpm lint`: ✅ · `pnpm build`: ✅

**Việc tiếp theo**

- Chờ 4 agent; gộp lần lượt, sau đó LM-016, LM-017, LM-021, LM-028, LM-006.

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
| [LM-005](issues/LM-005-them-playwright-test.md) | Playwright | ✅ | 15/09/2026 | 15/09/2026 | `6c4287a`, 23/23 E2E (CI mode); sửa Tailwind `source('.')` |
| [LM-006](issues/LM-006-github-actions-ci.md) | GitHub Actions | ✅ | 15/09/2026 | 15/09/2026 | Run 34949580777 xanh 5/5; job đỏ đúng chỗ đã kiểm |
| [LM-055](issues/LM-055-tailwind-merge-bo-mau-chu.md) | Bug `cn()` bỏ màu chữ nút | ✅ | 15/09/2026 | 15/09/2026 | TDD, 5 test; `/thanh-phan` chờ E2E |

### Phase 1 — Domain, service, dữ liệu, i18n nền

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-010](issues/LM-010-domain-models-schema.md) | Domain models + zod | ✅ | 15/09/2026 | 15/09/2026 | `4901e6f`, 39 test, 34 mã lỗi |
| [LM-011](issues/LM-011-numeric-roundcm-epsilon.md) | `roundCm` + EPSILON | ✅ | 14/09/2026 | 14/09/2026 | TDD 6 test; quy ước AGENTS chờ LM-003 |
| [LM-012](issues/LM-012-orientation-6-huong.md) | 6 hướng đặt | ✅ | 15/09/2026 | 15/09/2026 | `32012e5`, 12 test; mã mismatch → LM-014/023 |
| [LM-013](issues/LM-013-mo-rong-quantity-instance-id.md) | Mở rộng quantity, ID | ✅ | 15/09/2026 | 15/09/2026 | `e4cad8c`, 16 test |
| [LM-014](issues/LM-014-mo-hinh-loi-ma-tham-so.md) | Mô hình lỗi | ✅ | 15/09/2026 | 15/09/2026 | 22 mã, test kiểu; hoàn tất sau khi agent dừng |
| [LM-015](issues/LM-015-geometry-boundary-overlap-volume.md) | Biên, chồng lấn, thể tích | ✅ | 14/09/2026 | 14/09/2026 | TDD 8 test; phần diện tích giao → LM-018 |
| [LM-016](issues/LM-016-luoi-khong-gian.md) | Lưới không gian | ✅ | 15/09/2026 | 15/09/2026 | `f26fb1b`, 9 test; benchmark `1b0a8af`: thả 0,47 ms, xếp kín 35,1 ms |
| [LM-017](issues/LM-017-validation-dau-vao-xe-kien.md) | Validation đầu vào | ✅ | 15/09/2026 | 15/09/2026 | Agent, `dfe2d5f`, 33 test; `field` dạng react-hook-form |
| [LM-018](issues/LM-018-vat-can-va-ty-le-do-day.md) | Vật cản, tỷ lệ đỡ đáy | ✅ | 15/09/2026 | 15/09/2026 | Agent, `31b378e`, 19 test; `PlacementLayout` dùng lại cho LM-019/023 |
| [LM-019](issues/LM-019-tai-xep-chong-toan-stack.md) | Truyền tải toàn stack | ✅ | 15/09/2026 | 15/09/2026 | TDD 14 test; tính lại cục bộ = toàn bộ trên 200 lần dời |
| [LM-020](issues/LM-020-kiem-tra-lifo.md) | Kiểm tra LIFO | ✅ | 15/09/2026 | 15/09/2026 | Agent, `42d97ae`, 13 test; thiếu điểm giao → throw |
| [LM-021](issues/LM-021-metrics-trong-tam.md) | Metrics, trọng tâm | ✅ | 15/09/2026 | 15/09/2026 | TDD 15 test; thể tích không trừ vật cản |
| [LM-022](issues/LM-022-thu-tu-xep-kha-thi.md) | Thứ tự xếp khả thi | ✅ | 15/09/2026 | 15/09/2026 | TDD 6 test; `recomputeOrders` 5,1 ms / 1.000 kiện |
| [LM-023](issues/LM-023-constraint-engine-facade-benchmark.md) | Constraint engine + benchmark | ✅ | 15/09/2026 | 15/09/2026 | TDD 11 test; p95 32,8 ms / 1,9 ms / 1,5 ms; lưới 3 chiều |
| [LM-024](issues/LM-024-mock-optimization-service.md) | MockOptimizationService | ✅ | 15/09/2026 | 15/09/2026 | TDD 13 test + property 500; 1.000 instance 49 ms |
| [LM-025](issues/LM-025-worker-tien-trinh-huy-loi.md) | Web Worker | ✅ | 15/09/2026 | 15/09/2026 | TDD 9 test; Chromium thật không long task; E2E UI → LM-048 |
| [LM-026](issues/LM-026-mock-repository-revision.md) | Mock repository, revision | ✅ | 15/09/2026 | 15/09/2026 | Agent `2050a7b` + seed đã duyệt; 29 test |
| [LM-027](issues/LM-027-ha-tang-i18n.md) | Hạ tầng i18n | ✅ | 15/09/2026 | 15/09/2026 | `e00b097`, `53a205e`, 24 test |
| [LM-028](issues/LM-028-tu-dien-thong-bao-rang-buoc.md) | Thông báo ràng buộc vi/en | ✅ | 15/09/2026 | 15/09/2026 | TDD 59 test, 22 mã × vi/en; `issueField` → LM-041 |

### Phase 2 — Engine 3D sang cm

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-030](issues/LM-030-view-model-scene-cm.md) | View model từ result | ✅ | 15/09/2026 | 15/09/2026 | f02a540 |
| [LM-031](issues/LM-031-engine-doi-don-vi-cm.md) | Engine sang cm | ✅ | 15/09/2026 | 15/09/2026 | f02a540 · ảnh viewer-cm/ |
| [LM-032](issues/LM-032-engine-6-huong-dat.md) | 6 hướng trong engine | ✅ | 15/09/2026 | 15/09/2026 | de12ef7 |
| [LM-033](issues/LM-033-ve-vat-can-3d.md) | Vẽ vật cản | ✅ | 15/09/2026 | 15/09/2026 | 5fbc6ba (agent) |
| [LM-034](issues/LM-034-editor-do-chinh-xac-cm.md) | Editor theo cm | ✅ | 15/09/2026 | 15/09/2026 | de12ef7 · sửa chồng lấn giả do số thực |
| [LM-035](issues/LM-035-editor-dung-constraint-engine.md) | Editor dùng constraint engine | ✅ | 15/09/2026 | 15/09/2026 | de12ef7 · p95 kiểm khi thả ≈ 2 ms |
| [LM-036](issues/LM-036-timeline-thu-tu-service-lifo.md) | Timeline, LIFO | ✅ | 15/09/2026 | 15/09/2026 | 66dc2e4 (agent) |
| [LM-037](issues/LM-037-tai-truc-se-co-sau.md) | Tải trục "Sẽ có sau" | ✅ | 15/09/2026 | 15/09/2026 | f02a540 |
| [LM-038](issues/LM-038-e2e-3d-sang-cm-hieu-nang.md) | E2E 3D, hồi quy hiệu năng | ✅ | 15/09/2026 | 15/09/2026 | báo cáo viewer-cm-report.md |
| [LM-056](issues/LM-056-camera-giam-chuyen-dong-khong-ve-lai.md) | Bug camera khi giảm chuyển động | ✅ | 15/09/2026 | 15/09/2026 | b12303b (agent) |

### Phase 3 — Màn luồng Spec

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-040](issues/LM-040-vehicles-api-danh-sach-doi-xe.md) | Danh sách Đội xe | ✅ | 16/09/2026 | 16/09/2026 | d7f4d52 (agent, người điều phối hoàn tất) |
| [LM-041](issues/LM-041-trang-chi-tiet-xe-form-vat-can.md) | Chi tiết xe, vật cản | ✅ | 16/09/2026 | 16/09/2026 | d7f4d52 |
| [LM-042](issues/LM-042-xem-truoc-3d-xe.md) | Xem trước 3D xe | ✅ | 16/09/2026 | 16/09/2026 | 3224adf (agent) |
| [LM-043](issues/LM-043-trips-packages-api.md) | API chuyến và kiện | ✅ | 16/09/2026 | 16/09/2026 | 9e4c54a |
| [LM-044](issues/LM-044-bang-kien-ao-hoa-tong-hop.md) | Bảng kiện | ✅ | 16/09/2026 | 16/09/2026 | 9e4c54a — phân trang 50 dòng, không thêm react-virtual |
| [LM-045](issues/LM-045-panel-form-kien.md) | Panel form kiện | ✅ | 16/09/2026 | 16/09/2026 | 9e4c54a |
| [LM-046](issues/LM-046-diem-giao-danh-so-lai.md) | Điểm giao ↔ deliveryStop | ✅ | 16/09/2026 | 16/09/2026 | 9e4c54a |
| [LM-047](issues/LM-047-man-thiet-lap-toi-uu.md) | Thiết lập tối ưu | ✅ | 16/09/2026 | 16/09/2026 | 07f0b8f |
| [LM-048](issues/LM-048-chay-job-trang-thai.md) | Chạy job, trạng thái | ✅ | 16/09/2026 | 16/09/2026 | 07f0b8f — không hỏi bỏ draft (draft không qua trang) |
| [LM-049](issues/LM-049-planner-mock-badge-metrics-unplaced.md) | Planner hiển thị kết quả | ✅ | 16/09/2026 | 16/09/2026 | b953f61 |
| [LM-050](issues/LM-050-duyet-phuong-an-revision.md) | Duyệt phương án | ✅ | 16/09/2026 | 16/09/2026 | b953f61 — nút Duyệt ở header vẫn bấm được để đọc lý do chặn |
| [LM-051](issues/LM-051-so-sanh-revision.md) | So sánh revision | ✅ | 16/09/2026 | 16/09/2026 | 90f458c (agent); `?revision=` nhận mã revision |
| [LM-052](issues/LM-052-dashboard-kpi-spec.md) | Dashboard | ✅ | 16/09/2026 | 16/09/2026 | 45abf2f (agent) — gỡ biểu đồ bịa số |
| [LM-053](issues/LM-053-an-nut-chua-hoat-dong.md) | Ẩn nút chưa hoạt động | ✅ | 16/09/2026 | 16/09/2026 | 031f9f5 (agent) + 23964cc danh sách/form chuyến đọc kho |
| [LM-054](issues/LM-054-e2e-luong-spec.md) | E2E luồng Spec | ✅ | 16/09/2026 | 16/09/2026 | 84f5ead (agent) — sửa 2 bug; nút primary dispatcher trên tablet còn 40 px |

### Phase 4 — Kho, tài xế, dọn dẹp

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-060](issues/LM-060-kho-doc-revision-duyet.md) | Kho đọc revision duyệt | ✅ | 16/09/2026 | 16/09/2026 | 3bc6795 (agent) — kho không còn `?debug&packages=N` |
| [LM-061](issues/LM-061-tai-xe-doc-revision-duyet.md) | Tài xế đọc revision duyệt | ✅ | 16/09/2026 | 16/09/2026 | 93275bc (agent) — gỡ nút gọi (chuyến không có số điện thoại) |
| [LM-062](issues/LM-062-go-mock-mm-code-thua.md) | Gỡ mock mm, code thừa | ✅ | 16/09/2026 | 16/09/2026 | 66cd09c — JS −4,2 kB; cả phase +6,9 kB do màn mới |

### Phase 5 — i18n và nghiệm thu

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-070](issues/LM-070-i18n-dot-1-con-lai.md) | i18n đợt 1 phần còn lại | ✅ | 16/09/2026 | 16/09/2026 | 38d64e0 (agent) — 218 dòng → 0; E2E `i18n-en` |
| [LM-071](issues/LM-071-i18n-dot-2.md) | i18n đợt 2 | ✅ | 16/09/2026 | 16/09/2026 | 2ff95f3 (agent) — 292 dòng → 0; nút ngôn ngữ ở kho/tài xế |
| [LM-072](issues/LM-072-nghiem-thu-tai-lieu.md) | Nghiệm thu, bàn giao | ✅ | 16/09/2026 | 16/09/2026 | acceptance.md, handoff.md, benchmark + ảnh vi/en; mở LM-073 |

### Phase 6 — Hoàn thiện 5 vai trò

| ID | Việc | Trạng thái | Bắt đầu | Xong | Ghi chú |
|---|---|---|---|---|---|
| [LM-080](issues/LM-080-tach-tu-dien-theo-nhanh.md) | Tách từ điển theo nhánh | ✅ | 19/09/2026 | 19/09/2026 | 18 nhánh, JSON trước/sau giống hệt |
| [LM-081](issues/LM-081-vong-doi-chuyen-kho-mock.md) | Vòng đời chuyến trong kho | ✅ | 19/09/2026 | 19/09/2026 | 6 pha, khoá sửa, 26 mã lỗi vi/en |
| [LM-082](issues/LM-082-nguoi-dung-phien-nhat-ky.md) | Người dùng, phiên, nhật ký | ✅ | 19/09/2026 | 19/09/2026 | Đăng nhập qua kho, 28 mã nhật ký |
| [LM-083](issues/LM-083-seed-mo-rong-theo-ngay.md) | Seed mở rộng | ✅ | 19/09/2026 | 19/09/2026 | 8 xe, 12 người, 15 chuyến; dựng 0,31 s |
| [LM-084](issues/LM-084-phan-quyen-mock-403.md) | Phân quyền, 403 | ✅ | 19/09/2026 | 19/09/2026 | 13 quyền, 403, quản lý chỉ đọc; E2E 10/10 |
| [LM-085](issues/LM-085-bang-du-lieu-loc-sap-xep-phan-trang.md) | Bảng lọc/sắp xếp/phân trang | ✅ | 19/09/2026 | 19/09/2026 | Agent, `f0d2e87`; +23 test; sửa vòng focus toàn app |
| [LM-086](issues/LM-086-kho-chon-chuyen-tien-do.md) | Kho | ✅ | 19/09/2026 | 19/09/2026 | Agent, `197818d`; danh sách + tiến độ bền trong phiên |
| [LM-087](issues/LM-087-tai-xe-chuyen-cua-toi-tong-ket.md) | Tài xế | ✅ | 19/09/2026 | 19/09/2026 | Agent, `0184351`; chuyến của tôi, sự cố, tổng kết; E2E 30/30 |
| [LM-088](issues/LM-088-chuyen-trang-thai-loc-tien-trinh.md) | Chuyến | ⬜ | | | |
| [LM-089](issues/LM-089-doi-xe-trang-thai-bao-duong.md) | Đội xe | ⬜ | | | |
| [LM-090](issues/LM-090-dashboard-bieu-do-xuat-xlsx.md) | Dashboard | ⬜ | | | |
| [LM-091](issues/LM-091-nhat-ky-he-thong.md) | Nhật ký | ⬜ | | | |
| [LM-092](issues/LM-092-nguoi-dung-quan-tri-day-du.md) | Người dùng | ⬜ | | | |
| [LM-093](issues/LM-093-nhap-kien-csv-xlsx.md) | Nhập kiện CSV/.xlsx | ⬜ | | | |
| [LM-094](issues/LM-094-planner-gon.md) | Planner gọn | ⬜ | | | |
| [LM-095](issues/LM-095-bo-cuc-1366-het-cat-chu.md) | Bố cục 1.366 px | ⬜ | | | |
| [LM-096](issues/LM-096-ho-so-doi-mat-khau.md) | Hồ sơ | ⬜ | | | |
| [LM-097](issues/LM-097-so-do-tuyen-svg.md) | Sơ đồ tuyến | ⬜ | | | |
| [LM-098](issues/LM-098-chuong-thong-bao.md) | Thông báo | ⬜ | | | |
| [LM-099](issues/LM-099-tim-kiem-toan-cuc.md) | Ctrl+K | ⬜ | | | |
| [LM-100](issues/LM-100-hoan-thien-nho.md) | Hoàn thiện nhỏ | ⬜ | | | |
| [LM-073](issues/LM-073-e2e-keo-kien-vao-vat-can.md) | E2E kéo kiện vào vật cản | ✅ | 19/09/2026 | 19/09/2026 | Spec §15 dòng 12 đủ E2E |
| [LM-101](issues/LM-101-nghiem-thu-dot-6.md) | Nghiệm thu đợt 6 | ⬜ | | | |

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
