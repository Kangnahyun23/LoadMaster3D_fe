import { SEED_ANCHOR_DATE } from '@/lib/mock-db'
import { seedUsers } from '@/lib/mock-db/seed-users'
import type { User } from '@/types/user'

/** Danh sách ban đầu của màn quản trị cho tới khi màn đọc kho qua Query (LM-092): chính người dùng seed của kho. */
export const USERS: User[] = seedUsers(SEED_ANCHOR_DATE)
