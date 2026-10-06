import { useState } from 'react'
import { Plus, ShieldAlert } from 'lucide-react'

import { AdminFormDialog } from '@/components/admin-form-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMockStore } from '@/data/use-mock-store'

// P0-12 관리자 계정 관리 (요구사항 §9).
// 역할별 권한 정의는 /permissions에 있다.
export function AdminsPage() {
  const { admins: list, saveAdmin, deleteAdmin } = useMockStore()
  const [error, setError] = useState<string>()

  return (
    <>
      <PageHeader
        title="관리자"
        requirement="§9"
        description="관리자 계정을 등록하고 역할을 부여합니다. 역할별 권한 정의는 권한 화면에서 확인합니다."
      />

      {error ? <p role="alert" className="text-destructive mb-4 text-sm">{error}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">관리자 계정</CardTitle>
          <CardDescription>
            {list.length}명 · 비밀번호 5회 오류 시 잠기며, 다른 관리자가 해제할 수 있습니다.
          </CardDescription>
          <CardAction>
            <AdminFormDialog
              mode="create"
              trigger={
                <Button size="sm">
                  <Plus className="size-4" />
                  관리자 추가
                </Button>
              }
              existingAccounts={list}
              onSubmit={saveAdmin}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>계정</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead className="text-right">로그인 실패</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>마지막 로그인</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.account}</TableCell>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          m.role === 'Admin'
                            ? 'border-violet-500/20 bg-violet-500/10 font-normal text-violet-700 dark:text-violet-300'
                            : 'bg-muted text-muted-foreground border-transparent font-normal'
                        }
                      >
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.mfa ? (
                        <span className="text-xs text-emerald-700 dark:text-emerald-400">
                          적용
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                          <ShieldAlert className="size-3.5" />
                          미적용
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{m.failCount} / 5</TableCell>
                    <TableCell>
                      {m.locked ? (
                        <Badge
                          variant="outline"
                          className="border-rose-500/20 bg-rose-500/10 font-normal text-rose-700 dark:text-rose-300"
                        >
                          잠김
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/20 bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-300"
                        >
                          정상
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {m.lastLoginAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {m.locked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setError(saveAdmin({ ...m, locked: false, failCount: 0 }))
                            }
                          >
                            잠김 해제
                          </Button>
                        ) : null}
                        <AdminFormDialog
                          mode="edit"
                          admin={m}
                          trigger={
                            <Button variant="ghost" size="sm">
                              수정
                            </Button>
                          }
                          existingAccounts={list}
                          onSubmit={saveAdmin}
                        />
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                          if (window.confirm(`${m.account} 관리자를 삭제하시겠습니까?`)) setError(deleteAdmin(m.id))
                        }}>삭제</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </>
  )
}
