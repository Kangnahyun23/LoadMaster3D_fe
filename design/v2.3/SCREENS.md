# Danh sách màn V2.3

Mỗi màn có hai file cùng tên: `.jpg` là ảnh đích (kích thước đúng như cột Khung), `.html` là bản dựng tĩnh để đọc số đo, chữ và cấu trúc.
HTML chỉ là mockup: chữ trong code phải đi qua `t()`, màu qua token, dữ liệu qua `lib/mock-db`.

## Web (`screens/web/`)

### Hệ thống

| Màn | Tên | Route / vị trí | Khung |
|---|---|---|---|
| [Main](screens/web/Main.jpg) | Hệ Cyan kính · /kieu-dang | /kieu-dang | 1536×1688 |
| [ThanhPhan](screens/web/ThanhPhan.jpg) | Thành phần · /thanh-phan | /thanh-phan | 1536×2716 |
| [TrangThaiChung](screens/web/TrangThaiChung.jpg) | Trạng thái chung | EmptyState, skeleton, toast, banner (dùng chung) | 1536×1786 |
| [TimNhanh](screens/web/TimNhanh.jpg) | Tìm nhanh (Ctrl K) | Ctrl K (AppShell) | 1536×864 |
| [MenuToanCuc](screens/web/MenuToanCuc.jpg) | Thông báo, tài khoản, ngôn ngữ | chuông, menu tài khoản, ngôn ngữ (AppShell) | 1536×1422 |
| [HopThoaiChuyen](screens/web/HopThoaiChuyen.jpg) | Hộp thoại · chuyến | hộp thoại chuyến (huỷ, xoá kiện, nhập file, rời trang, khôi phục) | 1536×1265 |
| [HopThoaiQuanTri](screens/web/HopThoaiQuanTri.jpg) | Hộp thoại · quản trị và đội xe | hộp thoại quản trị và đội xe | 1536×1227 |

### Điều phối

| Màn | Tên | Route / vị trí | Khung |
|---|---|---|---|
| [BangDieuKhien](screens/web/BangDieuKhien.jpg) | Bảng điều khiển · quản lý | / | 1536×1458 |
| [ChuyenHang](screens/web/ChuyenHang.jpg) | Chuyến hàng | /chuyen | 1536×1554 |
| [TaoChuyen](screens/web/TaoChuyen.jpg) | Tạo chuyến mới | /chuyen/moi | 1536×1374 |
| [SuaChuyenKhoa](screens/web/SuaChuyenKhoa.jpg) | Sửa chuyến · đang xếp hàng | /chuyen/TRIP-011/sua | 1536×1147 |
| [ChiTietChuyen](screens/web/ChiTietChuyen.jpg) | Chi tiết chuyến · đã duyệt | /chuyen/TRIP-2026-0914 | 1536×864 |
| [ChiTietChuyenKien](screens/web/ChiTietChuyenKien.jpg) | Chi tiết chuyến · panel kiện | /chuyen/:id?kien=… | 1536×864 |
| [ChiTietChuyenKienDayDu](screens/web/ChiTietChuyenKienDayDu.jpg) | Panel kiện · đủ form | /chuyen/:id?kien=… (form đủ) | 1536×1558 |
| [ChiTietChuyenHuy](screens/web/ChiTietChuyenHuy.jpg) | Chi tiết chuyến · đã huỷ | /chuyen/TRIP-004 | 1536×864 |
| [ThietLapToiUu](screens/web/ThietLapToiUu.jpg) | Thiết lập tối ưu | /chuyen/:id/toi-uu | 1536×1265 |
| [DangToiUu](screens/web/DangToiUu.jpg) | Đang tối ưu | /chuyen/:id/toi-uu (đang chạy) | 1536×864 |
| [HopThoaiToiUu](screens/web/HopThoaiToiUu.jpg) | Lỗi và thông báo tối ưu | /chuyen/:id/toi-uu (lỗi, thông báo) | 1536×864 |
| [SoSanhPhuongAn](screens/web/SoSanhPhuongAn.jpg) | So sánh phương án | /chuyen/TRIP-2026-0914/so-sanh | 1536×1312 |
| [Planner3D](screens/web/Planner3D.jpg) | Planner 3D · xem | /chuyen/TRIP-2026-0914/phuong-an | 1536×864 |
| [Planner3DChinhSua](screens/web/Planner3DChinhSua.jpg) | Planner 3D · chỉnh tay | /chuyen/:id/phuong-an (Chỉnh sửa) | 1536×864 |
| [Planner3DThongTin](screens/web/Planner3DThongTin.jpg) | Planner 3D · thông tin phương án | /chuyen/:id/phuong-an (Chi tiết / Hiển thị) | 1536×864 |
| [Planner3DDuyet](screens/web/Planner3DDuyet.jpg) | Planner 3D · duyệt | /chuyen/:id/phuong-an (hộp thoại Duyệt) | 1536×864 |
| [ChiTietChuyenNhap](screens/web/ChiTietChuyenNhap.jpg) | Chi tiết chuyến · nháp vừa tạo | /chuyen/:id (nháp) | 1536×864 |
| [ChiTietChuyenCanXemLai](screens/web/ChiTietChuyenCanXemLai.jpg) | Chi tiết chuyến · cần xem lại | /chuyen/TRIP-013 | 1536×864 |
| [ChiTietChuyenDangXep](screens/web/ChiTietChuyenDangXep.jpg) | Chi tiết chuyến · đang xếp hàng | /chuyen/TRIP-011 | 1536×864 |
| [ChiTietChuyenDangGiao](screens/web/ChiTietChuyenDangGiao.jpg) | Chi tiết chuyến · đang giao | /chuyen/TRIP-009 | 1536×864 |
| [ChiTietChuyenHoanThanh](screens/web/ChiTietChuyenHoanThanh.jpg) | Chi tiết chuyến · hoàn thành | /chuyen/TRIP-007 | 1536×864 |
| [ThietLapToiUuLoi](screens/web/ThietLapToiUuLoi.jpg) | Thiết lập tối ưu · có lỗi | /chuyen/:id/toi-uu (có lỗi) | 1536×1339 |
| [SoSanhPhuongAnTrong](screens/web/SoSanhPhuongAnTrong.jpg) | So sánh · chưa đủ phương án | /chuyen/TRIP-012/so-sanh | 1536×864 |
| [Planner3DDoHang](screens/web/Planner3DDoHang.jpg) | Planner 3D · chế độ dỡ hàng | /chuyen/:id/phuong-an (Dỡ hàng, REV-029) | 1536×864 |
| [Planner3DKhongTheDat](screens/web/Planner3DKhongTheDat.jpg) | Planner 3D · không thể đặt kiện | /chuyen/:id/phuong-an (Chỉnh sửa, không thể đặt) | 1536×864 |
| [Planner3DTatLIFO](screens/web/Planner3DTatLIFO.jpg) | Planner 3D · duyệt khi tắt LIFO | /chuyen/:id/phuong-an (Duyệt, LIFO tắt) | 1536×864 |
| [Planner3DLoiThoi](screens/web/Planner3DLoiThoi.jpg) | Planner 3D · phương án lỗi thời | /chuyen/TRIP-013/phuong-an | 1536×864 |
| [Planner3DKhoa](screens/web/Planner3DKhoa.jpg) | Planner 3D · đã chốt, kho đang xếp | /chuyen/TRIP-011/phuong-an | 1536×864 |
| [Planner3DQuanLy](screens/web/Planner3DQuanLy.jpg) | Planner 3D · quản lý chỉ xem | /chuyen/:id/phuong-an (vai trò quản lý) | 1536×864 |
| [Planner3DBanChuaDuyet](screens/web/Planner3DBanChuaDuyet.jpg) | Planner 3D · xem bản chưa duyệt | /chuyen/:id/phuong-an?revision=… (REV-001) | 1536×864 |

### Đội xe & quản trị

| Màn | Tên | Route / vị trí | Khung |
|---|---|---|---|
| [DoiXe](screens/web/DoiXe.jpg) | Đội xe | /doi-xe | 1536×921 |
| [ChiTietXe](screens/web/ChiTietXe.jpg) | Chi tiết xe | /doi-xe/:id | 1536×1118 |
| [ThemXe](screens/web/ThemXe.jpg) | Thêm xe · lỗi kiểm tra | /doi-xe/moi | 1536×1243 |
| [NguoiDung](screens/web/NguoiDung.jpg) | Người dùng · tài khoản | /nguoi-dung | 1536×1123 |
| [MaTranQuyen](screens/web/MaTranQuyen.jpg) | Người dùng · ma trận quyền | /nguoi-dung (tab Ma trận quyền) | 1536×1449 |
| [NhatKy](screens/web/NhatKy.jpg) | Nhật ký hệ thống | /nhat-ky | 1536×1693 |
| [NhatKyChuyen](screens/web/NhatKyChuyen.jpg) | Nhật ký · lọc nhóm Chuyến | /nhat-ky (lọc Chuyến) | 1536×1637 |
| [HoSo](screens/web/HoSo.jpg) | Hồ sơ cá nhân | /ho-so | 1536×864 |
| [ChiTietXeDangChay](screens/web/ChiTietXeDangChay.jpg) | Chi tiết xe · đang phục vụ chuyến | /doi-xe/VEHICLE-007 | 1536×1076 |
| [ChiTietXeBaoDuong](screens/web/ChiTietXeBaoDuong.jpg) | Chi tiết xe · bảo dưỡng | /doi-xe/VEHICLE-008 | 1536×1122 |
| [HoSoKho](screens/web/HoSoKho.jpg) | Hồ sơ · nhân viên kho | /ho-so (nhân viên kho) | 1536×864 |

### Kho

| Màn | Tên | Route / vị trí | Khung |
|---|---|---|---|
| [KhoChuyenCanXep](screens/web/KhoChuyenCanXep.jpg) | Kho · chuyến cần xếp | /kho | 1024×768 |
| [KhoXepHang](screens/web/KhoXepHang.jpg) | Kho · bước xếp hàng | /kho?chuyen=TRIP-011 | 1024×768 |
| [KhoDaXep](screens/web/KhoDaXep.jpg) | Kho · đã xếp kiện | /kho (đã xếp kiện) | 1024×768 |
| [KhoGhiThieu](screens/web/KhoGhiThieu.jpg) | Kho · ghi thiếu kiện | /kho (ghi thiếu) | 1024×768 |
| [KhoXepXong](screens/web/KhoXepXong.jpg) | Kho · đã xếp xong | /kho (xếp xong) | 1024×768 |
| [KhoChoDuyetLai](screens/web/KhoChoDuyetLai.jpg) | Kho · chờ duyệt lại | /kho (chờ duyệt lại) | 1024×768 |
| [KhoTrangThai](screens/web/KhoTrangThai.jpg) | Kho · trạng thái danh sách và phiên | /kho (trạng thái danh sách và phiên) | 2128×1724 |

### Tài xế

| Màn | Tên | Route / vị trí | Khung |
|---|---|---|---|
| [TaiXeChuyen](screens/web/TaiXeChuyen.jpg) | Tài xế · chuyến của tôi | /tai-xe | 390×844 |
| [TaiXeSanSang](screens/web/TaiXeSanSang.jpg) | Tài xế · điểm giao sẵn sàng | /tai-xe/diem-giao?chuyen=… | 390×844 |
| [TaiXeDiemGiao](screens/web/TaiXeDiemGiao.jpg) | Tài xế · đang giao | /tai-xe/diem-giao (đang giao) | 390×844 |
| [TaiXeBaoSuCo](screens/web/TaiXeBaoSuCo.jpg) | Tài xế · báo sự cố | /tai-xe/diem-giao (báo sự cố) | 390×844 |
| [TaiXeViTriHang](screens/web/TaiXeViTriHang.jpg) | Tài xế · xem vị trí hàng | /tai-xe/diem-giao (vị trí hàng 3D) | 390×844 |
| [TaiXeTongKet](screens/web/TaiXeTongKet.jpg) | Tài xế · tổng kết chuyến | /tai-xe/diem-giao?chuyen=TRIP-007 | 390×844 |
| [TaiXeDaDoHet](screens/web/TaiXeDaDoHet.jpg) | Tài xế · điểm đã dỡ hết | /tai-xe/diem-giao (đã dỡ hết) | 390×844 |
| [TaiXeTrangThai](screens/web/TaiXeTrangThai.jpg) | Tài xế · trạng thái | /tai-xe (trạng thái) | 1760×948 |

### Truy cập

| Màn | Tên | Route / vị trí | Khung |
|---|---|---|---|
| [DangNhap](screens/web/DangNhap.jpg) | Đăng nhập | /dang-nhap | 1536×864 |
| [DangNhapDienThoai](screens/web/DangNhapDienThoai.jpg) | Đăng nhập · điện thoại, tài khoản khoá | /dang-nhap (điện thoại) | 390×844 |
| [Loi403](screens/web/Loi403.jpg) | 403 · không có quyền | 403 | 1536×864 |
| [Loi404](screens/web/Loi404.jpg) | 404 · không tìm thấy | 404 (*) | 1536×864 |
| [LoiChung](screens/web/LoiChung.jpg) | Lỗi chung | lỗi chung | 1536×864 |

## App Flutter (`screens/app/`)

App riêng, dùng chung backend với web. Điện thoại 390×844, máy tính bảng 1024×768; artboard rộng hơn là nhiều khung trạng thái đặt cạnh nhau.
Cột Widget là tên đề xuất cho màn Flutter. Bảng ánh xạ đầy đủ App ↔ Web: [AppAnhXa](screens/app/AppAnhXa.jpg).

### Điều phối

| Màn | Tên | Widget | Khung |
|---|---|---|---|
| [AppDieuPhoiChuyen](screens/app/AppDieuPhoiChuyen.jpg) | Chuyến | `TripList` | 390×844 |
| [AppDieuPhoiCanXuLy](screens/app/AppDieuPhoiCanXuLy.jpg) | Cần xử lý | `ReviewQueue` | 390×844 |
| [AppThongBao](screens/app/AppThongBao.jpg) | Thông báo | `Notifications` | 390×844 |
| [AppDieuPhoiChiTiet](screens/app/AppDieuPhoiChiTiet.jpg) | Chi tiết chuyến | `TripDetail` | 390×844 |
| [AppDieuPhoiChiTietTrangThai](screens/app/AppDieuPhoiChiTietTrangThai.jpg) | Chi tiết theo trạng thái | `TripDetail` | 2126×967 |
| [AppDieuPhoiCanXemLai](screens/app/AppDieuPhoiCanXemLai.jpg) | Cần xem lại | `TripDetail` | 390×844 |
| [AppDieuPhoiToiUuNhanh](screens/app/AppDieuPhoiToiUuNhanh.jpg) | Chạy tối ưu nhanh | `QuickOptimizeSheet` | 390×844 |
| [AppDieuPhoiDangToiUu](screens/app/AppDieuPhoiDangToiUu.jpg) | Đang tối ưu | `OptimizationProgress` | 390×844 |
| [AppDieuPhoiPhuongAn3D](screens/app/AppDieuPhoiPhuongAn3D.jpg) | Phương án 3D | `PlanViewer` | 390×844 |
| [AppDieuPhoiDuyet](screens/app/AppDieuPhoiDuyet.jpg) | Duyệt phương án | `ApprovePlanSheet` | 390×844 |
| [AppDieuPhoiSoSanh](screens/app/AppDieuPhoiSoSanh.jpg) | So sánh phương án | `PlanCompare` | 390×844 |
| [AppQuanLyTongQuan](screens/app/AppQuanLyTongQuan.jpg) | Tổng quan (quản lý) | `Overview` | 390×844 |
| [AppDieuPhoiChuyenTablet](screens/app/AppDieuPhoiChuyenTablet.jpg) | Chuyến và chi tiết | `TripListDetail` | 1024×768 |
| [AppDieuPhoiToiUuTablet](screens/app/AppDieuPhoiToiUuTablet.jpg) | Thiết lập tối ưu | `OptimizationSetup` | 1024×768 |
| [AppDieuPhoiPlannerTablet](screens/app/AppDieuPhoiPlannerTablet.jpg) | Chỉnh sửa 3D | `PlanEditor` | 1024×768 |
| [AppQuanLyTongQuanTablet](screens/app/AppQuanLyTongQuanTablet.jpg) | Tổng quan (quản lý) | `Overview` | 1024×768 |

### Kho

| Màn | Tên | Widget | Khung |
|---|---|---|---|
| [AppKhoCongViec](screens/app/AppKhoCongViec.jpg) | Ca xếp hàng | `WorkHome (kho)` | 390×844 |
| [AppKhoBatDauXep](screens/app/AppKhoBatDauXep.jpg) | Bắt đầu xếp | `StartLoadingSheet` | 390×844 |
| [AppKhoBuocXep](screens/app/AppKhoBuocXep.jpg) | Bước xếp hàng | `LoadingStep` | 390×844 |
| [AppKhoTrangThai](screens/app/AppKhoTrangThai.jpg) | Kho: trạng thái | `LoadingSession` | 1704×967 |
| [AppKhoCongViecTablet](screens/app/AppKhoCongViecTablet.jpg) | Ca xếp hàng | `WorkHome` | 1024×768 |
| [AppKhoBuocXepTablet](screens/app/AppKhoBuocXepTablet.jpg) | Bước xếp hàng | `LoadingStep` | 1024×768 |
| [AppKhoGhiThieuTablet](screens/app/AppKhoGhiThieuTablet.jpg) | Ghi thiếu kiện | `MissingPackageDialog` | 1024×768 |
| [AppKhoXepXongTablet](screens/app/AppKhoXepXongTablet.jpg) | Đã xếp xong | `LoadingFinished` | 1024×768 |

### Tài xế

| Màn | Tên | Widget | Khung |
|---|---|---|---|
| [AppTaiXeCongViec](screens/app/AppTaiXeCongViec.jpg) | Công việc | `WorkHome` | 390×844 |
| [AppTaiXeCongViecTrangThai](screens/app/AppTaiXeCongViecTrangThai.jpg) | Công việc: trạng thái | `WorkHome` | 1704×967 |
| [AppTaiXeChuyen](screens/app/AppTaiXeChuyen.jpg) | Tổng quan chuyến | `TripOverview` | 390×844 |
| [AppTaiXeBatDauGiao](screens/app/AppTaiXeBatDauGiao.jpg) | Bắt đầu giao | `StartDeliverySheet` | 390×844 |
| [AppTaiXeDiemGiao](screens/app/AppTaiXeDiemGiao.jpg) | Điểm giao | `DeliveryStop` | 390×844 |
| [AppTaiXeThuTuDiem](screens/app/AppTaiXeThuTuDiem.jpg) | Thứ tự điểm giao | `StopOrderSheet` | 390×844 |
| [AppTaiXeSuCo](screens/app/AppTaiXeSuCo.jpg) | Báo sự cố | `IssueReport` | 390×844 |
| [AppTaiXeHoanTatDiem](screens/app/AppTaiXeHoanTatDiem.jpg) | Hoàn tất điểm giao | `CompleteStopSheet` | 390×844 |
| [AppTaiXeTongKet](screens/app/AppTaiXeTongKet.jpg) | Tổng kết chuyến | `TripSummary` | 390×844 |
| [AppTaiXeXemTruoc](screens/app/AppTaiXeXemTruoc.jpg) | Xem trước chuyến | `DeliveryStop` | 390×844 |
| [AppHuongDanDo](screens/app/AppHuongDanDo.jpg) | Hướng dẫn dỡ | `PlacementGuide` | 390×844 |
| [AppHuongDanTuyChon](screens/app/AppHuongDanTuyChon.jpg) | Tuỳ chọn hiển thị 3D | `DisplayOptionsSheet` | 390×844 |
| [AppHuongDanViTri](screens/app/AppHuongDanViTri.jpg) | Vị trí từ trên xuống | `TopDownPositionSheet` | 390×844 |
| [AppHuongDanKien](screens/app/AppHuongDanKien.jpg) | Chi tiết kiện | `PackageSheet` | 390×844 |
| [AppHuongDanKienChan](screens/app/AppHuongDanKienChan.jpg) | Kiện chắn lối dỡ | `PlacementGuide` | 390×844 |
| [AppDoiChieuMa](screens/app/AppDoiChieuMa.jpg) | Đối chiếu mã kiện | `PackageCodeCheck` | 390×844 |
| [AppDoiChieuMaTrangThai](screens/app/AppDoiChieuMaTrangThai.jpg) | Đối chiếu mã: trạng thái | `PackageCodeCheck` | 1704×967 |
| [AppDoiChieuXacNhan](screens/app/AppDoiChieuXacNhan.jpg) | Xác nhận đã dỡ | `ConfirmUnloadSheet` | 390×844 |
| [AppDaGhiNhan](screens/app/AppDaGhiNhan.jpg) | Đã ghi nhận | `ConfirmationReceipt` | 390×844 |
| [AppChoGui](screens/app/AppChoGui.jpg) | Thao tác chờ gửi | `RetryQueue` | 390×844 |
| [AppChoGuiTrangThai](screens/app/AppChoGuiTrangThai.jpg) | Chờ gửi: trạng thái | `RetryQueue` | 1282×967 |

### Truy cập

| Màn | Tên | Widget | Khung |
|---|---|---|---|
| [AppDangNhap](screens/app/AppDangNhap.jpg) | Đăng nhập | `Login` | 390×844 |
| [AppDangNhapTrangThai](screens/app/AppDangNhapTrangThai.jpg) | Đăng nhập: trạng thái | `Login` | 1704×967 |
| [AppHoTroTaiKhoan](screens/app/AppHoTroTaiKhoan.jpg) | Hỗ trợ tài khoản | `AccountAccessHelp` | 390×844 |
| [AppTaiKhoan](screens/app/AppTaiKhoan.jpg) | Tài khoản | `Account` | 390×844 |
| [AppDangXuat](screens/app/AppDangXuat.jpg) | Đăng xuất khi còn việc chờ gửi | `LogoutConfirm` | 390×844 |
| [AppCaiDat](screens/app/AppCaiDat.jpg) | Cài đặt | `AppSettings` | 390×844 |
| [AppQuyenCamera](screens/app/AppQuyenCamera.jpg) | Camera & ảnh | `PermissionSheet` | 390×844 |
| [AppCaiDatHienThi](screens/app/AppCaiDatHienThi.jpg) | Hiệu ứng cài đặt hiển thị | `AppSettings` | 1282×967 |
| [AppThongTin](screens/app/AppThongTin.jpg) | Thông tin ứng dụng | `About` | 390×844 |
