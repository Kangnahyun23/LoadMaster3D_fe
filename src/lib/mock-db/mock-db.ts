import { SEED_ANCHOR_DATE } from './clock'
import { auditMethods } from './db-audit'
import { createDbContext, type DbState } from './db-context'
import { operationMethods } from './db-operations'
import { revisionMethods } from './db-revisions'
import { tripMethods } from './db-trips'
import { userMethods } from './db-users'
import { vehicleMethods } from './db-vehicles'
import { buildSeed } from './seed'
import type { MockDb, MockDbOptions } from './types'

/** Tạo một kho mới đã nạp seed neo theo `today` (D-44). Mỗi kho giữ dữ liệu và phiên riêng. */
export function createMockDb({ latencyMs = 0, today = SEED_ANCHOR_DATE, now = () => new Date() }: MockDbOptions = {}): MockDb {
  const seed = buildSeed(today)
  const state: DbState = {
    vehicles: new Map(seed.vehicles.map((vehicle) => [vehicle.id, vehicle])),
    maintenance: new Map(seed.maintenance),
    trips: new Map(seed.trips.map((trip) => [trip.id, trip])),
    revisions: new Map(seed.revisions.map((revision) => [revision.id, revision])),
    users: new Map(seed.users.map((user) => [user.id, user])),
    passwords: new Map(seed.passwords),
    events: seed.events,
    session: { userId: null },
  }
  const ctx = createDbContext(state, latencyMs, now)
  return {
    ...vehicleMethods(ctx),
    ...tripMethods(ctx),
    ...revisionMethods(ctx),
    ...operationMethods(ctx),
    ...userMethods(ctx),
    ...auditMethods(ctx),
  }
}
