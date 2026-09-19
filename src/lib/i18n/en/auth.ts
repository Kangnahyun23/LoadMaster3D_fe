import type { Dictionary } from '../types'
import type { auth as source } from '../vi/auth'

export const auth = {
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
} satisfies Dictionary<typeof source>
