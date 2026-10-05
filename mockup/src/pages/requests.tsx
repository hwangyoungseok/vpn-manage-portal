import { useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'

import { ExcelUploadDialog } from '@/components/excel-upload-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { RequestStatusBadge, UserTypeBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { requests } from '@/data/mock'
import { maskName } from '@/lib/format'

// P0-6 신청 목록 (요구사항 §2).
export function RequestsPage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('all')
  const [system, setSystem] = useState('all')
  const [selected, setSelected] = useState<string[]>([])

  const systems = useMemo(() => [...new Set(requests.map((r) => r.sourceSystem))], [])

  const rows = requests.filter((r) => {
    const hitKeyword =
      keyword === '' ||
      [r.account, r.name, r.company, r.sourceNo].some((v) =>
        v.toLowerCase().includes(keyword.toLowerCase()),
      )
    const hitStatus = status === 'all' || r.status === status
    const hitSystem = system === 'all' || r.sourceSystem === system
    return hitKeyword && hitStatus && hitSystem
  })

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id))

  return (
    <>
      <PageHeader
        title="신청 목록"
        requirement="§2"
        description="연계 시스템에서 넘어온 신청을 확인하고 정책을 적용합니다."
        actions={
          <>
            <ExcelUploadDialog />
            <Button size="sm" disabled={selected.length === 0}>
              <Check className="size-4" />
              선택 {selected.length}건 정책 적용
            </Button>
          </>
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
                placeholder="계정 · 이름 · 그룹사 · 근거번호"
                className="pl-8"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue>{(v) => (v === "all" ? "전체 상태" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="대기">대기</SelectItem>
                <SelectItem value="처리중">처리중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
                <SelectItem value="반려">반려</SelectItem>
              </SelectContent>
            </Select>
            <Select value={system} onValueChange={(v) => setSystem(v ?? "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue>{(v) => (v === "all" ? "전체 시스템" : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 시스템</SelectItem>
                {systems.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            {rows.length}건 표시 · 엑셀 업로드 시 근거 시스템과 근거 번호가 필수입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={(v) => setSelected(v ? rows.map((r) => r.id) : [])}
                      aria-label="전체 선택"
                    />
                  </TableHead>
                  <TableHead>신청번호</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>계정</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>그룹사</TableHead>
                  <TableHead>사용자 구분</TableHead>
                  <TableHead>근거 시스템 / 번호</TableHead>
                  <TableHead>신청일시</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">처리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} data-state={selected.includes(r.id) ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(r.id)}
                        onCheckedChange={(v) =>
                          setSelected((prev) =>
                            v ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                          )
                        }
                        aria-label={`${r.id} 선택`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {r.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.account}</TableCell>
                    <TableCell>{maskName(r.name)}</TableCell>
                    <TableCell className="text-muted-foreground">{r.company}</TableCell>
                    <TableCell>
                      <UserTypeBadge userType={r.userType} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {r.sourceSystem}
                      <br />
                      <span className="font-mono">{r.sourceNo}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {r.requestedAt}
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === '대기' ? (
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label="승인">
                            <Check className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="반려">
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
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
