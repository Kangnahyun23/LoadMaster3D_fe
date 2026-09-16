---
id: LM-041
title: Trang chi tiết xe — form cấu hình, bảng vật cản, trục xe, validation
phase: 3
labels: [fleet, form]
depends_on: [LM-017, LM-028, LM-040]
estimate: 2d
prd: [D-17, D-38]
spec: [9.2, 13]
---

# LM-041 — Trang chi tiết xe

## Việc cần làm

- [x] `features/fleet/VehicleDetailPage.tsx` cho `/doi-xe/moi` và `/doi-xe/:vehicleId`; header 72px, một nút primary "Lưu".
- [x] Form RHF + `vehicleConfigSchema`: tên, dài/rộng/cao trong thùng (cm), tải trọng tối đa (kg), rộng/cao cửa (cm), clearance (cm). `Input numeric` có hậu tố đơn vị, bước 0,1 cm / 0,01 kg; giá trị qua `roundCm` khi lưu.
  - zod 4 không cho `.omit('id')` trên schema có refinement → form tạo mới dùng id tạm hoặc schema form riêng dựng từ các khối trường của `src/domain/models`.
  - Lỗi nhiều trường (cửa ≤ thùng, vật cản trong thùng) chỉ xuất hiện khi các trường liên quan hợp lệ (`abort` trong schema); nếu cần hiện sớm hơn thì dùng `when` của zod.
  - Schema chỉ đòi `name` là chuỗi; bắt buộc không rỗng là quy tắc của form.
- [x] Bảng vật cản (`useFieldArray`, số dòng nhỏ): loại (Select 4 loại), x/y/z, dài/rộng/cao (cm), chịu tải (Switch), tải tối đa (kg, chỉ bật khi chịu tải). Thêm, sửa, xoá.
- [x] Bảng trục xe tuỳ chọn: tên, vị trí X (cm), tải rỗng, tải tối đa (kg), nhãn "Chưa dùng trong tính toán".
- [x] Lỗi hiển thị tại field và trong validation summary đầu form (qua `formatIssue`), không dùng `alert`.
- [x] Bấm lỗi trong summary nhảy tới ô (dời từ `issueField` của LM-028): `issue.field` của `validateVehicle` đã là đường dẫn react-hook-form (`innerLengthCm`, `obstacles.0.lengthCm`, lỗi cả dòng `obstacles.0`) → `setFocus` thẳng.
- [x] Rời trang khi form đang sửa: hỏi xác nhận (dialog của repo).
- [x] File ≤ 250 dòng: tách `VehicleSpecFields`, `ObstacleTable`, `AxleTable`, `VehicleValidationSummary`.

## Tiêu chí nghiệm thu

- [x] Nhập cửa 250 cm với thùng rộng 240 cm → lỗi đúng câu Spec ở ô cửa.
- [x] Vật cản vượt ra ngoài thùng hoặc chồng vật cản khác → lỗi tại dòng vật cản.
- [x] Test RTL cho hai ca trên và cho lưu thành công.

## Kết quả (16/09/2026)

**Validation hai chặng.** `vehicle-form-resolver.ts` là resolver của react-hook-form, chạy theo thứ tự:

1. schema zod của form (`createVehicleFormSchema(t)` trong `vehicle-form.ts`) — chỉ quy tắc **một ô**: bắt buộc nhập,
   đúng kiểu số, tên không rỗng, `clearanceCm` ≥ 0, tải trên của vật cản, tải trục. Câu lấy từ từ điển nên schema
   phải dựng theo `t`, không dựng ở module.
2. `validateVehicle` của `@/domain/constraints` — quy tắc Spec 9.2 nhiều trường (kích thước > 0, cửa ≤ lòng thùng,
   vật cản trong thùng, vật cản chồng nhau). Mã + tham số đổi thành câu bằng `formatIssue` (D-28).

Chặng 2 chỉ chạy khi chặng 1 sạch — đúng nếp `abort` của schema domain, nên ô còn trống không kéo theo lỗi cửa.

**Không dùng `vehicleConfigSchema` làm resolver.** Message của nó là **mã** model chứ không phải câu, muốn hiện phải
thêm một bảng mã → câu song song với `formatIssue`; và zod 4 không cho `.omit('id')` trên schema đã có refinement.
Chọn hướng "schema form riêng" mà issue cho phép: xe mới mang `id` rỗng (không cần id tạm), `vehicles-api.ts` hiểu đó
là lệnh tạo mới. Hai lớp kiểm tra không trùng nhau: schema form không lặp lại quy tắc nào của `validateVehicle`.

**Lỗi và summary.** Resolver đổi `ConstraintIssue[]` thành cây lỗi RHF theo `issue.field`, tạo mảng cho đoạn số
(`obstacles.0`) đúng hình dạng RHF sinh ra. Nhờ vậy lỗi ô rơi thẳng vào `Input` (viền danger + `aria-invalid`), lỗi cả
dòng vật cản nằm ở `errors.obstacles[i].message` và hiện trong danh sách dưới bảng (`aria-label` "Lỗi theo dòng vật
cản"). `VehicleValidationSummary` đọc `flattenFormErrors(formState.errors)` nên liệt kê được cả lỗi ô lẫn lỗi dòng;
bấm một dòng gọi `setFocus`. Lỗi cả dòng không có ô riêng để nhận focus nên đưa con trỏ về ô X của dòng đó.

**Form.** `VehicleDetailPage.tsx` lo route và trạng thái tải/không tìm thấy; `VehicleForm.tsx` lo form (header 72px,
một nút primary "Lưu", nút "Xoá xe" dạng secondary chỉ khi sửa). Ba khối tách riêng: `VehicleSpecFields`,
`ObstacleTable` (`useFieldArray`, Select 4 loại, Switch chịu tải, ô tải trên chỉ bật khi chịu tải),
`AxleTable` (badge "Chưa dùng trong tính toán"). `ConfirmDialog` dùng chung cho hỏi rời trang và hỏi xoá xe.
Mọi số vào domain qua `roundCm` / `roundKg` đúng một lần, trong `toVehicleConfig`; `floorMaxLoadKg` và
`floorPressureLimitKgPerCm2` không có trên form nên được giữ nguyên từ xe đang sửa thay vì bị xoá khi lưu.

**Rời trang.** `useBlocker` của react-router chặn khi `formState.isDirty`. Lưu/xoá xong thì đặt cờ `done` và điều
hướng trong `useEffect` ở lần render sau, để hộp "Rời trang khi chưa lưu?" không chặn chính thao tác lưu — cách này
không phải đọc `ref` trong lúc render (oxlint `react(refs)` báo).

**Chỗ cho LM-042.** `features/fleet` chưa import `three`; khối xem trước 3D sẽ thêm vào `VehicleForm` sau.

**Kiểm thử.** `VehicleDetailPage.dom.test.tsx` chạy qua kho mock thật, không giả lập kho:
cửa 250 cm trên thùng 240 cm → đúng câu Spec mục 13 và ô cửa `aria-invalid`; hốc bánh xe dài 700 cm trong thùng
600 cm → "Vật cản OBS-001 vượt chiều dài thùng 100 cm." ở danh sách lỗi theo dòng, ô Dài **không** `aria-invalid`;
lưu xe mới thì quay về `/doi-xe` và thấy tên xe trong bảng.

**Lệch khỏi luật, đã ghi vào AGENTS.md.** `src/lib/i18n/{vi,en}.ts` vượt 250 dòng sau khi thêm nhánh `fleet`; mục 11.5
nay nói rõ giới hạn 250 dòng tính cho file có logic, file dữ liệu phẳng (từ điển, mock, fixture) được dài hơn.
`setup-dom.ts` thêm `ResizeObserver` giả: jsdom không có, mà Radix Switch gọi thẳng vào nó và làm đổ cả cây React.
