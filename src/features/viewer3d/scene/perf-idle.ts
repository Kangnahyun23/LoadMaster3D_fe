/** Khoảng lặng tối thiểu trước khi coi là nghỉ, tính từ frame cuối. */
export const IDLE_AFTER_MS = 250

/**
 * Scene nghỉ khi **demand loop đã dừng**: frame cuối không xin frame tiếp và đã lặng đủ lâu.
 *
 * Không dùng riêng khoảng lặng: máy yếu vẽ 2–3 FPS thì frame nào cũng cách nhau hơn 250 ms, báo nghỉ sẽ giấu FPS ngay lúc cần
 * nhất và `quality-policy` (bỏ qua mẫu nghỉ) sẽ không bao giờ hạ tier (LM-101).
 */
export function isSceneIdle(requestedNextFrame: boolean, msSinceLastFrame: number): boolean {
  return !requestedNextFrame && msSinceLastFrame >= IDLE_AFTER_MS
}
