# CLAUDE.md — LoadMaster Web

Đọc file này trước khi viết bất kỳ dòng code nào trong repo.

File này là **luật sống**: khi thực tế phát triển cho thấy một luật cũ sai hoặc thiếu,
sửa luật ở đây cùng lúc với sửa code, đừng để code và luật lệch nhau. Những mục đánh
dấu *(đã điều chỉnh)* là chỗ hướng đi ban đầu đã đổi và lý do vì sao.

## 1. Sản phẩm

LoadMaster là hệ thống lập kế hoạch và tối ưu chất xếp hàng hóa 3D cho doanh nghiệp vận tải vừa và nhỏ tại Việt Nam. Đây là repo frontend.

Giao diện **tiếng Việt**. Một codebase responsive phục vụ 5 vai trò:

| Vai trò | Thiết bị | Đặc điểm |
|---|---|---|
| Dispatcher | Desktop | Dữ liệu dày, phiên làm việc dài, bảng nhiều cột |
| Warehouse worker | Tablet tại kho | Sáng, đeo găng, nhìn xa, một thao tác mỗi màn |
| Driver | Điện thoại ngoài trời | Nắng, một tay, mạng yếu |
| Manager | Desktop / tablet | Dashboard, biểu đồ, xuất báo cáo |
| Admin | Desktop | Người dùng, phân quyền, nhật ký |

Backend là Spring Boot monolith + PostgreSQL, cộng một Python FastAPI service riêng cho tối ưu. Giao tiếp REST + WebSocket.

**Trạng thái hiện tại:** backend chưa nối. Toàn bộ dữ liệu là mẫu. Đăng nhập đã có nhưng
**chưa phân quyền theo vai trò** — mọi tài khoản đăng nhập đều vào được mọi màn.

## 2. Tech stack

Khóa version trong lockfile, không tự nâng major. Dùng **pnpm**, không dùng npm/yarn
(`package-lock.json` và `yarn.lock` đã bị chặn trong `.gitignore`).

```
react 19  ·  vite  ·  typescript
tailwindcss v4           — cấu hình bằng @theme trong CSS, không có tailwind.config
@radix-ui/react-*        — primitive không giao diện
@tanstack/react-query    — data fetching, cache, optimistic update
@tanstack/react-table v9 — mọi bảng dữ liệu
react-hook-form + zod v4 — mọi form
react-router v7          — routing
recharts                 — biểu đồ dashboard
dnd-kit                  — kéo thả thứ tự điểm giao, ghim kiện
lucide-react             — icon, KHÔNG dùng bộ khác
sonner                   — toast
motion                   — animation 2D
```

Riêng cho 3D viewer (chỉ trong `src/features/viewer3d`):

```
three  ·  @react-three/fiber  ·  @react-three/drei
@react-three/postprocessing  ·  @react-spring/three
camera-controls (qua drei)
```

**Không dùng:** `framer-motion-3d` (deprecated, không hỗ trợ React 19) · Redux · axios (dùng fetch) · moment.js · thư viện UI khác.

### Radix trực tiếp, không dùng shadcn CLI *(đã điều chỉnh)*

Luật ban đầu ghi "shadcn/ui (Radix)". Thực tế shadcn bản hiện tại sinh code trên
**Base UI** chứ không phải Radix, và variant mặc định của nó lệch hẳn spec design
(nút `h-8` thay vì 40/56px, `active:translate-y-px` vi phạm luật hover ở mục 5,
`disabled:opacity-50` thay vì nền `--border`).

Nên: cài thẳng `@radix-ui/react-*` cho phần cần hành vi và khả năng truy cập
(Select, Dialog, DropdownMenu, Checkbox, Switch, RadioGroup, Tabs, Tooltip,
ScrollArea, Separator, Slot), rồi **tự viết lớp giao diện** trong `components/ui/`.
Không chạy `shadcn add`.

### TanStack Table v9

API v9 khác hẳn v8: dùng `useTable` + `tableFeatures({})` + `createColumnHelper`,
**không** dùng `useReactTable`/`getCoreRowModel`. Tài liệu chính chủ nằm trong
`node_modules/@tanstack/react-table/skills/`.

## 3. Cấu trúc thư mục

```
src/
  app/                  router, providers, app shell, nav rail
    design-system/      2 trang tài liệu bàn giao (/kieu-dang, /thanh-phan)
  components/ui/        primitive tự viết trên Radix
  components/           component dùng chung: StatusBadge, DataTable, EmptyState...
  features/
    auth/               đăng nhập, phiên, RequireAuth
    trips/              danh sách, chi tiết, form chuyến, so sánh phương án
    optimization/       chạy job, theo dõi tiến trình
    viewer3d/           toàn bộ code Three.js, tách biệt hoàn toàn
    warehouse/          luồng xếp hàng ở kho
    driver/             luồng giao hàng
    manager/            dashboard
    fleet/              đội xe
    admin/              người dùng
  lib/                  format, helper, mock dùng chung, api client
  types/                type dùng từ hai feature trở lên
```

Mỗi feature tự chứa component, hook, type của nó. Chỉ đưa lên `components/`, `lib/`
hoặc `types/` khi có **từ hai feature trở lên** dùng chung.

**Đặt mock ở đâu** *(bổ sung)*: mock chỉ một feature dùng thì để trong feature đó
(`features/trips/trip-detail.mock.ts`). Mock nhiều feature dùng chung thì lên `lib/`
(`lib/load-plan.mock.ts` — viewer3d, warehouse và driver cùng đọc).

## 4. Design tokens

Đặt trong `src/index.css`. Mọi màu, khoảng cách, bo góc **phải** lấy từ đây, không hardcode hex trong component.

Tailwind v4 nối token qua khối `@theme inline`, nên `bg-surface`, `text-text-2`,
`rounded-md`… trỏ thẳng vào `var()` chứ không sao chép giá trị. Sửa token chỉ ở một chỗ.

```css
:root {
  /* nền và chữ */
  --bg: #FFFFFF;
  --surface: #F7F8FA;
  --border: #E5E7EB;
  --text: #111827;
  --text-2: #4B5563;
  --text-3: #6B7280;
  --text-disabled: #9CA3AF;   /* chữ trên nền vô hiệu hoá */

  /* thương hiệu */
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-bg: #EFF6FF;

  /* ngữ nghĩa */
  --success: #16A34A;
  --warning: #D97706;
  --danger: #DC2626;
  --danger-hover: #B91C1C;
  --info: #0891B2;

  /* điều khiển */
  --switch-off: #D1D5DB;      /* rãnh switch khi tắt */
  --highlight: #FACC15;       /* kiện đang thao tác trên nền canvas tối */

  /* vùng 3D, luôn tối */
  --canvas-1: #1A1D23;
  --canvas-2: #0F1115;
  --panel-dark: #1E2228;
  --border-dark: #2D323B;

  /* màu định danh điểm giao, an toàn cho người mù màu (Okabe–Ito) */
  --stop-1: #E69F00;  --stop-2: #56B4E9;  --stop-3: #009E73;  --stop-4: #F0E442;
  --stop-5: #0072B2;  --stop-6: #D55E00;  --stop-7: #CC79A7;  --stop-8: #555555;

  /* 6 tông badge, mỗi tông 3 biến bg/fg/border:
     --badge-{neutral|info|cyan|success|warning|danger}-{bg|fg|border} */

  /* bo góc */
  --r-sm: 6px;  --r-md: 8px;  --r-lg: 12px;

  /* đổ bóng, chỉ cho lớp nổi */
  --e1: 0 1px 2px rgba(16,24,40,.06);
  --e2: 0 4px 12px rgba(16,24,40,.10);
  --e3: 0 12px 32px rgba(16,24,40,.16);

  /* chuyển động */
  --dur-fast: 120ms;  --dur-md: 250ms;  --dur-slow: 500ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
}
```

Font: **Be Vietnam Pro** cho giao diện, **JetBrains Mono** cho số, mã kiện, kích thước, khối lượng. Mono luôn kèm `font-variant-numeric: tabular-nums`.

### Type scale

| Bậc | Cỡ / dòng | Dùng ở |
|---|---|---|
| display | 32/40 | tiêu đề trang tài liệu |
| h1 | 24/32 | tiêu đề màn |
| h2 | 20/28 | tiêu đề mục, tiêu đề hộp thoại |
| h3 | 16/24 | tiêu đề card |
| body-lg | 16/24 | chữ thân trên tablet và điện thoại |
| body | 14/20 | chữ thân trên desktop |
| caption | 12/16 | nhãn phụ, tiêu đề cột bảng |
| micro | 11/14 | nhãn trục biểu đồ, nhãn trong panel nổi *(bổ sung)* |

**Số liệu lớn** không nằm trong thang trên vì chúng là hình khối chứ không phải chữ đọc:
`18px` mã kiện trên header · `22px` mã chuyến · `28px` số KPI · `40px` tỷ lệ lấp đầy
trong hộp thoại. Luôn dùng JetBrains Mono. Không phát sinh thêm cỡ ngoài danh sách này.

Spacing bội số 4px.

## 5. Luật thành phần

### Nút

- Nút chính: cao 40px desktop, **56px tablet và điện thoại**. Padding ngang 16px. Bo góc 8px. Nền đặc `--primary`. Chữ trắng 14px weight 600. Không viền, không bóng lúc nghỉ.
- Hover chỉ đổi nền sang `--primary-hover`. **Không** phóng to, **không** nhấc lên.
- Focus: vòng 2px `--primary` cách 2px.
- Loading: giữ nguyên chiều rộng, thêm spinner 16px bên trái chữ.
- Nút phụ: nền trắng, viền 1px `--border`. Nút ghost: trong suốt. Nút nguy hiểm: nền đặc `--danger`.
- Nút chỉ có icon: 36×36 desktop, 48×48 di động.
- Nút dùng `asChild` bọc `<Link>` thì **không kèm spinner** — Radix `Slot` chỉ nhận đúng một phần tử con.

### Thanh tiêu đề màn *(bổ sung)*

Cao **72px** cho mọi màn có nav rail. Chỉ **56px** cho màn xem phương án 3D, vì ở đó
chiều cao nhường cho khung 3D. Không tự chọn chiều cao khác — lệch là nội dung nhảy
khi chuyển màn.

### Cấm tuyệt đối

- Không dùng chữ gạch chân làm nút hành động. Gạch chân chỉ cho link trong đoạn văn.
- Không gradient trên nút, card, header hay nền trang.
- Không glassmorphism, không blur nền, không viền phát sáng — **ngoại trừ** panel điều khiển nổi đè lên khung 3D nền tối.
- Không đổ bóng lên card. Card phân tách bằng viền 1px `--border`. Bóng chỉ dùng cho dropdown, modal, toast, popover, và **thẻ đang được kéo** (lúc đó nó là lớp đang nhấc khỏi mặt phẳng).
- Không emoji trong giao diện. Icon dùng Lucide, nét 1,5px, cỡ 16/20/24.
- Không viết hoa toàn bộ, không giãn chữ trang trí.
- Không bo góc tròn hoàn toàn cho nút hành động. Dạng viên thuốc chỉ cho badge, chip lọc và thanh tiến độ.
- Chỉ dùng ba độ đậm chữ: 400, 500, 600.
- Không dùng màu ngoài bảng token. Tám màu điểm giao **chỉ** để định danh điểm giao, không dùng trang trí.
- Không kẻ sọc xen kẽ cho bảng. Dùng đường phân cách 1px.
- Không dữ liệu giả kiểu Lorem hay "Sample Item 1". Dùng dữ liệu tiếng Việt thật khi làm mẫu.

### Bố cục: màn có dữ liệu và màn không có dữ liệu *(đã điều chỉnh)*

Luật ban đầu cấm mọi "bố cục kiểu trang giới thiệu". Thực tế có một nhóm màn **không
hề có dữ liệu nghiệp vụ** để bày: đăng nhập, 404, trạng thái rỗng. Ép chúng căn trái
bám mép trên thì nội dung trôi lạc giữa vùng trống, nhìn như trang lỗi.

- **Màn vận hành** (có dữ liệu): nội dung căn trái, bám mép trên, không tiêu đề khổng lồ căn giữa, không hình minh hoạ lớn. Đây là mặc định.
- **Màn không có dữ liệu**: được phép bố cục hai cột, căn giữa theo chiều dọc, và có hình minh hoạ. Hình minh hoạ phải dựng từ chính sản phẩm (phép chiếu đẳng cự ở `lib/isometric.ts`, bảng màu điểm giao), không mượn ảnh trang trí bên ngoài.

### Phân cấp thị giác

Mỗi màn hình chỉ có **đúng một** hành động chính dùng nút primary. Mọi hành động khác dùng nút phụ hoặc ghost.

Không phải thứ gì cũng cần card. Nhóm nội dung bằng khoảng trắng trước, viền sau, nền surface cuối cùng.

### Bảng dữ liệu

Chiều cao dòng cố định (48px thoáng, 36px gọn, 56px cảm ứng). Cột số căn phải, JetBrains Mono. Tiêu đề cột 12px weight 500 màu `--text-3`, không viết hoa, dính khi cuộn. Bảng hẹp (cột phụ ≤ 360px) dùng padding ngang 10px thay vì 12px để tiêu đề không xuống dòng.

## 6. Ngôn ngữ giao diện

### Định dạng tiếng Việt

Dùng `Intl.NumberFormat('vi-VN')`, không tự nối chuỗi.

```
Khối lượng   8.240 kg        (chấm phân nhóm nghìn)
Phần trăm    87,4%           (phẩy thập phân)
Thể tích     18,4 m³
Kích thước   7.200 × 2.350 × 2.400 mm
Ngày         14/09/2026
Giờ          14:30
```

Đặt các hàm format trong `src/lib/format.ts` và dùng lại, không viết rải rác.

### Không để từ vựng kỹ thuật rò ra màn vận hành *(bổ sung)*

Màn vận hành viết bằng ngôn ngữ của người dùng, không phải của thuật toán hay của
backend. Ví dụ đã sửa: hộp thoại tối ưu từng ghi "Thế hệ 128" — đúng thuật ngữ giải
thuật di truyền nhưng vô nghĩa với điều phối viên, và sẽ **sai hẳn** nếu sau này đổi
thuật toán. Nay ghi "Vòng tối ưu 128".

Tên trường dữ liệu trong code vẫn giữ đúng hợp đồng với backend (`generation`);
giao diện làm lớp dịch. Ngoại lệ: màn **So sánh phương án** được dùng từ vựng thuật
toán ("GA 500 thế hệ", "GA có ràng buộc LIFO") vì ở đó người đọc đang so sánh thuật toán.

### Nút chưa nối backend

Không để nút bấm vào mà im lặng — người dùng không phân biệt được với lỗi. Gọi
`notifyPendingFeature()` trong `lib/pending-feature.ts` để báo rõ đang chờ gì. Xoá lời
gọi khi chức năng được nối thật.

## 7. Quy tắc riêng cho 3D

### Three.js

- Toàn bộ code Three.js nằm trong `src/features/viewer3d`. Không import `three` ở nơi khác. Màn khác cần 3D thì import component từ `viewer3d` (ví dụ `PositionViewer` cho màn kho).
- Kiện hàng render bằng **InstancedMesh** với `setColorAt`, không tạo mesh riêng từng kiện. Màn phương án dùng 3 InstancedMesh: kiện trong lát cắt, kiện ngoài lát cắt (mờ), và vỏ viền.
- Nền Canvas luôn tối, kể cả khi phần còn lại của app sáng.
- Mục tiêu ≥30 FPS với 300 kiện. Trước khi thêm bất kỳ hiệu ứng nào, đo `renderer.info.render.calls` — giữ dưới 100. Thêm `?debug` vào URL màn phương án để hiện số đo.
- Mọi hiệu ứng nâng cao (post-processing, shadow, AO) phải có cờ tắt được trong `usePerformanceFlags`.
- Animation trong Canvas dùng `@react-spring/three`. Animation ngoài Canvas dùng `motion`.
- Panel điều khiển nổi trên Canvas là React thường đặt đè bằng CSS, không dùng `<Html>` của drei trừ khi cần neo theo vật thể 3D. Lớp phủ phải `pointer-events-none`, chỉ bật lại trên đúng nhóm nút, nếu không nó nuốt thao tác kéo xoay.
- Canvas phải có `touch-action: none` (đã đặt toàn cục trong `index.css`). Thiếu nó thì trên máy tính bảng kéo ngón tay sẽ cuộn trang thay vì xoay mô hình — lỗi chỉ lộ khi chạm tay, dùng chuột không thấy.
- Ba lưu ý về camera: `fitToBox` của camera-controls **xoay camera** về nhìn thẳng mặt gần nhất nên làm mất góc chéo — với panel hẹp hãy tự tính khoảng cách từ bán kính bao và tỉ lệ khung. Vách thùng dùng mặt đơn pháp tuyến hướng vào trong để vách gần camera tự biến mất. `PCFSoftShadowMap` đã bị gỡ khỏi three r186, dùng `shadows="percentage"`.

### Ảnh xem trước tĩnh dùng SVG, không dùng Three.js *(bổ sung)*

Ảnh nhỏ, không xoay được thì vẽ bằng SVG đẳng cự qua `lib/isometric.ts` — nhẹ hơn
nhiều và không kéo Three.js vào chunk. Đang dùng ở: xem trước trong modal tối ưu,
ảnh thu nhỏ màn so sánh phương án, hình minh hoạ hướng đặt kiện ở kho, skeleton lúc
đang tải Three.js, và hình minh hoạ màn đăng nhập.

Chỉ dùng Three.js khi người dùng **cần xoay hoặc bấm vào vật thể**.

## 8. Chuyển động

| Tình huống | Thời lượng | Easing |
|---|---|---|
| Hover, nhấn nút | 120ms | standard |
| Toast vào / ra | 200 / 150ms | decelerate / accelerate |
| Panel chi tiết trượt | 280ms | decelerate |
| Modal mở | 220ms | standard |
| Kéo thả sắp xếp | 200ms | standard |
| Chuyển góc camera 3D | 500ms | decelerate |
| Một bước phát lại xếp hàng | 400–700ms | decelerate |

Bắt buộc hỗ trợ `prefers-reduced-motion`: mọi thời lượng trên 200ms rút về 100ms, tắt chuyển động lớn.

## 9. Quy ước code

```
Component React     PascalCase, file trùng tên component   LoadPlanViewer.tsx
Hook                bắt đầu bằng use                       useOptimizationJob
Hàm xử lý sự kiện   tiền tố handle                         handleApprovePlan
Biến, hàm           camelCase
Type, Interface     PascalCase, không tiền tố I            Placement, VehicleSpec
Hằng số             UPPER_SNAKE_CASE
Đường dẫn route     slug tiếng Việt không dấu              /chuyen/:tripId/phuong-an
```

Commit theo Conventional Commits: `feat(viewer3d): add cross-section slider`.

- TypeScript strict. Không `any`. Không `@ts-ignore`. Khi thư viện bắt buộc phải có kiểu lỏng, lấy kiểu từ chính thư viện (`TableOptions<...>['columns']`) thay vì tự viết `any`.
- Không gọi API trực tiếp trong component.
- Mọi form dùng react-hook-form + zod schema, không tự quản state form. Đọc giá trị đang nhập bằng `useWatch`, **không** dùng `form.watch()` trong thân render — React Compiler không memo được và sẽ cảnh báo.
- Không dùng `localStorage`. Phiên đăng nhập tạm giữ trong `sessionStorage`; khi nối backend thật sẽ đổi sang cookie HttpOnly do server đặt.

### Lớp dữ liệu *(đã điều chỉnh)*

Luật ban đầu ghi "mọi request đi qua hook TanStack Query". Thực tế phần lớn màn chưa
có backend nên chưa có request nào. Đường đi chuẩn khi làm màn mới:

1. Viết `features/<tên>/<tên>-api.ts` — nơi duy nhất biết về mạng. Chưa có backend thì trả mock sau một khoảng trễ giả.
2. Bọc bằng hook Query trong cùng feature (`useTripsQuery`).
3. Component chỉ gọi hook, không bao giờ gọi `-api.ts` trực tiếp.

Màn nào còn giữ dữ liệu ở `useState` (Đội xe, Người dùng) thì phải chuyển sang đường
đi này khi nối backend — đừng thêm màn mới theo lối cũ.

### Chia chunk theo route

Mọi màn trong `app/App.tsx` đều `lazy()`. Nhờ đó Three.js chỉ tải khi mở màn 3D,
recharts chỉ tải khi mở dashboard, và máy tính bảng ở kho không gánh code của dispatcher.
Thêm màn mới thì thêm theo đúng lối này.

## 10. Khả năng truy cập

- Tương phản chữ tối thiểu 4,5:1. Không dùng chữ mảnh hoặc xám nhạt cho nội dung quan trọng.
- Vùng chạm tối thiểu 44px desktop, **56px trên tablet và điện thoại**.
- Màn hình dispatcher phải dùng được hoàn toàn bằng bàn phím. Màn 3D có phím tắt: Space phát/dừng, ←/→ lùi/tiến một bước, Home về đầu. Kéo thả điểm giao làm được bằng bàn phím qua dnd-kit (Space nhấc, mũi tên di chuyển, Space thả).
- Màu điểm giao luôn đi kèm nhãn hoặc số, không bao giờ chỉ dựa vào màu. Trong 3D, chèn nhãn ẩn `sr-only` cho khối màu.
- Chữ tối thiểu 16px trên tablet và điện thoại.
- Mọi màn toàn màn hình (kho, tài xế, 3D) phải có lối thoát nhìn thấy được. Màn kiosk không có nghĩa là không có đường ra.

## 11. Khi dựng lại màn hình từ mockup

1. Xác định trước những component **đã tồn tại** trong repo có thể dùng lại. Không tạo component mới trùng chức năng.
2. Lấy màu và khoảng cách từ token, không đo từ ảnh.
3. Nếu mockup vi phạm luật ở mục 5, **làm theo luật ở mục 5** và nói rõ chỗ đã lệch khỏi mockup.
4. Dữ liệu để mock đặt trong file riêng `*.mock.ts` (xem mục 3 để biết đặt ở đâu), không nhúng vào component.
5. Không viết một file dài quá 250 dòng. Tách sớm — thường tách được ngay ở phần header hoặc từng panel.

### Những chỗ đã lệch khỏi bản design gốc, có chủ ý

| Bản design | Đã làm | Vì |
|---|---|---|
| Bóng `0 1px 2px` trên card | Chỉ viền 1px | Mục 5 cấm bóng trên card |
| Nhãn mục viết hoa + giãn chữ | Viết thường | Mục 5 cấm viết hoa toàn bộ |
| Nút "XÁC NHẬN ĐÃ XẾP" xanh lá, viết hoa | Nút primary, viết thường | Mục 5 chỉ định nghĩa nút chính nền `--primary` |
| Nút "Chỉ đường" màu primary trên màn tài xế | Đổi sang secondary | Mỗi màn chỉ một nút primary |
| Chữ 11px và 13px rải rác | Ép về 11px (micro) hoặc 12/14px | Giữ thang chữ ở mục 4 |
| Màn kho không có nút thoát | Thêm nút quay lại 56px | Mục 10: màn toàn màn hình phải có lối ra |
| Ô vị trí 3D ở màn kho là ảnh tĩnh | Three.js xoay được | Công nhân cần nhìn quanh kiện để đặt đúng |
