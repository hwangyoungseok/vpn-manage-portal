import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { MockStoreProvider } from '@/data/mock-store'
import { AccountDetailPage } from '@/pages/account-detail'
import { AccountsPage } from '@/pages/accounts'
import { AdminsPage } from '@/pages/admins'
import { AuditLogsPage } from '@/pages/audit-logs'
import { CompaniesPage } from '@/pages/companies'
import { DashboardPage } from '@/pages/dashboard'
import { DeletedUsersPage } from '@/pages/deleted-users'
import { IpRangesPage } from '@/pages/ip-ranges'
import { LoginPage } from '@/pages/login'
import { PermissionsPage } from '@/pages/permissions'
import { ReportsPage } from '@/pages/reports'
import { RequestsPage } from '@/pages/requests'

export default function App() {
  return (
    <MockStoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/:id" element={<AccountDetailPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/ip-ranges" element={<IpRangesPage />} />
            <Route path="/deleted" element={<DeletedUsersPage />} />
            <Route path="/admins" element={<AdminsPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </MockStoreProvider>
  )
}
