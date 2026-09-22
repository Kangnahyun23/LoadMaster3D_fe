# V2 — Nghiên cứu và hiệu chỉnh visual, 21/09/2026

## Phản hồi làm chuẩn

Vòng 04 chưa được duyệt. Người dùng chấp nhận chất kính nhưng không chấp nhận số liệu xanh/cyan/tím, phối màu tuỳ tiện, bề mặt kính không nhất quán và thành phần còn sơ sài. Cả A/B đều cần phát triển tiếp. Không được hiểu yêu cầu này thành giảm toàn bộ giao diện về trắng/xám hoặc thay kính đã được duyệt.

## Nguồn và cách áp dụng

Đây là desk research từ nguồn chính chủ, không phải thử nghiệm người dùng hoặc chứng minh rằng một kiểu UI được mọi người ưa thích. Đã kiểm tra skill sẵn có: không có product-design chuyên dụng trong phiên; Visualize dành cho trình bày tương tác trong hội thoại. Tra cứu plugin không làm phát sinh cài đặt hay kết nối bên ngoài. Research tiếp tục bằng tài liệu web chính chủ.

| Nguồn | Điều học được | Áp dụng vào LoadMaster | Không sao chép |
|---|---|---|---|
| [Apple — Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/), phần Principles | Phân biệt lớp điều khiển và nội dung; tránh kính chồng kính; tint có chọn lọc, tính dễ đọc quyết định vật liệu | Giữ navigation nổi; bề mặt kính cùng hướng sáng, blur và phản sáng; bảng đọc nền đặc; số liệu màu mực thống nhất | Không tuyên bố CSS mô phỏng có lensing/adaptivity của native Liquid Glass. Khối tổng quan kính là ngoại lệ theo yêu cầu người dùng, không phải áp dụng nguyên xi Apple |
| [Linear — How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui) | Căn chỉnh sidebar/header/panel, phân cấp, quan hệ giữa màu nền–accent–tương phản; kiểm thiết kế qua nhiều view/state | Một màu chữ chính; xanh thương hiệu cho hành động và selection; nhãn/số/đơn vị có cấp bậc; A và B dùng chung vật liệu | Không chép dark UI, chữ quá nhỏ hoặc layout quản lý issue vào vận tải |
| [Carbon — Data table usage](https://carbondesignsystem.com/components/data-table/usage/) | Thanh công cụ có vị trí nhất quán; phân biệt bảng, lựa chọn và chi tiết mở thêm | Tìm/lọc/mật độ cạnh nhau; hiển thị điều kiện đang lọc; chọn dòng mở inspector; đóng trả focus | Không thêm bulk actions/phân trang giả cho snapshot chỉ có 6 dòng |

## Chẩn đoán cụ thể

1. Ba KPI màu riêng không mã hoá trạng thái hoặc nhóm cần đối chiếu. Nó tạo ba điểm nhấn cạnh tranh, khiến khối tổng hợp trông như bộ card mẫu.
2. Nền kính và chữ cùng nhiều sắc độ làm cảm giác màu bị cộng dồn. Vật liệu có thể giàu màu nhẹ, nhưng chữ phải có hệ thống ổn định.
3. Glass trước đây được khai báo riêng cho từng section, khác độ mờ và phản sáng. Cần một công thức chung, biến thể chỉ khi có vai trò khác nhau.
4. Panel chi tiết chỉ lặp ba dòng chữ, chưa hỗ trợ người điều phối kiểm tra kiện; thao tác lọc thiếu câu trả lời rõ đang xem tập con nào.
5. A vẫn đẩy bảng khá sâu ở viewport 1366×768; B đưa bảng lên sớm hơn nhưng inspector hẹp. Đây là đánh đổi bố cục chưa được người dùng duyệt, không phải hai phương án đã hoàn thiện.

## Quy tắc vòng 05

- **Chữ:** số tổng hợp cùng màu `#243142`; nhãn và đơn vị `#54657a`. Khác biệt bằng cỡ/đậm/căn hàng, không tô màu từng con số. Bỏ vạch KPI nhiều màu.
- **Màu:** primary cho hành động/chọn; xanh lá cho hoàn tất; vàng cho cần chú ý; màu điểm giao đi với số/tên điểm. Hai meter tải/thể tích cùng primary vì không phải hai trạng thái cảnh báo.
- **Vật liệu:** giữ nền kính đã duyệt. Heading/metrics/route dùng chung fill, blur 9px và saturation 1.35; phản sáng cùng phía. Navigation giữ công thức riêng đã duyệt, highlight bao trọn nút. Table và inspector đọc chi tiết không thêm kính bên trong kính.
- **Chi tiết hữu ích:** kích thước ngay dưới tên kiện; khối lượng thật theo điểm; điều kiện lọc và nút bỏ lọc; inspector có sơ đồ kích thước theo tỷ lệ, thông số đơn kiện/tổng nhóm, điểm giao và tải tối đa đặt lên trên. Không thêm ETA, người duyệt, timestamps hay trạng thái xử lý không có trong snapshot.
- **Motion:** chuyển cảnh ngắn theo thao tác; giữ spring navigation; không thêm chuyển động trang trí vô hạn. Reduced motion vẫn tắt animation.

## Khả thi và giới hạn

Thay đổi chỉ ở prototype HTML/CSS/JS, không thêm dependency, không tải Three.js. Sơ đồ kiện là SVG theo dimensions, không phải vị trí xếp hoặc mô phỏng. Các con số mới derive từ snapshot hiện tại; kg/cm giữ nhất quán, thể tích đơn kiện hiển thị lít.

Vòng này kiểm Chromium 1366px, viewport 390px, lọc/tìm, focus khi đóng inspector, density, toggle kính; xác nhận các KPI chung màu. Chưa đo hiệu năng blur/độ đọc ngoài trời trên điện thoại thật. Chưa kiểm toàn bộ browser/a11y và chưa thay FE production.

## Hướng phát triển sau vòng này

Nhận định thiết kế: B có triển vọng cho thao tác điều phối vì tuyến–danh sách–kiện được chọn xuất hiện cùng vùng làm việc. A phù hợp xem tổng quan, cần giảm chiều cao nếu dùng hằng ngày. Chưa coi đây là quyết định của người dùng.

Vòng kế tiếp nên duyệt các trạng thái cụ thể: tất cả kiện → lọc một điểm → chọn kiện dễ vỡ → không có kết quả. Khi các trạng thái này đủ rõ mới mở rộng sang bảng thành phần toàn sản phẩm. Tránh tiếp tục tạo thêm theme hoặc đổi toàn bộ palette trước khi chốt cấu trúc.
