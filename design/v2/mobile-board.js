const groups={
 'account-phones':[
  ['mobile-login.png','Đăng nhập theo vai trò','Email, hiện/ẩn mật khẩu, lỗi tại chỗ. Tài khoản mẫu mở đúng công việc của tài xế hoặc kho.','login','driver'],
  ['mobile-settings.png','Cài đặt riêng trên điện thoại','Nền rõ, chữ lớn, giảm chuyển động; mở hàng đợi và hướng dẫn camera/ảnh.','settings','driver'],
  ['mobile-access.png','Khi không đăng nhập được','Kiểm tra thông tin, liên hệ quản trị và sao chép nội dung yêu cầu. Không giả gửi email.','access','driver'],
 ],
 'account-detail-phones':[
  ['mobile-logout.png','Đăng xuất khi còn việc chưa gửi','Nhắc số mục đang chờ; có lối quay lại hàng đợi. Đăng xuất mẫu giữ dữ liệu trong tab.','profile','driver'],
  ['mobile-login-expired.png','Đăng nhập lại sau hết phiên','Giải thích vì sao phải đăng nhập; không làm người dùng nhầm thao tác chưa gửi đã mất.','login','driver&expired=1'],
  ['mobile-about.png','Thông tin bản mẫu','Rõ nền tảng dự kiến, dữ liệu snapshot và phần còn phải triển khai khi bàn giao.','about','driver'],
 ],
 'driver-phones':[
  ['mobile-home.png','Chuyến hàng của bạn','Phương án được duyệt, xe và một lối đi vào công việc. Thanh kính chỉ ở điều hướng chính.','home','driver'],
  ['mobile-stop.png','Hàng tại điểm giao','Địa chỉ, số kiện và yêu cầu. Mở bản đồ ngoài, đi tiếp vào hướng dẫn dỡ.','stop','driver'],
  ['mobile-scene.png','Xem từng kiện cần dỡ','Vùng xe tối, thông tin nền sáng. Chọn bước, phát hướng dẫn mẫu và mở chi tiết.','scene','driver'],
 ],
 'confirm-phones':[
  ['mobile-scan-error.png','Mã sai được chặn tại chỗ','Giữ mã cần kiểm tra và lỗi ngay bên ô nhập. Đổi mã sau khi khớp sẽ phải kiểm tra lại.','scan','driver'],
  ['mobile-confirm.png','Xác nhận việc đã làm','Chỉ mở sau khi mã khớp. Kiện đã xác nhận không thể ghi thêm lần nữa.','home','driver'],
  ['mobile-done.png','Lưu xong, biết bước tiếp','Phân biệt lưu trong phiên với đã gửi. Tiếp tục đúng kiện chưa xác nhận kế tiếp.','home','driver'],
 ],
 'warehouse-phones':[
  ['mobile-warehouse-home.png','Bắt đầu từ công việc','Cùng nhận diện, hành động theo vai trò kho. Không đưa công cụ điều phối lên điện thoại.','home','warehouse'],
  ['mobile-loading.png','Theo thứ tự xếp','132 bước từ snapshot. Mã kiện, kích thước và vị trí được mở theo nhu cầu.','scene','warehouse'],
  ['mobile-scan.png','Đối chiếu trước khi thao tác','Kiểm mã đúng/sai bằng ô nhập hoặc máy quét bàn phím. Vùng camera là phác thảo.','scan','driver'],
 ],
 'state-phones':[
  ['mobile-state-empty.png','Chưa có công việc','Trạng thái rỗng có lời giải thích, không hiển thị số hoặc tiến độ giả.','home','driver&state=empty'],
  ['mobile-state-error.png','Không tải được','Có lối thử lại và xem hàng đợi. Kịch bản này được chọn ở thanh duyệt mẫu.','home','driver&state=error'],
  ['mobile-state-expired.png','Phiên hết hạn','Giữ lối xem thao tác chưa gửi; đăng nhập lại trong luồng mobile mẫu.','home','driver&state=expired'],
 ],
 'support-phones':[
  ['mobile-issue.png','Sự cố kèm ảnh','Chọn loại sự cố, mô tả và xem trước ảnh. Bản mẫu chỉ giữ nội dung cùng tên file trong phiên.','issue','driver'],
  ['mobile-queue-failed.png','Biết thao tác nào chưa gửi','Mô phỏng chờ, lỗi, gửi lại. Không báo đã đồng bộ khi chưa có backend.','queue','driver'],
  ['mobile-profile.png','Tài khoản & lối điều khiển','Từ tài khoản vào cài đặt, hàng đợi, hỗ trợ và đăng xuất.','profile','driver'],
 ],
};
for(const [id,items] of Object.entries(groups))document.getElementById(id).innerHTML=items.map(([img,title,description,view,role])=>`<a class="phone" href="./mobile.html?view=${view}&role=${role}"><img src="./${img}" alt="${title}" loading="lazy" width="390" height="844"><h3>${title}</h3><p>${description}</p><span>Thử màn này →</span></a>`).join('');
