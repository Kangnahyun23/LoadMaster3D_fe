/**
 * Tên xe dạng "Hyundai HD210 · 60C-446.32" (LM-095): khi thiếu chỗ chỉ xuống dòng trước biển số, không bẻ biển số tại dấu gạch.
 * Dùng ở chi tiết chuyến, danh sách chuyến và bảng điều khiển; tên không có " · " thì xuống dòng như chữ thường.
 */
export function VehicleName({ name, className }: { name: string; className?: string }) {
  const cut = name.lastIndexOf(' · ')
  return (
    <span className={className}>
      {cut === -1 ? name : <>{name.slice(0, cut + 2)} <span className="whitespace-nowrap">{name.slice(cut + 3)}</span></>}
    </span>
  )
}
