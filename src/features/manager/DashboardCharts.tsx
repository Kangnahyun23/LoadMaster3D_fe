/**
 * Điểm tải lười của `recharts` (AGENTS mục 2, mục 9 "Chia chunk"): `DashboardPage` chỉ import file này qua `lazy()`, nên thư viện
 * biểu đồ nằm ở một chunk riêng và phần còn lại của màn (KPI, thẻ đội xe, bảng chuyến) hiện trước. Ba biểu đồ cùng một chunk;
 * mỗi biểu đồ có chỗ riêng trong lưới V2 nên trang tạo một component lười cho từng cái.
 */
export { FillByDayChart } from './FillByDayChart'
export { TripsByStatusChart } from './TripsByStatusChart'
export { WeightByVehicleChart } from './WeightByVehicleChart'
