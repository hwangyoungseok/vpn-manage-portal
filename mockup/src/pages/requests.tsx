import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Search, X } from 'lucide-react'

import { ExcelUploadDialog } from '@/components/excel-upload-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { RequestStatusBadge, UserTypeBadge } from '@/components/status-badge'
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
import { requestKinds, requests } from '@/data/mock'
import { maskName } from '@/lib/format'

// P0-6 신청 목록 (요구사항 §2).
export function RequestsPage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('all')
  const [system, setSystem] = useState('all')
  const [kind, setKind] = useState('all')
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])

  const systems = useMemo(() => [...new Set(requests.map((r) => r.sourceSystem))], [])

  // 한 신청 건에 여러 사용자가 있으므로 사용자 단위로 펼쳐서 보여준다.
  const rows = requests
    .flatMap((request) => request.items.map((item) => ({ request, item })))
    .filter(({ request: r, item: i }) => {
      const hitKeyword =
        keyword === '' ||
        [i.account, i.assignedIp, i.name, i.department, i.affiliation, r.company, r.sourceNo].some((v) =>
          v.toLowerCase().includes(keyword.toLowerCase()),
        )
      const hitStatus = status === 'all' || r.status === status
      const hitSystem = system === 'all' || r.sourceSystem === system
      const hitKind = kind === 'all' || i.kind === kind
      return hitKeyword && hitStatus && hitSystem && hitKind
    })

  const allChecked = rows.length > 0 && rows.every(({ item }) => selected.includes(item.id))

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
                placeholder="VPN ID · VPN IP · 이름 · 부서 · 소속사 · 신청사 · 근거번호"
                aria-label="신청 검색"
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
            <Select value={kind} onValueChange={(v) => setKind(v ?? 'all')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue>{(v) => (v === 'all' ? '전체 구분' : String(v))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 구분</SelectItem>
                {requestKinds.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
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
            <span className="mt-1 block">VPN IP는 신청 계정의 고정 IP입니다. 행을 누르면 같은 근거번호의 신청 상세에서 해당 사용자를 보여줍니다.</span>
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
                      onCheckedChange={(v) => setSelected(v ? rows.map(({ item }) => item.id) : [])}
                      aria-label="전체 선택"
                    />
                  </TableHead>
                  <TableHead>신청사 / 구분</TableHead>
                  <TableHead>이름 / 부서 / 소속사</TableHead>
                  <TableHead>근거번호</TableHead>
                  <TableHead>VPN ID</TableHead>
                  <TableHead>VPN IP</TableHead>
                  <TableHead>신청일시</TableHead>
                  <TableHead>만료일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">처리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ request: r, item: i }) => (
                  <TableRow
                    key={i.id}
                    data-state={selected.includes(i.id) ? 'selected' : undefined}
                    className="cursor-pointer"
                    onClick={() => navigate(`/requests/${r.id}?item=${i.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(i.id)}
                        onCheckedChange={(v) =>
                          setSelected((prev) =>
                            v ? [...prev, i.id] : prev.filter((id) => id !== i.id),
                          )
                        }
                        aria-label={`${i.account} 선택`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{r.company}</span>
                        <span aria-hidden="true" className="bg-border h-4 w-px shrink-0" />
                        <UserTypeBadge userType={i.userType} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{maskName(i.name)}</span>
                        <span aria-hidden="true" className="bg-border h-4 w-px shrink-0" />
                        <span className="text-muted-foreground">{i.department}</span>
                        <span aria-hidden="true" className="bg-border h-4 w-px shrink-0" />
                        <span className="text-muted-foreground">{i.affiliation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <Link
                        to={`/requests/${r.id}?item=${i.id}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.sourceNo}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{i.account}</TableCell>
                    <TableCell className="font-mono text-xs">{i.assignedIp}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {r.requestedAt}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {i.expiresAt}
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
