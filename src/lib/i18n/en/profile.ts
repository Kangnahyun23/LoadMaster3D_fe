import type { Dictionary } from '../types'
import type { profile as source } from '../vi/profile'

export const profile = {
  title: 'My profile',
  details: {
    title: 'Personal details',
    description: 'You can edit your name and phone number. Your email, role and depot are changed by an administrator.',
    fullName: 'Full name',
    phone: 'Phone number',
    email: 'Email',
    role: 'Role',
    depot: 'Depot',
    save: 'Save changes',
    saved: 'Profile saved',
  },
  password: {
    title: 'Change password',
    description: 'Use the new password from your next sign-in.',
    current: 'Current password',
    next: 'New password',
    nextHint: 'At least {min} characters',
    confirm: 'Confirm new password',
    submit: 'Change password',
    changed: 'Password changed',
  },
  errors: {
    fullNameRequired: 'Enter your full name',
    fullNameTooLong: 'Full name can be at most 80 characters',
    phoneRequired: 'Enter a phone number',
    phoneInvalid: 'Phone number must have 10 digits and start with 0',
    currentRequired: 'Enter your current password',
    currentIncorrect: 'Current password is incorrect',
    nextTooShort: 'The new password needs at least {min} characters',
    confirmMismatch: 'The passwords do not match',
  },
} satisfies Dictionary<typeof source>
