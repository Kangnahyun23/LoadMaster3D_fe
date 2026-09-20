---
id: LM-101
title: Nghiệm thu đợt 6 — E2E một ngày làm việc 5 vai trò, ảnh vi/en, bàn giao
phase: 6
labels: [acceptance, e2e, docs]
depends_on: [LM-086, LM-087, LM-088, LM-089, LM-090, LM-091, LM-092, LM-093, LM-094, LM-095, LM-096, LM-097, LM-098, LM-099, LM-100, LM-073]
estimate: 1d
prd: [D-40, D-57]
---

# LM-101 — Nghiệm thu đợt 6

## Việc cần làm

- [x] E2E "một ngày làm việc": điều phối tạo chuyến + nhập kiện + tối ưu + duyệt → kho xếp (báo thiếu 1) → tài xế giao (1 sự cố)
      → quản lý xem dashboard + xuất → quản trị xem nhật ký đủ chuỗi sự kiện.
- [x] Bộ ảnh vi/en mới cho mọi màn (`tests/handoff-screenshots.mjs`).
- [x] `acceptance.md` mục 5 (đợt 6) đối chiếu bảng 5 vai trò; `handoff.md`, AGENTS cập nhật.
- [ ] Người dùng thử màn tài xế trên điện thoại thật, ghi kết quả. — **chờ người dùng** (D-57).

## Tiêu chí nghiệm thu

- [x] Lint, build, Vitest, E2E xanh (máy local và CI). Bench chạy tay — CI chưa gọi `pnpm test:bench` (nợ N-15).

## Kết quả (20/09/2026)

**E2E một ngày làm việc** — `e2e/workday.spec.ts`, một kho in-memory, đổi người bằng đăng xuất/đăng nhập trong app (~46 s):

1. Điều phối tạo `TRIP-015` chạy hôm nay (Truck 6m, tài xế Phạm Quốc Dũng, 1 điểm giao), thêm 6 kiện, tối ưu, duyệt, đăng xuất.
2. Kho mở chuyến, báo thiếu 1 kiện ở bước 3; phiên tự xếp xong: "Đã xếp 5 / 6 kiện".
3. Tài xế xuất phát, báo sự cố "Hàng hỏng", dỡ từng kiện của điểm (`stopItemIds`), hoàn tất điểm, thấy "Tổng kết chuyến".
4. Quản lý lọc 7 ngày, thấy chuyến trong bảng kỳ, xuất .xlsx.
5. Quản trị mở `/nhat-ky`, tìm `TRIP-015`: đủ 10 sự kiện, đúng người làm từng việc. Kho kết thúc ở pha `completed`, sự cố `['damaged']`.

Kịch bản bắt được một lỗi thật: toast "Đã duyệt" nằm đè nút Duyệt ở góc phải header Planner, và rê chuột lên toast làm sonner dừng
đếm giờ nên toast không tự tắt. Sửa: `Toaster` đặt `offset`/`mobileOffset` top 80 px — dưới thanh tiêu đề 72 px (Planner 56 px)
(`src/app/providers.tsx`, luật ở AGENTS mục 5).

**Ảnh bàn giao** — `tests/handoff-screenshots.mjs` viết lại cho đợt 6: 24 màn × vi/en = 48 ảnh ở `docs/screenshots/handoff/`.
Mỗi ảnh đăng nhập đúng vai trò của màn (403 chụp bằng tài xế mở `/nguoi-dung`); thêm danh sách chuyến, chuyến đang giao, so sánh,
đội xe, xe bảo dưỡng, nhật ký, người dùng, ma trận quyền, hồ sơ, 403, danh sách chuyến của kho và tài xế, chuông thông báo, tìm nhanh,
hộp nhập kiện. Đồng hồ trang cố định 16:00 hôm nay giờ Việt Nam (chụp lúc sáng sớm thì seed phải lùi mốc giờ); mỗi ngôn ngữ một
trình duyệt với `--lang=vi-VN|en-US` — ô ngày gốc lấy định dạng theo `--lang`, tuỳ chọn `locale` của context không đổi được.

**Tài liệu** — `acceptance.md` mục 5 (bảng 5 vai trò → bằng chứng, nợ N-11 → N-15), `handoff.md` viết lại (tài khoản 5 vai trò, route,
seed, kiến trúc, kiểm thử, nợ), AGENTS cập nhật luật đợt 6 qua từng lần gộp nhóm.

**Lượt CI đầu bắt thêm ba lỗi mà máy dev giấu** (runner GitHub chậm hơn nhiều; sửa ở `fc271d3`):

1. `DataTable` khoá dòng theo **vị trí** (mặc định TanStack). Lọc trong lúc menu thao tác của một dòng đang mở thì dòng bị gỡ khỏi
   DOM — hoặc tệ hơn, menu nằm lại trên dòng của **người khác** và "Khoá tài khoản" chạy nhầm người. Bảng có thao tác theo dòng nay
   truyền `getRowId`; test DOM dựng lại đúng cảnh lọc bỏ các dòng phía trước.
2. Overlay debug coi scene là "nghỉ" khi 250 ms chưa vẽ frame nào — điều luôn đúng khi máy chạy dưới 4 FPS. Hậu quả không chỉ ở test:
   overlay giấu FPS đúng lúc cần đo nhất, và `quality-policy` (bỏ qua mẫu nghỉ) **không bao giờ hạ tier** trên máy yếu. Nay nghỉ =
   demand loop đã dừng (`scene/perf-idle.ts` + unit test). Dựng lại lỗi tại chỗ bằng CDP `Emulation.setCPUThrottlingRate` 40×:
   trước khi sửa, overlay báo nghỉ trong khi số frame vẫn tăng 46 → 93.
3. `i18n-en.spec.ts` sai giả định: tên tài xế và tên xe của seed là **dữ liệu** (không dịch, AGENTS mục 6) nhưng bị tính là chữ Việt
   lọt vào bản en — Radix Select dựng sẵn `<option>` ẩn nên chúng vào DOM khi truy vấn về; và test bấm nút đóng toast, trong khi
   sonner chỉ dừng đếm giờ lúc con trỏ nằm trên toast, nên máy chậm thì toast đã tắt trước khi bấm. Nay lấy tên từ kho và chờ toast tự tắt.

Hai lỗi đầu có từ trước đợt 6: lượt CI của `main` (`751fdc8`) và lượt `2f8b840` (docs trên nền MVP) cũng đỏ vì overlay nghỉ giả.

**Lượt CI thứ hai** (`fc271d3`) còn ba chỗ test tự cho rằng máy nhanh; sửa ở `342d965`, không đụng mã sản phẩm:
`admin-users` bấm nút thao tác của một dòng đúng lúc bộ lọc (có debounce) vừa đáp, nên cú bấm rơi vào chỗ dòng vừa rời đi — nay chờ
bảng lọc xong; `viewer-visuals` lấy mẫu hình dỡ trong 850 ms kể từ lúc bấm, trong khi máy chậm tiêu hết ngần ấy cho quãng bấm →
render → spring — nay đếm từ lúc hình dỡ hiện ra (chờ tối đa 6 giây); `fleet-vehicle-preview` đọc root R3F của canvas đã tra trước đó,
canvas dựng lại thì undefined — nay chờ root của canvas đang có mặt.

**Lượt CI thứ ba** (`342d965`) xanh: 79 test qua, 26,3 phút, còn `admin-users` đỏ lượt đầu rồi qua ở lượt thử lại — cú bấm mở menu
thao tác không ăn. Không dựng lại được ở máy dev kể cả khi bóp CPU 20× và chạy đúng cả luồng (tạo tài khoản → đăng xuất → đăng nhập
lại → lọc), nên E2E bấm lại tới khi menu mở thay vì đứng chờ 4 phút; ghi nợ N-17. Menu đang mở **không** bị đóng khi danh sách người
dùng được đọc lại (đã thử riêng), nên đây không phải lỗi giữ trạng thái dòng.

**Lượt CI thứ tư** (`b708c57`, sau khi E2E bấm lại nút mở menu) xanh trọn: **80/80, 19,6 phút, không lần thử lại nào**.

**Kiểm tra cuối:** `pnpm lint` ✅ · `pnpm build` ✅ · `pnpm test` **776/776** ✅ · `pnpm test:e2e` **80/80** ✅ (15,6 phút, 1 worker)
· `pnpm test:bench` ✅ — dựng + `evaluateAll` 1.000 kiện p95 33,8 ms (ngân sách 50), `evaluateMove` 1,7 ms, `commitMove` 1,5 ms
(ngân sách 8). Lượt chạy ngay sau khi chụp 48 ảnh 3D (máy còn tải) đo 55,2 ms và đỏ: cổng này nhạy với tải máy, chạy lúc máy nghỉ.

**Còn lại:** thử màn tài xế trên điện thoại thật (D-57) — người dùng tự làm; ghi kết quả vào mục này khi có.
