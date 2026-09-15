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
  /** Giữ đúng từng chữ các câu mẫu của Spec mục 13. */
  issues: {
    subject: { placement: 'Placement {id}', obstacle: 'Obstacle {id}' },
    DIMENSION_NOT_POSITIVE: {
      vehicle: '{field} must be greater than {zero}.',
      obstacle: '{field} of obstacle {obstacleId} must be greater than {zero}.',
      package: '{field} of package {packageId} must be greater than {zero}.',
    },
    DOOR_EXCEEDS_INNER: {
      y: 'Door width {doorCm} cannot exceed vehicle inner width {innerCm}.',
      z: 'Door height {doorCm} cannot exceed vehicle inner height {innerCm}.',
    },
    NO_ALLOWED_ORIENTATION: 'Package {packageId} has no allowed orientation.',
    PAYLOAD_EXCEEDED: 'Total cargo weight {totalKg} exceeds vehicle payload {maxPayloadKg}.',
    MUST_LOAD_PAYLOAD_EXCEEDED: 'Must-load packages alone weigh {totalKg}, exceeding vehicle payload {maxPayloadKg}.',
    DOOR_TOO_SMALL: 'Package {packageId} cannot pass through the {door} door.',
    EXCEEDS_BOUNDARY: {
      x: {
        beforeOrigin: '{subject} extends {overCm} past the front wall.',
        beyondInterior: '{subject} exceeds vehicle length by {overCm}.',
      },
      y: {
        beforeOrigin: '{subject} extends {overCm} past the left wall.',
        beyondInterior: '{subject} exceeds vehicle width by {overCm}.',
      },
      z: {
        beforeOrigin: '{subject} is {overCm} below the floor.',
        beyondInterior: '{subject} exceeds vehicle height by {overCm}.',
      },
    },
    OVERLAP: '{id} overlaps {related}.',
    OBSTACLE_OVERLAP: '{id} overlaps obstacle {obstacleId}.',
    NON_BEARING_SUPPORT: '{id} rests on obstacle {obstacleId}, which cannot bear load.',
    SUPPORT_BELOW_MIN: '{id} support ratio {ratio} is below the required {required}.',
    TOP_LOAD_EXCEEDED: '{subject} carries {loadKg} on top, above its limit of {maxKg}.',
    NOT_STACKABLE: '{id} is not stackable but supports {related}.',
    STACK_COUNT_EXCEEDED: '{id} is in a stack of {layers} layers, above the limit of {maxStackCount}.',
    LIFO_BLOCKED: '{id} is fully blocked by packages delivered later.',
    LIFO_PARTIAL: '{id} is {coverage} blocked by packages delivered later.',
    COG_LATERAL: 'Cargo center of gravity is {offsetCm} off the centerline, beyond the {limitCm} limit.',
    COG_HIGH: 'Cargo center of gravity is {heightCm} above the floor, beyond the {limitCm} limit.',
    MUST_LOAD_UNPLACED: 'Must-load package {packageId} was not placed.',
    LOADING_ORDER_INFEASIBLE: '{id} is loaded before the packages supporting it: {related}.',
    DUPLICATE_INSTANCE_ID: 'ID {id} is used by {occurrences} package lines: {related}.',
    ORIENTATION_MISMATCH: 'Placed dimensions of {id} do not match orientation {orientation}.',
    ORIENTATION_NOT_ALLOWED: '{id} is placed in orientation {orientation}, which its package does not allow.',
  },
  viewer: {
    axles: {
      title: 'Axle load',
      comingLater: 'Coming later',
      pending: 'Waiting for the backend to compute axle loads; no estimated figures are shown.',
      axle: '{name} · {position} from the front wall · max {maxLoad}',
    },
    measurements: {
      summary: '{rear} from the door · {left} from the left wall · Layer {layer}',
    },
    unplacedReasons: {
      NO_SPACE: 'No free space fits the package',
      OVER_PAYLOAD: 'Exceeds the vehicle max payload',
      DOOR_TOO_SMALL: 'Does not fit through the door',
      NO_ALLOWED_ORIENTATION: 'No allowed orientation fits the cargo space',
      STACKING_VIOLATION: 'Breaks a stacking rule',
      LIFO_VIOLATION: 'Breaks the delivery unloading order',
      UNKNOWN: 'Not placed, reason unknown',
    },
  },
  fields: {
    innerLengthCm: 'Inner length',
    innerWidthCm: 'Inner width',
    innerHeightCm: 'Inner height',
    maxPayloadKg: 'Max payload',
    doorWidthCm: 'Door width',
    doorHeightCm: 'Door height',
    lengthCm: 'Length',
    widthCm: 'Width',
    heightCm: 'Height',
  },
} satisfies Dictionary<typeof vi>
