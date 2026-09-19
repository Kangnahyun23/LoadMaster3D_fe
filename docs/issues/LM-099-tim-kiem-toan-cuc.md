---
id: LM-099
title: Tìm kiếm toàn cục Ctrl+K
phase: 6
labels: [search, keyboard]
depends_on: [LM-083, LM-084]
estimate: 1d
prd: [D-55]
---

# LM-099 — Ctrl+K

## Việc cần làm

- [x] Hộp thoại tìm nhanh (Ctrl+K / ⌘K, và nút ở nav rail): chuyến (mã, tên, điểm giao), xe (tên, biển số), kiện (mã), người dùng — chỉ nhóm có quyền.
- [x] Mũi tên chọn, Enter mở, Esc đóng; kết quả nhóm theo loại; không có kết quả thì nói rõ.

## Tiêu chí nghiệm thu

- [x] DOM test bàn phím; E2E mở chuyến bằng Ctrl+K.

## Kết quả (20/09/2026)

### Đã làm

- [x] **Mở**: nút "Tìm nhanh" trên nav rail (trên chuông, `NavRailButton`, `aria-keyshortcuts="Control+K Meta+K"`) và phím Ctrl+K / ⌘K ở
  mọi màn có nav rail. Vai trò không được xem nhóm nào (kho, tài xế) thì không có nút và không bắt phím. Không mở chồng lên hộp thoại
  khác. Mở bằng phím tắt thì đóng xong con trỏ về chỗ đang gõ; mở bằng nút thì về nút.
- [x] **Tìm** (`quick-search.ts`, hàm thuần, `matchesQuery` của danh sách — không dấu, không phân biệt hoa thường, mọi từ phải có):
  chuyến theo mã, tên, tên điểm giao → `/chuyen/<mã>`; kiện theo mã kiện gốc → `/chuyen/<mã>?kien=<mã kiện>` (chi tiết chuyến mở đúng kiện,
  LM-047); xe theo mã, tên (tên gồm biển số) → `/doi-xe/<mã>`; người dùng theo họ tên, email, mã → `/nguoi-dung?q=<mã>`. Chỉ nhóm có quyền
  (`trips.view` cho chuyến và kiện, `fleet.view`, `users.manage`), tối đa 8 kết quả mỗi nhóm theo thứ tự của kho, nhóm rỗng bỏ.
- [x] **Dữ liệu**: `search-api.ts` chỉ đọc những gì nhóm được phép cần (điều phối viên không kéo danh sách người dùng) →
  `useSearchSourcesQuery` (`staleTime: 0`); hộp thoại chỉ gắn khi mở nên chỉ đọc kho lúc mở, lọc theo từ khoá chạy trên máy.
- [x] **Hộp thoại** (Radix Dialog có sẵn, đặt cao 12vh): ô nhập là `combobox` (`aria-activedescendant`), kết quả là `listbox` chia `group`
  có tiêu đề (Chuyến, Kiện, Xe, Người dùng), mỗi dòng icon trùng mục nav + tên + mã (mono). Mũi tên lên/xuống chọn (vòng tròn, cuộn theo),
  Enter mở, Esc đóng, chuột di/bấm được. Chưa gõ: câu gợi ý đúng phạm vi của vai trò; không có kết quả: "Không tìm thấy kết quả cho “…”.";
  `role="status"` đọc số kết quả. Chân hộp thoại: phím ↑↓/Enter/Esc và "Mở nhanh bằng Ctrl K" (⌘ K trên Mac).

### File

`src/features/search/`: `quick-search.ts`, `search-api.ts`, `useSearchSourcesQuery.ts`, `QuickSearch.tsx`, `QuickSearchPanel.tsx`,
`SearchResults.tsx` · `src/app/NavRail.tsx` (nút trên chuông) · `src/lib/i18n/{vi,en}/search.ts` (nhánh mới).

### Kiểm thử

- Unit `quick-search.test.ts` (5): từ khoá rỗng; chuyến theo mã/tên/điểm giao không dấu, kiện theo mã kiện gốc ở mọi chuyến; xe theo biển
  số, người dùng theo tên/email; chỉ nhóm được phép, đúng thứ tự, bỏ nhóm rỗng; tối đa 8 mỗi nhóm.
- DOM `QuickSearch.dom.test.tsx` (5, kho seed): Ctrl+K mở, ô nhập nhận con trỏ, gợi ý đúng phạm vi, Esc trả con trỏ về ô cũ; ⌘K + "trip-00"
  → 8 chuyến, dòng đầu được chọn, ↓ rồi ↑↑ vòng về dòng cuối (`aria-selected`, `aria-activedescendant`), Enter mở `/chuyen/TRIP-008`; tìm
  theo tên điểm giao, Enter trên kiện mở `/chuyen/TRIP-2026-0914?kien=PKG-001`; quản lý không tìm được người dùng và được báo không có kết quả;
  quản trị tìm người dùng (→ `/nguoi-dung?q=US-0011`) và bấm chuột mở xe `VEHICLE-003`; nhân viên kho không có nút, Ctrl+K không làm gì.
- DOM `NavRail.dom.test.tsx` +5: nút Tìm nhanh chỉ có ở điều phối, quản lý, quản trị.
- E2E `e2e/quick-search.spec.ts` (1, desktop): Ctrl+K → "0914" → Enter mở chi tiết `TRIP-2026-0914`; mở lại bằng nút nav rail → "pkg-002"
  → ↓↑ Enter mở chuyến với panel kiện `PKG-002`.

Lệnh: `pnpm lint` ✅ · `pnpm exec tsc -b` ✅ · `pnpm test` 123 file / 763 test ✅ · `E2E_PORT=5196 pnpm exec playwright test
e2e/profile.spec.ts e2e/notifications.spec.ts e2e/quick-search.spec.ts e2e/rbac.spec.ts` 6/6 ✅; thêm vì đụng header màn kho/tài xế:
`driver-approved-plan.spec.ts -g "run in English"` (phone) và `warehouse.spec.ts -g tablet` 3/3 ✅.
`e2e/admin-users.spec.ts` và `e2e/admin-audit.spec.ts` đỏ **từ trước**, không do nhóm issue này: admin-users chờ tài xế mới vào
`/tai-xe/diem-giao` nhưng màn chính của tài xế đã là `/tai-xe` (LM-087); admin-audit phụ thuộc giờ chạy — chạy trước 11:40 thì sự kiện seed
"Sửa chuyến TRIP-013 11:40 hôm nay" đứng trên sự kiện vừa ghi.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 1: thêm *Ctrl+K / ⌘K (LM-099) mở tìm nhanh ở mọi màn có nav rail, theo quyền xem nhóm; màn toàn màn hình không có.*
- Mục 10 "Khả năng truy cập": thêm *Hộp thoại chọn kết quả theo mẫu combobox + listbox (`aria-activedescendant`), con trỏ ở ô nhập; mở bằng
  phím tắt thì đóng xong trả con trỏ về chỗ cũ.*
- Nav rail của quản trị (7 mục + Tìm nhanh + Thông báo) cao ~880px: dưới chiều cao đó rail cuộn (`overflow-y-auto`, như trước ở ~744px);
  nếu cần vừa 768px, đề xuất đặt nút ngôn ngữ nằm ngang ở rail.
