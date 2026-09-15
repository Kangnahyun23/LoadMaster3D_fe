---
id: LM-037
title: Panel tải trục hiển thị "Sẽ có sau", gỡ số tải trục giả
phase: 2
labels: [viewer3d, spec-compliance]
depends_on: [LM-030]
estimate: 0.5d
prd: [D-20, D-38]
spec: [7.10]
---

# LM-037 — Tải trục "Sẽ có sau"

## Bối cảnh

Spec 7.10 cấm tạo số tải trọng trục giả. `overlays/AxleLoadPanel.tsx` đang hiện `frontAxle/rearAxle` từ mock và `ApprovePlanDialog` có thể nhắc tới tải trục.

## Việc cần làm

- [x] `AxleLoadPanel`: giữ vị trí trong inspector, hiển thị "Sẽ có sau" / "Coming later", không bấm được, kèm câu ngắn "Chờ backend tính tải trục".
- [x] Nếu `vehicle.axles` có dữ liệu: liệt kê tên trục, vị trí X (cm), tải tối đa — **không** có số tải hiện tại.
- [x] Gỡ `frontAxle`, `rearAxle` khỏi mock và type cũ; rà `approval-checks.ts`, `ApprovePlanDialog`, `OperationsPanel`.

## Tiêu chí nghiệm thu

- [x] Tìm trong `src/` không còn số tải trục hiện tại nào được hiển thị.

## Kết quả (15/09/2026)

- [AxleLoadPanel.tsx](../../src/features/viewer3d/overlays/AxleLoadPanel.tsx): nhãn "Sẽ có sau"/"Coming later" + câu chờ backend qua từ điển (`viewer.axles.*`); có `vehicle.axles` thì liệt kê tên, vị trí X (cm), tải tối đa — không số tải hiện tại.
- Gỡ `AxleLoad`/`frontAxle`/`rearAxle` khỏi `types/load-plan.ts`, `load-plan.mock.ts`, benchmark; `approval-checks.ts` bỏ kiểm tải trục; Đội xe giữ dung lượng trục cấu hình trong type riêng `FleetAxle` (form cũ, không phải số đo).
- E2E operations: hộp thoại Duyệt không còn chữ tải trục.
