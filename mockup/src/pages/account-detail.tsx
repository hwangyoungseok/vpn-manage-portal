import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Link2, Plus, Trash2 } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { AclForm } from '@/components/acl-form'
import { StatusBadge, UserTypeBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Account, Acl } from '@/data/mock'
import { useMockStore } from '@/data/use-mock-store'
import { maskName } from '@/lib/format'

// P0-8 계정 상세 · 정책 편집 (요구사항 §1.2).
// ACL 신규 생성 방식과 기존 ACL 매핑 방식 두 가지를 모두 보여준다.
export function AccountDetailPage() {
  const { id } = useParams()
  const [notice, setNotice] = useState('')
  const { accounts } = useMockStore()
  const account = accounts.find((a) => a.id === id)
  if (!account) return <p>계정을 찾을 수 없습니다. <Link to="/accounts" className="underline">목록으로 돌아가기</Link></p>
  return <>
    {notice ? <p role="status" className="mb-4 text-sm text-emerald-700 dark:text-emerald-400">{notice}</p> : null}
    <AccountPolicyEditor key={`${account.id}:${account.acls.join(',')}`} account={account} onNotice={setNotice} />
  </>
}

function AccountPolicyEditor({ account, onNotice }: { account: Account; onNotice: (notice: string) => void }) {
  const { acls, savePolicies } = useMockStore()
  const [mode, setMode] = useState<'map' | 'create'>('map')
  const [names, setNames] = useState(account.acls)
  const [created, setCreated] = useState<Acl[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const allAcls = [...acls, ...created]
  const applied = allAcls.filter((acl) => names.includes(acl.name))
  const available = allAcls.filter((acl) => !names.includes(acl.name))
  const dirty = names.length !== account.acls.length || names.some((name) => !account.acls.includes(name))

  function changeNames(next: string[]) {
    setNames(next)
    onNotice('')
    setError(undefined)
  }

  const fields = [
    { label: '계정', value: account.account, mono: true },
    { label: '이름', value: maskName(account.name) },
    { label: '그룹사', value: account.company },
    { label: '부서', value: account.department },
    { label: '할당 IP', value: account.assignedIp, mono: true },
    { label: 'OTP 사용', value: account.otp ? '사용' : '미사용' },
    { label: '생성일', value: account.createdAt },
    { label: '만료일', value: account.expiresAt },
    { label: '마지막 접속', value: account.lastAccessAt ?? '없음' },
    { label: '근거 시스템', value: account.sourceSystem },
    { label: '근거 번호', value: account.sourceNo, mono: true },
  ]

  return (
    <>
      <PageHeader
        title={`계정 상세 — ${account.account}`}
        requirement="§1.2"
        description="계정 정보와 VPN 정책(ACL)을 확인하고 편집합니다."
        actions={
          <>
            <Button variant="ghost" size="sm" render={<Link to="/accounts" />}>
              <ArrowLeft className="size-4" />
              목록
            </Button>
            <Button variant="outline" size="sm">
              기간 연장
            </Button>
            <Button size="sm" disabled={!dirty} onClick={() => {
              const failure = savePolicies(account.id, names, created.filter((acl) => names.includes(acl.name)))
              setError(failure)
              if (!failure) { setCreated([]); onNotice('정책 변경을 저장했습니다.') }
            }}>변경 사항 적용</Button>
          </>
        }
      />
      {error ? <p role="alert" className="text-destructive mb-4 text-sm">{error}</p> : null}
      {dirty ? <p role="status" className="text-muted-foreground mb-4 text-sm">저장하지 않은 정책 변경이 있습니다. ‘변경 사항 적용’을 눌러 저장하세요.</p> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">계정 정보</CardTitle>
              <StatusBadge status={account.status} />
              <UserTypeBadge userType={account.userType} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((f) => (
              <div key={f.label} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground shrink-0">{f.label}</span>
                <span className={f.mono ? 'font-mono text-xs' : 'text-right'}>{f.value}</span>
              </div>
            ))}
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                비밀번호 초기화
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-destructive">
                계정 삭제
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">정책 (ACL)</CardTitle>
            <CardDescription>
              기존 ACL을 매핑하거나, 새 ACL을 만들어 IP · 포트를 직접 지정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-muted-foreground mb-2 block text-xs">적용된 ACL</Label>
              <div className="space-y-2">
                {applied.length === 0 ? (
                  <p className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
                    적용된 정책이 없습니다.
                  </p>
                ) : (
                  applied.map((acl) => (
                    <div key={acl.id} className="rounded-md border">
                      <div className="flex items-center justify-between gap-2 p-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-medium">{acl.name}</span>
                            {acl.shared ? (
                              <Badge variant="secondary" className="font-normal">
                                그룹 ACL
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">{acl.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" aria-label={`${acl.name} 정책 제거`} onClick={() => changeNames(names.filter((name) => name !== acl.name))}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <Separator />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>목적지</TableHead>
                            <TableHead>포트</TableHead>
                            <TableHead>프로토콜</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {acl.entries.map((e) => (
                            <TableRow key={`${acl.id}-${e.destination}-${e.port}-${e.protocol}`}>
                              <TableCell className="font-mono text-xs">{e.destination}</TableCell>
                              <TableCell className="font-mono text-xs">{e.port}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                {e.protocol}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'map' | 'create')}>
              <TabsList>
                <TabsTrigger value="map">
                  <Link2 className="size-4" />
                  기존 ACL 매핑
                </TabsTrigger>
                <TabsTrigger value="create">
                  <Plus className="size-4" />
                  새 ACL 생성
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-3 pt-4">
                <p className="text-muted-foreground text-xs">
                  미리 정의된 그룹 ACL을 이 계정 정책에 매핑합니다. ACL 이름은 신청 시스템과
                  연계됩니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Select value={selected} onValueChange={setSelected}>
                    <SelectTrigger className="min-w-[240px] flex-1">
                      <SelectValue placeholder="매핑할 ACL 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((acl) => (
                        <SelectItem key={acl.id} value={acl.name}>
                          {acl.name} — {acl.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" disabled={!selected || !available.some((acl) => acl.name === selected)} onClick={() => {
                    if (selected) changeNames([...names, selected])
                    setSelected(null)
                  }}>매핑 추가</Button>
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-4 pt-4">
                <p className="text-muted-foreground text-xs">
                  새 ACL 이름을 만들고 필요한 IP · 포트를 직접 삽입합니다.
                </p>
                <AclForm existing={allAcls} onSubmit={(acl) => {
                  setCreated((prev) => [...prev, acl])
                  changeNames([...names, acl.name])
                  return undefined
                }} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
