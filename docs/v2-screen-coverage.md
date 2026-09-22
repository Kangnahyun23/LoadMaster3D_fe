# V2 — Phạm vi phác thảo màn hình

Cập nhật 22/09/2026, vòng 08. **Desktop trước, mobile sau** theo yêu cầu mới nhất.
Đây là prototype trong `design/v2`, chưa thay production React hoặc triển khai Flutter.

## Đối chiếu desktop với router / feature hiện tại

| Màn / luồng | Phác thảo | Mức thực hiện |
|---|---|---|
| Danh sách chuyến | `screens.html?screen=trips` | Tìm/lọc, mật độ, xem nhanh |
| Tạo / sửa chuyến | `screens.html?screen=create` | Tạo bản nháp, chọn xe, thứ tự điểm, validation; sửa sâu chưa có |
| Chi tiết chuyến | `trip-detail.html?layout=b` | Tương tác, inspector, 9 cảnh review |
| Kiện / kiểm tra nhập | `screens.html?screen=cargo` | Sửa mẫu trong trang, kiểm 4 trường dữ liệu dán; chưa nhập XLSX hoàn chỉnh |
| Thiết lập tối ưu | `screens.html?screen=optimize` | Kiểm đầu vào và lựa chọn; chưa tạo job trong prototype |
| So sánh phương án | `screens.html?screen=compare` | REV-001/002 thật trong seed, chọn bản, chỉ khác biệt, mở đúng revision |
| Planner | `screens.html?screen=planner` | Bố cục inspector quanh ảnh tham chiếu; mở engine thật bằng link |
| Đội xe | `screens.html?screen=fleet` | 8 xe, lọc trạng thái/tên, vào chi tiết |
| Chi tiết / thêm xe | `screens.html?screen=vehicle` / `&new=1` | Form mẫu, kiểm cửa, trạng thái khoá, sơ đồ vật cản; chưa lưu/bảo dưỡng |
| Dashboard quản lý | `screens.html?screen=dashboard` | 2 kỳ từ hàm summary hiện tại, CSV tải thật của snapshot |
| Người dùng / quyền | `screens.html?screen=users` | 12 tài khoản, 5 vai trò, 13 quyền, inspector; chưa thêm/sửa/khoá |
| Nhật ký | `screens.html?screen=audit` | 115 sự kiện seed, tìm/lọc, phân trang, chi tiết |
| Hồ sơ | `screens.html?screen=profile` | Kiểm họ tên/điện thoại, tùy chọn nền đặc; chưa lưu/đổi mật khẩu |
| Bảng thành phần | `screens.html?screen=components` | Specimen tương tác + token/tên Flutter; chưa bao phủ toàn bộ component |
| Đăng nhập / 403 / 404 | Chưa phác thảo V2 | Production hiện có |
| Tìm nhanh / thông báo | Chưa phác thảo V2 | Production hiện có; không phải route riêng |

Menu prototype tổng hợp nhiều vai trò để duyệt màn. **Không phải đề xuất bỏ RBAC**; khi đưa vào app vẫn lọc route/nav/hành động theo quyền.

## Nguồn dữ liệu và nghiên cứu

- `capture-desktop-data.mjs` đọc `buildSeed('2026-09-22')`, kho riêng và `summarizeDashboard`; xuất `desktop-snapshot.mock.js`. Không xuất passwords, không đọc/ghi phiên app đang dùng. Snapshot không chạy theo ngày hiện tại.
- So sánh giữ đúng sự thật: REV-002 duyệt từ REV-001, số liệu bằng nhau; runtime 0 của seed được ghi “Không đo”, không biến thành tuyên bố nhanh hơn.
- Cargo dùng snapshot 6 loại / 132 kiện của prototype cũ. Dữ liệu thay trong trang không lan sang prototype khác hoặc repository.
- [Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): dành đủ chiều rộng cho bảng, toolbar gần bảng, chi tiết mở theo nhu cầu. Áp vào cargo/users/audit; không bê thư viện hoặc zebra rows.
- [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials): tham chiếu phân lớp vật liệu. Quyết định dự án vẫn là kính ở chrome/tổng hợp, bảng/biểu mẫu nền rõ và số liệu cùng màu mực.

## Kiểm chứng vòng 08

- `node design/v2/verify-desktop.mjs`: 9 màn, ảnh chụp 1366, không tràn ngang; sửa kiện, kiểm dữ liệu nhập, chọn revision, xe/form, dashboard/CSV, quyền, nhật ký, hồ sơ, specimen.
- `node design/v2/verify-screens.mjs`: 7 màn vòng trước vẫn pass, gồm ba viewport điện thoại và queue/scan mẫu. Gallery có 16 link màn, ảnh desktop mới tải được, không tràn ngang tại 1366.
- `pnpm lint`: pass, không cảnh báo sau dọn import thừa.
- `pnpm build`: pass; vẫn có cảnh báo chunk lớn của app 3D hiện tại.
- `pnpm test`: 126 files / 776 tests pass. Không thay code `src/`.
- Prototype chưa được thử trên điện thoại thật; kiểm 390 px chỉ là regression cho 3 mẫu mobile cũ, không nghiệm thu mobile V2.

## Việc còn lại trước / sau khi chuyển mobile

1. Duyệt bố cục desktop và hoàn thiện các luồng sâu đánh dấu ở bảng; thêm trạng thái tải/lỗi, thao tác nguy hiểm, nhập XLSX và kiểm khả năng truy cập.
2. Hoàn thiện login/403/404, tìm nhanh/thông báo và hợp đồng component. Chưa thể gọi design system hoàn tất chỉ vì có screenshot.
3. Mobile vòng tiếp: danh sách chuyến tài xế/kho → chi tiết công việc → xác nhận → sự cố/ảnh → queue; 3D chỉ đọc, hướng dẫn xếp/dỡ; nút 56 px.
4. Flutter là triển khai riêng sau duyệt, cùng token/ngôn ngữ nhưng bố cục phù hợp điện thoại. Chưa có code Flutter trong repo này.

## Bổ sung Mobile 01 — 22/09/2026

Đã phác thảo 7 màn riêng cho điện thoại (2 vai trò), có bảng 9 ảnh và luồng tương tác. Xem [mobile brief](v2-mobile-sketch.md) cho coverage, giới hạn và kiểm chứng. Phần mobile sơ bộ không còn là ba màn co lại từ desktop. Chưa có xác nhận nghiệp vụ, nhiều chuyến, camera scan, queue bền hoặc app Flutter.

Mobile 02 bổ sung màn đã ghi nhận, luồng xác nhận có kiểm mã/chặn trùng, nhận chuyến theo vai trò, 4 cảnh trạng thái và sơ đồ vị trí 2D. Bảng duyệt tăng lên 15 hình. Chi tiết tại [mobile brief](v2-mobile-sketch.md); các giới hạn Flutter/3D/queue bền vẫn còn.

Mobile 03 bổ sung login/settings/access/about, nối profile và logout, tổng 12 màn / 21 ảnh. Xem [bàn giao Mobile 03](v2-mobile-handoff.md); prototype được phép truy cập trực tiếp để duyệt, không phải xác thực hoặc RBAC thật.
