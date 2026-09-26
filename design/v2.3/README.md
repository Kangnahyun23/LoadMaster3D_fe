# LoadMaster V2.3 "Cyan kính" — bộ bàn giao cho code

Bản thiết kế đã chốt ngày 25/09/2026 (canvas "LoadMaster V2.3 Cyan kính", bản 12), xuất thành file để đưa vào code.
Web: 68 màn. App Flutter: 54 màn và bảng ánh xạ App ↔ Web.

```
design/v2.3/
  README.md            file này: thứ tự làm, luật app, câu lệnh mẫu
  SCREENS.md           danh sách màn → route / widget → kích thước
  CHANGES.md           V2.3 khác code hiện tại ở đâu + việc chờ backend
  tokens/
    index.v2.3.css     khối :root đề xuất thay cho src/index.css (giữ tên token cũ)
    v3.css             CSS gốc của bản mẫu (nút, form, bảng, chip, hộp thoại, kính…) — tham chiếu, không import vào src/
    fonts.css, fonts/  Archivo, Be Vietnam Pro, JetBrains Mono (woff2, có dải tiếng Việt)
    lm_tokens.dart     cùng bộ token cho app Flutter
  screens/
    web/  <Màn>.jpg    ảnh đích, đúng kích thước khung
          <Màn>.html   bản dựng tĩnh: mở bằng trình duyệt để đo, đọc chữ và cấu trúc
    app/               như trên cho app (điện thoại 390×844, máy tính bảng 1024×768)
    img/               ảnh cảnh 3D dùng trong mockup (chụp từ engine thật)
```

## Quyết định đã chốt

1. Chuyến đã có phương án: nút chính "Xem phương án 3D", nút phụ "Chạy tối ưu". Chuyến nháp chỉ "Chạy tối ưu". Áp dụng cả app.
2. Nhật ký lưu và hiện `trước → sau` cho thao tác sửa.
3. Chỉnh 3D: kiện đã dời mà hợp lệ → xanh "Có thể đặt" + nhãn xám "Đã chỉnh thủ công"; chỉ ràng buộc thật mới hổ phách; lỗi cứng đỏ "Không thể đặt".
4. App là ứng dụng riêng, dùng chung backend và dữ liệu với web. Tài xế và Kho là luồng chính; Điều phối / Quản lý xem và thao tác phù
   hợp; chỉnh 3D đầy đủ và cấu hình tối ưu sâu chỉ ở máy tính bảng / desktop.

## Thứ tự làm (web) — mỗi đợt một nhánh `feat/…`, một PR vào `developer`

| Đợt | Việc | Xong khi |
|---|---|---|
| 1. Token | Thay `:root` trong `src/index.css` theo `tokens/index.v2.3.css`, nạp Archivo, cập nhật `@theme`, `THEME_FONT_SIZES`, mục 4 AGENTS.md | lint/build/test xanh; màn cũ vẫn chạy, chỉ đổi màu |
| 2. Thành phần | Button, badge/chip trạng thái, card, form, tab, hộp thoại, toast, banner, dải trời + thanh điều hướng, `/kieu-dang`, `/thanh-phan` | `/thanh-phan` khớp `ThanhPhan.jpg` |
| 3. Chuyến | Danh sách, tạo/sửa, chi tiết đủ 7 trạng thái, panel kiện | khớp các ảnh `ChuyenHang`, `TaoChuyen`, `ChiTietChuyen*` |
| 4. Tối ưu | Thiết lập, đang chạy, lỗi, so sánh | khớp `ThietLapToiUu*`, `DangToiUu`, `SoSanhPhuongAn*` |
| 5. Planner 3D | 11 trạng thái | khớp `Planner3D*` |
| 6. Kho, Tài xế | tablet 1024×768, điện thoại 390×844 | khớp `Kho*`, `TaiXe*` |
| 7. Quản trị | đội xe, người dùng, nhật ký, hồ sơ, đăng nhập, lỗi | khớp phần còn lại |

Mỗi đợt: đối chiếu theo `CHANGES.md` mục 5 **trước** khi code, chỉ đổi giao diện (domain, mock-db, route, quyền giữ nguyên trừ khi
CHANGES.md nói khác), chụp Playwright cùng kích thước và so ảnh, chạy `pnpm lint && pnpm build && pnpm test && pnpm test:e2e`.

## App Flutter

- Token: `tokens/lm_tokens.dart` → `ThemeData`. Không viết mã màu trong widget.
- Điện thoại 390×844, máy tính bảng 1024×768. Vùng chạm ≥ 56 px cho tài xế và kho, ≥ 48 px cho điều phối / quản lý.
- Mỗi màn một nút chính. Kính chỉ ở thanh điều hướng dưới và lớp phủ trên khung 3D; bật "Nền rõ ngoài trời" thì bỏ kính.
- Không có "Nhận chuyến"; tài xế dùng "Bắt đầu giao". Tên widget đề xuất nằm ở cột Widget của `SCREENS.md`.

## Câu lệnh mẫu cho Claude Code

Đợt đầu:

> Đọc `design/v2.3/README.md`, `CHANGES.md` mục 1 và `AGENTS.md` mục 4–5. Làm đợt 1 (token) trên nhánh `feat/v2-3-token`:
> thay khối `:root` của `src/index.css` theo `design/v2.3/tokens/index.v2.3.css`, nạp font Archivo, cập nhật `@theme` và mục 4 của
> AGENTS.md. Chưa sửa component. Chạy lint/build/test, chụp `/chuyen` và `/kieu-dang` trước và sau để tôi xem.

Các đợt sau (thay tên đợt và danh sách ảnh):

> Làm đợt 3 (Chuyến) theo `design/v2.3/README.md`. Với từng màn trong `SCREENS.md` thuộc đợt này: mở ảnh `.jpg` và file `.html`
> cùng tên, chụp màn hiện tại bằng Playwright cùng kích thước, ghi danh sách lệch vào issue, rồi sửa. Dùng lại component có sẵn,
> chữ qua i18n, số từ mock-db. Xong thì chụp lại, đặt cạnh ảnh đích và báo những chỗ còn lệch có chủ ý.

Đừng giao "làm hết V2.3" trong một lần: mỗi đợt nhỏ thì so ảnh được, review được, và lỗi không lan sang màn khác.
