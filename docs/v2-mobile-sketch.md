# V2 — Mobile 01 · 22/09/2026

Trạng thái: **phác thảo tương tác để duyệt**, chưa là app Flutter hoặc giao diện production. Desktop tạm dừng theo yêu cầu người dùng. Không đổi `src/`, domain, dependencies hay backend.

## Mở và duyệt

- [Bảng 9 hình](../design/v2/mobile-board.html) → mở qua Vite `/design/v2/mobile-board.html`.
- `/design/v2/mobile.html?view=home&role=driver`: tài xế.
- `/design/v2/mobile.html?view=home&role=warehouse`: kho.
- `view=scene&role=driver&stop=2`: hướng dẫn dỡ tại điểm 2.
- `view=scene&role=driver&warning=1`: mẫu cảnh báo, không phải kết quả geometry.

## Hướng thiết kế

Ảnh tham chiếu của người dùng được áp vào bố cục: xe lớn ở trên, thông tin kiện và điều khiển theo bước ở đáy. Màn nghiệp vụ giữ nền sáng; chỉ vùng mô hình tối. Không đưa editor hoặc bảng điều phối lên điện thoại. Kính giới hạn ở điều hướng và công cụ nổi, có nền đặc trong Tài khoản. Nút thao tác chính cao 56 px; số điểm giao luôn đi cùng màu.

Tài xế: Công việc → Điểm giao → Hướng dẫn dỡ → Đối chiếu mã. Kho: Công việc → Hướng dẫn xếp → Đối chiếu mã. Cả hai có báo sự cố, xem ảnh trước khi gửi và hàng đợi mẫu. Điều hướng chính có ba đích thực: Công việc / Chờ gửi / Tài khoản; màn chi tiết có quay lại, không giữ tab chiếm chỗ.

## Tương tác và giới hạn

| Phần | Đã thử được | Chưa triển khai |
|---|---|---|
| Công việc / điểm giao | Một chuyến mẫu, chọn 4 điểm, nhóm kiện, bản đồ ngoài | Danh sách nhiều chuyến, xuất phát, hoàn tất giao |
| Hướng dẫn | Bước trước/sau, slider, phát thông tin kiện; 132 bước xếp và dỡ theo điểm | Xoay xe, highlight đúng kiện trong ảnh, animation xếp/dỡ |
| Chi tiết kiện | ID, kích thước sau đặt, kg, vị trí cm, dễ vỡ | Chỉnh sửa mobile (ngoài phạm vi) |
| Kiểm mã | Nhập, máy quét bàn phím, báo đúng/sai | Quét camera, xác nhận nghiệp vụ |
| Sự cố / ảnh | Form, xem trước file ảnh | Upload, lưu bytes ảnh và backend |
| Chờ gửi | sessionStorage giữ note/tên file, mô phỏng lỗi và retry | Queue bền trên thiết bị, tự đồng bộ, bảo vệ trùng thao tác |
| Tài khoản | Nhận diện vai trò mẫu, giảm kính | Đăng nhập Flutter, quyền thực, đăng xuất app |

`mobile-engine-overview.png` chụp từ viewer hiện có bằng `capture-mobile-scene.mjs`. `mobile-placements.mock.js` chứa 132 placements lấy từ `src/test/scene.ts` → `seedScene()`, không bịa thứ tự. Bản mẫu dùng cm/kg; trình phát chỉ thay metadata, ảnh tổng quan không đổi. Link mở viewer thật đi sang FE hiện tại và chịu kiểm quyền của FE.

## Nghiên cứu đã áp dụng

- [Android: Layout and navigation patterns](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns): navigation chính chỉ cho các đích cùng cấp; chọn ba đích thực, dùng điều khiển theo tác vụ ở màn con.
- [Flutter: SafeArea & MediaQuery](https://docs.flutter.dev/ui/adaptive-responsive/safearea-mediaquery): dành vùng an toàn trên/dưới; HTML dùng `env(safe-area-inset-*)`, triển khai Flutter cần SafeArea và kiểm text scaling.
- Bottom sheet phù hợp xem thông tin kiện theo nhu cầu. Bản HTML dùng native dialog, Escape, focus trong modal; chưa thay thế kiểm TalkBack trên Android.

## Bàn giao Flutter sau duyệt

Tên tương ứng: WorkHome, DeliveryStop, PlacementGuide, PackageSheet, PackageCodeCheck, IssueReport, RetryQueue, Account. Dùng chung màu/nhận diện và semantics, không sao chép CSS. Driver/kho đổi nội dung theo role, mobile 3D chỉ đọc. Bước tiếp cần chốt phương án tích hợp engine hiện tại, scanner/camera, lưu queue/ảnh bền và API idempotency; không tự coi prototype là đã giải quyết chúng.

## Kiểm chứng

`node design/v2/verify-mobile.mjs`: pass 7 màn, 2 vai trò, 360/390/430 px, không tràn ngang; chuyển bước/phát, dialog, chọn điểm, đúng/sai mã, preview ảnh, retry/remove và nền đặc. Ảnh `mobile-*.png` là screenshot thật của prototype. Chưa kiểm điện thoại thật, GPU/blur, TalkBack, bàn phím ảo, text scale lớn hoặc iOS.

Tiếp theo cần duyệt bố cục rồi hoàn thiện xác nhận thao tác, nhiều chuyến, trạng thái rỗng/tải/lỗi và phiên hết hạn. Đây là vòng sơ bộ, chưa nghiệm thu mobile V2.

Kiểm tra repo cuối vòng: `pnpm lint` pass; `pnpm build` pass (cảnh báo chunk 3D lớn hiện có); `pnpm test` 126 files / 776 tests pass. E2E tập trung dùng `verify-mobile.mjs` với Playwright; không chạy lại toàn bộ suite E2E production vì không đổi `src/`. Gallery kiểm đủ 9 ảnh, không tràn ở 390/1366 px.

## Mobile 02 — hoàn thiện theo web B (22/09/2026)

**Đã bổ sung:** cùng lớp kính, phản sáng và viền của web B; navigation bọc cả nút, số liệu dùng màu mực và mono. Tổng quan có tuyến 4 điểm, xe, số kiện và hành động nhận chuyến. Các khối đọc chi tiết giữ nền rõ.

Luồng nhận chuyến mẫu → chọn điểm → xem hướng dẫn → sơ đồ vị trí → kiểm mã → xác nhận thao tác → màn đã lưu → kiện chưa xác nhận kế tiếp. Tiến độ theo điểm tính từ thao tác đã làm trong phiên. Mã sai, mã trùng, mã đã đổi sau khi khớp và tài xế chưa nhận chuyến đều chặn xác nhận. Hộp thoại yêu cầu đối chiếu thao tác thực tế trước khi lưu. Nhận chuyến được giữ riêng cho từng vai trò trong phiên.

Xác nhận tạo một mục chờ gửi; retry lỗi/thành công vẫn là mô phỏng. Tài khoản có đặt lại luồng với dialog xác nhận, giữ các sự cố mẫu. Có cảnh chưa có chuyến, tải, lỗi tải và hết phiên qua thanh duyệt trên màn công việc. Vẫn chỉ một chuyến snapshot; chưa phải danh sách nhiều chuyến thực.

Sơ đồ 2D từ trên dùng vị trí/kích thước cm của 132 kiện và thùng snapshot 720 × 235 cm; kiện được chọn có viền xanh. Đây là phép chiếu: các lớp cao chồng lên nhau, cao từ sàn hiển thị riêng. Không khẳng định khả năng dỡ và không phải renderer 3D mới. Ảnh xe trong vùng chính vẫn cố định.

**Kiểm chứng:** `verify-mobile-flow.mjs` pass luồng đầu-cuối, các chặn xác nhận, retry, reset và 4 cảnh trạng thái; trình duyệt Chromium có touch/isMobile. `verify-mobile.mjs` pass regression, 360/390/430 px và bảng 15 ảnh. Đã kiểm ảnh dialog, màn đã lưu và sơ đồ vị trí. Không coi đây là kiểm thiết bị thật.

**Vẫn còn:** camera scan, ảnh lưu bền, queue bền/idempotency, xác nhận/hoàn tất điểm giao phía server, nhiều chuyến, viewer 3D nhúng Flutter, TalkBack/text scaling và thử ngoài trời. Không thay source production, không thêm dependency hoặc code Flutter. Mobile 01 ở trên được giữ làm lịch sử vòng đầu.

Kiểm tra cuối Mobile 02: lint/build pass; 126 files / 776 tests pass. Build vẫn có cảnh báo chunk 3D lớn hiện có. E2E dùng hai bộ Playwright prototype nêu trên; không chạy lại toàn bộ E2E production.


## Mobile 03 — tài khoản và cài đặt (22/09/2026)

Thêm 4 màn login/settings/access/about, tổng 12 màn và 21 ảnh gallery. Đăng nhập demo vào đúng vai trò từ email, hiện/ẩn mật khẩu, lỗi tại chỗ; hỗ trợ chỉ sao chép yêu cầu, không gửi email/reset giả. Hết phiên quay vào login mobile. Tài khoản nối cài đặt và đăng xuất; có nhắc số mục chờ, giữ queue trong tab. Đây không phải cơ chế xác thực/route guard production.

Cài đặt nền rõ, chữ lớn, giảm chuyển động áp dụng xuyên màn; giải thích camera/ảnh qua dialog, không giả trạng thái quyền. Đã kiểm 360/430 px với chữ lớn và các luồng login/expiry/logout qua `verify-mobile-account.mjs`; hai bộ regression mobile cũ vẫn pass. Không thử thiết bị thật.

Nguồn bàn giao hiện tại: [v2-mobile-handoff.md](v2-mobile-handoff.md), có danh sách file, state, cách chạy, mapping Flutter, phần cần triển khai và prompt tiếp tục. Các mục Mobile 01/02 phía trên là lịch sử.
