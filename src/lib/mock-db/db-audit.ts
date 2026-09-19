import { vnDate } from './clock'
import type { DbContext } from './db-context'
import type { MockDb } from './types'

/** Nhật ký (D-43): mới nhất trước, lọc theo ngày giờ Việt Nam, người làm, mã đối tượng (chứa chuỗi, không phân biệt hoa thường). */
export function auditMethods(ctx: DbContext): Pick<MockDb, 'listEvents'> {
  return {
    listEvents: (filter = {}) =>
      ctx.respond(() => {
        const target = filter.targetId?.trim().toLowerCase()
        return ctx.state.events
          .filter((event) => {
            const day = vnDate(new Date(event.at))
            if (filter.from !== undefined && day < filter.from) return false
            if (filter.to !== undefined && day > filter.to) return false
            if (filter.actorId !== undefined && event.actorId !== filter.actorId) return false
            return !target || event.target.id.toLowerCase().includes(target)
          })
          .toReversed()
      }),
  }
}
