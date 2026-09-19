---
id: LM-091
title: Nhật ký hệ thống /nhat-ky
phase: 6
labels: [admin, audit]
depends_on: [LM-083, LM-084, LM-085]
estimate: 1d
prd: [D-43, D-52]
---

# LM-091 — Nhật ký

## Việc cần làm

- [x] `features/admin/audit-api.ts` + hook; màn `/nhat-ky` (quyền `audit.view`), mục nav "Nhật ký".
- [x] Bảng: thời điểm, người làm, hành động (dịch mã), đối tượng (liên kết tới chuyến/xe/người dùng), chi tiết (tham số format theo locale).
- [x] Lọc: khoảng ngày, người làm, nhóm hành động (chuyến, đội xe, tối ưu, kho, giao hàng, người dùng, đăng nhập), tìm theo mã đối tượng; phân trang.

## Tiêu chí nghiệm thu

- [x] E2E: điều phối huỷ một chuyến → quản trị thấy sự kiện đó đầu nhật ký, lọc theo người làm ra đúng.

## Kết quả (19/09/2026)

### Đã làm

- **Route và nav**: `/nhat-ky` trong nhóm `guarded('audit.view', …)` của `App.tsx` (lazy như mọi màn, trong khung có nav rail); mục nav
  "Nhật ký" (`ScrollText`, `permission: 'audit.view'`) đứng sau "Người dùng" — chỉ quản trị viên thấy.
- **Dữ liệu**: `audit-api.ts` — `fetchAuditEvents(filter)` gọi `listEvents({ from, to, actorId, targetId })` của kho (lọc như server:
  ngày giờ Việt Nam, mã đối tượng chứa chuỗi), nhóm hành động lọc ngay sau (`auditGroup`); `fetchAuditDirectory()` đọc tên hiện tại của
  người dùng, chuyến, xe. `useAuditLogQuery.ts`: `useAuditEventsQuery` (khoá theo bộ lọc, `keepPreviousData` — đổi lọc giữ bảng cũ mờ đi,
  không nhấp nháy) và `useAuditDirectoryQuery`; cả hai đọc lại mỗi lần mở màn.
- **Đọc sự kiện** (`audit-log.ts`, hàm thuần `describeEvent(event, directory, t, format)`):
  - Người làm: họ tên; không có phiên → "Hệ thống", riêng đăng nhập sai → "Chưa đăng nhập"; người đã xoá → "Tài khoản đã xoá (US-…)".
  - Hành động: `audit.actions.<nhóm>.<mã>`.
  - Đối tượng: tên hiện tại + mã (hai dòng để tên dài không cắt mất mã); liên kết `/chuyen/:id`, `/doi-xe/:id`, người dùng →
    `/nguoi-dung?q=<mã>` (chưa có trang người dùng riêng). Đối tượng đã xoá: tên lưu trong tham số (`name`/`fullName`), không liên kết.
  - Chi tiết: từng tham số "Nhãn: giá trị" nối bằng " · "; số qua `format.integer`; mã được dịch — tên trường (`fields`, nối bằng liên từ
    của ngôn ngữ), loại sự cố giao (`kind`), vai trò (`role`), lý do đăng nhập sai (`reason: suspended`); lý do huỷ chuyến giữ nguyên chữ
    người dùng nhập; tham số chưa có nhãn hiện đúng tên kho ghi.
- **Màn** `AuditLogPage`: `FilterBar` (ô tìm mã đối tượng `q`, khoảng ngày `tu`/`den`, "Người làm" `nguoi-lam` — mọi người dùng sắp theo
  tên, "Nhóm hành động" `nhom` — 8 nhóm của `AUDIT_GROUPS`) + `DataTable` (cột Thời điểm sắp xếp được, mặc định mới nhất trước; phân
  trang **50** dòng mặc định; rỗng vì lọc → "Không có sự kiện khớp bộ lọc." + Xoá lọc). Đầu màn: tiêu đề + số sự kiện khớp. Màn chỉ đọc nên
  không có nút primary. Ngày sai dạng trên URL (năm 6 chữ số) không gửi xuống kho.
- Từ điển: nhánh `audit` thêm `audit.log.*` (tiêu đề, bộ lọc, cột, nhãn tham số, tên trường, loại sự cố, lý do); `nav.audit`.

### File

`src/features/admin/`: `AuditLogPage.tsx`, `audit-columns.tsx`, `audit-log.ts`, `audit-api.ts`, `useAuditLogQuery.ts` · `src/app/App.tsx`
(một route) · `src/app/NavRail.tsx` (một mục) · `src/lib/i18n/{vi,en}/audit.ts`, `{vi,en}/nav.ts` · `e2e/admin-audit.spec.ts`.

### Kiểm thử

- Unit `audit-log.test.ts` (5): huỷ chuyến (người làm, hành động, liên kết, lý do); số theo locale vi/en; dịch tên trường, loại sự cố,
  vai trò, lý do khoá; không phiên ("Chưa đăng nhập"/"Hệ thống"), email lạ không liên kết; đối tượng đã xoá, tham số chưa có nhãn.
- DOM `AuditLogPage.dom.test.tsx` (6): sự kiện vừa ghi đứng đầu + 50 dòng/trang + `aria-sort`; lọc người làm qua Select (URL
  `?nguoi-lam=US-0003`); tìm `TRIP-004` (4 sự kiện); nhóm "Chuyến" + mã (2); khoảng ngày 18/08 theo giờ VN (7 sự kiện của TRIP-001);
  không khớp + Xoá lọc. `NavRail.dom.test.tsx`: danh sách mục của quản trị thêm "Nhật ký".
- E2E `e2e/admin-audit.spec.ts` (1, desktop): điều phối đăng nhập, huỷ TRIP-012 qua `page.evaluate` (`cancelTrip`), đăng xuất bằng menu
  tài khoản, quản trị đăng nhập trong cùng trang, mở "Nhật ký": ba dòng đầu là quản trị đăng nhập, điều phối đăng xuất, **lần huỷ chuyến**
  (tên, mã, lý do); lọc "Người làm" = Nguyễn Thanh Tùng → mọi dòng của người đó, lần huỷ ngay sau lần đăng xuất; thêm nhóm "Chuyến" → lần
  huỷ đứng đầu, bấm đối tượng mở `/chuyen/TRIP-012`.

Lệnh: `pnpm lint` ✅ · `pnpm exec tsc -b` ✅ · `pnpm test` 99 file / 629 test ✅ · `E2E_PORT=5194 pnpm exec playwright test
e2e/admin-audit.spec.ts` 1/1 ✅.

### Phát hiện, đề xuất

- **Seed (LM-083, không sửa ở đây)**: chuyến đã giao có `loading.completed` muộn hơn `delivery.started` khi nhiều kiện — xếp từ 05:30,
  45 giây/kiện × 230 kiện (TRIP-001) xong 08:23 nhưng xuất phát 07:30. Nhật ký hiện đúng thứ tự thời điểm nên "Xếp xong" nằm sau
  "Xuất phát giao hàng". Đề xuất: xuất phát = xếp xong + ít phút.
- `useListUrlState` chưa nhận cỡ trang mặc định khác 25: màn nhật ký tự giữ `so-dong` (vắng = 50, chọn 25 thì ghi rõ). Đề xuất thêm
  tuỳ chọn `defaultPageSize` cho hook rồi bỏ đoạn này.
- Nhãn loại sự cố giao (`audit.log.issueKinds`) có thể trùng nhãn LM-087 thêm cho màn tài xế — khi gộp nên dùng chung một chỗ.

### Đề xuất sửa AGENTS (người điều phối áp)

- Mục 1 "Trạng thái hiện tại": *Nhật ký `/nhat-ky` (quyền `audit.view`, chỉ quản trị) đọc sự kiện kho qua `features/admin/audit-api.ts`;
  câu hiển thị dựng ở UI bằng `describeEvent` (`audit.actions.*`, `audit.log.params.*`), kho không lưu chữ.*
- Mục 6 "i18n": *Tham số sự kiện nhật ký là dữ liệu: số format theo locale, mã (tên trường, loại sự cố, vai trò, lý do) dịch qua
  `audit.log.*`; chữ người dùng nhập (lý do huỷ, ghi chú) giữ nguyên. Thêm tham số mới vào `ctx.log` thì thêm nhãn `audit.log.params.<tên>`.*
