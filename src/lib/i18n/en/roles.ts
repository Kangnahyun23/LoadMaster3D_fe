import type { Dictionary } from '../types'
import type { roles as source } from '../vi/roles'

export const roles = {
  dispatcher: 'Dispatcher',
  warehouse: 'Warehouse staff',
  driver: 'Driver',
  manager: 'Manager',
  admin: 'System administrator',
} satisfies Dictionary<typeof source>
