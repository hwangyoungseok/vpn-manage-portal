import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { ResultBadge } from '@/components/status-badge'
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
import { auditLogs } from '@/data/mock'

// P0-13 감사 로그 (요구사항 §11).
export function AuditLogsPage() {
  const [keyword, setKeyword] = useState('')
  const [action, setAction] = useState('all')
  const [role, setRole] = useState('all')

  const actions = useMemo(() => [...new Set(auditLogs.map((l) => l.action))], [])

  const rows = auditLogs.filter((l) => {
    const hitKeyword =
      keyword === '' ||
      [l.actor, l.target, l.detail, l.ip].some((v) =>
        v.toLowerCase().includes(keyword.toLowerCase()),
      )
    return (
      hitKeyword && (action === 'all' || l.action === action) && (role === 'all' || l.role === role)
    )
  })

  return (
    <>
      <PageHeader
        title="감사 로그"
        requirement="§11"
        description="관리자가 수행한 행위와 대상, 변경 내용을 조회합니다."
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            엑셀 다운로드
          </Button>
        }
      />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="수행자 · 대상 · 내용 · IP"
                className="pl-8"
              />
            </div>
            <Select value={action} onValueChange={(v) => setAction(v ?? "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue>{(v) => (v === "all" ? "전체 행위" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 행위</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={(v) => setRole(v ?? "all")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue>{(v) => (v === "all" ? "전체 역할" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 역할</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="운영자">운영자</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>{rows.length}건 표시 / 전체 {auditLogs.length}건</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>일시</TableHead>
                  <TableHead>수행자</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>행위</TableHead>
                  <TableHead>대상</TableHead>
                  <TableHead>변경 내용</TableHead>
                  <TableHead>접속 IP</TableHead>
                  <TableHead>결과</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="tabular-nums">{l.at}</TableCell>
                    <TableCell>{l.actor}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {l.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{l.action}</TableCell>
                    <TableCell className="font-mono text-xs">{l.target}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[320px] text-xs">
                      {l.detail}
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">{l.ip}</TableCell>
                    <TableCell>
                      <ResultBadge result={l.result} />
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
