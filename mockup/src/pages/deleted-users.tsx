import { useState } from 'react'
import { Download, Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { DeleteReasonBadge, UserTypeBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { DeleteReason } from '@/data/mock'
import { deletedUsers } from '@/data/mock'
import { maskName } from '@/lib/format'

const reasons: DeleteReason[] = ['요청삭제', '기간만료삭제', '장기미사용삭제']

// P0-11 삭제 사용자 목록 (요구사항 §8).
export function DeletedUsersPage() {
  const [keyword, setKeyword] = useState('')
  const [reason, setReason] = useState('all')

  const rows = deletedUsers.filter((d) => {
    const hitKeyword =
      keyword === '' ||
      [d.account, d.name, d.company].some((v) => v.toLowerCase().includes(keyword.toLowerCase()))
    return hitKeyword && (reason === 'all' || d.reason === reason)
  })

  return (
    <>
      <PageHeader
        title="삭제 사용자"
        requirement="§8"
        description="삭제된 계정과 삭제 사유를 확인합니다."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            엑셀 다운로드
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {reasons.map((r) => {
          const count = deletedUsers.filter((d) => d.reason === r).length
          return (
            <Card key={r}>
              <CardHeader className="pb-2">
                <CardDescription>{r}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {count}
                  <span className="text-muted-foreground ml-1 text-sm font-normal">건</span>
                </CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="계정 · 이름 · 그룹사"
                className="pl-8"
              />
            </div>
            <Select value={reason} onValueChange={(v) => setReason(v ?? "all")}>
              <SelectTrigger className="w-[170px]">
                <SelectValue>{(v) => (v === "all" ? "전체 사유" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 사유</SelectItem>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CardDescription>{rows.length}건 표시</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>계정</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>그룹사</TableHead>
                  <TableHead>사용자 구분</TableHead>
                  <TableHead>삭제 사유</TableHead>
                  <TableHead>상세</TableHead>
                  <TableHead>마지막 접속</TableHead>
                  <TableHead>삭제일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.account}</TableCell>
                    <TableCell>{maskName(d.name)}</TableCell>
                    <TableCell className="text-muted-foreground">{d.company}</TableCell>
                    <TableCell>
                      <UserTypeBadge userType={d.userType} />
                    </TableCell>
                    <TableCell>
                      <DeleteReasonBadge reason={d.reason} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{d.detail}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {d.lastAccessAt ?? '없음'}
                    </TableCell>
                    <TableCell className="tabular-nums">{d.deletedAt}</TableCell>
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
