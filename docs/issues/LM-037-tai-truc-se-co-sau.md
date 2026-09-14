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

- [ ] `AxleLoadPanel`: giữ vị trí trong inspector, hiển thị "Sẽ có sau" / "Coming later", không bấm được, kèm câu ngắn "Chờ backend tính tải trục".
- [ ] Nếu `vehicle.axles` có dữ liệu: liệt kê tên trục, vị trí X (cm), tải tối đa — **không** có số tải hiện tại.
- [ ] Gỡ `frontAxle`, `rearAxle` khỏi mock và type cũ; rà `approval-checks.ts`, `ApprovePlanDialog`, `OperationsPanel`.

## Tiêu chí nghiệm thu

- [ ] Tìm trong `src/` không còn số tải trục hiện tại nào được hiển thị.
