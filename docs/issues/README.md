# Gói issue — LoadMaster FE MVP (tích hợp Build Spec)

Nguồn: [docs/prd.md](../prd.md) (quyết định D-01 → D-39) và [LoadMaster_FE_MVP_Build_Spec.md](../../LoadMaster_FE_MVP_Build_Spec.md).
Tiến độ và nhật ký theo ngày: [docs/progress.md](../progress.md).
Cập nhật 14/09/2026. 55 issue, ước lượng tổng **~55 ngày công** cho một người; làm song song theo các luồng ở mục 3 thì rút ngắn được đáng kể.

## 1. Quy ước

Mỗi issue là một file `LM-0xx-ten-ngan.md` với frontmatter:

| Trường | Ý nghĩa |
|---|---|
| `id` | Mã issue, dùng trong commit và tên nhánh (`feat/LM-023-constraint-engine`) |
| `phase` | 0–5, theo PRD mục 11 |
| `labels` | Nhóm việc: `domain`, `viewer3d`, `performance`, `i18n`, `e2e`… |
| `depends_on` | Issue phải xong trước; đã kiểm tra không vòng lặp, không phụ thuộc phase sau |
| `estimate` | Ngày công ước lượng (0,5–2 ngày) |
| `prd` / `spec` | Quyết định PRD và mục Spec liên quan |

**Definition of Done cho mọi issue:**

- [ ] Đạt hết "Tiêu chí nghiệm thu" trong file.
- [ ] `pnpm lint`, `pnpm build`, `pnpm test` xanh (và `pnpm test:e2e` với issue có UI).
- [ ] Theo AGENTS.md: không `any`, file ≤ 250 dòng, token từ `index.css`, chuỗi UI qua từ điển i18n (từ LM-027 trở đi), số format theo locale.
- [ ] Không còn nút bấm không làm gì (D-20).
- [ ] Commit Conventional Commits có mã issue, ví dụ `feat(domain): stack load transfer (LM-019)`.

## 2. Danh sách theo phase

### Phase 0 — Nền tảng (~4 ngày)

| ID | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| [LM-001](LM-001-commit-scene-first-tao-nhanh.md) | Commit scene-first lên main, tạo nhánh `feat/spec-mvp` | 0,5d | — |
| [LM-002](LM-002-chot-contract-backend.md) | Chốt contract với backend *(theo dõi, không chặn)* | — | — |
| [LM-003](LM-003-cap-nhat-agents-claude-md.md) | Cập nhật AGENTS.md và CLAUDE.md | 0,5d | 001 |
| [LM-004](LM-004-them-vitest-rtl.md) | Vitest + RTL, chuyển 37 test | 1d | 001 |
| [LM-005](LM-005-them-playwright-test.md) | `@playwright/test`, chuyển suite trình duyệt | 1,5d | 001 |
| [LM-006](LM-006-github-actions-ci.md) | GitHub Actions CI | 0,5d | 004, 005 |
| [LM-055](LM-055-tailwind-merge-bo-mau-chu.md) | Bug: `cn()` bỏ màu chữ nút khi gặp cỡ chữ token *(mở 15/09/2026)* | 0,5d | 004 |

### Phase 1 — Domain, service, dữ liệu, i18n nền (~18,5 ngày)

| ID | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| [LM-010](LM-010-domain-models-schema.md) | Domain models + zod schema | 1d | 004 |
| [LM-011](LM-011-numeric-roundcm-epsilon.md) | `roundCm` + so sánh EPSILON | 0,5d | 004 |
| [LM-012](LM-012-orientation-6-huong.md) | 6 hướng đặt, `keepUpright` | 0,5d | 010 |
| [LM-013](LM-013-mo-rong-quantity-instance-id.md) | Mở rộng quantity, ID instance | 0,5d | 010 |
| [LM-014](LM-014-mo-hinh-loi-ma-tham-so.md) | Mô hình lỗi mã + tham số | 0,5d | 010 |
| [LM-015](LM-015-geometry-boundary-overlap-volume.md) | Biên, chồng lấn, thể tích | 0,5d | 011, 014 |
| [LM-016](LM-016-luoi-khong-gian.md) | Lưới không gian X–Y | 1d | 015 |
| [LM-017](LM-017-validation-dau-vao-xe-kien.md) | Validation xe, kiện, tải, cửa | 1d | 012, 013, 015 |
| [LM-018](LM-018-vat-can-va-ty-le-do-day.md) | Vật cản, tỷ lệ đỡ đáy | 1d | 016 |
| [LM-019](LM-019-tai-xep-chong-toan-stack.md) | Truyền tải toàn stack | 1,5d | 018 |
| [LM-020](LM-020-kiem-tra-lifo.md) | Kiểm tra LIFO | 1d | 018 |
| [LM-021](LM-021-metrics-trong-tam.md) | Metrics, trọng tâm | 0,5d | 012, 015 |
| [LM-022](LM-022-thu-tu-xep-kha-thi.md) | Thứ tự xếp khả thi, tính lại | 1d | 019, 020 |
| [LM-023](LM-023-constraint-engine-facade-benchmark.md) | Constraint engine + benchmark CI | 1,5d | 016–022 |
| [LM-024](LM-024-mock-optimization-service.md) | `MockOptimizationService` | 2d | 013, 017, 021–023 |
| [LM-025](LM-025-worker-tien-trinh-huy-loi.md) | Web Worker, tiến trình, huỷ, lỗi giả lập | 1d | 024 |
| [LM-026](LM-026-mock-repository-revision.md) | Mock repository, revision, seed | 1,5d | 010, 024 |
| [LM-027](LM-027-ha-tang-i18n.md) | Hạ tầng i18n, nút chuyển, format locale | 1,5d | 004 |
| [LM-028](LM-028-tu-dien-thong-bao-rang-buoc.md) | Thông báo ràng buộc vi/en | 0,5d | 014, 027 |

### Phase 2 — Engine 3D sang cm (~10 ngày)

| ID | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| [LM-030](LM-030-view-model-scene-cm.md) | View model từ `OptimizationResult` | 1,5d | 024, 026 |
| [LM-031](LM-031-engine-doi-don-vi-cm.md) | Engine đổi đơn vị sang cm | 1,5d | 030 |
| [LM-032](LM-032-engine-6-huong-dat.md) | 6 hướng trong engine và editor | 1d | 012, 031 |
| [LM-033](LM-033-ve-vat-can-3d.md) | Vẽ vật cản, draw call cố định | 1d | 031 |
| [LM-034](LM-034-editor-do-chinh-xac-cm.md) | Editor theo cm | 1d | 011, 031 |
| [LM-035](LM-035-editor-dung-constraint-engine.md) | Editor chạy constraint engine | 1,5d | 023, 028, 032, 034 |
| [LM-036](LM-036-timeline-thu-tu-service-lifo.md) | Timeline theo thứ tự service, LIFO | 1d | 020, 030 |
| [LM-037](LM-037-tai-truc-se-co-sau.md) | Tải trục "Sẽ có sau" | 0,5d | 030 |
| [LM-038](LM-038-e2e-3d-sang-cm-hieu-nang.md) | E2E 3D sang cm, hồi quy hiệu năng | 1d | 005, 031–037 |
| [LM-056](LM-056-camera-giam-chuyen-dong-khong-ve-lai.md) | Bug: camera không vẽ lại khi giảm chuyển động *(mở 15/09/2026)* | 0,5d | 005 |

### Phase 3 — Màn luồng Spec (~16,5 ngày)

| ID | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| [LM-040](LM-040-vehicles-api-danh-sach-doi-xe.md) | Danh sách Đội xe qua Query | 1d | 026, 027 |
| [LM-041](LM-041-trang-chi-tiet-xe-form-vat-can.md) | Trang chi tiết xe, vật cản | 2d | 017, 028, 040 |
| [LM-042](LM-042-xem-truoc-3d-xe.md) | Xem trước 3D xe | 1d | 033, 041 |
| [LM-043](LM-043-trips-packages-api.md) | API chuyến và kiện | 0,5d | 026 |
| [LM-044](LM-044-bang-kien-ao-hoa-tong-hop.md) | Bảng kiện ảo hoá, tổng hợp | 1d | 017, 028, 043 |
| [LM-045](LM-045-panel-form-kien.md) | Panel form kiện | 1,5d | 012, 044 |
| [LM-046](LM-046-diem-giao-danh-so-lai.md) | Điểm giao ↔ `deliveryStop` | 0,5d | 043 |
| [LM-047](LM-047-man-thiet-lap-toi-uu.md) | Màn Thiết lập tối ưu | 1,5d | 017, 028, 041, 044 |
| [LM-048](LM-048-chay-job-trang-thai.md) | Chạy job và các trạng thái | 1d | 025, 047 |
| [LM-049](LM-049-planner-mock-badge-metrics-unplaced.md) | Planner: MOCK RESULT, metrics, chưa xếp | 1,5d | 030, 036, 037, 048 |
| [LM-050](LM-050-duyet-phuong-an-revision.md) | Duyệt phương án, revision approved | 1,5d | 022, 026, 035, 049 |
| [LM-051](LM-051-so-sanh-revision.md) | So sánh revision | 1d | 026, 049 |
| [LM-052](LM-052-dashboard-kpi-spec.md) | Dashboard KPI Spec | 1d | 026, 040 |
| [LM-053](LM-053-an-nut-chua-hoat-dong.md) | Ẩn nút chưa hoạt động | 0,5d | 003 |
| [LM-054](LM-054-e2e-luong-spec.md) | E2E luồng Spec | 1d | 042, 045, 046, 048, 050–053 |

### Phase 4 — Kho, tài xế, dọn dẹp (~2,5 ngày)

| ID | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| [LM-060](LM-060-kho-doc-revision-duyet.md) | Kho đọc revision đã duyệt | 1d | 030, 050 |
| [LM-061](LM-061-tai-xe-doc-revision-duyet.md) | Tài xế đọc revision đã duyệt | 1d | 030, 036, 050 |
| [LM-062](LM-062-go-mock-mm-code-thua.md) | Gỡ mock mm và code thừa | 0,5d | 049, 051, 060, 061 |

### Phase 5 — i18n và nghiệm thu (~3,5 ngày)

| ID | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| [LM-070](LM-070-i18n-dot-1-con-lai.md) | i18n đợt 1 phần còn lại | 1,5d | 054 |
| [LM-071](LM-071-i18n-dot-2.md) | i18n đợt 2 | 1,5d | 060, 061, 070 |
| [LM-072](LM-072-nghiem-thu-tai-lieu.md) | Nghiệm thu và bàn giao | 0,5d | 062, 071 |
| [LM-073](LM-073-e2e-keo-kien-vao-vat-can.md) | E2E kéo kiện vào vật cản (nợ sau nghiệm thu) | 0,5d | 035, 072 |

## 3. Đường găng và luồng song song

**Đường găng** (chuỗi phụ thuộc có tổng ước lượng dài nhất, ~26 ngày; trễ issue nào trên chuỗi là trễ cả dự án):

```text
LM-001 → LM-004 → LM-010 → LM-014 → LM-015 → LM-016 → LM-018 → LM-019 → LM-022 → LM-023
       → LM-024 → LM-026 → LM-040 → LM-041 → LM-047 → LM-048 → LM-049 → LM-050
       → LM-054 → LM-070 → LM-071 → LM-072
```

Chuỗi engine 3D (LM-030 → LM-031 → LM-032 → LM-035 → LM-050) chạy song song và hội tụ ở LM-050; nó ngắn hơn đường găng nhưng rủi ro kỹ thuật cao hơn, nên bắt đầu ngay khi LM-026 xong.

**Luồng làm song song được** (khi có 2–3 người):

| Luồng | Issue | Bắt đầu được sau |
|---|---|---|
| A — Công cụ | LM-003, LM-005, LM-006, LM-053 | LM-001 |
| B — Domain lõi | LM-010 → LM-023 | LM-004 |
| C — i18n nền | LM-027, LM-028 | LM-004 (LM-028 cần LM-014) |
| D — Service & dữ liệu | LM-024 → LM-026 | LM-023 |
| E — Engine 3D | LM-030 → LM-038 | LM-026 |
| F — Màn Đội xe | LM-040 → LM-042 | LM-026, LM-027 (LM-042 cần LM-033) |
| G — Màn Chuyến | LM-043 → LM-048 | LM-026 |

## 4. Issue theo chủ đề

**Hiệu năng:** LM-016 (lưới không gian), LM-019 (tính lại cục bộ), LM-023 (ngân sách 50 ms / 8 ms làm cổng CI), LM-025 (Web Worker), LM-033 (vật cản draw call cố định), LM-035 (engine tăng dần trong editor), LM-038 (hồi quy draw call), LM-042 (debounce xem trước), LM-044 (ảo hoá bảng).

**Rủi ro kỹ thuật đã có issue chặn:**

| Rủi ro | Issue |
|---|---|
| Nhầm hệ số 10 khi đổi mm → cm | LM-031, LM-038, LM-062 |
| Sai số số thực làm chạm mặt thành chồng lấn | LM-011, LM-015, LM-034 |
| Chuỗi lỗi cứng làm hỏng i18n | LM-014, LM-028 |
| Draft lệch dữ liệu đã sửa | LM-026, LM-050 |
| Thứ tự xếp sai sau chỉnh tay | LM-022, LM-035, LM-050 |
| ID instance trùng | LM-013 |
| Contract backend đổi | LM-002 (theo dõi), tách qua `services/optimization` |
| Hiển thị số giả như thật | LM-037, LM-051, LM-052, LM-053 |

**Tuân thủ Spec mục 15 — issue chứng minh chính:**

| Dòng checklist | Issue |
|---|---|
| Tạo xe bằng cm/kg | LM-041 |
| Thêm/sửa/xoá/nhân bản kiện | LM-045 |
| Mọi field hiển thị đơn vị | LM-041, LM-045, LM-027 |
| Validation chặn dữ liệu sai | LM-017, LM-047 |
| Tự tính tổng khối lượng, thể tích | LM-044 |
| Quantity mở thành instance | LM-013 |
| Mock trả đúng `OptimizationResult` | LM-024 |
| Viewer đúng tỷ lệ xe, hàng, vật cản | LM-031, LM-033 |
| Rotate/zoom/pan/reset camera | LM-049 |
| Click kiện hiện đúng cm/kg | LM-049 |
| Chạm mặt không báo chồng lấn | LM-015 |
| Vượt biên / chồng vật cản bị cảnh báo | LM-015, LM-018, LM-035 |
| Hiện kiện chưa xếp và lý do | LM-049 |
| Hiện volume/payload utilization | LM-021, LM-049 |
| Nhãn mock rõ ràng | LM-049, LM-051, LM-052 |
| Unit test volume/orientation/boundary/overlap | LM-012, LM-015 |
| Thay mock bằng API không sửa UI chính | LM-025, LM-030 |
