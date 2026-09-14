---
id: LM-027
title: Hạ tầng i18n vi/en — từ điển typed, nút chuyển, format theo locale
phase: 1
labels: [i18n, infra]
depends_on: [LM-004]
estimate: 1.5d
prd: [D-07, D-08]
---

# LM-027 — Hạ tầng i18n

## Bối cảnh

Toàn app đang hardcode tiếng Việt; `lib/format.ts` cố định `vi-VN`. D-07 chốt tự viết, không thêm dependency. Làm sớm để mọi màn mới ở phase 2–3 dùng từ điển ngay.

## Việc cần làm

- [x] `src/lib/i18n/`: `Locale = 'vi' | 'en'`; từ điển `vi.ts` là nguồn chuẩn, `en.ts` khai báo `satisfies Dictionary<typeof vi>` để **thiếu key là lỗi TypeScript** lúc build.
- [x] `I18nProvider` + `useT()` trả `t(key, params)`; key có kiểu (gợi ý tự động), tham số có kiểu; hỗ trợ số nhiều đơn giản (`one` / `other`).
- [x] Ngôn ngữ đọc theo thứ tự `?lang` → `sessionStorage` → mặc định `vi`; đổi ngôn ngữ ghi `sessionStorage`, cập nhật `<html lang>`. Không dùng `localStorage`.
- [x] `lib/format.ts` nhận locale (`vi-VN` / `en-US`): độ dài cm, khối lượng kg, thể tích cm³ (kèm m³), phần trăm, tỷ lệ, kích thước, ngày, giờ. Hook `useFormat()`. *(Đặt tên dạng `format.length(cm)` thay cho `formatLength(cm)` — xem Kết quả.)*
- [ ] `LanguageSwitch`: trong nav rail (desktop) ✅ và header các màn toàn màn hình → kho, tài xế ở **LM-071**, Planner 3D ở **LM-070**; component đã có `orientation="horizontal"` và `size="touch"` (56px) cho chỗ đó.
- [x] Đổi ngôn ngữ không remount route, không mất dữ liệu form (kiểm bằng test RTL).
- [x] Chuyển trước chuỗi của nav rail, trang đăng nhập, 404 làm mẫu.

## Tiêu chí nghiệm thu

- [x] Xoá một key trong `en.ts` thì `pnpm build` báo lỗi.
- [x] `?lang=en` mở trang đăng nhập bằng tiếng Anh; số `5,320 kg` ở en, `5.320 kg` ở vi.
- [x] Test RTL: đang nhập form, đổi ngôn ngữ, giá trị còn nguyên.

## Kết quả — 15/09/2026 (TDD)

### Seam và test

- **unit `@/lib/format`** — [src/lib/format.test.ts](../../src/lib/format.test.ts): 13 test — 12 cho `createFormatter` (mỗi test so cả vi và en), 1 test chặn lớp hàm cũ vẫn ra đúng chữ tiếng Việt và đơn vị cũ.
- **dom `I18nProvider` qua RTL** — [src/lib/i18n/I18nProvider.dom.test.tsx](../../src/lib/i18n/I18nProvider.dom.test.tsx): 11 test — mặc định `vi`, `?lang=en`, đọc `sessionStorage`, `?lang` thắng lựa chọn đã lưu, `?lang` lạ bị bỏ qua, bấm nút đổi chữ + số + `<html lang>`, nhãn và `aria-pressed` của nút, ghi `sessionStorage`, form react-hook-form giữ giá trị khi đổi ngôn ngữ, tham số `{name}`, số nhiều + số theo locale.
- **Kiểu** — [src/lib/i18n/dictionary.test-d.ts](../../src/lib/i18n/dictionary.test-d.ts), do `tsc -b` biên dịch, Vitest không chạy: 7 `@ts-expect-error` (thiếu key, thừa key, bản dịch làm mất `{name}`, key sai, thiếu tham số, sai tên tham số, `count` không phải số). Đã chứng minh đỏ bằng cách nới lỏng kiểu tạm thời.
- Test chặn (chạy xanh ngay) đều đã được làm đỏ thử rồi khôi phục: bỏ `hourCycle`, đổi locale lớp cũ, đảo thứ tự `?lang`/storage, bỏ kiểm tra `?lang` hợp lệ, thêm `key={locale}` làm remount.
- **Kiểm tra cuối:** `pnpm test` 77/77 (53 cũ + 24 mới, 8 file) · `pnpm lint` ✅ · `pnpm build` ✅.

### API

- `@/lib/i18n`: `I18nProvider` (bọc ngoài cùng trong [providers.tsx](../../src/app/providers.tsx)), `useT()`, `useFormat()`, `useLocale()` → `{ locale, setLocale }`, `LOCALES`, `LOCALE_NAMES`, type `Locale`, `MessageKey`, `TFunction`.
- `t('nav.trips')` · `t('nav.account', { name })` · `t('common.packageCount', { count })`. Tham số kiểu số được format theo ngôn ngữ (`1.320` / `1,320`); số có đơn vị thì format trước bằng `useFormat()` rồi truyền chuỗi.
- `@/lib/format`: `createFormatter('vi-VN' | 'en-US')` trả `Formatter`; component dùng `useFormat()`, hàm thuần nhận `format` làm tham số (hợp với `formatIssue(issue, t, format)` của LM-028).
- `@/components/LanguageSwitch`: `orientation` (`horizontal` mặc định / `vertical` cho nav rail), `size` (`md` 44px / `touch` 56px, chữ 16px).

| Gọi | vi-VN | en-US |
|---|---|---|
| `weight(5320)` | 5.320 kg | 5,320 kg |
| `weight(1234.567)` | 1.234,57 kg | 1,234.57 kg |
| `length(1250.55)` · `length(240)` | 1.250,6 cm · 240 cm | 1,250.6 cm |
| `dimensions(1203.5, 235, 239.2)` | 1.203,5 × 235 × 239,2 cm | 1,203.5 × 235 × 239.2 cm |
| `volume(324000)` | 324.000 cm³ | 324,000 cm³ |
| `volumeM3(18400000)` · `volumeM3(40000000)` | 18,4 m³ · 40,0 m³ | 18.4 m³ |
| `percent(87.42)` · `percent(100)` | 87,4% · 100,0% | 87.4% |
| `ratio(0.62)` · `ratio(0.8)` | 0,62 | 0.62 · 0.80 |
| `integer(8240)` · `decimal(18.44)` · `decimal(18)` | 8.240 · 18,4 · 18,0 | 8,240 · 18.4 |
| `date(14/09/2026 14:30)` | 14/09/2026 | Sep 14, 2026 |
| `time(14:30)` · `time(00:05)` | 14:30 | 14:30 · 00:05 |

Chuỗi mong đợi đã chạy thật bằng `Intl` của Node 22.16 (ICU 77, CLDR 47) trước khi viết test: khoảng trắng trước đơn vị là U+0020 ở cả hai locale, không có khoảng trắng trước `%`.

### Chọn ngôn ngữ

`?lang=vi|en` → `sessionStorage['loadmaster.ngon-ngu']` → `vi`. Giá trị lạ bị bỏ qua. Mỗi lần ngôn ngữ đổi — kể cả lựa chọn đến từ `?lang` lúc mở trang — được ghi vào `sessionStorage` và `<html lang>`, nên mở link `?lang=en` rồi tải lại trang không có `?lang` vẫn là tiếng Anh. `?lang` chỉ đọc lúc mở trang.

### Thêm một câu

1. Thêm key vào `vi.ts`, đúng nhóm khu vực (`nav`, `auth.login`, `notFound`…).
2. `tsc -b` báo thiếu ở `en.ts` → thêm bản dịch, giữ đủ `{tham số}` (thiếu cũng là lỗi build).
3. Dùng `t('nhom.key')`. Câu đổi theo số lượng: object đúng hai key `{ one, other }` với `{count}`.
4. Khi từ điển dài phải tách file theo khu vực: mỗi file tiếng Anh con tự khai báo `satisfies Dictionary<(typeof vi)['nhom']>` — ghép bằng biến thì TypeScript không còn bắt key thừa.
5. Thông báo zod: message là key từ điển, dịch lúc render (mẫu ở `LoginPage`), nên đổi ngôn ngữ khi lỗi đang hiện thì lỗi cũng đổi theo.

### Quyết định và chỗ lệch khỏi issue

- **Tên hàm format:** issue ghi `formatLength(cm)`…; làm thành object `Formatter` (`format.length`, `format.weight`…) để một giá trị `format` đi cùng `t` sang hàm thuần. Lớp hàm cũ cấp module còn nơi gọi (`formatInteger`, `formatDecimal`, `formatRatioAsPercent`, `formatDimensions` theo **mm**, `formatDateTime`) giữ nguyên đầu ra vi-VN cho khoảng 40 file, có test chặn. Bỏ các hàm cũ không còn nơi gọi: `formatWeight`, `formatVolume` (nhận **m³**, dễ nhầm với `format.volume` nhận cm³), `formatPercent`, `formatDate`, `formatTime`, `formatDuration` (có chữ "giờ/phút" cứng — khi cần thì viết bằng `t()` + số nhiều).
- **Ngày tiếng Anh `Sep 14, 2026`** thay vì `09/14/2026`: người dùng chuyển qua lại hai ngôn ngữ không thể đọc 03/04 thành ngày khác.
- **Giờ 24h ở cả tiếng Anh** (en-US mặc định `02:30 PM`): điều phối, kho, tài xế có thể dùng hai ngôn ngữ khác nhau mà vẫn đọc cùng giờ xuất phát.
- **Số chữ thập phân:** `percent`, `decimal`, `volumeM3` luôn một chữ số như màn hiện tại; `length`/`dimensions` bỏ `,0` với số tròn cm (bước 0,1 cm); `weight` tới 0,01 kg; `ratio` hai chữ số như câu mẫu Spec 13.
- **`AuthError` mang mã** (`invalid-credentials`, `account-suspended`) thay cho câu tiếng Việt, theo tinh thần D-28, để trang đăng nhập dịch được.
- Dịch cả phần con của trang đăng nhập: `DemoAccounts` (tiêu đề, "mật khẩu", tên vai trò qua `roles.*`) và `aria-label` của `LoginArtwork`. Nav rail cũng dịch tên vai trò; `ROLE_LABELS` ở `types/user.ts` vẫn giữ cho màn Người dùng.
- **Không dùng lại `SegmentedControl`:** control đó cao 28/22px và nằm ngang; nút chuyển cần vùng chạm 44/56px và xếp dọc trong rail 72px.
- **Tên truy cập của nút:** "VI Tiếng Việt" / "EN English" — mã nhìn thấy đứng đầu tên (WCAG 2.5.3) cộng tên ngôn ngữ viết bằng chính ngôn ngữ đó, `lang` đặt trên từng nút; nhóm có `aria-label` theo ngôn ngữ đang chọn ("Ngôn ngữ giao diện" / "Interface language").
- Key số nhiều mẫu `common.packageCount` chưa có màn dùng; để sẵn cho LM-044/LM-049.

### Kiểm tra thủ công

- Xoá `nav.signOut` khỏi `en.ts` → `pnpm build` dừng ở `tsc -b` với TS2741 tại `en.ts(8,3)`; thêm key lạ → TS2353. Đã khôi phục.
- Smoke RTL tạm thời (đã xoá, không commit vì ngoài seam đã chốt): `/dang-nhap?lang=en` không còn chữ tiếng Việt, kể cả lỗi form và "Incorrect email or password"; bản tiếng Việt giữ nguyên từng chữ cũ; nav rail đổi en ↔ vi bằng nút; trang 404 tiếng Anh.

### Phát hiện ngoài phạm vi

- **`cn()` làm rơi class:** tailwind-merge mặc định coi token cỡ chữ tự đặt (`text-body`, `text-caption`…) là màu chữ, nên class đứng sau thắng. Đã kiểm trên DOM thật: nút `Button` primary/danger **mất `text-white`**, `SegmentedControl` size `md` **mất `text-caption`**. `LanguageSwitch` né bằng cách đặt cỡ chữ ở khung. Sửa gốc: `extendTailwindMerge` khai báo nhóm `font-size` cho các token trong `lib/utils.ts` — nên làm thành issue riêng vì đổi giao diện toàn app.
- `tsc -b` từng hết bộ nhớ hai lần khi máy gần hết commit memory do tiến trình khác; không do kiểu i18n (đo riêng: khoảng 8 nghìn instantiation, cả app khoảng 612 nghìn).

### Để lại cho issue sau

- Nút chuyển trong header màn toàn màn hình: kho, tài xế → LM-071; Planner 3D → LM-070. Trang đăng nhập hiện chỉ đổi được bằng `?lang` — đề xuất thêm nút ở LM-071 (auth phần còn lại).
- Chuỗi còn lại ngoài ba màn mẫu, ví dụ "Đang tải màn hình" trong `App.tsx` → LM-070/LM-071.
- AGENTS.md mục 6 (format theo locale qua `useFormat`/`createFormatter`) và mục 9 (từ điển typed, ngôn ngữ trong `sessionStorage` + `?lang`) cần cập nhật → LM-003; không sửa ở đây để tránh xung đột với nhánh làm song song.
- Cách dịch mã lỗi domain và message zod dùng chung → LM-028. Test phát hiện chuỗi tiếng Việt cứng trong JSX → LM-070.
