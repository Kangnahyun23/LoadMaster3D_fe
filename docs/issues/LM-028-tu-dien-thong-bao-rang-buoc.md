---
id: LM-028
title: Từ điển thông báo ràng buộc vi/en cho mọi mã lỗi
phase: 1
labels: [i18n, validation]
depends_on: [LM-014, LM-027]
estimate: 0.5d
prd: [D-28]
spec: [13]
---

# LM-028 — Thông báo ràng buộc vi/en

## Việc cần làm

- [x] Mỗi mã trong LM-014 có câu vi và en; bản en giữ đúng câu Spec mục 13 khi có.
- [x] `formatIssue(issue, t, format) → string`; số trong câu đi qua `format` theo locale (vi: `5.320 kg`, `0,62`; en: `5,320 kg`, `0.62`).
- [ ] ~~Hàm `issueField(issue)` trả đường dẫn field cho form nhảy tới ô lỗi.~~ Dời sang LM-041 (xem Kết quả).
- [x] Test ảnh chụp chuỗi (snapshot) cho cả hai ngôn ngữ.

## Tiêu chí nghiệm thu

- [x] 8 câu ví dụ Spec mục 13 tái tạo đúng từng chữ ở bản en.
- [x] Không có mã lỗi nào thiếu câu (test lặp qua toàn bộ union).

## Kết quả (15/09/2026)

Seam `@/lib/i18n` (`formatIssue`, thêm export `createTranslator` cho hàm thuần và test) và `@/lib/format`.
TDD 6 vòng: 59 test trong `issue-message.test.ts`, 2 test mới trong `format.test.ts`.

- **Từ điển:** nhánh `issues` (key trùng tên mã; mã có biến thể tách key con: `EXCEEDS_BOUNDARY.{x|y|z}.{beforeOrigin|beyondInterior}`,
  `DOOR_EXCEEDS_INNER.{y|z}`, `DIMENSION_NOT_POSITIVE.{vehicle|obstacle|package}`) và nhánh `fields` (tên trường không đơn vị,
  dùng lại được cho nhãn form). `Dictionary<typeof vi>` bắt bản en thiếu key hoặc làm mất `{tham số}`.
- **Vét cạn ở mức kiểu:** `switch` trên `issue.code` kết thúc bằng `unreachable(issue: never)` — thêm mã mới mà chưa có câu thì
  `tsc -b` đỏ. Bảng mẫu trong test có kiểu `{ [C in ConstraintCode]: ConstraintIssue<C> }` nên cũng không thể quên mẫu.
- **Số theo locale:** câu nhận chuỗi đã format (`format.weight`, `length`, `ratio`, `percent`, `integer`), không để `t` tự format số trần.
  `Formatter` thêm `widthByHeight` ("220 × 230 cm") và `list` (`Intl.ListFormat`: "PKG-007 và PKG-008" · "PKG-007 and PKG-008").
- **Issue thiếu dữ liệu câu cần** (`packageInstanceId`, `relatedIds` rỗng, `field` không có nhãn) → `throw` kèm mã: lỗi ở nơi dựng issue,
  không in câu thiếu chủ ngữ. Test "thiếu mã kiện" đã chứng minh đỏ khi đổi `throw` thành chuỗi thay thế.
- **Bảng Spec §13 dùng chung:** `src/test/spec-13.ts`; `src/domain/constraints/spec-messages.test.ts` chuyển sang dùng bảng này
  (phần `schemaTwin` giữ thành map có kiểu), không còn hai bản chép.
- **Snapshot** (`__snapshots__/issue-message.test.ts.snap`): 22 mã + 9 biến thể × 2 ngôn ngữ, đã đọc duyệt từng câu.
  Chạy `CI=1` thì snapshot thiếu là đỏ, không tự ghi.
- **`issueField` dời sang LM-041:** LM-017 đặt `issue.field` sẵn là đường dẫn react-hook-form trong form của đối tượng
  (`innerLengthCm`, `obstacles.0.lengthCm`), nên hàm này chỉ trả lại `issue.field`; form tự `setFocus` theo đường dẫn đó.
- **Sau khi gộp LM-017:** `DIMENSION_NOT_POSITIVE` lấy nhãn theo đoạn cuối của `field` và đơn vị của số 0 theo trường
  (`maxPayloadKg` → "0 kg"); `EXCEEDS_BOUNDARY` / `OBSTACLE_OVERLAP` của dòng vật cản (không có `packageInstanceId`) lấy chủ ngữ
  từ `relatedIds[0]` ("Vật cản OBS-002 vượt chiều cao thùng 10 cm."). Test mới chạy validator thật rồi dịch mọi issue (snapshot 7 câu × 2).
- **Còn mở cho LM-019:** `TOP_LOAD_EXCEEDED` hiện cần `packageInstanceId`; vật cản chịu tải quá tải thì theo quy ước chủ thể
  (vật cản ở `relatedIds[0]`) và thêm biến thể câu.
- **Mã trần từ contract** (`warnings: string[]`, `constraintWarnings` của placement) không có params nên không đi qua `formatIssue`;
  màn Planner (LM-049) chạy lại constraint engine hoặc thêm nhãn ngắn theo mã khi cần.
