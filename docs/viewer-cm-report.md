# Engine 3D sang cm — báo cáo (15/09/2026)

Phase 2 của [docs/issues](issues/README.md): LM-030 → LM-038, LM-056. Số đo: [benchmarks/viewer-cm-2026-09-15.json](benchmarks/viewer-cm-2026-09-15.json)
(Chromium SwiftShader, desktop giả lập 1600 × 1000 — không phải số đo thiết bị thật).

## Đã đổi gì

| Mảng | Trước | Sau |
|---|---|---|
| Nguồn dữ liệu Planner | `LOAD_PLAN` mm dựng tay | Revision đã duyệt của chuyến từ mock repository → `adaptResult` (cm), badge **MOCK RESULT** |
| Đơn vị engine | mm, `MM = 0.001` | cm, `SCENE_SCALE = 0.01` chỉ trong `scene/units.ts` |
| Hướng đặt | 3 hướng `0/1/2` | 6 mã Spec, xoay vòng qua `effectiveOrientations`, tôn trọng `keepUpright` |
| Kiểm tra editor | `validatePlacement` riêng của viewer, câu tiếng Việt cứng | Constraint engine của domain; `error` chặn, `warning` vẫn commit; câu qua `formatIssue` |
| Editor | lưới 50 mm, hút 20 mm, nudge 10/50/100 mm | lưới 5 cm, hút 2 cm (cả mặt vật cản chịu tải), nudge 1/5/10 cm, commit `roundCm` |
| Vật cản | không vẽ | 2 draw call cố định, token `--obstacle`/`--obstacle-bearing`, bấm xem thông tin, danh sách `sr-only` |
| Thứ tự dỡ, blocker | thứ tự FE tự suy, hành lang hình học | `unloadingOrder` của kết quả, `lifoIssues` của domain: che kín dừng mô phỏng, che một phần chỉ đánh dấu |
| Tải trục | số tải từ mock | "Sẽ có sau", chỉ cấu hình trục (Spec 7.10) |
| Camera giảm chuyển động | có thể không vẽ lại | `invalidate()` sau mỗi lệnh camera (LM-056) |

Kho và tài xế vẫn đọc `LoadPlan` mm tới LM-060 → LM-062; viewer của hai màn đổi sang cm đúng một lần qua `adaptLoadPlan`.

## Số đo trước / sau

Draw call lúc nghỉ (không vật cản):

| Tier | 132 | 300 | 500 | 1.000 | Trước (14/09) |
|---|---|---|---|---|---|
| low | 16 | 16 | 16 | 16 | 16 |
| balanced | 25 | 25 | 25 | 25 | 25 |
| high | 33 | 33 | 33 | 33 | 33 |

- Tam giác trùng số đo 14/09 ở mọi mẫu có sẵn (low 132/300/500/1.000: 3.428 / 7.460 / 12.260 / 24.260; balanced và high 1.000: 41.444 / 58.378).
- Vật cản: +2 draw call cho 1 hoặc 20 vật cản, +0 khi không có (E2E `viewer-obstacles.spec.ts`).
- Nghỉ: không vẽ thêm frame nào sau 1,2 giây.
- Một lần kiểm khi thả ở 1.000 kiện (đồng bộ + constraint engine) trong trình duyệt: trung vị ≈ 1 ms, p95 ≈ 2 ms, lớn nhất 6,3 ms —
  trong ngân sách 8 ms của D-29 (đồng hồ trình duyệt làm tròn ~0,1 ms). Node: p95 ≈ 2,7 ms kể cả snap.

## Rủi ro còn lại

- Chưa chụp lại bộ ảnh `docs/screenshots/scene-first/` với dữ liệu seed cm (tiêu chí ảnh của LM-031): so tỷ lệ bằng mắt vẫn còn nợ.
- Seed Planner không có vật cản; vật cản chỉ thấy trên route benchmark `?debug&obstacles=1|20`. Phase 3 (đội xe) thêm xe có hốc bánh.
- Seed không có ca LIFO; fixture benchmark cố ý đổi điểm giao của hai kiện để có đúng một ca `LIFO_BLOCKED`.
- Chưa đo React Profiler cho "không cập nhật state mỗi pointer frame" (LM-035); cơ chế preview imperative không đổi so với trước.
- `engineInput` của scene giữ tham chiếu request/result của revision (kho đã sao chép khi đọc) — không đóng băng sâu.
- Số FPS SwiftShader không phải cam kết thiết bị thật.
