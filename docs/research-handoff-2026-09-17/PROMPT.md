# Prompt bàn giao nghiên cứu LoadMaster

Bạn là nhóm tiếp nhận nghiên cứu sản phẩm, UX/UI và kiến trúc frontend LoadMaster. Hãy dùng source code hiện tại và bộ ảnh đi kèm làm cơ sở. Mục tiêu trước mắt là đánh giá hiện trạng và đề xuất lộ trình cải tiến; chưa tự triển khai hoặc nối backend.

## Bối cảnh

LoadMaster phục vụ lập kế hoạch chất xếp hàng hóa 3D cho doanh nghiệp vận tải Việt Nam. Frontend đã được rebuild theo Build Spec, không còn là bản viewer dùng mm trước đây. Baseline: nhánh `feat/spec-mvp`, commit `b1fa061c9676d8688538b1e6b20be1e225cef393`; bộ bàn giao được chuẩn bị ngày 17/09/2026.

Luồng chính hiện tại: cấu hình xe và vật cản → chuyến, điểm giao và kiện → thiết lập tối ưu → mock service trong Web Worker → Planner 3D và chỉnh tay → Duyệt revision → kho xếp hàng → tài xế dỡ tại điểm giao.

Chưa có backend, thuật toán tối ưu thật hay RBAC. Kho dữ liệu in-memory mất khi reload. Mọi kết quả tối ưu hiện là `MOCK RESULT`. Không diễn giải các ảnh thành bằng chứng đã vận hành thực tế.

## Đọc trước

Nếu có repo, đọc theo thứ tự:

1. `AGENTS.md`: luật hiện hành; Build Spec thắng ở các yêu cầu nghiệp vụ bắt buộc.
2. `LoadMaster_FE_MVP_Build_Spec.md` và `docs/prd.md`: contract, quy tắc, quyết định D-01–D-39.
3. `handoff.md`, `docs/acceptance.md`, phần mới nhất của `docs/progress.md`.
4. `docs/research-handoff-2026-09-17/HANDOFF.md` và `GALLERY.md`: đối chiếu code và ảnh của đợt bàn giao này.
5. Các file nguồn đúng phạm vi nghiên cứu; không đọc lại toàn repo sau mỗi bước.

Các báo cáo viewer thời dùng mm là lịch sử. `docs/viewer-cm-report.md` mô tả giai đoạn chuyển đổi; những đoạn còn nói kho/tài xế dùng mm đã được LM-060–062 thay thế. Khi tài liệu lệch code, nêu rõ bằng chứng và đề nghị cập nhật, không tự giả định tài liệu mới hơn luôn đúng.

## Kiến trúc và invariant cần giữ

- React 19, Vite, TypeScript, Tailwind v4, Radix, TanStack Query/Table, RHF + Zod; pnpm.
- `src/domain`: logic thuần, không React/Three. Đơn vị cm/kg; `roundCm`/`roundKg` tại biên; so sánh hình học dùng EPSILON.
- Sáu hướng `LWH/LHW/WLH/WHL/HLW/HWL`; chỉ xoay trong tập cho phép của kiện. Kích thước gốc lấy từ CargoPackage.
- `OptimizationRequest/Result` → `adaptResult` → `ViewerSceneModel` bất biến + `ViewerDraft` theo ID → effective placements → `SceneCanvas`.
- Planner, Warehouse, Driver dùng chung core 3D; giao diện và thao tác khác theo vai trò. Preview xe cũng reuse core.
- Cargo dùng InstancedMesh, mapping instanceId ↔ placementId rõ ràng; không biến 1.000 kiện thành 1.000 mesh/HTML label/shadow.
- Demand rendering; high/balanced/low kiểm soát DPR, vật liệu, bóng, trang trí và animation. Giữ selection và cảnh báo quan trọng ở tier low.
- Editor có proxy của kiện đang chọn, drag imperative, snap/nudge, rotate, pin, undo/redo/reset; constraint engine kiểm trước commit.
- Duyệt tạo revision mới, áp draft, tính lại thứ tự và metrics; revision nguồn không bị sửa. Input thay đổi làm phương án lỗi thời và chặn Duyệt.
- Loading và unloading dùng hai thứ tự riêng trong kết quả. LIFO che kín/che một phần là kiểm tra hình học theo quy tắc FE, không chứng minh toàn bộ thao tác dỡ ngoài thực tế.
- Trọng tâm chỉ là tâm khối lượng hàng. Không bịa tải trục; hiện giữ nhãn “Sẽ có sau”.
- Không đổi engine, thêm physics/WebGPU, nâng major hoặc thêm state library nếu chưa chứng minh cần.

## Phạm vi nghiên cứu mong muốn

1. Đánh giá tính dễ hiểu của toàn luồng vận hành và ranh giới giữa dữ liệu mock, dữ liệu suy ra, cảnh báo FE và dữ liệu cần backend.
2. Đánh giá UX/UI 3D: ưu tiên diện tích scene; độ rõ của kiện, xe, cửa sau, vật cản, selection, ghost, blocker; camera và timeline; inspector và editor; mô phỏng xếp/dỡ.
3. Đề xuất làm xe và animation chi tiết hơn nhưng có ích cho thao tác, giữ ngân sách draw call và khả năng giảm chất lượng. Phân biệt chi tiết trang trí với hình học nghiệp vụ thật.
4. Đánh giá riêng dispatcher desktop, Planner cảm ứng, warehouse tablet, driver phone. Màn điều phối thông thường hiện được chốt chỉ hỗ trợ desktop; đề xuất mở rộng responsive phải ghi là phạm vi mới.
5. Đánh giá kiến trúc, rủi ro dữ liệu/revision, khả năng thay mock bằng API và lỗ hổng kiểm thử.
6. Đề xuất kế hoạch ưu tiên nhỏ, có acceptance criteria và cách đo; không đề xuất rewrite chung chung.

## Các khoảng trống đã biết

- LM-002: contract backend, auth/RBAC và lưu trữ còn chờ thống nhất.
- LM-073: thiếu E2E thao tác đưa kiện vào vật cản; unit/engine đã có kiểm tra.
- `.github/workflows/ci.yml` chưa gọi `pnpm test:bench`, dù PRD có yêu cầu cổng benchmark domain.
- Bảng kiện thực tế phân trang 50 dòng theo LM-044; PRD còn ghi ảo hóa.
- Bản bàn giao cũ báo CI xanh, nhưng nhật ký lượt E2E local cuối ghi 54/55 với lỗi không ổn định. Chưa xác minh lại CI từ xa trong đợt bàn giao này.
- Chưa đo thiết bị thật; kho chưa có bằng chứng 1.000 kiện sau khi bỏ fixture benchmark khỏi flow kho.
- Draft chỉnh tay và tiến độ vận hành chưa bền vững qua phiên/reload; chi tiết chuyến chật ở 1.440 px.

## Kết quả cần trả

- Tóm tắt hiện trạng đã xác minh, phần chưa xác minh; không nhận công cho code có sẵn.
- Bảng findings: vấn đề, bằng chứng file/ảnh, tác động, mức ưu tiên, giải pháp nhỏ nhất.
- Đề xuất UX/UI và mô phỏng có mô tả trạng thái, thao tác, responsive, reduced motion, bàn phím/touch và tác động hiệu năng.
- Lộ trình P0/P1/P2: scope, acceptance criteria, phụ thuộc backend, tiêu chí kiểm thử.
- Danh sách quyết định cần chủ sản phẩm xác nhận trước implementation.

Chỉ phân tích và đề xuất trong lượt đầu. Nếu chỉ nhận bộ tài liệu/ảnh mà không có repo, ghi rõ không thể xác minh source hoặc runtime. Không coi ảnh tĩnh là bằng chứng drag, undo, animation hoặc hiệu năng đã đạt.
