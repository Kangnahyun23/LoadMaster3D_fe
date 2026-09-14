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

- [ ] Mỗi mã trong LM-014 có câu vi và en; bản en giữ đúng câu Spec mục 13 khi có.
- [ ] `formatIssue(issue, t, format) → string`; số trong câu đi qua `format` theo locale (vi: `5.320 kg`, `0,62`; en: `5,320 kg`, `0.62`).
- [ ] Hàm `issueField(issue)` trả đường dẫn field cho form nhảy tới ô lỗi.
- [ ] Test ảnh chụp chuỗi (snapshot) cho cả hai ngôn ngữ.

## Tiêu chí nghiệm thu

- [ ] 8 câu ví dụ Spec mục 13 tái tạo đúng từng chữ ở bản en.
- [ ] Không có mã lỗi nào thiếu câu (test lặp qua toàn bộ union).
