import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Info, Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge, UserTypeBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { companies } from '@/data/mock'
import { useMockStore } from '@/data/use-mock-store'
import { excludedFromExport, maskName } from '@/lib/format'

// P0-7 계정 · 정책 목록 (요구사항 §3). P0-15 마스킹 규칙 적용.
export function AccountsPage() {
  const { accounts } = useMockStore()
  const [keyword, setKeyword] = useState('')
  const [company, setCompany] = useState('all')
  const [userType, setUserType] = useState('all')
  const [status, setStatus] = useState('all')

  const rows = accounts.filter((a) => {
    const hitKeyword =
      keyword === '' ||
      [a.account, a.name, a.assignedIp, a.sourceNo].some((v) =>
        v.toLowerCase().includes(keyword.toLowerCase()),
      )
    return (
      hitKeyword &&
      (company === 'all' || a.company === company) &&
      (userType === 'all' || a.userType === userType) &&
      (status === 'all' || a.status === status)
    )
  })

  return (
    <>
      <PageHeader
        title="계정 · 정책"
        requirement="§3"
        description="적용된 계정과 정책을 확인합니다. 다운로드 내역은 감사 로그에 기록됩니다."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            엑셀 다운로드
          </Button>
        }
      />

      <Card className="mb-4 border-sky-500/20 bg-sky-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div className="text-sm">
            <p className="font-medium">개인정보 표시 · 내보내기 규칙</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              이름은 가운데를 마스킹하여 표시합니다. 엑셀 다운로드에서는{' '}
              {excludedFromExport.join(' · ')} 항목이 제외되고, 계정 · 정책 · 만료 기한만
              포함됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="계정 · 이름 · IP · 근거번호"
                className="pl-8"
              />
            </div>
            <Select value={company} onValueChange={(v) => setCompany(v ?? "all")}>
              <SelectTrigger className="w-[170px]">
                <SelectValue>{(v) => (v === "all" ? "전체 그룹사" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 그룹사</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userType} onValueChange={(v) => setUserType(v ?? "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue>{(v) => (v === "all" ? "전체 구분" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 구분</SelectItem>
                <SelectItem value="정직원">정직원</SelectItem>
                <SelectItem value="협력사">협력사</SelectItem>
                <SelectItem value="생산협력사">생산협력사</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue>{(v) => (v === "all" ? "전체 상태" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="사용중">사용중</SelectItem>
                <SelectItem value="만료임박">만료임박</SelectItem>
                <SelectItem value="만료">만료</SelectItem>
                <SelectItem value="잠김">잠김</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>{rows.length}건 표시 / 전체 {accounts.length}건</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>계정</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>그룹사 / 부서</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>할당 IP</TableHead>
                  <TableHead>OTP</TableHead>
                  <TableHead>적용 정책</TableHead>
                  <TableHead>만료일</TableHead>
                  <TableHead>마지막 접속</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.account}</TableCell>
                    <TableCell>{maskName(a.name)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {a.company}
                      <br />
                      {a.department}
                    </TableCell>
                    <TableCell>
                      <UserTypeBadge userType={a.userType} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">{a.assignedIp}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-xs">
                        {a.otp ? '사용' : '미사용'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {a.acls.length === 0 ? (
                          <span className="text-muted-foreground text-xs">없음</span>
                        ) : (
                          a.acls.map((acl) => (
                            <Badge key={acl} variant="outline" className="font-mono text-[10px]">
                              {acl}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{a.expiresAt}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {a.lastAccessAt ?? '없음'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link to={`/accounts/${a.id}`} />}
                      >
                        상세
                      </Button>
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
