import type { Dictionary } from '../types'
import type { status as source } from '../vi/status'

export const status = {
  nhap: 'Draft',
  dang_toi_uu: 'Optimizing',
  da_toi_uu: 'Optimized',
  da_duyet: 'Approved',
  dang_xep_hang: 'Loading',
  da_xep_xong: 'Loaded',
  dang_giao: 'Delivering',
  hoan_thanh: 'Completed',
  can_xem_lai: 'Needs review',
  da_huy: 'Cancelled',
} satisfies Dictionary<typeof source>
