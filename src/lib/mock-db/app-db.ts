import { createMockDb } from './mock-db'
import type { MockDb } from './types'

/** Độ trễ giả của kho dùng chung, đủ để thấy trạng thái đang tải mà không làm chậm thao tác. */
const APP_LATENCY_MS = 300

let appDb: MockDb | undefined

/**
 * Kho dùng chung cho mọi `features/<tên>/<tên>-api.ts` (D-06): tạo ở lần gọi đầu, đã nạp seed, có độ trễ giả.
 * Dữ liệu mất khi tải lại trang. Test tự tạo kho riêng bằng `createMockDb`.
 */
export function getMockDb(): MockDb {
  appDb ??= createMockDb({ latencyMs: APP_LATENCY_MS })
  return appDb
}
