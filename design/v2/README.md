# LoadMaster V2 — B / Bàn điều phối

B được người dùng chọn làm nền. A chỉ giữ để đối chiếu lịch sử. Đây là prototype biệt lập, không phải FE production và không phải app Flutter.

## Mở bản thử

- `trip-detail.html?layout=b`: bản tương tác mặc định.
- `trip-detail.html?layout=b&package=PKG-003`: inspector kiện dễ vỡ.
- `trip-detail.html?layout=b&scenario=stale`: cần duyệt lại.
- `sketchbook.html`: bảng phác thảo gồm các cảnh, ảnh và liên kết thử.

Vite hiện phục vụ tại `http://127.0.0.1:5182/design/v2/`. Thanh trên cùng là công cụ **duyệt thiết kế**: chọn cảnh, đối chiếu A và tắt kính. Không đưa thanh này vào sản phẩm.

## Những gì hoạt động

- Tìm không dấu; lọc điểm giao/hàng dễ vỡ; hiện bộ lọc và bỏ lọc.
- Sắp xếp tên/điểm/số lượng/kg tăng–giảm bằng tiêu đề cột, `aria-sort` theo trạng thái.
- Chọn kiện theo ID, giữ lựa chọn khi sort; inspector có kích thước, thông số và yêu cầu xếp từ seed.
- Đóng inspector trên đầu panel, Escape, trả focus về kiện. Desktop giữ tóm tắt xe; ≤760px mở dialog dạng sheet với focus trong modal và khoá cuộn nền.
- Đổi viewport khi mở inspector vẫn giữ kiện: sheet ↔ panel.
- Gọn/thoáng; header bảng sticky trong vùng cuộn; navigation phản hồi hover/focus; reduced motion.
- 9 cảnh duyệt: approved, planning, stale, loading, delivering, fetching, error, empty, missing. Các cảnh chỉ đổi UI mẫu, không ghi repository, không gửi API.

## Quyết định visual

- Giữ glass navigation đã duyệt và kính khối tổng hợp. Chữ số cùng màu mực; đơn vị nhỏ hơn. Bảng/inspector có nền đọc rõ.
- Không nhầm “chờ xếp” với “đang xếp”: bước tiếp theo viền nét đứt và có chữ; bước đang chạy nền xanh; bước xong dấu check.
- Nét nền được giới hạn ở vùng tiêu đề, không đi xuyên nội dung tiến trình.
- Bảng phân biệt số loại kiện với tổng số kiện. Không tự thêm timestamp duyệt, ETA hoặc tiến độ giao khi snapshot không có.

## Files

Vòng 08 bổ sung 9 màn desktop: `cargo`, `compare`, `dashboard`, `fleet`, `vehicle`, `users`, `audit`, `profile`, `components` qua `screens.html?screen=...`. Chi tiết mức hoàn thiện: [coverage](../../docs/v2-screen-coverage.md).

- Module `desktop-{cargo,fleet,insights,admin,components}.js` chứa màn; `desktop-ui.js` hỗ trợ chrome/bảng; `desktop.css` định dạng riêng.
- `desktop-snapshot.mock.js` được tạo bởi `capture-desktop-data.mjs` từ seed neo 22/09/2026 và summary hiện tại. Không có mật khẩu. Chỉ cần tạo lại khi chủ động đổi snapshot.
- `sketchbook-desktop.js` đưa 9 màn vào thư viện duyệt, giữ các màn cũ phía dưới.
- `verify-desktop.mjs`: kiểm tương tác và chụp ảnh. `screen-import-errors.png`/`screen-permissions.png` là hai trạng thái chi tiết bổ sung.
- Cargo sửa cục bộ; nhập chỉ kiểm danh sách dán 4 cột, chưa nhập XLSX. Vehicle/profile chỉ kiểm bản nháp, không lưu. Dashboard CSV tải thật từ snapshot. So sánh mở đúng revisionId. User/audit chỉ đọc.
- Menu duyệt tổng hợp vai trò, không thay RBAC production. Tùy chọn nền đặc lưu riêng trong sessionStorage của prototype.

Vòng 07: `screens.html?screen=trips|create|optimize|planner|driver|warehouse|queue`.

- Danh sách: snapshot 7 chuyến từ seed, tìm không dấu, lọc, mật độ, xem nhanh.
- Tạo chuyến: form, chọn xe/chặn tải trọng vượt xe, đổi thứ tự điểm, xem bản nháp. Chưa lưu chuyến; màn tối ưu dùng snapshot cố định.
- Thiết lập tối ưu: yêu cầu xếp, giới hạn thời gian, xem thông số; không tạo job/progress giả.
- Planner: inspector cạnh **ảnh** engine từ `docs/screenshots/handoff`; chọn loại kiện không thay ảnh. Có lối mở viewer thật.
- Tài xế: chọn điểm, đối chiếu nhóm, bản đồ ngoài, nhập sự cố/tên file ảnh.
- Kho: snapshot bước 111/280 TRIP-011 từ ảnh handoff; kiểm mã qua bàn phím/keyboard-wedge. Chưa quét camera hoặc xác nhận bước thật.
- Queue: giữ note/tên file trong sessionStorage, retry lỗi/thành công mô phỏng. Không lưu bytes ảnh, không backend, không phải queue bền hoặc Flutter.

`screens.js`, `screen-ui.js`: chọn màn và chrome dùng chung.
`screens-dispatch.js`, `screens-field.js`: desktop/mobile và tương tác.
`screens.mock.js`, `screens.css`: dữ liệu mẫu và styling.
`verify-screens.mjs`: kiểm 7 màn, xuất ảnh `screen-*.png`.

`trip-detail.html`, `concepts.css`, `trip-detail.js`: màn và tương tác.
`trip-detail.mock.js`: snapshot 6 loại/132 kiện.
`package-detail.js`: inspector/sơ đồ dimensions.
`scenarios.js`: các cảnh mẫu có nhãn rõ.
`sketchbook.html`, `sketchbook.css`: bảng phác thảo.
`verify.mjs`: kiểm prototype, tạo ảnh dùng trong bảng phác thảo.

CSS expressive/manifest/trip-detail cũ và ảnh C là lịch sử, không dùng trong bản hiện tại.

## Kiểm chứng

Chạy `node design/v2/verify.mjs` khi Vite ở cổng 5182. Kiểm tương tác, cảnh, focus, sorting, query link, ảnh phác thảo, không tràn trang tại 1366/1024/768/390px. Ở B 1366×768: đầu bảng y=464, thấy trọn 4 dòng trước khi cuộn; vòng 05 chỉ thấy 2 dòng (đầu bảng y=536).

Chỉ chạy bộ kiểm prototype cho vòng này; không đổi `src/` hay dependency nên không chạy lại full suite production.

Vòng 07: `node design/v2/verify-screens.mjs` pass: render 7 màn, ảnh nguồn, không tràn desktop 1366 và ba màn phone 390, tìm/lọc, validation xe, reorder, escaping, panel Planner, sự cố → queue → retry/remove, mã sai/đúng. Chưa kiểm điện thoại thật.

## Chưa hoàn thành / không nên suy diễn

- Bảng thành phần mới là các mẫu đầu, chưa đủ mọi primitive/state/responsive và ánh xạ Flutter.
- Chưa thiết kế luồng thêm/sửa/nhập kiện V2; hành động chuyển trang mở route hiện tại.
- Snapshot chỉ 6 loại: không suy diễn thành benchmark bảng 1.000 dòng.
- Chưa test hiệu năng blur trên điện thoại thật hoặc hoàn tất kiểm contrast/browser/screen reader toàn diện.
- Chưa tích hợp i18n/RBAC/Query V2, chưa đổi 3D, chưa nối backend.

Nguồn và lịch sử: [brief](../../docs/v2-design-brief.md), [research](../../docs/v2-visual-research.md).

## Mobile 01 — 22/09/2026

Mở `mobile-board.html` để duyệt 9 hình; `mobile.html?view=home&role=driver` hoặc `role=warehouse` để thử luồng. Bảy màn: home/stop/scene/scan/issue/queue/profile. 3D là ảnh chụp engine hiện tại, trình phát đổi metadata theo snapshot 132 placements. Quét camera, upload ảnh, xác nhận nghiệp vụ và queue bền chưa triển khai.

`verify-mobile.mjs` kiểm tương tác, hai vai trò, 360/390/430 px và xuất screenshot. Chi tiết/nguồn nghiên cứu: [mobile brief](../../docs/v2-mobile-sketch.md). Chưa có Flutter hoặc test thiết bị thật.

## Mobile 02 — kế thừa web B

`mobile-board.html` hiện có 15 hình, 8 màn và 4 cảnh trạng thái. Mở `mobile.html?view=home` rồi **Nhận chuyến mẫu** để thử luồng tài xế đầy đủ: điểm giao → hướng dẫn → vị trí từ trên → kiểm mã → xác nhận → kiện tiếp theo. Tài khoản có đặt lại luồng. Navigation dùng cùng vật liệu kính của web B, khối dữ liệu giữ chữ tối và nút chính đặc.

`mobile-home.js`, `mobile-confirm.js`, `mobile-flow.js`, `mobile-position.js` chứa phần bổ sung; `mobile-refinement.css` là lớp visual Mobile 02. `verify-mobile-flow.mjs` kiểm cả mã bị sửa sau khi khớp, mã trùng, xác nhận chưa nhận chuyến, queue retry và đặt lại. `verify-mobile.mjs` giữ regression/ảnh/gallery. Mọi xác nhận chỉ ở sessionStorage, không đổi production hoặc backend.

## Mobile 03 — đăng nhập, cài đặt và bàn giao

Bắt đầu tại `mobile.html?view=login`, bảng `mobile-board.html` có 21 hình / 12 màn. Thêm login/settings/access/about; tài khoản nối cài đặt, hỗ trợ, queue và đăng xuất có nhắc mục chưa gửi. Cài đặt chữ lớn/nền rõ/giảm chuyển động áp dụng trong tab. Đăng nhập là mô phỏng, không lưu mật khẩu, không phải RBAC hay session server.

Bàn giao đầy đủ và prompt cho người tiếp nhận: [v2-mobile-handoff.md](../../docs/v2-mobile-handoff.md). `verify-mobile-account.mjs` kiểm đăng nhập, cài đặt, hết phiên và đăng xuất. Không đổi production hoặc thêm Flutter/backend.
