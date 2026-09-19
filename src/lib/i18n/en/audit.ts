import type { Dictionary } from '../types'
import type { audit as source } from '../vi/audit'

export const audit = {
  actions: {
    auth: { signedIn: 'Signed in', signedOut: 'Signed out', signInFailed: 'Sign-in failed' },
    vehicle: { created: 'Added vehicle', updated: 'Edited vehicle', deleted: 'Deleted vehicle', maintenanceOn: 'Put vehicle in maintenance', maintenanceOff: 'Ended vehicle maintenance' },
    trip: { created: 'Created trip', updated: 'Edited trip', cancelled: 'Cancelled trip' },
    optimization: { saved: 'Saved optimization result' },
    revision: { approved: 'Approved plan' },
    loading: { started: 'Started loading', missing: 'Reported package missing at warehouse', completed: 'Finished loading' },
    delivery: { started: 'Left for delivery', issue: 'Reported delivery issue', stopCompleted: 'Completed stop', completed: 'Completed trip' },
    user: {
      created: 'Created account', updated: 'Edited account', locked: 'Locked account', unlocked: 'Unlocked account', deleted: 'Deleted account',
      passwordReset: 'Reset password', passwordChanged: 'Changed password', profileUpdated: 'Edited own profile',
    },
  },
  groups: {
    auth: 'Sign-in',
    vehicle: 'Fleet',
    trip: 'Trips',
    optimization: 'Optimization',
    revision: 'Approval',
    loading: 'Warehouse',
    delivery: 'Delivery',
    user: 'Users',
  },
} satisfies Dictionary<typeof source>
