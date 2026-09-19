import type { Dictionary } from '../types'
import type { notFound as source } from '../vi/notFound'

export const notFound = {
  errorCode: 'Error',
  title: 'Page not found',
  description:
    'This link does not exist or has changed. Check the link or go back to the trip list.',
  errorTitle: 'Something went wrong',
  errorDescription:
    'This screen failed to load. Reload the page; if it still fails, contact your system administrator.',
  backToTrips: 'Back to trip list',
  reload: 'Reload page',
} satisfies Dictionary<typeof source>
