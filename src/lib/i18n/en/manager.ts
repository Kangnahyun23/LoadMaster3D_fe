import type { Dictionary } from '../types'
import type { manager as source } from '../vi/manager'

export const manager = {
  title: 'Dashboard',
  createPlan: 'Create a load plan',
  loading: 'Loading figures…',
  errorTitle: 'Could not load the figures',
  errorDescription: 'The data store did not answer. Try again in a moment.',
  retry: 'Try again',
  dateTime: '{date} {time}',
  runtime: '{value} ms',
  kpi: {
    vehicles: 'Vehicles in the fleet',
    vehiclesUnit: 'vehicles',
    vehiclesNote: 'Vehicle configurations held in the data store',
    packages: 'Packages in total',
    packagesUnit: 'packages',
    packagesNote: {
      one: 'Expanded from the quantities of {count} trip',
      other: 'Expanded from the quantities of {count} trips',
    },
    weight: 'Total cargo weight',
    weightNote: 'Every package of every trip added up',
  },
  latest: {
    title: 'Latest optimization',
    method: 'Method',
    status: 'Status',
    volume: 'Volume utilization',
    payload: 'Payload utilization',
    runtimeLabel: 'Runtime',
    createdAt: 'Run at',
    open: 'Open the plan',
    emptyTitle: 'No optimization yet',
    emptyDescription: 'Create a load plan for a trip and run the optimizer; the result shows up here.',
  },
  status: {
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    approved: 'Approved',
  },
  recent: {
    title: 'Recent plans',
    subtitle: 'The {count} most recent optimizations',
    trip: 'Trip',
    createdAt: 'Run at',
    method: 'Method',
    volume: 'Utilization',
    placed: 'Packages placed',
    empty: 'No plan yet',
  },
} satisfies Dictionary<typeof source>
