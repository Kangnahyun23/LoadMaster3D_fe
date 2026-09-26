# V2.3 khác code hiện tại ở đâu

Danh sách này là **việc cần làm**, không phải luật (luật nằm trong `AGENTS.md`). Mục "đã kiểm" là chỗ đã đối chiếu với
code ngày 25/09/2026; phần còn lại mỗi đợt phải tự đối chiếu theo cách ở cuối file.

## 1. Toàn cục (đợt 1–2)

| Hạng mục | Code hiện tại | V2.3 | Xem |
|---|---|---|---|
| Bảng màu | xanh dương `#2563eb`, xám trung tính | cyan + xám ánh cyan, `tokens/index.v2.3.css` | `Main.jpg` |
| Nút chính | nền đặc `--primary`, chữ trắng, bo 8 | gradient `#2ed6e4 → #00c3d4`, viền `#00b5c6`, **chữ tối** `--on-primary`, bo 10 | `ThanhPhan.jpg` |
| Đầu màn trong khung ứng dụng | thanh điều hướng kính sáng + `PageHero` 72 px nền sáng | **dải trời** `--sky`: thanh điều hướng kính tối (`.glass-nav`), tiêu đề 32 px Archivo trắng, tab nằm trong dải; nội dung nền `--app` bên dưới | `ChuyenHang.jpg`, `BangDieuKhien.jpg` |
| Card | viền 1 px, không bóng | viền 1 px + `--card-shadow` rất nhẹ, bo 14 | mọi màn |
| Chữ | Be Vietnam Pro + JetBrains Mono | thêm **Archivo** (variable, độ rộng 106–112 %) cho tiêu đề và số lớn | `Main.jpg` |
| Chip trạng thái chuyến | 6 tông badge | ngữ pháp chấm: chấm đặc = trạng thái, vòng rỗng = chờ người kế tiếp, quầng = đang chạy; thêm tông violet cho đang chạy / đang tối ưu / đã xếp xong | `ThanhPhan.jpg`, `ChuyenHang.jpg` |
| Kính | kính sáng ở nav và ô số liệu | kính **tối** chỉ ở thanh điều hướng (trên dải trời) và lớp phủ trên khung 3D; bảng, form, panel đọc lâu dùng nền đặc | `Planner3D.jpg` |
| Khung 3D | nền `#1a1d23` | theme dầu `#031f29`, panel `.glass-dark` | `Planner3D.jpg` |

## 2. Theo màn — đã kiểm

**Chi tiết chuyến** (`features/trips/TripDetailHeader.tsx`)
- Quyết định 1: chuyến đã có phương án có **hai** nút — chính "Xem phương án 3D", phụ "Chạy tối ưu". Chuyến nháp chỉ "Chạy tối ưu".
  Code hiện chọn **một** trong hai nút theo `runnable`.
- Cần xem lại (TRIP-013): banner nói **vì sao** lỗi thời — mục đã đổi, trước → sau, giờ, người sửa (lấy từ nhật ký) — kèm
  "Tới Thiết lập tối ưu"; mốc Duyệt trên tiến trình gắn nhãn "Lỗi thời". `ChiTietChuyenCanXemLai.jpg`
- Đang xếp (TRIP-011): lý do khoá + "Vẫn sửa được tên, ngày chạy và tài xế" + tiến độ kho 110 / 280. `ChiTietChuyenDangXep.jpg`

**Nhật ký** — quyết định 2: thao tác sửa lưu và hiện `trước → sau`. `NhatKy.jpg`, `NhatKyChuyen.jpg`

**Thông báo** (chuông) — chỉ hiện sự kiện có thật trong seed (Xếp xong, Hoàn thành chuyến…), không có sự cố bịa. `MenuToanCuc.jpg`

**Planner 3D** (`features/viewer3d`) — 11 màn `Planner3D*.jpg`
- Nhãn neo trên kiện đọc được trên nền 3D (kính tối, hai dòng: vai trò · điểm giao / mã kiện).
- Thẻ kiện đang chọn nổi bên phải, nhãn đúng `viewer.selected.*`; tỷ lệ đỡ đáy hiện `%` như `SelectedPackagePanel`.
- "Đã duyệt lúc" hai dòng (đã có trong code), "So sánh phương án" đủ chữ ở 1.536 px.
- Khoá theo pha (TRIP-011): thanh khoá thêm dòng tiến độ kho "Kho đã xếp 110 / 280 kiện · bắt đầu … · người". `Planner3DKhoa.jpg`
- Lỗi thời (TRIP-013 · REV-027): banner nêu mục đã đổi và số kiện phương án ↔ chuyến; ô điểm giao ghi phần chênh. `Planner3DLoiThoi.jpg`
- Xem revision chưa duyệt (`?revision=`): thanh thông tin "Đang xem REV-001 … Kho và tài xế đang đọc REV-002" + nút mở bản đã duyệt. **Mới.** `Planner3DBanChuaDuyet.jpg`
- Hộp thoại Duyệt khi tắt LIFO: dòng giải thích 72 cảnh báo đều từ kiểm tra LIFO + nút "Xem mô phỏng dỡ hàng". `Planner3DTatLIFO.jpg`
- Chỉnh sửa, kéo vào vị trí không hợp lệ: dòng mô tả vật cản (loại, phạm vi, chịu tải), ghi chú "đang kéo", điều khiển tạm khoá, chú
  giải 3 trạng thái theo quyết định 3. `Planner3DKhongTheDat.jpg`
- Quyết định 3: kiện đã dời mà hợp lệ → xanh "Có thể đặt" + nhãn **xám** "Đã chỉnh thủ công"; chỉ ràng buộc thật mới hổ phách; lỗi cứng
  đỏ "Không thể đặt". Nhãn "Đã chỉnh tay" trên thanh trên giữ đúng logic code (chỉ khi bản đã lưu có chỉnh tay và không có nháp).
- Dỡ hàng: panel "Kiện chắn lối dỡ", tạm dừng khi bị che kín. `Planner3DDoHang.jpg`

**Tài xế** — không có "Nhận chuyến" (backend không có); nút bắt đầu là "Bắt đầu giao".

## 3. App Flutter

Toàn bộ `screens/app/` là màn mới (repo app riêng). Bảng ánh xạ từng màn app sang màn web + route: `screens/app/AppAnhXa.jpg`.
Luật riêng của app: xem `README.md` mục "App".

## 4. Chờ backend (chưa làm được ở FE)

1. Ảnh khi báo sự cố (tối đa 4 ảnh) — cần API tải ảnh.
2. Hàng "Chờ gửi" khi mất mạng — backend phải bỏ qua lần gửi trùng của cùng một thao tác.
3. "Nhận chuyến" — backend chưa có bước này.
4. Seed chưa có phương án tắt LIFO: REV-029 trong `Planner3DDoHang`, `Planner3DTatLIFO`, `AppHuongDanKienChan` được tính bằng code
   app trên TRIP-2026-0914 với `enforceLifo: false`. Muốn demo thì thêm revision này vào `lib/mock-db`.

## 5. Tự đối chiếu một màn trước khi code

1. Chạy app, đăng nhập đúng vai trò, mở đúng route trong `SCREENS.md`, chụp bằng Playwright **cùng kích thước khung**.
2. Đặt cạnh ảnh `.jpg` của màn đó, liệt kê chỗ lệch: bố cục, thành phần, chữ, trạng thái, dữ liệu.
3. Chữ trên mockup khác `lib/i18n/vi`: nếu chỉ là cách viết thì **giữ i18n**; nếu là chữ mới thì thêm key vào cả `vi` và `en`.
4. Số liệu trên mockup lấy từ seed thật; lệch với `lib/mock-db` thì tin mock-db và ghi lại, không sửa seed để khớp ảnh.
5. Ghi danh sách vào file issue của đợt, làm xong thì chụp lại và so lần nữa.
