const screens = [
  ['cargo','01 / Dữ liệu đầu vào','Kiện hàng & kiểm lỗi nhập','Bảng kiện rộng, panel sửa ngay cạnh. Thử số lượng, kích thước và danh sách nhập có lỗi.'],
  ['compare','02 / Ra quyết định','So sánh phương án','Chọn đúng bản lưu, chỉ hiện khác biệt và giải thích quan hệ kết quả chạy với bản duyệt.'],
  ['fleet','03 / Phương tiện','Danh sách đội xe','Lọc xe sẵn sàng, đang phục vụ và bảo dưỡng; mở cấu hình cụ thể.'],
  ['vehicle','04 / Cấu hình','Lòng thùng & vật cản','Thông số cửa, tải trọng và sơ đồ nhìn từ trên. Có form xe mới và kiểm giới hạn cửa.'],
  ['dashboard','05 / Quản lý','Tổng quan vận hành','Chọn kỳ, đọc số tổng hợp từ seed, xem chuyến và tải bảng CSV mẫu.'],
  ['users','06 / Quản trị','Người dùng & phân quyền','Tìm/lọc 12 tài khoản, xem hồ sơ bên cạnh và ma trận 13 quyền của 5 vai trò.'],
  ['audit','07 / Truy vết','Nhật ký hệ thống','115 sự kiện seed, lọc theo người/mã chuyến/nhóm, phân trang và mở chi tiết.'],
  ['profile','08 / Cá nhân','Hồ sơ & tùy chọn hiển thị','Kiểm định dạng thông tin; thử nền đặc thay kính trong bộ desktop.'],
  ['components','09 / Tài liệu chung','Bảng thành phần V2','Nút, form, lỗi, hộp thoại, trạng thái rỗng và ánh xạ token/tên sang Flutter.'],
];
document.querySelector('#desktop-expansion').innerHTML = `<div class="gallery-heading"><h2>Vòng 08 · Bổ sung desktop</h2><span>9 màn mới · Bấm ảnh để thử</span></div><div class="gallery-grid">${screens.map(([key,step,title,desc])=>`<a class="gallery-item" href="./screens.html?screen=${key}"><div class="gallery-image"><img src="./screen-${key}.png" alt="Phác thảo ${title}" loading="lazy"></div><div><small>${step}</small><h3>${title}</h3><p>${desc}</p><span>Mở phác thảo →</span></div></a>`).join('')}</div><div class="coverage-note"><strong>Desktop trước, mobile sau</strong><p>Đã phủ các màn công việc desktop chính ở mức prototype. Còn bước sâu: sửa tài khoản, bảo dưỡng xe, nhập Excel hoàn chỉnh, loading/error trên mọi màn và kiểm khả năng truy cập. Đăng nhập, 403/404, tìm nhanh và thông báo chưa có bản V2 riêng. Mobile hiện giữ 3 bản đầu để phát triển ở vòng kế tiếp.</p></div>`;
