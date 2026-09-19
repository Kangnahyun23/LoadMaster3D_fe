import type { Dictionary } from '../types'
import type { notFound as source } from '../vi/notFound'

export const notFound = {
  errorCode: 'Error',
  title: 'Page not found',
  description:
    'This link does not exist or has changed. Check the link or go back to your home screen.',
  errorTitle: 'Something went wrong',
  errorDescription:
    'This screen failed to load. Reload the page; if it still fails, contact your system administrator.',
  backHome: 'Back to home',
  reload: 'Reload page',
  forbiddenTitle: 'Access denied',
  forbiddenDescription: 'A {role} account cannot open this screen. Go back to your home screen or contact your system administrator.',
} satisfies Dictionary<typeof source>
