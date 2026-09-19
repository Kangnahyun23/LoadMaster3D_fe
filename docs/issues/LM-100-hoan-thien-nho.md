---
id: LM-100
title: Hoàn thiện nhỏ — tiêu đề tab, câu quảng cáo tải trục, cảnh báo rời form chuyến, E2E còn thiếu
phase: 6
labels: [polish]
depends_on: [LM-088]
estimate: 1d
prd: [D-20]
---

# LM-100 — Hoàn thiện nhỏ

## Việc cần làm

- [ ] `document.title` theo màn ("Chuyến TRIP-… · LoadMaster"), dịch theo ngôn ngữ.
- [ ] Màn đăng nhập bỏ câu "kiểm tra tải từng trục" (tính năng đang "Sẽ có sau").
- [ ] Form chuyến cảnh báo rời trang khi còn thay đổi chưa lưu (như form xe).
- [ ] E2E cho `/chuyen/:id/so-sanh` và 404.

## Tiêu chí nghiệm thu

- [ ] Lint/build/test/E2E xanh.
