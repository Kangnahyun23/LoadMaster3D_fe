# V2 — Brief thiết kế và vòng duyệt Chi tiết chuyến

Ngày: 21/09/2026. Trạng thái: **đang duyệt visual**, chưa thay giao diện vận hành.

## Quyết định từ người dùng

- Ưu tiên demo/bảo vệ, sau đó pilot một doanh nghiệp; chưa nhắm thương mại.
- Nhóm 5 người, review tiến độ tuần sau. Chưa có ngày bảo vệ, lịch review chính xác hoặc phân công web/Flutter; 3–4 tuần ở trao đổi trước là dự kiến, không là cam kết.
- Chuyên nghiệp, hiện đại và thân thiện. Giải quyết phân cấp thị giác, nhịp bố cục, khả năng tự hiểu và chữ dễ đọc trước.
- Giữ xanh primary, Be Vietnam Pro, JetBrains Mono cho mã/số đo và 8 màu điểm giao. Chữ đứng; không tăng cảm giác kỹ thuật bằng mono cho nội dung thông thường.
- Được thử glassmorphism trên navigation và một số nút; giữ nếu duyệt thấy đẹp và dễ dùng. Giữ nút chính nền đặc, trạng thái chọn/focus rõ, phương án nền đặc thay thế.
- Điều phối desktop và tài xế phone ưu tiên; kho tiếp theo. Thử trên điện thoại trước, tablet sau.
- Desktop mặc định dày, có gọn/thoáng. 10–20 chuyến/ngày, 8–15 xe, 4–8 điểm/chuyến, 100–300 kiện thường xuyên, đỉnh 1.000.
- Vai trò xử lý nối tiếp. Giữ route tiếng Việt, role landing và ranh giới `features/*/*-api.ts`.
- Một engine 3D. Ưu tiên hiểu xếp/dỡ, cảnh báo, chỉnh kiện, animation rồi mới độ chân thực. Demo mode là camera/playback/panel preset. Draw calls mục tiêu <100 tại 1.000 kiện, chưa đo lại ở vòng thiết kế này.
- Bảng thành phần: mẫu tương tác, trạng thái, luật dùng, responsive; Flutter ánh xạ token/tên component, không tự sinh code.
- Flutter: một app cho kho/tài xế, Android trước; thiết kế trước rồi triển khai app chạy được nếu khả thi. Mobile 3D chỉ xem/hướng dẫn, không editor.
- Quét mã kiện kho, ảnh khi báo sự cố, mở bản đồ ngoài; nhận keyboard-wedge nếu có.
- **Hàng đợi gửi lại thuộc V2**. Cần thiết kế trạng thái chờ gửi/đang gửi/đã gửi/thất bại, tránh báo hoàn tất trên server khi chưa có xác nhận. Quyết định lưu bền, ảnh đính kèm, idempotency và cách xử lý revision đổi cần được chốt trước implementation; chưa coi là offline-first.
- Chưa làm dark mode, chữ ký, push thật, bản đồ/định tuyến tự dựng. Polling là hướng đã chọn. Backend không chặn prototype mock.

## Bản đang phát triển — vòng 06 (22/09/2026)

**Người dùng đã chọn B làm nền**, yêu cầu hoàn thiện theo audit và phác thảo thêm. A giữ để đối chiếu, không còn là lựa chọn ngang hàng cần duyệt.

- Thu gọn chrome/tổng quan: B ở 1366×768 thấy trọn 4 dòng kiện, trước là 2; đầu bảng y=464 thay vì y=536. Chữ tiến trình 12px, bỏ motif khỏi vùng chữ tiến trình.
- Thêm sorting tăng/giảm, `aria-sort`, header bảng sticky; giữ tìm/lọc/mật độ và ID selection.
- Inspector rộng 280px, nút đóng ở đầu, Escape/trả focus, giữ tóm tắt xe. Màn ≤760px dùng native dialog dạng sheet, giữ focus trong modal; đổi viewport giữ selection.
- Cảnh “chờ kho” là bước tiếp theo, không hiện như đang xếp. Thêm 9 trạng thái mẫu bằng selector ở thanh review; không ghi dữ liệu nghiệp vụ.
- [Bảng phác thảo](../design/v2/sketchbook.html): xem chuyến, inspector, cần duyệt lại, sheet màn hẹp, liên kết trạng thái và các mẫu thành phần. Chưa phải toàn bộ component library.
- Kiểm prototype riêng Chromium + bốn viewport; chưa test blur trên thiết bị thật, chưa thay production. [Hướng dẫn bàn giao](../design/v2/README.md).

## Vòng 05 (lịch sử, 21/09/2026)

Vòng 04 chưa được duyệt: chất kính đúng hướng nhưng chữ KPI nhiều màu bị từ chối; A/B chưa đủ chi tiết. Vòng 05 giữ hai bố cục, sửa hệ chữ/màu, thống nhất vật liệu kính, thêm chiều sâu cho inspector và trạng thái lọc. Nguồn nghiên cứu, chẩn đoán, đánh đổi và phần chưa kiểm: [v2-visual-research.md](v2-visual-research.md). Không còn gán xanh/cyan/tím cho từng KPI. Bản vòng 05 chỉ là hiệu chỉnh prototype, chưa chốt hướng.

## Quyết định và implementation vòng 04 (lịch sử)

Vòng 03 bị từ chối vì tối, nhợt và thiếu chất kính. Sau 8 câu hỏi, người dùng chọn: kính ở khối nổi bật, bảng nền rõ; vật liệu theo navigation đã duyệt; xanh chủ đạo với màu theo nhóm thông tin; nét nền gợi tuyến/kiện; chuyển cảnh; bỏ slogan, card lặp và gradient/bóng thiếu tiết chế. Duyệt **hai mẫu toàn màn khác biệt**.

- **A · Tổng quan tuyến** (`?layout=a`): navigation dọc; tên tuyến và ba số tổng hợp trên cùng một mặt kính; tiến trình gọn; điểm giao ngang; bảng kiện và thông tin xe bên dưới.
- **B · Bàn điều phối** (`?layout=b`): navigation ngang; tổng hợp gọn; tuyến giao bên trái, bảng rộng ở giữa, panel phương tiện/kiện đang chọn bên phải. Thanh lọc nằm trong một bề mặt riêng phía trên bảng.
- `concepts.css` là stylesheet đang dùng, thay hai lớp CSS của vòng trước. `expressive.css`, `manifest.css` và ảnh C là lịch sử, không phải lựa chọn đang duyệt. Glass highlight bao toàn nút navigation, không quanh riêng icon.
- Nét tuyến phía sau kính là đồ hoạ gợi chủ đề, không phải bản đồ/geolocation. Xanh cho tổng kiện, cyan cho khối lượng, tím cho thể tích; vàng cho yêu cầu dễ vỡ, xanh lá cho bước đã hoàn tất. Bốn màu điểm giao vẫn dành cho định danh điểm.
- Chuyển bố cục và mở chi tiết có chuyển cảnh ngắn; navigation giữ spring. Reduced motion tắt animation. Không tạo tiến độ xếp hàng giả, không thêm hiệu ứng chạy nền liên tục.
- Bộ lọc/tìm không dấu, chọn kiện, đóng chi tiết và trả focus, mật độ và toggle glass hoạt động. Layout ghi vào query string để gửi từng mẫu. Chọn kiện thay panel xe bằng thông tin kiện; đóng để quay lại.
- Kiểm riêng Chromium: hai bố cục ở 1366px, không tràn trang ở 390px, các tương tác trên và không lỗi JS. Chưa benchmark blur trên điện thoại thật; bản hẹp chỉ để mở duyệt, chưa phải thiết kế Flutter.

**Chưa chọn hướng cuối, chưa thay giao diện production.** Các mục vòng 01–03 bên dưới giữ lại để truy vết phản hồi.

## Vòng thiết kế 01

Mở `/design/v2/trip-detail.html` trên Vite. Ba phương án cùng dữ liệu từ `seed-trip.ts`: 6 dòng, 132 kiện, 5.844 kg, 16,55 m³. Ngày minh hoạ cố định 21/09/2026, trạng thái bản duyệt chờ kho.

| Mẫu | Trọng tâm | Điều cần người dùng đánh giá |
|---|---|---|
| A | Dữ liệu, tiến trình thu gọn, bảng dày | Có dễ đọc khi làm lâu không? |
| B | Tiến trình và việc tiếp theo | Có tự hiểu chuyến đang chờ gì không? |
| C | Tổng quan và điểm giao ngang | Sơ đồ có giúp hiểu nhanh hay đẩy bảng xuống quá xa? |

Thử được: chuyển A/B/C, glass/nền đặc, gọn/thoáng, tìm không dấu, lọc điểm, lọc hàng dễ vỡ, mở/đóng chi tiết kiện. Các liên kết navigation và xem 3D đi tới route thật, có thể yêu cầu đăng nhập. Prototype không ghi kho và không giả thành công nghiệp vụ.

Glass dùng bề mặt trong nhẹ, viền sáng, highlight di chuyển theo hover/focus; trạng thái trang hiện tại vẫn có chữ xanh và vạch riêng. Chỉ navigation nổi có bóng nhẹ. Không gradient. Tắt hiệu ứng chuyển động theo reduced-motion, nền đặc khi không hỗ trợ blur. Không dựa vào CSS Anchor Positioning để tránh khóa prototype vào một nhóm trình duyệt.

Đây là mẫu HTML biệt lập trong `design/v2`, không là component production. Nhãn tiếng Việt, dữ liệu snapshot, token cục bộ dùng để duyệt; khi tích hợp phải tái dùng component React, t(), Query và kiểm đầy đủ quyền/trạng thái. Bản phone chỉ kiểm khả năng mở trang duyệt, **không phải thiết kế app Flutter**.

## Kiểm tra

`node design/v2/verify.mjs` với Vite cổng 5182: A/B/C ở 1366, không tràn trang ở 1366/390, bộ lọc, tìm không dấu, trạng thái rỗng, chi tiết/focus trả lại, mật độ, glass và JS runtime. Ảnh cùng thư mục. Không thay app nên không chạy lại toàn bộ lint/build/unit/E2E nghiệp vụ cho vòng này.

## Sau khi chọn visual

### Vòng ý tưởng 02 — Glass rõ hơn (21/09/2026)

Người dùng đánh giá vòng 01 quá giống V1, chưa thấy chất kính. Đã chọn **thay đổi mạnh, nền sáng hơi xanh và màu chuyển nhẹ**; cho phép vượt luật visual cũ trong giai đoạn ý tưởng. `expressive.css` là lớp thử nghiệm riêng, không đổi token app.

- Navigation có kính lồi quanh icon, phản sáng radial gradient, SVG displacement filter và spring easing đúng chuỗi người dùng cung cấp; phép định vị dùng offset để thích ứng navigation dọc/ngang thay vì phụ thuộc anchor API. Tooltip interestfor không sao chép vì navigation đã có nhãn luôn hiện.
- Đoạn CSS gửi chưa có SVG `#filter`; prototype bổ sung filter `#glass-refraction`. Đây là hiệu ứng CSS/SVG thử nghiệm, không tuyên bố tương đương vật liệu native Apple hoặc hoạt động đồng nhất mọi trình duyệt.
- Nền xanh nhẹ/lavender, header xanh chuyển sắc, khối thống kê có chiều sâu, minh hoạ nhóm hàng theo số kiện thật từ snapshot. Minh hoạ ghi rõ không phải vị trí xếp.
- Glass ở navigation/nút phụ; vùng đọc bảng giữ nền sáng ổn định. Có nền đặc dự phòng, reduced-motion và reduced-transparency. Không đổi app sản xuất.
- Tham khảo thêm [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials) và [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): lớp điều hướng/điều khiển và khả năng đọc nội dung. Đây là tham chiếu thiết kế, chưa phải chứng minh hiệu quả với người dùng LoadMaster.
- Đánh đổi cần duyệt: header giàu visual tăng chiều dài trang; cần chốt mức gọn trước khi đưa vào màn làm việc hằng ngày. Chưa benchmark blur trên điện thoại thật.

### Các bước tiếp theo

### Vòng ý tưởng 03 — Hồ sơ chuyến (21/09/2026)

Phản hồi: navigation kính đã đúng ý, nhưng bỏ kính riêng quanh icon. Người dùng không chấp nhận chi tiết chuyến dạng banner gradient, slogan, minh hoạ trang trí và các card đều nhau. Cho phép tự chọn màu/chi tiết cần thiết để có hướng thẩm mỹ rõ.

- Giữ navigation kính và spring, phản sáng bao **toàn nút**, không còn lens dọc quanh icon; trạng thái trang hiện tại giữ riêng với hover/focus.
- Hướng mới: hồ sơ vận tải có hệ thống căn lề; giấy trắng hơi ấm trên chrome xanh nhẹ, chữ than/navy, các đường phân cách mảnh. Tên tuyến là tiêu đề, ngày chạy và thao tác ở cùng hàng. Không slogan, hero gradient, cargo sculpture hoặc card KPI.
- Một hàng tổng số; thanh tiến trình gọn; bốn điểm giao nối nhau và lọc bảng; bảng kiện là vùng làm việc, phương tiện ở cột phụ.
- Thêm thông tin có ý nghĩa từ snapshot: tỷ lệ khối lượng 61,5% và tỷ lệ thể tích 40,8%; thể tích không được gọi là bảo đảm xếp vừa. 22 kiện dễ vỡ có sẵn trong seed.
- `manifest.css` thay lớp `expressive.css` trong trang duyệt; file expressive giữ làm lịch sử chưa dùng. Prototype không thay production.
- Research: [Linear redesign](https://linear.app/now/how-we-redesigned-the-linear-ui) — thứ bậc chrome/content, density, alignment và kiểm nhiều trạng thái; [Figma UI3](https://www.figma.com/blog/behind-our-redesign-ui3/) — tách công cụ với công việc chính; [Carbon patterns](https://carbondesignsystem.com/patterns/overview/) — tổ hợp component theo nhiệm vụ. Áp dụng có chọn lọc, không sao chép appearance hoặc tuyên bố đã có user validation.
- Kiểm riêng tiếp tục đạt: bộ lọc/tìm, chi tiết/focus, density, A/B/C, full-button glass, tỷ lệ từ seed, không tràn trang 1366/390. Ảnh mới ghi đè ảnh vòng duyệt; chưa đánh giá trên thiết bị thật.

1. Chốt một hướng cùng biến thể glass, cỡ chữ và mật độ.
2. Áp chuẩn vào Bảng thành phần: navigation, header, button, tab, badge, bảng và trạng thái; giữ các luồng đang chạy.
3. Triển khai Chi tiết chuyến trong app với quyền, i18n và dữ liệu thật từ mock repository; kiểm 1366 và luồng nghiệp vụ.
4. Thiết kế tài xế phone, kho phone, quét mã/sự cố/queue; xác định cách nhúng 3D đọc trong Flutter bằng thử nghiệm trên điện thoại thật.
5. Chỉ sau kiểm chứng mới chốt lịch app chạy được. Không tuyên bố Flutter, queue hay backend đã triển khai trong vòng này.

Tham chiếu: [glass tab](https://freefrontend.com/css-glassmorphism/#2026-03-03-anchored-glassmorphic-tab-indicator-l), [Linear](https://linear.app/now/behind-the-latest-design-refresh), [Carbon table](https://carbondesignsystem.com/components/data-table/usage/), [Flutter adaptive](https://docs.flutter.dev/ui/adaptive-responsive).

## Vòng 07 — phác thảo các màn tiếp theo (22/09/2026)

Bổ sung 7 màn theo hướng B trong `design/v2/screens.html`: danh sách chuyến, tạo chuyến, thiết lập tối ưu, Planner, tài xế phone, kho phone và queue. Sketchbook là điểm mở đầu để duyệt từng màn. Prototype có tương tác cục bộ, không ghi mock repository production. Planner dùng ảnh tham chiếu; queue chỉ lưu note/tên file trong sessionStorage, không lưu ảnh/gửi mạng và chưa là Flutter. Chi tiết và cách kiểm tại `design/v2/README.md`.

Còn thiếu: thêm/sửa/nhập kiện, so sánh phương án, danh sách chuyến kho/tài xế, đội xe, dashboard quản lý, người dùng/phân quyền, hồ sơ và bảng thành phần đầy đủ. Các màn mới là vòng đầu để duyệt bố cục, chưa phải nghiệm thu design system V2.

## Vòng 08 — Desktop trước mobile (22/09/2026)

Thêm 9 màn desktop theo hướng B, có dữ liệu snapshot truy được về seed. Phạm vi, nguồn nghiên cứu, kiểm chứng và những luồng còn thiếu được tập trung tại [v2-screen-coverage.md](v2-screen-coverage.md). Không coi đây là nghiệm thu V2 production. Người dùng yêu cầu hoàn thiện desktop trước rồi mới phát triển tiếp giao diện mobile; các mẫu mobile vòng 07 giữ nguyên để tham chiếu.
