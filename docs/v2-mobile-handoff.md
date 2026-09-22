# LoadMaster V2 — Bàn giao thiết kế Mobile 03

Cập nhật 22/09/2026. **Đây là prototype HTML/CSS/JS, chưa phải Flutter hoặc app vận hành.** Desktop B là hướng visual đã chọn. Không thay `src/`, dependencies, backend hoặc engine 3D trong vòng mobile này.

## Bắt đầu ở đâu

1. Đọc `AGENTS.md`, [brief V2](v2-design-brief.md) và tài liệu này. Không audit lại toàn repo nếu không cần.
2. Chạy `pnpm exec vite --host 127.0.0.1 --port 5182 --strictPort` nếu chưa có server. Không khởi động thêm nếu cổng đang dùng.
3. Mở `/design/v2/mobile-board.html`: **21 ảnh**, liên kết đến màn tương tác.
4. Mở `/design/v2/mobile.html?view=login`: chọn tài khoản mẫu để đi từ đầu. `taixe@loadmaster.vn` hoặc `kho@loadmaster.vn`, mật khẩu công khai chỉ cho demo: `loadmaster`. Không dùng thông tin thật.
5. Vào Tài khoản → Công cụ duyệt thiết kế → Thử lại luồng nhận chuyến để đặt lại tiến độ mẫu. Thao tác này giữ sự cố nhưng xoá các xác nhận mẫu.

Prototype được Vite phục vụ trực tiếp trong lúc phát triển. Build production hiện tại **không đóng gói các HTML này thành app mobile**.

## Phạm vi đã có

| `view` | Màn | Tương tác chính |
|---|---|---|
| `login` | Đăng nhập | Email/mật khẩu, hiện/ẩn, lỗi, vào vai trò từ tài khoản demo |
| `access` | Hỗ trợ đăng nhập | Hướng dẫn quản trị cấp tài khoản; sao chép nội dung yêu cầu, không gửi email |
| `home` | Công việc | Nhận chuyến mẫu; cảnh ready/loading/empty/error/expired qua `&state=` |
| `stop` | Điểm giao | Chọn 4 điểm, nhóm kiện, mở bản đồ ngoài, tiến độ xác nhận trong phiên |
| `scene` | Hướng dẫn xếp/dỡ | Ảnh engine, chuyển bước/phát metadata, chi tiết kiện và sơ đồ nhìn từ trên |
| `scan` | Đối chiếu mã | Nhập hoặc máy quét bàn phím; chặn sai/trùng/thay mã sau khi khớp |
| `done` | Đã ghi nhận | Xác nhận trong phiên, mục chờ gửi, đi đúng kiện chưa xác nhận tiếp theo |
| `issue` | Sự cố | Loại, mô tả, xem trước ảnh; lưu note/tên file vào queue mẫu |
| `queue` | Thao tác chờ gửi | Pending/failed/sent mô phỏng, retry/remove |
| `profile` | Tài khoản | Cài đặt, hỗ trợ, queue, đăng xuất có nhắc mục chưa gửi, đặt lại luồng |
| `settings` | Cài đặt | Nền rõ, chữ lớn, giảm chuyển động; hướng dẫn camera/ảnh |
| `about` | Thông tin | Vai trò, nền tảng, snapshot và giới hạn bản mẫu |

`role=driver|warehouse` là công cụ duyệt, **không phải RBAC**. Các màn vẫn mở trực tiếp để duyệt; đăng xuất mẫu không phải cơ chế bảo mật hay chặn history/deep link. Xác thực demo chỉ lưu tên vai trò vào sessionStorage, không lưu/gửi mật khẩu. Đăng xuất giữ queue trong tab, không chứng minh cách bảo vệ dữ liệu khi đổi tài khoản trên thiết bị thật.

## Quyết định thiết kế cần giữ

- Nhận diện web B: xanh thương hiệu, Be Vietnam Pro, số/mã JetBrains Mono; kính bao toàn nút navigation, chữ tối và số liệu cùng màu mực.
- Màn nghiệp vụ sáng; canvas tối. Kính cho lớp điều khiển/tổng quan, form và thông tin cần đọc giữ nền rõ. Có giảm kính và giảm chuyển động.
- Điện thoại trước, thao tác chính 56 px; thông tin kiện và điều khiển theo bước ở dưới. Màu điểm giao luôn kèm số/tên.
- Mobile dành cho tài xế/kho, chỉ đọc mô hình; không kéo, xoay hoặc chỉnh placement. Điều phối tiếp tục trên web.
- Đơn vị cm/kg. Không lấy mm từ ảnh concept cũ làm contract.
- Không thêm dark mode toàn app, arbitrary rotations, engine thứ hai, bản đồ riêng hoặc offline-first. Queue gửi lại là hạng mục triển khai V2 nhưng prototype **chưa làm queue bền**.

## File chính

- [mobile.html](../design/v2/mobile.html), [mobile.js](../design/v2/mobile.js), [mobile-ui.js](../design/v2/mobile-ui.js): entry/router prototype/chrome/dialog.
- [mobile-home.js](../design/v2/mobile-home.js), [mobile-work.js](../design/v2/mobile-work.js): công việc và điểm giao.
- [mobile-account.js](../design/v2/mobile-account.js): đăng nhập/hỗ trợ/tài khoản/cài đặt/thông tin; chỉ giả lập xác thực.
- [mobile-confirm.js](../design/v2/mobile-confirm.js), [mobile-flow.js](../design/v2/mobile-flow.js): đối chiếu/xác nhận, state theo vai trò và ID kiện.
- [mobile-scene.js](../design/v2/mobile-scene.js), [mobile-position.js](../design/v2/mobile-position.js): ảnh engine + sơ đồ 2D bằng cm; không renderer mới.
- [mobile-feedback.js](../design/v2/mobile-feedback.js): ảnh/sự cố/queue mẫu.
- [mobile.css](../design/v2/mobile.css), [mobile-refinement.css](../design/v2/mobile-refinement.css), [mobile-account.css](../design/v2/mobile-account.css): nền Mobile 01, lớp visual B Mobile 02 và bổ sung tài khoản Mobile 03. Thứ tự import có ý nghĩa; khi chuyển Flutter cần hợp nhất token, không chép CSS máy móc.
- `mobile-board.html/js/css`, `mobile-*.png`: bảng duyệt và ảnh chụp thực.

Snapshot `mobile-placements.mock.js` lấy 132 placements từ `seedScene()`, ảnh `mobile-engine-overview.png` chụp engine hiện tại. `capture-mobile-scene.mjs` chụp lại ảnh khi cần. Sơ đồ từ trên là phép chiếu 2D, kiện nhiều tầng chồng nhau; cao từ sàn ghi riêng. Không dùng sơ đồ này làm chứng minh kiện dỡ được.

## Trạng thái và cài đặt mẫu

Tất cả chỉ sống trong tab: `lm-mobile-flow-02` (nhận chuyến/xác nhận), `loadmaster-mobile-sketch-queue` (nội dung/tên file), `lm-mobile-demo-session` (vai trò demo), `lm-mobile-solid|large|motion` (hiển thị). Không lưu bytes ảnh, mật khẩu, token xác thực thật. Đừng chuyển nguyên cách lưu này sang app production.

## Kiểm thử để tiếp tục

Khi Vite ở 5182:

```bash
node design/v2/verify-mobile-account.mjs
node design/v2/verify-mobile-flow.mjs
node design/v2/verify-mobile.mjs
```

Ba script kiểm tương tác và sinh ảnh. Chạy account/flow trước khi cần kiểm gallery từ checkout mới để có ảnh trạng thái tương ứng. Viewport 360/390/430 px, touch emulation, kiểm chữ lớn, dialog, nhận chuyến/scan/confirm/queue, đăng nhập theo vai trò, hết phiên và đăng xuất giữ queue. Không phải test điện thoại thật. Các ảnh sau tương tác được chụp ở 390 × 844.

## Phần phải triển khai tiếp

1. Flutter Android: app shell, SafeArea, typography/text scaling, focus/TalkBack, keyboard, navigation và app lifecycle. Tên tương ứng: Login, AccountAccessHelp, WorkHome, DeliveryStop, PlacementGuide, PackageCodeCheck, ConfirmationReceipt, IssueReport, RetryQueue, Account, AppSettings, About.
2. Xác thực/server RBAC, tài khoản khoá, refresh/expiry, đăng xuất và deep link. Bảo vệ queue theo tài khoản/doanh nghiệp, quy tắc đổi người dùng trên thiết bị; prototype chưa giải quyết.
3. Camera scan, ảnh có quyền phù hợp, nén/lưu bền/xoá an toàn. Không hiển thị trạng thái quyền giả.
4. Queue bền: lưu payload và ảnh, retry có backoff, idempotency, trạng thái server và xử lý xung đột. Không nâng phạm vi thành offline-first.
5. Chốt phương án tái sử dụng core 3D hiện tại trên app. Prototype chỉ có ảnh và sơ đồ; chưa chọn bridge/WebView hoặc cách tích hợp Flutter. Không hứa đã có engine Flutter.
6. Nhiều chuyến, xác nhận đến điểm/hoàn tất điểm và chuyến, số kiện thiếu/thừa, quyền và lỗi nghiệp vụ. Hiện chỉ một chuyến snapshot.
7. Nối dữ liệu qua adapter/lớp API riêng tương đương `features/*/*-api.ts` của web. Không lấy state HTML làm domain contract mới.
8. Duyệt trên điện thoại Android thật ngoài trời, bàn phím ảo, chữ lớn, TalkBack, blur/GPU và mất mạng. Tablet/iOS sau.

## Prompt bàn giao gợi ý

> Tiếp tục LoadMaster V2 từ code hiện tại. Đọc AGENTS.md, docs/v2-mobile-handoff.md và mở design/v2/mobile-board.html. Đây là prototype đã có luồng mẫu, chưa là Flutter/production. Giữ nhận diện web B, phone-first cho tài xế và kho, 3D chỉ đọc và cm/kg. Rà phần còn thiếu theo mục cuối tài liệu, báo ngắn phạm vi triển khai đề xuất trước khi thay kiến trúc. Không giả backend/đồng bộ, không viết engine mới hoặc mở rộng offline-first. Chỉ đọc file liên quan; giữ các chỉnh sửa hiện có và ghi lại kiểm chứng cùng giới hạn thực tế.

## Kết quả kiểm tra cuối Mobile 03

Ngày 22/09/2026: `pnpm lint` pass không warning; `pnpm build` pass (cảnh báo chunk 3D lớn hiện có); `pnpm test` 126 files / 776 tests pass. Ba script Playwright mobile ở trên pass. Không chạy lại toàn bộ E2E production vì vòng này không đổi `src/`; chưa nghiệm thu thiết bị thật.
