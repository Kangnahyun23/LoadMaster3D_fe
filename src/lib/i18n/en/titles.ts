import type { Dictionary } from '../types'
import type { titles as source } from '../vi/titles'

export const titles = {
  login: 'Sign in',
  dashboard: 'Dashboard',
  trips: 'Trips',
  trip: 'Trip {id}',
  newTrip: 'Create trip',
  editTrip: 'Edit trip {id}',
  optimize: 'Optimization setup {id}',
  compare: 'Compare plans {id}',
  plan: 'Plan {id}',
  fleet: 'Fleet',
  vehicle: 'Vehicle {id}',
  newVehicle: 'Add vehicle',
  users: 'Users',
  audit: 'Audit log',
  warehouse: 'Trips to load',
  loading: 'Loading {id}',
  driverTrips: 'My trips',
  delivery: 'Delivery {id}',
  styleSheet: 'Style sheet',
  componentSheet: 'Components',
  notFound: 'Page not found',
  error: 'Something went wrong',
  forbidden: 'Access denied',
} satisfies Dictionary<typeof source>
