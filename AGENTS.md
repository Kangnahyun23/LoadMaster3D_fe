# AGENTS.md — LoadMaster Web

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

### MVP theo Build Spec *(bổ sung 15/09/2026)*

Đang tích hợp [LoadMaster_FE_MVP_Build_Spec.md](LoadMaster_FE_MVP_Build_Spec.md) vào repo
này trên nhánh `feat/spec-mvp`. Quyết định và phạm vi: [docs/prd.md](docs/prd.md) (D-01 → D-39).
Việc chia nhỏ: [docs/issues/](docs/issues/README.md). Tiến độ theo ngày: [docs/progress.md](docs/progress.md).

- **Bắt buộc theo Spec:** đơn vị cm/kg, hệ toạ độ, mô hình dữ liệu và contract
  `OptimizationService`, validation, nhãn **MOCK RESULT**, acceptance criteria mục 15.
  Khi luật dưới đây mâu thuẫn với phần bắt buộc của Spec, Spec thắng và phải sửa luật.
- **Được điều chỉnh cho khớp repo:** cấu trúc thư mục, component, thư viện.
- Mọi kết quả từ mock có badge **MOCK RESULT** (không dịch). Không có chữ kiểu "AI optimized",
  không đặt tên service là `AIService`.
- Giao diện chuyển được **vi / en** (D-07); tiếng Việt là ngôn ngữ mặc định và nguồn chuẩn của từ điển.

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

Kiểm thử (devDependencies):

```
vitest 5                 — unit (node) và dom (jsdom), cấu hình ở vitest.config.ts
@testing-library/react   — test component qua hành vi người dùng (+ user-event, jest-dom)
@playwright/test         — E2E trình duyệt thật (thêm ở LM-005)
```

**Không dùng:** `framer-motion-3d` (deprecated, không hỗ trợ React 19) · Redux · Zustand (state dùng chung đi qua mock repository + TanStack Query, D-06) · thư viện i18n (từ điển tự viết, D-07) · axios (dùng fetch) · moment.js · thư viện UI khác.

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
    i18n/               từ điển vi/en, provider, hook (LM-027)
    mock-db/            kho in-memory: xe, chuyến, revision bất biến, Duyệt, seed chuyến đã duyệt (LM-026)
  types/                type dùng từ hai feature trở lên
  domain/               logic nghiệp vụ THUẦN theo Spec — không React, không Three.js
    geometry/           số (roundCm, EPSILON), hộp, chồng lấn, biên thùng, 6 hướng đặt, lưới không gian
    models/             type contract Spec + zod schema (LM-010)
    constraints/        validation và ràng buộc, trả mã lỗi (LM-014 →)
    metrics/            tỷ lệ sử dụng, trọng tâm (LM-021)
    fixtures/           dữ liệu mẫu Spec mục 12
    cargo/              mở rộng quantity thành instance, trùng ID, mã kiện mới (LM-013)
  services/
    optimization/       interface OptimizationService, MockOptimizationService, worker (LM-024 →)
  test/                 setup và dữ liệu test dùng chung (setup-dom.ts, spec-13.ts, placements.ts, engine-plans.ts)
tests/                  unit test cũ của viewer3d (Vitest)
e2e/                    Playwright (LM-005)
```

Mỗi feature tự chứa component, hook, type của nó. Chỉ đưa lên `components/`, `lib/`
hoặc `types/` khi có **từ hai feature trở lên** dùng chung.

**`src/domain` và `src/services`** *(bổ sung, D-19)*: không import React, Three.js, router hay
component. Mọi hàm tính toán ở đây là pure function có unit test. Feature và engine 3D gọi vào
domain, không bao giờ ngược lại. Three.js không quyết định tính hợp lệ của placement.

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

**Token cỡ chữ và `cn()`** *(bổ sung 15/09/2026, LM-055)*: `cn()` trong `lib/utils.ts` dùng
tailwind-merge đã khai báo các cỡ chữ của `@theme` (`display`, `h1`, `h2`, `h3`, `body-lg`, `body`,
`caption`). Thiếu khai báo thì tailwind-merge coi `text-body` là màu chữ và **bỏ mất `text-white`**
của nút. Thêm token `--text-*` mới vào `@theme` thì phải thêm tên vào `THEME_FONT_SIZES`.

**Nguồn quét class của Tailwind** *(bổ sung 15/09/2026, LM-005)*: `src/index.css` khai báo
`@import 'tailwindcss' source('.')` — chỉ quét `src/`. Không bỏ `source('.')`: mặc định Tailwind v4 quét
cả gốc repo (`AGENTS.md`, `docs/`, `design/`, `.claude/worktrees/`) và **tải lại toàn trang** dev server
mỗi khi một file ngoài app đổi, làm mất state và làm E2E đỏ ngẫu nhiên. Class chỉ được sinh từ code
trong `src/`; muốn dùng class từ nơi khác thì thêm `@source` tường minh.

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

### Đơn vị nghiệp vụ *(đã điều chỉnh 15/09/2026)*

Luật ban đầu dùng **mm** cho kích thước và toạ độ. Spec bắt buộc **cm/kg** và cấm trộn đơn vị
trong state và payload (D-03), nên đích là:

| Đại lượng | Đơn vị | Làm tròn khi vào domain |
|---|---|---|
| Dài, rộng, cao, toạ độ, clearance | cm | `roundCm` — bội 0,1 cm |
| Khối lượng, tải trọng, tải tối đa | kg | `roundKg` — bội 0,01 kg |
| Thể tích | cm³ (hiển thị thêm m³ cho dễ đọc) | — |

- Chỉ `viewer3d/scene/units.ts` được đổi scale sang đơn vị Three.js.
- `roundCm`/`roundKg` áp **tại biên**: khi lưu dữ liệu form, khi nhận placement từ service, khi
  editor commit. Không làm tròn giữa các phép tính trung gian.
- So sánh số thực trong `src/domain` qua `eq/lt/gt` có `EPSILON = 1e-6` của `@/domain/geometry`,
  **không** dùng `<` `>` `===` trực tiếp giữa toạ độ hoặc kích thước. Oxlint không có rule tự
  động cho việc này — reviewer phải chặn. Ví dụ đã gặp: `100.4 + 120.7 = 221.10000000000002`
  làm hai kiện chạm mặt bị báo chồng lấn giả.
- Mọi ví dụ số thực đưa vào test phải được chạy thử bằng máy trước; ba giả định viết tay trong
  issue gốc đã sai (`45.1 + 45.1 + 45.1` thực ra bằng đúng `135.3`).
- **Trạng thái chuyển đổi:** `src/domain` đã dùng cm. Engine 3D, editor, kho, tài xế và mock
  `LoadPlan` **vẫn là mm** cho tới LM-031/LM-060/LM-061/LM-062. Code mới không được thêm giá trị
  mm; code cũ đổi theo đúng issue, không đổi rải rác.

### Định dạng số và ngày theo ngôn ngữ

Dùng `Intl`, không tự nối chuỗi hay thay dấu (`toFixed().replace('.', ',')` là sai).

```
                 vi-VN                      en-US
Khối lượng       8.240 kg                   8,240 kg
Phần trăm        87,4%                      87.4%
Thể tích         18,4 m³                    18.4 m³
Kích thước       720 × 235 × 240 cm         720 × 235 × 240 cm
Ngày             14/09/2026                 (theo LM-027)
Giờ              14:30                      (theo LM-027)
```

Đặt các hàm format trong `src/lib/format.ts` và dùng lại, không viết rải rác. Từ LM-027 hàm
format nhận locale đang chọn.

### i18n vi/en *(bổ sung, D-07, D-08)*

- Từ điển TypeScript tự viết trong `src/lib/i18n/`. `vi` là nguồn chuẩn; `en` khai báo sao cho
  **thiếu hoặc thừa key là lỗi TypeScript** lúc build.
- Ngôn ngữ đọc theo thứ tự `?lang` → `sessionStorage` → `vi`. Không dùng `localStorage`.
  Đổi ngôn ngữ không tải lại trang, không mất dữ liệu đang nhập.
- Chuỗi hiển thị viết qua `t()`; từ LM-027 mọi chuỗi mới **phải** qua từ điển. Chuỗi cũ được
  chuyển theo đợt (LM-070, LM-071), không sửa rải rác ngoài issue.
- Không dịch: badge **MOCK RESULT**; tên riêng trong dữ liệu (tên kho, điểm giao, người).
- `src/domain` **không chứa câu chữ hiển thị**: validation và constraint trả **mã lỗi + tham số**
  (`{ code, severity, params }`, D-28); zod schema dùng mã làm message. UI dịch mã và format số
  theo locale. Test so mã, không so câu.
- Câu cho mã ràng buộc nằm ở nhánh `issues` của từ điển, key trùng tên mã, và chỉ gọi qua
  `formatIssue(issue, t, format)` của `@/lib/i18n` (LM-028). Thêm mã vào `CONSTRAINT_CODES` mà
  chưa có câu thì `tsc -b` báo lỗi. Bản en giữ đúng từng chữ câu mẫu Spec mục 13 (`src/test/spec-13.ts`).

### Không để từ vựng kỹ thuật rò ra màn vận hành *(bổ sung)*

Màn vận hành viết bằng ngôn ngữ của người dùng, không phải của thuật toán hay của
backend. Ví dụ đã sửa: hộp thoại tối ưu từng ghi "Thế hệ 128" — đúng thuật ngữ giải
thuật di truyền nhưng vô nghĩa với điều phối viên, và sẽ **sai hẳn** nếu sau này đổi
thuật toán. Nay ghi "Vòng tối ưu 128".

Tên trường dữ liệu trong code vẫn giữ đúng hợp đồng với backend (`generation`);
giao diện làm lớp dịch. Ngoại lệ: màn **So sánh phương án** được dùng từ vựng thuật
toán ("GA 500 thế hệ", "GA có ràng buộc LIFO") vì ở đó người đọc đang so sánh thuật toán.

### Nút chưa hoạt động *(đã điều chỉnh 15/09/2026, D-20)*

Luật ban đầu cho phép giữ nút chưa nối backend nếu gọi `notifyPendingFeature()` để báo đang
chờ gì. Spec cấm "nút giả" (mục 9.3: Import CSV chỉ hiện khi hoạt động), nên nay:

- **Không hiển thị** nút hay mục menu chưa có chức năng. Không để nút bấm vào mà im lặng,
  không dùng toast báo "đang chờ", không báo thành công giả.
- Ngoại lệ duy nhất: nơi Spec yêu cầu giữ vị trí cho tính năng sau (tải trục) hiển thị nhãn
  **"Sẽ có sau" / "Coming later"** dạng chữ, không bấm được.
- Code hiện còn `notifyPendingFeature()` ở một số màn cũ — gỡ ở LM-053, không thêm lời gọi mới.

## 7. Quy tắc riêng cho 3D

### Three.js

- Toàn bộ code Three.js nằm trong `src/features/viewer3d`. Không import `three` ở nơi khác. Màn khác cần 3D thì import component từ `viewer3d` (ví dụ `PositionViewer` cho màn kho).
- Kiện hàng render bằng **InstancedMesh** với `setColorAt`, không tạo mesh riêng từng kiện. Tối đa 3 InstancedMesh cargo: solid, ghost và vỏ viền. Tier low tắt viền chung nhưng giữ viền cảnh báo khi có blocker. Mapping `instanceId ↔ placementId` nằm trong `scene/instance-layout.ts`, không lấy index của danh sách UI để picking. Editor và animation dỡ mỗi loại dùng tối đa một proxy tạm; bánh xe dùng instancing riêng, không nhân theo cargo count.
- Nền Canvas luôn tối, kể cả khi phần còn lại của app sáng.
- Target chức năng/performance là 1.000 placements với draw calls dưới 100, số mesh/nhãn không tăng tuyến tính theo cargo. Đã kiểm tra selection, editor, playback và các vai trò trên Chromium; mục tiêu thiết bị thật: desktop hướng tới 60 FPS, tablet 45–60 FPS, phone khoảng ≥30 FPS bằng quality adaptation. Số đo SwiftShader không phải cam kết FPS trên thiết bị thật. Thêm `?debug` để đo trước khi thêm hiệu ứng.
- Mọi hiệu ứng nâng cao (post-processing, shadow, AO) phải có cờ tắt được trong `usePerformanceFlags`. Ba tier `high / balanced / low` điều khiển DPR, bóng, viền chung, trang trí, bề mặt cargo và animation; viền kiện đang chọn luôn được giữ. Runtime bỏ qua idle, hạ tier sau 3 mẫu chậm (>28 ms), nâng sau 8 mẫu nhanh (<18 ms), cooldown 12 giây. Debug quality override khóa tier để đo lặp lại.
- Animation trong Canvas dùng `@react-spring/three`. Animation ngoài Canvas dùng `motion`.
- Panel điều khiển nổi trên Canvas là React thường đặt đè bằng CSS, không dùng `<Html>` của drei trừ khi cần neo theo vật thể 3D. Lớp phủ phải `pointer-events-none`, chỉ bật lại trên đúng nhóm nút, nếu không nó nuốt thao tác kéo xoay.
- Canvas phải có `touch-action: none` (đã đặt toàn cục trong `index.css`). Thiếu nó thì trên máy tính bảng kéo ngón tay sẽ cuộn trang thay vì xoay mô hình — lỗi chỉ lộ khi chạm tay, dùng chuột không thấy.
- Ba lưu ý về camera: `fitToBox` của camera-controls **xoay camera** về nhìn thẳng mặt gần nhất nên làm mất góc chéo — dùng phép chiếu các góc bao theo preset và tỉ lệ khung; bounding sphere theo chiều dài làm góc cửa sau trên phone quá nhỏ. Resize panel giữ góc người dùng đang xoay. Vách thùng dùng mặt đơn pháp tuyến hướng vào trong để vách gần camera tự biến mất. `PCFSoftShadowMap` đã bị gỡ khỏi three r186, dùng `shadows="percentage"`.

### Foundation engine *(bổ sung)*

- `LoadPlan` là snapshot bất biến. Planner đi qua `adaptLoadPlan → ViewerSceneModel`, kết hợp `ViewerDraft` theo ID để sinh effective placements. Chỉ commit `{ position?, orientation?, pinned? }` vào draft; không sửa `plan.placements`. Tất cả vị trí trong draft dùng mm nghiệp vụ.
- Kích thước domain **đã áp orientation**. Phải khôi phục kích thước nguyên bản từ hướng nguồn rồi áp hướng đích, kể cả nguồn ở hướng 1 hoặc 2. Xoay giữ nguyên góc vị trí của kiện. Helper nằm trong `viewer-scene-model.ts`.
- Cả ba vai trò dùng chung `SceneCanvas` với `frameloop="demand"`. CameraControls tự invalidate khi chuyển động; mọi thay đổi buffer imperative phải gọi invalidate. Spring chỉ ghi ma trận/proxy kiện đang chạy, không đưa state từng frame qua React.
- `frustumCulled={false}` không loại bỏ nhu cầu bounds của **raycast**. Cargo dùng sphere bao toàn bộ effective geometry và quãng animation, cập nhật khi geometry đổi. Không tính lại `computeBoundingSphere()` trong animation/step/slice path; cập nhật màu không ghi lại ma trận.
- Dữ liệu đo riêng trong `features/viewer3d/benchmark.mock.ts`: `?debug&packages=132|300|500|1000`, có thể thêm `&quality=high|balanced|low`. Không đổi mock nghiệp vụ và không kích hoạt benchmark khi thiếu `debug`. Đây là fixture renderer có khe hở, không phải phương án đã xác nhận ổn định chất xếp.
- Debug chỉ quan sát: FPS khi scene chuyển động, draw calls, tam giác, số kiện, DPR và tier. Khi nghỉ hiển thị trạng thái nghỉ; không tự invalidate để đo FPS. Chưa nâng mục tiêu FPS trên thiết bị thật chỉ dựa vào số đo Chromium phần mềm.
- Low tier dùng DPR 0,5 và vật liệu cargo Lambert sau phép đo kéo camera 1.000 kiện trên SwiftShader; giữ nguyên picking và nhãn HTML. Balanced/high giữ Standard. Phần 3D mềm hơn là trade-off có chủ ý để ưu tiên tương tác. Không suy diễn kết quả này thành cam kết FPS trên mọi thiết bị hoặc mọi tier.

### Manual editor *(bổ sung)*

- Planner có chế độ Xem/Chỉnh sửa. Chỉ kiện đang chọn dùng một proxy mesh; instance tương ứng được ẩn theo ID. Lưới sàn và chỉ dẫn trục có số draw call cố định.
- Kéo dùng pointer capture, ref và cập nhật Three imperative; chỉ commit một lệnh khi thả hợp lệ. Trong gesture tạm ngưng camera và raycast instances, khôi phục khi thả/hủy/unmount. Không đưa pointer position qua React mỗi frame.
- Snapping/validation dùng mm nguyên trong `viewer3d/editor`. Nút nudge đi đúng bước mm; snapping dùng khi kéo hoặc bấm Căn vị trí. Không xoay quaternion tự do.
- Chồng lấn và vượt biên chặn commit. Nâng đỡ dưới 80%, tiếp xúc kiện dễ vỡ và chỉnh thủ công chỉ là advisory. Coverage tính union diện tích tiếp xúc, tolerance 2 mm; không phải stability solver. Fixture có khe hở có thể nhận advisory.
- Lịch sử giữ patch trước/sau theo ID, tối đa 200 lệnh, không snapshot placements mỗi lần di chuột. Ghim khóa move/rotate cho đến khi bỏ ghim. Reset mọi chỉnh sửa cần dialog; reset riêng bị chặn nếu vị trí gốc đang bị kiện khác chiếm.
- Không tạo placement từ UnplacedPackage, không lưu draft qua phiên/trang và không coi kiểm tra frontend là kết quả tối ưu authoritative.

### Operations và scene dùng chung *(bổ sung)*

- `operations/scene-semantics.ts` tách loaded/current/next/future/removed khỏi renderer. Planner, `PositionViewer` (kho) và `DriverCargoViewer` cùng dùng `SceneCanvas`; panel và workflow nằm ở wrapper. Không thêm engine cho từng vai trò.
- Loading lấy `placement.step`; unloading lấy **thứ tự dỡ gợi ý**, ưu tiên stop tăng, cao trước, gần cửa trước. Stop-order consistency không chứng minh unload accessibility. Blocker chỉ là giao cắt hành lang thẳng về +X cửa sau, không tính người, xe nâng, clearance hay xoay lúc dỡ.
- CoM là **tâm khối lượng hàng** đã xếp/còn lại, không phải toàn xe. Tải trục hiển thị số từ phương án gốc, chưa tính lại sau edit/dỡ. Cabin, bánh và khung gầm là mô hình minh họa, không phải axle geometry.
- Chi tiết xe gộp geometry theo vật liệu; sáu bánh dùng một draw. Cargo dùng atlas trung tính chung cho carton/pallet/crate qua thuộc tính instance, không phải nhãn hướng đặt. Low tắt chi tiết phụ; không tắt cues nghiệp vụ. Khi gặp potential blocker, playback dỡ tạm dừng và giữ target. Chỉ khi người dùng chủ động bỏ qua bước mô phỏng, kiện bị cản mới mờ tại chỗ; không dịch chuyển xuyên kiện khác. Reduced motion không dịch chuyển lớn; hoàn tất phải trở lại idle.
- Timeline dùng ô cao bằng nhau, 8–64 bins theo chiều rộng, slider giữ toàn bộ bước. Bản đồ điểm giao mặc định tắt; geometry nằm hoàn toàn trong mép sàn thùng (helper `operations/stop-map.ts`), depth test bình thường. Tính từ phân bố thể tích thực, giữ nhiều màu khi stop xen kẽ. Không đặt ribbon trên thân/gầm hoặc bên ngoài xe. Màu phải có số/tên điểm trong panel hoặc nhãn.
- Planner mặc định ưu tiên scene với HUD gọn; thông tin kiện, tải trục, màu/slice và lớp phân tích nằm trong inspector mở theo nhu cầu. Double-click focus giữ góc nhìn; Esc hoặc “Xem toàn xe” thoát focus. Theo bước là tùy chọn, tạm dừng khi người dùng tự điều khiển camera. Chọn blocker không đổi target dỡ; có đường quay lại target.
- Viền/nhãn selected/current/next/hover là tập nhỏ cố định; `SceneCallout` giữ nhãn trong khung và đường chỉ dẫn neo đúng vị trí 3D. Editor có ba hướng đo, mặt phẳng kéo, tối đa ba mặt snap và bốn vùng overlap bằng hai InstancedMesh phụ cố định. Geometry/nhãn của preview cập nhật imperative, không đưa pointer frames qua React. Phone giữ trạng thái/snap/invalid, lược nhãn đo phụ để dành chỗ cho kiện.
- Three của kho và driver được lazy-load từ `viewer3d`. Driver chỉ tải khi mở “Xem vị trí hàng”; mô phỏng không đánh dấu giao hàng và không có editor. Phone dùng panel dưới/drawer, nút thao tác 56px, không phụ thuộc hover/gizmo nhỏ.

### Tích hợp Spec vào engine *(bổ sung 15/09/2026 — đích, làm theo issue)*

Các mục "Foundation engine", "Manual editor", "Operations" phía trên mô tả code **hiện tại**
(mm, 3 hướng, `placement.step`). Đích sau phase 2 của [docs/issues](docs/issues/README.md):

- Engine nhận view model dựng từ `OptimizationResult` + `CargoPackage` + chuyến (LM-030),
  đơn vị cm, `SCENE_SCALE = 0.01` chỉ trong `scene/units.ts` (LM-031).
- 6 hướng đặt `LWH … HWL`; xoay chỉ vòng qua `allowedOrientations`, tôn trọng `keepUpright` (LM-032).
- Vật cản vẽ bằng số draw call cố định (tối đa 2), màu token riêng, không raycast khi kéo kiện (LM-033).
- Editor: nudge 1/5/10 cm, lưới 5 cm, snap 2 cm, commit qua `roundCm` (LM-034). Mỗi lần thả/xoay
  chạy constraint engine của `src/domain`; lỗi chặn commit, cảnh báo vẫn commit (LM-035).
  Ngân sách: constraint engine 1.000 kiện p95 ≤ 50 ms, một lần thả p95 ≤ 8 ms (D-29).
- Timeline dùng `loadingOrder` / `unloadingOrder` của kết quả; LIFO lấy từ domain — che kín
  100% mặt sau là vi phạm, che một phần là cảnh báo (LM-036, D-26).
- Tải trục không hiện số khi backend chưa trả dữ liệu tin cậy: nhãn "Sẽ có sau" (LM-037, Spec 7.10).
- Mock optimization chạy trong Web Worker, không chặn main thread (LM-025, D-30).

Khi làm một issue trong nhóm này, sửa luật tương ứng ở các mục phía trên cùng lúc với code.

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

### Dữ liệu dùng chung và tối ưu *(bổ sung 15/09/2026, D-06, D-30, D-31)*

- Dữ liệu đi qua nhiều màn (xe, chuyến, kiện, revision kết quả) nằm trong **mock repository
  in-memory** (`src/lib/mock-db/`, LM-026) → `features/<tên>/<tên>-api.ts` → hook TanStack Query.
  Ghi bằng `useMutation` rồi invalidate. Không thêm store client (Zustand, Redux, Context giữ dữ liệu nghiệp vụ).
- Tối ưu đi qua interface `OptimizationService` (`src/services/optimization`). Hiện có mock chạy trên luồng gọi
  (`MockOptimizationService`), trong Web Worker (`WorkerOptimizationService`) và bản giả lập sự cố
  (`UnavailableOptimizationService`); API thật sau này thay tại `-api.ts`, UI không đổi. Kết quả mock luôn
  `isMockResult: true`.
  Mock thuần là `runMockOptimization` (tất định theo request + `randomSeed`, `runtimeMs` qua `clock` tiêm vào);
  `FAILED` chỉ khi request sai schema hoặc có lỗi toàn cục — contract không có `warnings`, nên UI chạy `validateRequest`
  trước khi gọi. `message` của kiện chưa xếp là `reasonCode`, UI dịch mã (LM-024).
- Kết quả là **revision bất biến** theo `jobId`. Duyệt tạo revision approved mới; sửa xe/kiện sau
  khi tối ưu làm revision lỗi thời và chặn Duyệt. Kho và tài xế chỉ đọc revision đã duyệt.
- Trạng thái demo lỗi service bật bằng tham số URL (`?mo-phong=loi`), đọc ở `-api.ts`, không đưa
  công tắc kỹ thuật lên UI vận hành. `-api.ts` lấy service qua `createOptimizationService({ simulateFailure })`:
  Web Worker trong trình duyệt, chạy trên luồng gọi khi không có Worker (jsdom), mọi đường kết thúc đều `terminate` (LM-025).

### Kiểm thử *(bổ sung 15/09/2026, D-15, D-39)*

- `pnpm test` chạy Vitest: project `unit` (node) cho `tests/**/*.test.ts` và `src/**/*.test.ts`;
  project `dom` (jsdom + React Testing Library) cho `src/**/*.dom.test.tsx`, setup ở `src/test/setup-dom.ts`.
- Test ở **seam** đã thống nhất (giao diện công khai), không test file nội bộ. Ví dụ: domain geometry
  chỉ test qua `@/domain/geometry`.
- Logic domain làm theo TDD: một test đỏ → cài đặt tối thiểu → xanh, rồi mới sang test sau.
  Giá trị kỳ vọng lấy từ nguồn độc lập (literal trong Spec, số đã kiểm bằng máy), không tính lại
  theo cách code tính.
- Benchmark domain: `pnpm test:bench` (file `*.bench.ts`). Vitest 5 lấy `bench` từ context của
  `test` (`test(name, async ({ bench }) => …)`), không còn `import { bench } from 'vitest'`.
- **Cổng ngân sách constraint engine** (D-29, LM-023): `constraint-engine.bench.ts` **fail** khi p95 của dựng + `evaluateAll`
  1.000 kiện vượt 50 ms hoặc `evaluateMove`/`commitMove` vượt 8 ms (75/12 ms khi có biến `CI`). p95 tính từ mẫu
  (`retainSamples`), không lấy p99 thay. Ghi số đo: `BENCH_RECORD=docs/benchmarks/<tên>-<ngày>.json pnpm test:bench`.
  Đổi engine hoặc lưới không gian thì chạy lại cổng này.
- File `*.bench.ts` được kiểm kiểu bằng `tsconfig.bench.json` (có kiểu Node để ghi file); `tsconfig.app.json` loại chúng
  ra để code app không thấy kiểu Node.
- E2E: `pnpm test:e2e` (Playwright, `e2e/*.spec.ts`, project `desktop`/`tablet`/`phone` theo tag
  `@tablet`/`@phone`). Tự bật Vite ở `127.0.0.1:5175`; cổng đang do checkout khác giữ thì đặt
  `E2E_PORT`. Trước khi so tư thế camera phải chờ camera đã vẽ xong (`waitCameraSettled`) —
  overlay debug có thể báo nghỉ sớm. CI: `.github/workflows/ci.yml` (LM-006).

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

## 12. Tối ưu token và context *(bổ sung)*

- Dùng trạng thái code hiện tại làm nguồn chuẩn cho task tiếp theo. Không đọc lại toàn repo hoặc file đã audit nếu chúng không thay đổi.
- Ưu tiên `git diff`, tìm symbol và import/reference; chỉ mở đúng phần liên quan. Tận dụng findings và kết quả kiểm tra đã có.
- Nếu cần research song song, chỉ dùng tối đa 1–2 subagent với scope hẹp, không giao đọc trùng code. Subagent trả findings ngắn, không viết essay hoặc paste code dài.
- Làm song song **nhiều issue** thì mỗi issue một git worktree riêng, chỉ giao issue không sửa chung file và đã đủ phụ thuộc. Agent không sửa `docs/progress.md`; người điều phối gộp nhánh và cập nhật tiến độ sau khi kiểm tra lại lint/build/test trên nhánh gộp.
- Không refactor ngoài scope, không over-engineer; chỉ thêm abstraction/dependency khi có nhu cầu đã chứng minh.
- Khi giải pháp đơn giản đạt acceptance criteria và performance target, dừng khám phá phương án khác.
- Chạy full `pnpm lint`, `pnpm build` và `pnpm test` để xác nhận cuối task (thêm `pnpm test:e2e` khi task đụng UI, sau LM-005); không lặp lại sau từng thay đổi nhỏ nếu chưa có lỗi hoặc rủi ro mới cần kiểm tra.
- Mỗi task xong: ghi kết quả vào file issue tương ứng và thêm một mục nhật ký có ngày vào `docs/progress.md`.
- Giữ chất lượng implementation và bằng chứng kiểm thử, đồng thời giảm tối đa context/token không cần thiết.
