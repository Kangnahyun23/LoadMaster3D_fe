import type { Dictionary } from '../types'
import type { common as source } from '../vi/common'

export const common = {
  packageCount: { one: '{count} package', other: '{count} packages' },
  stop: 'Stop {number}',
  stopWithName: 'Stop {number} · {name}',
  packageAtStop: '{id} · Stop {stop}',
  loadingScreen: 'Loading screen',
  processing: 'Processing',
  noData: 'No data yet',
  selectPlaceholder: 'Select…',
  backToTrips: 'Back to trips',
  on: 'On',
  off: 'Off',
} satisfies Dictionary<typeof source>
