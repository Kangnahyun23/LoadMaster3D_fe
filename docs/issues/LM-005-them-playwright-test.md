---
id: LM-005
title: Đưa Playwright vào repo, chuyển suite trình duyệt sang @playwright/test
phase: 0
labels: [tooling, test, e2e]
depends_on: [LM-001]
estimate: 1.5d
prd: [D-39]
---

# LM-005 — Đưa Playwright vào repo

## Bối cảnh

7 suite `tests/viewer-*.mjs` dùng Playwright cài ngoài repo qua `PLAYWRIGHT_MODULE`, `CHROMIUM_EXECUTABLE`, `VIEWER_TEST_URL` và helper riêng `viewer-browser-helpers.mjs`. Không chạy được trên CI.

## Việc cần làm

- [x] `pnpm add -D @playwright/test`; `playwright.config.ts` có `webServer` khởi động app tại cổng cố định.
- [x] Chuyển `viewer-ui`, `viewer-editor-ui`, `viewer-operations-ui`, `viewer-visuals`, `viewer-demand-quality`, `viewer-scene-first-ui` sang `e2e/*.spec.ts`; đăng nhập demo thành fixture.
- [x] Giữ `viewer-benchmark` là script chạy tay, cập nhật cách gọi, không đưa vào CI.
- [x] Project `desktop` 1600×1000, `tablet` 820×1180, `phone` 390×844 cho suite cần.
- [x] Script `test:e2e`, `test:e2e:ui`; thêm `test-results/`, `playwright-report/` vào `.gitignore`.
- [x] Phase này giữ giá trị mm; chuyển sang cm ở LM-038.

## Tiêu chí nghiệm thu

- [x] `pnpm test:e2e` xanh trên máy local, không cần biến môi trường ngoài.
- [x] Không còn file `.mjs` trùng chức năng trong `tests/`.

## Kết quả — 15/09/2026

### Phiên bản và trình duyệt

- `@playwright/test` **1.61.1**, khai báo `~1.61.1` để lần nâng bản vá không đổi revision trình duyệt. Chromium **149.0.7827.55** (revision 1228, headless shell) — đúng bản đã sinh bằng chứng trong `docs/benchmarks` (`HeadlessChrome/149.0.7827.55`) và đã có trong cache `ms-playwright` của máy nên không phải tải. Bản mới nhất lúc làm là 1.63.0 nhưng cần tải Chromium khác.
- Máy mới hoặc CI: `pnpm exec playwright install chromium` (Linux CI thêm `--with-deps`).

### Cấu hình

- [playwright.config.ts](../../playwright.config.ts):
  - `webServer`: `pnpm exec vite --host 127.0.0.1 --port 5175 --strictPort`, `reuseExistingServer: !CI`. `E2E_PORT` (tuỳ chọn, mặc định 5175) để đổi cổng khi 5175 đang do checkout/worktree khác giữ — nếu không, test sẽ chạy nhầm vào code của server đó.
  - `workers: 1`, `fullyParallel: false` (SwiftShader ăn CPU, các suite đo frame/idle); `retries: CI ? 1 : 0`; `forbidOnly` trên CI; timeout 4 phút/test, `expect` 15 s; reporter `list` + `html`; `trace: on-first-retry`, `screenshot: only-on-failure`; Chromium chạy `--use-angle=swiftshader --enable-unsafe-swiftshader` như bản `.mjs`.
  - Project `desktop` 1600×1000 nhận mọi test không gắn tag; `tablet` 820×1180 và `phone` 390×844 (`isMobile`, `hasTouch`, DPR 1) chỉ nhận test gắn `@tablet`/`@phone`.
- [tsconfig.e2e.json](../../tsconfig.e2e.json) (strict, `noUncheckedIndexedAccess`) được tham chiếu từ `tsconfig.json`, nên `tsc -b` trong `pnpm build` kiểm kiểu cả `e2e/` lẫn config. Vitest giữ nguyên `include`, không nhặt `e2e/**/*.spec.ts`.
- Script `pnpm test:e2e`, `pnpm test:e2e:ui`. `.gitignore` thêm `test-results/`, `playwright-report/`, `blob-report/`.
- [vite.config.ts](../../vite.config.ts): `server.watch.ignored` thêm `playwright-report`, `blob-report`. Trên Windows, watcher của Vite ném `scandir UNKNOWN` rồi dừng dev server khi báo cáo HTML bị xoá/tạo lại giữa lượt chạy (Vite vốn đã bỏ qua `test-results`).

### Fixture và helper

- [e2e/fixtures.ts](../../e2e/fixtures.ts): `login(route)` mở route cần đăng nhập, điền tài khoản demo vào form thật (tap trên project cảm ứng) và chờ rời `/dang-nhap`; app tự quay lại đúng route kèm query. `browserErrors` gom `pageerror` (thêm `console.error` ở suite vận hành và scene-first như cũ); mỗi test tự khẳng định rỗng ở cuối kịch bản. Ảnh và số đo từng ghi vào `node_modules/.tmp/…` nay là attachment trong báo cáo Playwright.
- [e2e/viewer-helpers.ts](../../e2e/viewer-helpers.ts): bản TypeScript có kiểu của `viewer-browser-helpers.mjs`, vẫn đọc scene bằng `import('/node_modules/.vite/deps/@react-three_fiber.js')` trong `page.evaluate`. Chạy được vì file deps này chỉ re-export chunk chung app đã nạp (cùng `_roots`), và spec là ES module (`"type": "module"`) nên Babel của Playwright không đổi `import()` thành `require`.

### Chuyển suite

| Bản cũ | Spec mới (`e2e/`) | desktop | tablet | phone |
|---|---|---:|---:|---:|
| `viewer-ui.mjs` | `viewer-ui.spec.ts` | 4 | – | – |
| `viewer-editor-ui.mjs` | `viewer-editor-ui.spec.ts` | 2 | 1 | 1 |
| `viewer-operations-ui.mjs` | `viewer-operations-ui.spec.ts` | 3 | 1 | 1 |
| `viewer-visuals.mjs` | `viewer-visuals.spec.ts` | 2 | – | 1 |
| `viewer-demand-quality.mjs` | `viewer-demand-quality.spec.ts` | 1 | – | – |
| `viewer-scene-first-ui.mjs` | `viewer-scene-first-ui.spec.ts` | 3 | 1 | 2 |
| **Tổng: 23 test** | | **15** | **3** | **5** |

- Kịch bản dài được tách thành test độc lập đúng ở chỗ bản cũ đã `goto` sang route khác, nên không mất trạng thái; mỗi test tự đăng nhập. Mọi bước và assertion giữ nguyên, giá trị vẫn mm.
- Phần cảm ứng 390/820 của editor và vận hành chạy ở `phone`/`tablet` (vẫn `reducedMotion: 'reduce'`; kéo chạm qua CDP chỉ ở tablet như nhánh 820 cũ). Kiểm tra 820/390 của scene-first và 390 của visuals từng chạy bằng cách thu nhỏ trang desktop, nay chạy ở project cảm ứng: bố cục chỉ phụ thuộc chiều rộng (không có media query pointer/hover), assertion không đổi. Kiểm tra 1024 px ở lại `desktop` qua `test.use({ viewport })`.
- `viewer-demand-quality` giữ renderer mặc định (không ép SwiftShader) và DPR thiết bị 2; `VIEWER_INITIAL_QUALITY` vẫn là tuỳ chọn khi đo tay, mặc định `balanced`.

### Lệch khỏi bản `.mjs`, có bằng chứng

1. **Test cảm ứng editor** so X với vị trí nguồn của `BENCH-01000` đọc từ `benchmark.mock.ts`, thay cho biến `initial` của lượt desktop (trang mới chưa có draft nên là cùng một giá trị).
2. **Chờ camera thật sự được vẽ trước khi so tư thế camera.** Chạy lại chính các file `.mjs` trên cùng Chromium: editor trượt phép so hướng sau "Tập trung vào kiện" **4/5 lần**, scene-first trượt phép so hướng sau double-click **1/3 lần**. Nguyên nhân đo được:
   - `waitIdle` đọc DebugOverlay, vốn công bố mẫu mỗi 500 ms và báo nghỉ sau 250 ms không có frame. Ngay sau thao tác nó có thể còn mẫu "nghỉ" cũ; hoặc báo nghỉ giả khi một frame SwiftShader chậm quá 250 ms lúc camera đang chuyển (đo được R3F còn frame chờ vẽ trong khi overlay báo `idle`).
   - Với giảm chuyển động, `CameraRig` đổi camera không transition trong effect chạy **sau** frame mà commit của root R3F xin; camera-controls không phát sự kiện nên không ai xin frame mới. Đo được: sự kiện `change` ở 18 ms, frame duy nhất vẽ xong ở 83 ms, đích camera mới chỉ có ở ~120 ms — góc "Trên" chưa hề được vẽ lúc chụp.
   - Sửa phía test, không bỏ hay nới assertion nào: `waitCameraSettled` (R3F không còn frame chờ và tư thế camera đứng yên qua 3 animation frame) sau `settle`, trước khi đọc camera hoặc chiếu điểm 3D ra màn hình (scene-first; click kiện 999 ở vận hành). `renderCameraChange` cho bước giảm chuyển động của editor: chờ đích camera đổi, xin một frame, chờ đứng yên. Sau sửa: 8/8 lần lặp mỗi test.
3. `E2E_PORT` tuỳ chọn (xem Cấu hình).

### Lỗi app phát hiện, chưa sửa (ngoài phạm vi, không đụng `src/`)

Khi `prefers-reduced-motion: reduce`, chọn góc nhìn / tập trung / khôi phục camera trong `CameraRig` có thể **không hiện** cho tới khi có thao tác khác làm scene vẽ lại: `setLookAt`/`moveTo`/`dollyTo` không transition không phát sự kiện nên demand loop không được `invalidate`. Tái hiện: bật giảm chuyển động, scene nghỉ, chọn "Trên", chờ 3 s — camera vẫn ở góc cũ ở 1/3 lần chạy. Đề xuất: lấy `invalidate` từ `useThree` và gọi sau các lệnh camera trong `scene/CameraRig.tsx`; khi đó bỏ bước xin frame trong `renderCameraChange`.

### Benchmark chạy tay

- `tests/viewer-benchmark.mjs` vẫn là script, không nằm trong `test:e2e` hay CI. Dùng `chromium` của `@playwright/test` (Chromium đi kèm), bỏ `PLAYWRIGHT_MODULE`/`CHROMIUM_EXECUTABLE`; ba helper cần dùng được chép gọn vào script nên `viewer-browser-helpers.mjs` đã xoá.
- Cách gọi (kết quả ghi vào `node_modules/.tmp/viewer-final/`):

  ```powershell
  pnpm dev --host 127.0.0.1 --port 5175 --strictPort   # cửa sổ riêng
  node tests/viewer-benchmark.mjs                        # thêm --low-only để chỉ đo tier low
  $env:VIEWER_TEST_URL = 'http://127.0.0.1:5185'         # chỉ khi server ở địa chỉ khác
  ```

- Lượt chạy thử (SwiftShader, chỉ tham khảo): low 132/300/500 kiện 60 FPS, 16 draw call; low 1.000 kiện 21 FPS, 16; balanced 1.000 kiện 12 FPS, 25; high 1.000 kiện 8 FPS, 33.

### File đã xoá

`tests/viewer-ui.mjs`, `viewer-editor-ui.mjs`, `viewer-operations-ui.mjs`, `viewer-visuals.mjs`, `viewer-demand-quality.mjs`, `viewer-scene-first-ui.mjs`, `viewer-browser-helpers.mjs`. `tests/` chỉ còn test Vitest và `viewer-benchmark.mjs`.

### Kiểm tra

- `pnpm lint` ✅ · `pnpm build` ✅ (cảnh báo chunk > 500 kB có từ trước) · `pnpm test` 53/53 ✅.
- `pnpm test:e2e` **23/23** ✅ (5,7 phút, không biến môi trường) · CI_RUN_PLACEHOLDER
- `handoff.md` mục 6 đổi lệnh chạy browser suite sang `pnpm test:e2e` và lệnh benchmark mới.

## Lưu ý cho issue sau

- LM-006: job e2e cần `pnpm exec playwright install --with-deps chromium`, upload `playwright-report/` khi lỗi; không chạy `tests/viewer-benchmark.mjs`.
- LM-038: đổi mm → cm trong `e2e/*.spec.ts`; `proxyPoint` nhận độ dời theo mm.
- LM-003: ghi `e2e/`, `@playwright/test`, `pnpm test:e2e` vào AGENTS.md/CLAUDE.md (mục 2, 3, 12).
- Sửa lỗi `CameraRig` ở trên thì bỏ bước `invalidate()` trong `renderCameraChange`.
