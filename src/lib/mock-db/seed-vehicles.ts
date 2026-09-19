import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { VehicleConfig } from '@/domain/models'

/**
 * Đội xe mẫu (cm, kg): xe "Truck 6m" của Spec mục 12 giữ nguyên, rồi bảy xe tải thật đang chạy ở kho Long Bình và Sóng Thần
 * (VEHICLE-008 đang bảo dưỡng trong seed, LM-083).
 * Biển số ghép vào `name` vì `VehicleConfig` không có trường biển số (D-04). Thứ tự và mã cố định: seed tất định.
 */
export function seedVehicles(): VehicleConfig[] {
  return [
    structuredClone(SPEC_TRUCK_6M),
    {
      id: 'VEHICLE-002',
      name: 'Hyundai HD210 · 60C-446.32',
      innerLengthCm: 720,
      innerWidthCm: 235,
      innerHeightCm: 240,
      maxPayloadKg: 9500,
      doorWidthCm: 225,
      doorHeightCm: 230,
      doorPosition: 'REAR',
      clearanceCm: 0,
      // Hai hốc bánh sau sát hai vách: chuyến seed mở trên Planner có vật cản thật để xem và để editor chặn (LM-033, LM-035)
      obstacles: [
        { id: 'OBS-001', type: 'WHEEL_ARCH', xCm: 420, yCm: 0, zCm: 0, lengthCm: 110, widthCm: 25, heightCm: 32, loadBearing: false },
        { id: 'OBS-002', type: 'WHEEL_ARCH', xCm: 420, yCm: 210, zCm: 0, lengthCm: 110, widthCm: 25, heightCm: 32, loadBearing: false },
      ],
    },
    {
      id: 'VEHICLE-003',
      name: 'Isuzu NQR 550 · 51C-284.19',
      innerLengthCm: 570,
      innerWidthCm: 210,
      innerHeightCm: 215,
      maxPayloadKg: 5500,
      doorWidthCm: 200,
      doorHeightCm: 205,
      doorPosition: 'REAR',
      clearanceCm: 0,
      // Hai hốc bánh sau nhô vào sàn thùng, sát hai vách
      obstacles: [
        { id: 'OBS-001', type: 'WHEEL_ARCH', xCm: 330, yCm: 0, zCm: 0, lengthCm: 95, widthCm: 25, heightCm: 30, loadBearing: false },
        { id: 'OBS-002', type: 'WHEEL_ARCH', xCm: 330, yCm: 185, zCm: 0, lengthCm: 95, widthCm: 25, heightCm: 30, loadBearing: false },
      ],
    },
    {
      id: 'VEHICLE-004',
      name: 'Hino FC9J đông lạnh · 51C-190.07',
      innerLengthCm: 600,
      innerWidthCm: 210,
      innerHeightCm: 200,
      maxPayloadKg: 6000,
      doorWidthCm: 200,
      doorHeightCm: 190,
      doorPosition: 'REAR',
      // Chừa khe cho khí lạnh lưu thông
      clearanceCm: 2,
      // Dàn lạnh treo sát vách trước, phía trên
      obstacles: [
        { id: 'OBS-001', type: 'COOLING_UNIT', xCm: 0, yCm: 0, zCm: 165, lengthCm: 25, widthCm: 210, heightCm: 35, loadBearing: false },
      ],
    },
    // Bốn xe thêm ở đợt 6 (D-44) để đội xe có đủ trạng thái sẵn sàng / đang chạy / bảo dưỡng
    {
      id: 'VEHICLE-005',
      name: 'Hino XZU720 · 51D-457.88',
      innerLengthCm: 520,
      innerWidthCm: 200,
      innerHeightCm: 200,
      maxPayloadKg: 3500,
      doorWidthCm: 190,
      doorHeightCm: 190,
      doorPosition: 'REAR',
      clearanceCm: 0,
      obstacles: [
        { id: 'OBS-001', type: 'WHEEL_ARCH', xCm: 300, yCm: 0, zCm: 0, lengthCm: 85, widthCm: 20, heightCm: 25, loadBearing: false },
        { id: 'OBS-002', type: 'WHEEL_ARCH', xCm: 300, yCm: 180, zCm: 0, lengthCm: 85, widthCm: 20, heightCm: 25, loadBearing: false },
      ],
    },
    {
      id: 'VEHICLE-006',
      name: 'Thaco Ollin 720 · 61C-339.05',
      innerLengthCm: 610,
      innerWidthCm: 215,
      innerHeightCm: 215,
      maxPayloadKg: 7000,
      doorWidthCm: 205,
      doorHeightCm: 205,
      doorPosition: 'REAR',
      clearanceCm: 0,
      obstacles: [
        { id: 'OBS-001', type: 'WHEEL_ARCH', xCm: 350, yCm: 0, zCm: 0, lengthCm: 100, widthCm: 25, heightCm: 30, loadBearing: false },
        { id: 'OBS-002', type: 'WHEEL_ARCH', xCm: 350, yCm: 190, zCm: 0, lengthCm: 100, widthCm: 25, heightCm: 30, loadBearing: false },
      ],
    },
    {
      id: 'VEHICLE-007',
      name: 'Isuzu FVR 900 · 51D-622.14',
      innerLengthCm: 850,
      innerWidthCm: 240,
      innerHeightCm: 250,
      maxPayloadKg: 9000,
      doorWidthCm: 230,
      doorHeightCm: 240,
      doorPosition: 'REAR',
      clearanceCm: 0,
      obstacles: [
        { id: 'OBS-001', type: 'WHEEL_ARCH', xCm: 520, yCm: 0, zCm: 0, lengthCm: 120, widthCm: 25, heightCm: 32, loadBearing: false },
        { id: 'OBS-002', type: 'WHEEL_ARCH', xCm: 520, yCm: 215, zCm: 0, lengthCm: 120, widthCm: 25, heightCm: 32, loadBearing: false },
      ],
    },
    {
      id: 'VEHICLE-008',
      name: 'Hyundai Mighty EX8 · 50H-118.29',
      innerLengthCm: 630,
      innerWidthCm: 220,
      innerHeightCm: 215,
      maxPayloadKg: 7000,
      doorWidthCm: 210,
      doorHeightCm: 205,
      doorPosition: 'REAR',
      clearanceCm: 0,
      obstacles: [
        { id: 'OBS-001', type: 'WHEEL_ARCH', xCm: 370, yCm: 0, zCm: 0, lengthCm: 100, widthCm: 25, heightCm: 30, loadBearing: false },
        { id: 'OBS-002', type: 'WHEEL_ARCH', xCm: 370, yCm: 195, zCm: 0, lengthCm: 100, widthCm: 25, heightCm: 30, loadBearing: false },
      ],
    },
  ]
}
