import type { Dictionary } from './types'
import type { vi } from './vi'
import { language } from './en/language'
import { nav } from './en/nav'
import { roles } from './en/roles'
import { auth } from './en/auth'
import { notFound } from './en/notFound'
import { common } from './en/common'
import { status } from './en/status'
import { manager } from './en/manager'
import { driver } from './en/driver'
import { fleet } from './en/fleet'
import { issues } from './en/issues'
import { optimization } from './en/optimization'
import { trips } from './en/trips'
import { warehouse } from './en/warehouse'
import { viewer } from './en/viewer'
import { fields } from './en/fields'
import { admin } from './en/admin'
import { designSystem } from './en/designSystem'
import { dataErrors } from './en/dataErrors'
import { audit } from './en/audit'
import { profile } from './en/profile'
import { notifications } from './en/notifications'
import { search } from './en/search'
import { titles } from './en/titles'

/** Bản tiếng Anh: mỗi nhánh một file trong `en/`, kiểm thiếu/thừa key theo nhánh nguồn `vi/`. */
export const en = {
  language,
  nav,
  roles,
  auth,
  notFound,
  common,
  status,
  manager,
  driver,
  fleet,
  issues,
  optimization,
  trips,
  warehouse,
  viewer,
  fields,
  admin,
  designSystem,
  dataErrors,
  audit,
  profile,
  notifications,
  search,
  titles,
} satisfies Dictionary<typeof vi>
