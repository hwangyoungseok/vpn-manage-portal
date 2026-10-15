import { useState } from 'react'
import { Plus, Search } from 'lucide-react'

import { AclFormDialog } from '@/components/acl-form'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMockStore } from '@/data/use-mock-store'

// 그룹 ACL 관리 (요구사항 §1.2). 미리 정의해 두고 계정 정책에 매핑하는 공용 ACL이다.
// ACL 이름은 신청 시스템과 연계되므로, 적용 중인 ACL은 삭제할 수 없다.
export function GroupAclsPage() {
  const { acls, accounts, saveAcl, deleteAcl } = useMockStore()
  const [keyword, setKeyword] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ text: string; error?: boolean }>()

  const groupAcls = acls.filter((a) => a.shared)
  const k = keyword.trim().toLowerCase()
  const rows = groupAcls.filter(
    (acl) =>
      k === '' ||
      (acl.company ?? '').toLowerCase().includes(k) ||
      acl.name.toLowerCase().includes(k) ||
      acl.description.toLowerCase().includes(k) ||
      acl.entries.some((e) => e.destination.includes(k) || e.port.includes(k)),
  )
  const usage = (name: string) => accounts.filter((a) => a.acls.includes(name)).length

  function remove(id: string, name: string) {
    if (confirmId !== id) {
      setConfirmId(id)
      setNotice({ text: `‘삭제 확인’을 누르면 ${name} ACL이 삭제됩니다.`, error: true })
      return
    }
    const failure = deleteAcl(id)
    setConfirmId(null)
    setNotice(failure ? { text: failure, error: true } : { text: `${name} ACL을 삭제했습니다.` })
  }

  return (
    <>
      <PageHeader
        title="그룹 ACL 관리"
        requirement="§1.2"
        description="미리 정의한 공용 ACL을 관리합니다. 계정 정책에서 매핑해 사용하며, 이름이 신청 시스템과 연계됩니다."
        actions={
          <AclFormDialog
            shared
            existing={acls}
            onSubmit={(acl) => {
              const failure = saveAcl(acl)
              if (!failure) setNotice({ text: `${acl.name} ACL을 추가했습니다.` })
              return failure
            }}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                그룹 ACL 추가
              </Button>
            }
          />
        }
      />

      <Card>
        <CardHeader className="gap-4">
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="회사 · ACL 이름 · 설명 · 목적지 IP · 포트"
              aria-label="그룹 ACL 검색"
              className="pl-8"
            />
          </div>
          {notice ? (
            <p
              role={notice.error ? 'alert' : 'status'}
              className={notice.error ? 'text-destructive text-sm' : 'text-sm text-emerald-700 dark:text-emerald-400'}
            >
              {notice.text}
            </p>
          ) : (
            <CardDescription>
              {rows.length}건 표시 / 전체 {groupAcls.length}건 · 적용 계정이 있는 ACL은 계정 정책에서 매핑을 뺀 뒤
              삭제할 수 있습니다.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회사</TableHead>
                  <TableHead>ACL 이름</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>목적지 · 포트 / 프로토콜</TableHead>
                  <TableHead className="text-right">적용 계정</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="text-muted-foreground h-20 text-center">
                      조회된 그룹 ACL이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((acl) => {
                    const used = usage(acl.name)
                    return (
                      <TableRow key={acl.id} className="align-top">
                        <TableCell>{acl.company}</TableCell>
                        <TableCell className="font-mono text-xs font-medium">{acl.name}</TableCell>
                        <TableCell className="text-muted-foreground">{acl.description}</TableCell>
                        <TableCell>
                          <ul className="space-y-0.5 font-mono text-xs">
                            {acl.entries.map((e, i) => (
                              <li key={i}>
                                {e.destination} · {e.port} / {e.protocol}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {used === 0 ? <span className="text-muted-foreground">0</span> : used}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <AclFormDialog
                              acl={acl}
                              existing={acls}
                              onSubmit={(next) => {
                                const failure = saveAcl(next)
                                if (!failure) setNotice({ text: `${next.name} ACL을 저장했습니다.` })
                                return failure
                              }}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  수정
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => remove(acl.id, acl.name)}
                            >
                              {confirmId === acl.id ? '삭제 확인' : '삭제'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
