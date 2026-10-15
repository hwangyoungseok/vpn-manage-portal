import { createContext, useContext } from 'react'
import type { Account, AccountHistory, Acl, AdminUser, AuditLog, PermissionRole, PermissionRow } from './mock'

type Store = {
  admins: AdminUser[]
  acls: Acl[]
  accounts: Account[]
  auditLogs: AuditLog[]
  accountHistory: AccountHistory[]
  permissions: PermissionRow[]
  error?: string
  saveAdmin: (admin: AdminUser) => string | undefined
  deleteAdmin: (id: string) => string | undefined
  savePermission: (label: string, role: PermissionRole, allowed: boolean) => string | undefined
  saveAcl: (acl: Acl) => string | undefined
  deleteAcl: (id: string) => string | undefined
  savePolicies: (accountId: string, names: string[], created: Acl[]) => string | undefined
  saveAccount: (account: Account) => string | undefined
  deleteAccount: (id: string) => string | undefined
  reset: () => string | undefined
}
export const MockStoreContext = createContext<Store | null>(null)

export function useMockStore() {
  const store = useContext(MockStoreContext)
  if (!store) throw new Error('MockStoreProvider is required')
  return store
}
