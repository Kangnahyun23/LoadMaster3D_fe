---
id: LM-013
title: Mở rộng quantity thành instance, quy tắc ID và truy vết
phase: 1
labels: [domain]
depends_on: [LM-010]
estimate: 0.5d
prd: [D-33]
spec: [6]
---

# LM-013 — Mở rộng quantity thành instance

## Việc cần làm

- [x] `expandPackages(packages) → { instances, packageIdByInstanceId: Map, issues }`.
- [x] ID = `{packageId}-{n}` với n 1-based, đệm tối thiểu 2 chữ số, số chữ số = `max(2, digits(quantity))` (quantity 100 → `-001`…`-100`).
- [x] Truy vết chỉ qua `packageIdByInstanceId`, **không** tách chuỗi ID.
- [x] Phát hiện trùng ID trong toàn request (vd kiện gốc `PKG-001-01` va với instance của `PKG-001`) → lỗi `DUPLICATE_INSTANCE_ID`.
- [x] Hàm `nextPackageId(existing)` cho thao tác nhân bản.

## Tiêu chí nghiệm thu

- [x] Fixture Spec (`PKG-001`, quantity 4) sinh `PKG-001-01`…`PKG-001-04`.
- [x] quantity 100 sinh đủ 100 ID duy nhất, sắp xếp chuỗi đúng thứ tự.
- [x] Ca va chạm ID được phát hiện.

## Kết quả — 15/09/2026 (TDD)

**Seam.** Module mới `src/domain/cargo/`. Test chỉ import từ `@/domain/cargo` ([index.ts](../../src/domain/cargo/index.ts)), cộng `SPEC_CARTON_A` và type `CargoPackage`. API công khai:

- `expandPackages(packages: readonly CargoPackage[]) → { instances, packageIdByInstanceId: ReadonlyMap<string, string>, issues }`.
- `nextPackageId(existingIds: readonly string[]) → string`.
- Type `PackageInstance`, `ExpandedPackages`, `DuplicateInstanceIdIssue`.

**Instance.** `PackageInstance` gồm `packageInstanceId` và mọi trường của `CargoPackage` mà việc xếp đọc: kích thước, `weightKg`, `allowedOrientations`, `keepUpright`, `fragilityLevel`, `stackable`, `maxTopLoadKg`, `maxStackCount`, `minSupportRatio`, `deliveryStop`, `priority`, `mustLoad`. Các trường bị bỏ:

- `id`, để không nhầm mã kiện với mã instance;
- `quantity`, vì mỗi instance là một kiện (tránh nhân khối lượng hai lần);
- `name`, `groupId`, `notes`, vì chỉ để hiển thị.

Instance **không** mang `packageId`. Kiện gốc chỉ lấy lại qua `packageIdByInstanceId` rồi tra theo mã.

**Quy tắc ID**

- Dạng `{packageId}-{n}`, n đếm từ 1, đệm 0 tới `max(2, số chữ số của quantity)`. Quantity 4 → `PKG-001-01`…`PKG-001-04`; quantity 100 → `PKG-001-001`…`PKG-001-100`.
- Thứ tự tất định: theo thứ tự dòng kiện trong request, rồi theo n. Không sắp lại theo mã.
- Map `instanceId → packageId` được ghi ngay lúc sinh ID.

**Trùng ID.** Mã kiện gốc và mã instance dùng chung một không gian ID. Phần sau dấu `-` cuối của mã instance chỉ có chữ số, nên instance của hai mã kiện **khác nhau** không bao giờ trùng nhau. Vì vậy chỉ có hai nguồn trùng: nhiều dòng cùng mã, và mã kiện gốc trùng mã instance của một dòng khác. Mỗi ID có từ 2 dòng kiện trở lên cùng dùng sinh một lỗi:

| Trường | Giá trị |
|---|---|
| `code` / `severity` | `'DUPLICATE_INSTANCE_ID'` / `'error'` |
| `packageInstanceId` | chính ID bị trùng; là mã kiện gốc khi hai dòng cùng mã |
| `relatedIds` | mã các kiện gốc dùng ID đó (làm mã của chính nó hoặc mã instance), theo thứ tự request, không lặp |
| `params.occurrences` | số dòng kiện dùng ID đó |

Ví dụ `[PKG-001 ×4, PKG-001-01 ×1]` cho một lỗi `packageInstanceId: 'PKG-001-01'`, `relatedIds: ['PKG-001', 'PKG-001-01']`, `occurrences: 2`.

Hai dòng cùng mã chỉ báo **một** lỗi ở mã kiện, không báo lại từng instance ID trùng theo (cùng tinh thần `abort` của LM-010). Va chạm khác vẫn được báo, kể cả khi các dòng liên quan cũng trùng mã.

`DuplicateInstanceIdIssue` là **kiểu tạm**. LM-014 thay nó bằng `ConstraintIssue` dùng chung; tên trường đã khớp nên không phải đổi tên.

**nextPackageId.** Lấy số lớn nhất cộng 1, tất định.

- Chỉ tính mã `PKG-<số>` và mã bắt đầu bằng `PKG-<số>-`. Mã dạng instance `PKG-002-01` giữ số 2, nên bản sao nhận `PKG-003`; nếu nhận `PKG-002` thì instance `PKG-002-01` sẽ trùng. Mã tự đặt khác (`KHO-A-15`, `PKG-12A`, `THUNG-SUA`) bị bỏ qua.
- Đệm 0 theo mã rộng nhất đang có, mặc định 3 chữ số như mẫu Spec. Chỉ nới rộng khi số cần, không bao giờ cắt: `PKG-0009` → `PKG-0010`, `PKG-999` → `PKG-1000`, `[]` → `PKG-001`.

**Test.** Có 16 test trong [cargo.test.ts](../../src/domain/cargo/cargo.test.ts): `expandPackages` 10, `nextPackageId` 6. Làm 16 vòng, 13 vòng red → green đúng lý do. Trước mỗi hàm và mỗi trường mới có stub trả rỗng, để test đỏ ở assertion chứ không đỏ vì thiếu module. 3 test xanh ngay đã được chứng minh đỏ bằng cách cố ý làm hỏng code rồi khôi phục:

- 100 ID duy nhất, đúng thứ tự chuỗi: đệm theo số chữ số của `n` thay vì `quantity`;
- thứ tự theo request: sắp dòng kiện theo mã trước khi mở rộng;
- request không trùng thì không có lỗi: hạ ngưỡng trùng xuống 1 lần dùng.

Chứng minh thêm hai chỗ:

- Thêm `PKG-12A` vào test "bỏ qua mã khác dạng". Test này đỏ khi thử pattern tối thiểu `^PKG-(\d+)` (ra `PKG-013`), nên pattern chốt là `^PKG-(\d+)(?:-|$)`.
- Nửa `PKG-999 → PKG-1000` đỏ khi đệm bằng `slice(-width)` (ra `PKG-000`).

Một vòng đã đổi thiết kế. Bản đầu bỏ qua instance ID đã gặp để khỏi báo trùng kéo theo, nhưng khi đó `occurrences` của `PKG-001-01` ra 2 thay vì 3 (ID này là instance của hai dòng `PKG-001` và là mã dòng thứ ba). Bản chốt ghi nhận mọi lần dùng, chỉ bỏ nhóm ID mà mọi lần dùng đều là instance của các dòng cùng một mã.

**Tài liệu.** AGENTS.md mục 3: thêm `domain/cargo/` vào cây thư mục.

**Chuyển sang issue khác**

- **LM-014**: thay `DuplicateInstanceIdIssue` bằng `ConstraintIssue` và đưa mã vào danh mục. Chốt nghĩa `relatedIds` (ở đây là mã kiện gốc, không phải mã instance khác) và kiểu `params`.
- **LM-017**: gộp `issues` của `expandPackages` vào `validateRequest`. Khi nhiều dòng cùng mã, `relatedIds` không chỉ ra được dòng nào; UI cần `field` hoặc vị trí dòng để nhảy tới ô.
- **LM-024**: mock service gọi `expandPackages` sau validation; `placedCount + unplacedCount = instances.length`.
- **LM-045**: nhân bản gọi `nextPackageId(mã các kiện đang có)`. Form nên chặn lưu mã trùng trước khi tới bước tối ưu.
- **LM-028**: câu thông báo cho `DUPLICATE_INSTANCE_ID` (dùng `packageInstanceId`, `relatedIds`, `occurrences`).
- Giới hạn đã biết: dòng kiện có mã đúng bằng `PKG` với quantity ≥ 100 sinh instance `PKG-001`…. `nextPackageId` chỉ tránh được trường hợp này khi được truyền cả mã instance. Nếu vẫn va, `expandPackages` báo lỗi, không hỏng im lặng.

**Kiểm tra**

- `pnpm test`: 132/132 ✅ (116 cũ + 16 mới).
- `pnpm lint`: ✅, 0 chẩn đoán.
- `pnpm build`: ✅. Cảnh báo chunk > 500 kB đã có từ trước.
