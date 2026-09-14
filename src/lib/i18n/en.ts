import type { Dictionary } from './types'
import type { vi } from './vi'

export const en = {
  language: {
    label: 'Interface language',
  },
  nav: {
    label: 'Main navigation',
    dashboard: 'Dashboard',
    trips: 'Trips',
    warehouse: 'Warehouse tablet',
    driver: 'Driver screen',
    fleet: 'Fleet',
    users: 'Users',
    settings: 'Settings',
    account: 'Account {name}',
    signOut: 'Sign out',
  },
  roles: {
    dispatcher: 'Dispatcher',
    warehouse: 'Warehouse staff',
    driver: 'Driver',
    manager: 'Manager',
    admin: 'System administrator',
  },
  auth: {
    login: {
      title: 'Sign in',
      subtitle: '3D cargo load planning and optimization system.',
      email: 'Email',
      emailPlaceholder: 'name@loadmaster.vn',
      password: 'Password',
      submit: 'Sign in',
      emailRequired: 'Enter your email',
      emailInvalid: 'Enter a valid email address',
      passwordRequired: 'Enter your password',
      invalidCredentials: 'Incorrect email or password',
      accountSuspended: 'This account is locked. Contact your system administrator.',
      serverUnreachable: 'Cannot reach the server. Try again later.',
    },
    showcase: {
      tagline: 'Every truck carries more, and unloads in the right order.',
      fillRate: 'Fill each vehicle better and run fewer trips',
      reverseOrder: 'Load in reverse delivery order — each stop unloads only its own cargo',
      axleLoad: 'Check the load on every axle before the truck leaves',
      artworkLabel: 'Animation of a truck body being loaded in unloading order',
    },
    demo: {
      title: 'Demo accounts',
      password: 'password {password}',
    },
  },
  notFound: {
    errorCode: 'Error',
    title: 'Page not found',
    description:
      'This link does not exist or has changed. Check the link or go back to the trip list.',
    errorTitle: 'Something went wrong',
    errorDescription:
      'This screen failed to load. Reload the page; if it still fails, contact your system administrator.',
    backToTrips: 'Back to trip list',
    reload: 'Reload page',
  },
  common: {
    packageCount: { one: '{count} package', other: '{count} packages' },
  },
} satisfies Dictionary<typeof vi>
