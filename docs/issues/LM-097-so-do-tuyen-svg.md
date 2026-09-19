---
id: LM-097
title: Sơ đồ tuyến SVG ở chi tiết chuyến
phase: 6
labels: [trips, svg]
depends_on: [LM-088]
estimate: 0.5d
prd: [D-50]
---

# LM-097 — Sơ đồ tuyến

## Việc cần làm

- [x] `RouteDiagram` SVG: kho xuất phát → điểm 1 → … theo màu điểm giao (luôn kèm số), số kiện và khối lượng mỗi điểm;
      điểm đã giao có dấu hoàn tất khi chuyến đang giao/hoàn thành. Không địa lý, không thư viện bản đồ.
- [x] Đặt ở chi tiết chuyến; co theo chiều rộng, cuộn ngang khi > 6 điểm.

## Tiêu chí nghiệm thu

- [x] DOM test: đúng số điểm, nhãn truy cập đọc được thứ tự và trạng thái.

## Kết quả (19/09/2026)

### Đã làm

- `src/features/trips/RouteDiagram.tsx`: danh sách có thứ tự (`ol`, nhãn "Kho xuất phát rồi n điểm giao theo thứ tự giao"), ô đầu là kho
  xuất phát (khung + biểu tượng kho), mỗi điểm giao một ô: vòng màu định danh (`stopColor`/`stopForeground` của `lib/stops.ts`) có số điểm,
  tên (cắt bằng dấu ba chấm, `title` đủ tên), "n kiện · khối lượng" (mono, theo locale). Đoạn đường nối là SVG `line` theo phần trăm
  chiều rộng ô, vòng và dấu hoàn tất là SVG lồng đặt ở giữa ô (`x="50%"`) — không thư viện, không địa lý.
- Trạng thái giao chỉ khi chuyến đang giao hoặc đã hoàn thành (Chi tiết chuyến chỉ truyền `delivery` ở hai pha đó): điểm đã hoàn tất có dấu
  tích màu hoàn tất và dòng "Đã giao 07:40", đoạn đường tới nó liền nét màu hoàn tất; điểm chưa hoàn tất đầu tiên là "Đang giao", còn lại
  "Chưa giao", đoạn đường nét đứt.
- Truy cập: phần hình và chữ nhìn thấy `aria-hidden`, mỗi ô một câu `sr-only` đọc theo thứ tự — "Điểm 2 / 4: Tên, 12 kiện, 150,5 kg,
  đang giao" (tiếng Anh "Stop 2 of 4: …, being delivered now").
- Bố cục: ≤ 6 điểm thì các ô chia đều chiều rộng (tối thiểu 96 px); > 6 điểm thì mỗi ô 144 px và khung cuộn ngang. Đặt ngay dưới banner
  khoá, trên các cột của Chi tiết chuyến.
- Chỉnh nhỏ LM-088: cột "Ngày chạy" của danh sách rộng 128 px để tiêu đề cùng mũi tên sắp xếp không bị cắt.

### File chính

`src/features/trips/RouteDiagram.tsx`, `src/features/trips/TripDetailPage.tsx`, từ điển `src/lib/i18n/{vi,en}/trips.ts` (nhánh
`trips.route`).

### Kiểm thử

- DOM `src/features/trips/RouteDiagram.dom.test.tsx` (3): đúng số ô (kho + mọi điểm) và câu đọc theo thứ tự có số, tên, số kiện, khối
  lượng; đang giao — điểm đã giao đọc kèm giờ, điểm kế "đang giao", điểm sau "chưa giao", dấu hoàn tất chỉ ở điểm đã giao; 9 điểm vẫn đủ ô,
  màu quay vòng sau 8.
- `pnpm lint`, `pnpm exec tsc -b` xanh; `pnpm test` 99 file, 632 test xanh.
- E2E `e2e/i18n-en.spec.ts` (Chi tiết chuyến tiếng Anh ở 1.440 / 1.024 / 390 px: không chữ tiếng Việt, không tràn chữ, không cuộn ngang
  trang) xanh với `E2E_PORT=5193`. Ảnh kiểm tay 1.366 px: chuyến đang giao, đã hoàn thành, đã huỷ.

### Đề xuất sửa luật AGENTS

- Mục 7 "Ảnh xem trước tĩnh dùng SVG": thêm *sơ đồ tuyến ở Chi tiết chuyến (`trips/RouteDiagram.tsx`)* vào danh sách nơi dùng SVG.
