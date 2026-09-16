---
id: LM-054
title: E2E luồng Spec đầu cuối trên desktop và tablet
phase: 3
labels: [test, e2e]
depends_on: [LM-042, LM-045, LM-046, LM-048, LM-050, LM-051, LM-052, LM-053]
estimate: 1d
prd: [D-39]
spec: [15, 16]
---

# LM-054 — E2E luồng Spec

## Kịch bản

- [x] **Đầy đủ:** Dashboard → Tạo kế hoạch xếp → tạo chuyến → tạo xe "Truck 6m" có hốc bánh → thêm kiện `PKG-001` (quantity 4) + nhân bản → Thiết lập tối ưu → Tối ưu → Planner có MOCK RESULT, 4+ kiện, utilization → click kiện thấy cm/kg → Duyệt → mở `/kho` thấy bước đầu tiên.
- [x] **Lỗi dữ liệu:** kiện không có hướng → nút Tối ưu disabled, summary nhảy tới ô.
- [x] **Kết quả một phần:** kiện vượt thùng → Planner liệt kê chưa xếp với lý do.
- [x] **Lỗi service:** `?mo-phong=loi` → dialog lỗi, Thử lại.
- [x] **Lỗi thời:** sửa kiện sau khi tối ưu → Duyệt bị chặn.
- [x] **Ngôn ngữ:** chuyển en giữa luồng, dữ liệu form giữ nguyên, số format kiểu en.
- [x] Chạy trên project `desktop` và `tablet` (vùng chạm 56px).

## Tiêu chí nghiệm thu

- [ ] Toàn bộ kịch bản xanh trên CI. *(xanh cục bộ, xem dưới; chờ CI của nhánh gộp)*
- [x] Mỗi dòng checklist Spec mục 15 có ít nhất một assertion trỏ tới (ghi chú ID dòng trong test) — trừ các dòng liệt kê ở "Chưa phủ bằng E2E".

## Kết quả (16/09/2026)

**File.** `e2e/spec-flow.spec.ts` (7 test) + `e2e/spec-flow-helpers.ts` (`navigateInApp`, `addPackage`,
`optimizeAndOpenPlanner`, `heightOf`). Dữ liệu chỉ tạo qua UI trên kho in-memory; không `page.goto` sau khi đã ghi,
chỗ không có liên kết (Planner → `/kho`) đổi route phía client. Assertion gắn dòng Spec §15 ghi dạng `§15 "<dòng>"`.

| Test | Project | Nội dung |
|---|---|---|
| `desktop: dashboard to approved plan to warehouse step` | desktop | Đội xe → xe "Truck 6m" + vật cản hốc bánh → Bảng điều khiển → "Tạo kế hoạch xếp" → form chuyến (chọn đúng xe vừa tạo, seed cũng có xe cùng tên) → `PKG-001` × 4 → Nhân bản `PKG-002` → Thiết lập tối ưu → Tối ưu → Planner (MOCK RESULT, 26,7 % / 32,0 %, 8 / 8, vật cản đúng cm) → xoay/zoom/pan/đặt lại camera → Kiện `PKG-001-02` 120 × 100 × 100 cm, 200,0 kg, không lỗi → Duyệt → `/kho` hiện bước xếp. |
| `tablet: …` `@tablet` | tablet | Cùng luồng, bỏ phần camera bằng chuột; khẳng định nút "Duyệt phương án" và "Xác nhận đã xếp" ≥ 56 px; đính kèm chiều cao các nút chính. |
| `invalid cargo blocks optimisation…` | desktop | Form kiện không lưu kiện bỏ hết hướng đặt ("Chọn ít nhất một hướng đặt."); kiện 300 cm không lọt cửa → Tối ưu tắt + alert; link trong summary mở `?kien=PKG-007` với panel kiện; xoá kiện → Tối ưu bật lại. |
| `cargo that does not fit…` | desktop | 30 × 1,2 m³ thêm vào chuyến seed → header `Đã xếp N / 162` → tab "Kiện chưa xếp N" liệt kê `PKG-007-…` với lý do "Không vừa chỗ trống còn lại.". |
| `an unavailable optimisation service…` | desktop | `?mo-phong=loi` → dialog "Không chạy được tối ưu" → Thử lại. |
| `editing a package after optimising…` | desktop | Revision mới qua `optimizationResultSchema` (`COMPLETED`, `isMockResult`) → sửa khối lượng `PKG-001` → quay lại Planner: banner lỗi thời, nút Duyệt trong hộp thoại tắt. |
| `switching to English mid-flow…` | desktop | Form chuyến điền dở → EN: giá trị giữ nguyên, `9,500 kg`; tạo chuyến và kiện 1234.5 kg → `1.2 m³`, `1,234.5 kg`. |

Kịch bản "lỗi dữ liệu" dùng lỗi cửa (`DOOR_TOO_SMALL`) ở màn Thiết lập vì form kiện đã chặn kiện không có hướng đặt
trước khi lưu — không còn đường UI nào đưa `NO_ALLOWED_ORIENTATION` tới Thiết lập (DOM test của `OptimizationSetupPage`
phủ ca đó qua kho). Màn kho còn đọc phương án mẫu mm tới LM-060, nên luồng đầy đủ chỉ khẳng định bước xếp hiện ra.

### Spec §15 — nơi phủ

| Dòng | E2E |
|---|---|
| Tạo xe bằng cm/kg | `spec-flow` đầy đủ (ô cm/kg, dòng đội xe `600 × 240 × 250 cm 5.000 kg`) |
| Thêm/sửa/xóa/nhân bản kiện | thêm + nhân bản (đầy đủ), xoá (lỗi dữ liệu), sửa (lỗi thời) |
| Mọi field hiển thị đơn vị | đầy đủ: form xe, bảng vật cản, form kiện |
| Validation chặn dữ liệu không hợp lệ | lỗi dữ liệu |
| Tự tính tổng khối lượng và thể tích | đầy đủ: `4,8 m³ · 800 kg` rồi `9,6 m³ · 1.600 kg` |
| Quantity được mở rộng thành instance riêng | đầy đủ: `8 / 8`, `PKG-001-02` |
| Mock service trả đúng OptimizationResult | lỗi thời: revision qua `optimizationResultSchema` |
| Viewer hiển thị đúng tỷ lệ xe, hàng và obstacle | đầy đủ: vật cản cm trong danh sách `sr-only`, kích thước kiện; hình học thêm ở `viewer-obstacles`, `viewer-benchmark-cm` |
| Rotate, zoom, pan và reset camera hoạt động | đầy đủ (desktop) |
| Click kiện hiển thị đúng thông tin cm/kg | đầy đủ |
| Hai kiện chạm mặt không bị báo overlap | đầy đủ: kiện xếp sát "Không có lỗi hay cảnh báo", hộp Duyệt "Không còn cảnh báo ràng buộc." |
| Kiện vượt biên hoặc overlap obstacle bị cảnh báo | **một phần**: vượt biên/chồng lấn kiện ở `viewer-editor-ui` ("Không thể đặt", "chồng lấn") |
| Hiển thị kiện chưa xếp và lý do | kết quả một phần |
| Hiển thị volume/payload utilization | đầy đủ |
| Mock result có nhãn rõ ràng | đầy đủ, kết quả một phần |

**Chưa phủ bằng E2E:**

- *Kiện overlap obstacle bị cảnh báo* — chỉ có unit test (`domain/constraints/obstacles.test.ts`, `engine.test.ts`);
  chưa E2E kéo kiện vào vật cản trong editor.
- *Unit test cho volume, orientation, boundary và overlap* — bản chất là unit test (`src/domain/**`), không phải E2E.
- *Thay MockOptimizationService bằng API service mà không sửa UI chính* — tính chất kiến trúc (`OptimizationService`,
  `createOptimizationService` trong `-api.ts`), không kiểm được bằng trình duyệt.

### Lỗi app tìm thấy và đã sửa

1. **Thiết lập tối ưu kẹt nút Tối ưu ở trạng thái tắt** sau khi sửa dữ liệu rồi quay lại: `disabled` đọc
   `form.formState.isValid` sau `!summary?.canRun ||`, nên lần mở lại với bản cache còn lỗi không đăng ký theo dõi
   `isValid` và nó ở `false` tới khi người dùng sửa một ô thiết lập. Sửa: đọc `isValid` ở đầu mỗi render.
   DOM test `fixing the cargo and coming back enables Optimize…` (đỏ trước khi sửa).
2. **Form kiện hiện mã lỗi thô** (`package.allowedOrientations.empty`) thay vì câu: zod dùng mã làm message (D-28) nhưng
   `PackageFormFields` in thẳng message. Thêm `trips.form.errors.*` (vi/en) và `package-form-errors.ts`.
   DOM test `an invalid package is not saved and field errors read as sentences…`.

### Còn lệch, chưa sửa

- **Nút chính của màn điều phối cao 40 px trên tablet** (820 px): "Tạo chuyến", "Tối ưu" ở Thiết lập tối ưu, "Duyệt"
  trong hộp thoại Duyệt của Planner. AGENTS mục 5/10 đòi 56 px trên tablet; `Button` mặc định `size="md"` không đổi theo
  thiết bị. Sửa đúng là quyết định chung cho `Button` (mọi màn), ngoài phạm vi issue test này — E2E tablet chỉ khẳng định
  56 px ở màn cảm ứng (Planner "Duyệt phương án", kho "Xác nhận đã xếp") và đính kèm số đo các nút còn lại.
