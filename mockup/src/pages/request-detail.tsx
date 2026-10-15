import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Mail,
  Trash2,
  X,
} from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { TablePagination } from '@/components/table-pagination'
import {
  RequestStatusBadge,
  ReviewBadge,
  UserTypeBadge,
  ValidityBadge,
} from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  requestKinds,
  requests,
  type RequestItem,
  type RequestKind,
  type RequestStatus,
  type ReviewState,
  type VpnRequest,
} from '@/data/mock'
import { maskEmail, maskName } from '@/lib/format'
import { policyText } from '@/lib/request'

const now = '2026-10-14 10:30'
const operator = '김수현'

const sectionLabel: Partial<Record<RequestKind, string>> = { 신규: '신규요청' }

// 신청 상세 현황 (요구사항 §2). 하나의 근거번호에 묶인 사용자를 구분별로 점검한다.
export function RequestDetailPage() {
  const { id } = useParams()
  const request = requests.find((r) => r.id === id)
  if (!request)
    return (
      <p>
        신청을 찾을 수 없습니다.{' '}
        <Link to="/requests" className="underline">
          목록으로 돌아가기
        </Link>
      </p>
    )
  return <RequestDetail key={request.id} request={request} />
}

function RequestDetail({ request }: { request: VpnRequest }) {
  const navigate = useNavigate()
  // 목록에서 누른 사용자. 해당 섹션 페이지를 열고 행을 강조한다.
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('item')
  const [users, setUsers] = useState(request.items)
  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [processed, setProcessed] = useState(
    request.processedBy ? `${request.processedBy} / ${request.processedAt}` : '',
  )
  const [mailedAt, setMailedAt] = useState(request.mailedAt ?? '')
  const [notice, setNotice] = useState<{ text: string; error?: boolean }>()

  const closed = status === '완료' || status === '반려'
  const count = (review: ReviewState) => users.filter((u) => u.review === review).length
  const invalid = users.filter((u) => u.validity === '실패').length

  function review(ids: string[], next: ReviewState) {
    const blocked = users.filter((u) => ids.includes(u.id) && next === '확인' && u.validity === '실패')
    setUsers((prev) =>
      prev.map((u) => (ids.includes(u.id) && !blocked.includes(u) ? { ...u, review: next } : u)),
    )
    if (status === '대기') setStatus('처리중')
    setNotice(
      blocked.length > 0
        ? { text: `유효성 실패 ${blocked.length}건은 확인할 수 없습니다. 사유를 확인하고 제외하세요.`, error: true }
        : { text: `${ids.length}건을 ${next} 처리했습니다.` },
    )
  }

  function finish(next: '완료' | '반려') {
    setUsers((prev) =>
      prev.map((u) =>
        u.review !== '대기' ? u : { ...u, review: next === '완료' && u.validity === '성공' ? '확인' : '제외' },
      ),
    )
    setStatus(next)
    setProcessed(`${operator} / ${now}`)
    setNotice({ text: next === '완료' ? '신청을 확인 처리했습니다.' : '신청을 반려했습니다.' })
  }

  const summary = [
    { label: '근거', value: `${request.sourceSystem}:${request.sourceNo}`, mono: true },
    { label: '신청사', value: request.company },
    { label: '신청자 / 부서', value: `${maskName(request.requestedBy)} / ${request.requesterDepartment}` },
    { label: '결재일', value: request.approvedAt },
    {
      label: '신청 / 유효성 실패 / 확인 / 제외',
      value: `${users.length} / ${invalid} / ${count('확인')} / ${count('제외')}`,
    },
    { label: '상태', value: <RequestStatusBadge status={status} /> },
    { label: '신청 처리', value: processed || '-' },
    { label: '메일 발송', value: mailedAt || '-' },
  ]

  return (
    <>
      <PageHeader
        title={`신청 상세 — ${request.sourceNo}`}
        requirement="§2"
        description="결재 건에 포함된 사용자를 점검하고 확인 · 제외 · 반려를 처리합니다."
        actions={
          <>
            <Button variant="ghost" size="sm" render={<Link to="/requests" />}>
              <ArrowLeft className="size-4" />
              목록
            </Button>
            <Button variant="destructive" size="sm" onClick={() => navigate('/requests')}>
              <Trash2 className="size-4" />
              삭제
            </Button>
            <Button variant="outline" size="sm" disabled={closed} onClick={() => finish('반려')}>
              <X className="size-4" />
              반려
            </Button>
            <Button size="sm" disabled={closed} onClick={() => finish('완료')}>
              <Check className="size-4" />
              확인
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!closed}
              onClick={() => {
                setMailedAt(now)
                setNotice({ text: '처리 결과 메일을 발송했습니다.' })
              }}
            >
              <Mail className="size-4" />
              메일
            </Button>
          </>
        }
      />
      {notice ? (
        <p
          role={notice.error ? 'alert' : 'status'}
          className={
            notice.error
              ? 'text-destructive mb-4 text-sm'
              : 'mb-4 text-sm text-emerald-700 dark:text-emerald-400'
          }
        >
          {notice.text}
        </p>
      ) : null}

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">신청 정보</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {summary.map((s) => (
                      <TableHead key={s.label} className="text-center">
                        {s.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-transparent">
                    {summary.map((s) => (
                      <TableCell
                        key={s.label}
                        className={
                          s.mono ? 'text-center font-mono text-xs' : 'text-center tabular-nums'
                        }
                      >
                        {s.value}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">신청 사용자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 px-0">
            {requestKinds
              .filter((kind) => users.some((u) => u.kind === kind))
              .map((kind, index) => (
                <UserSection
                  key={kind}
                  title={`(${index + 1}) ${sectionLabel[kind] ?? kind}`}
                  users={users.filter((u) => u.kind === kind)}
                  disabled={closed}
                  focusId={focusId}
                  onReview={review}
                />
              ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function UserSection({
  title,
  users,
  disabled,
  focusId,
  onReview,
}: {
  title: string
  users: RequestItem[]
  disabled: boolean
  focusId: string | null
  onReview: (ids: string[], next: ReviewState) => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [size, setSize] = useState(5)
  const [page, setPage] = useState(() => {
    const index = users.findIndex((u) => u.id === focusId)
    return index < 0 ? 1 : Math.floor(index / size) + 1
  })
  const focusRow = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    focusRow.current?.scrollIntoView({ block: 'center' })
  }, [])

  const pages = Math.max(1, Math.ceil(users.length / size))
  const current = Math.min(page, pages)
  const rows = users.slice((current - 1) * size, current * size)
  const allChecked = rows.length > 0 && rows.every((u) => selected.includes(u.id))

  function apply(next: ReviewState) {
    onReview(selected, next)
    setSelected([])
  }

  return (
    <section aria-label={title}>
      <div className="mb-2 flex items-center justify-between gap-2 px-4">
        <h3 className="text-sm font-medium">
          {title}
          <span className="text-muted-foreground ml-2 font-normal">{users.length}명</span>
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="xs"
            disabled={disabled || selected.length === 0}
            onClick={() => apply('확인')}
          >
            확인
          </Button>
          <Button
            variant="outline"
            size="xs"
            disabled={disabled || selected.length === 0}
            onClick={() => apply('제외')}
            className="text-amber-700 dark:text-amber-300"
          >
            제외
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allChecked}
                  disabled={disabled || rows.length === 0}
                  onCheckedChange={(v) =>
                    setSelected((prev) =>
                      v
                        ? [...new Set([...prev, ...rows.map((u) => u.id)])]
                        : prev.filter((id) => !rows.some((u) => u.id === id)),
                    )
                  }
                  aria-label={`${title} 전체 선택`}
                />
              </TableHead>
              <TableHead>점검</TableHead>
              <TableHead>유효성</TableHead>
              <TableHead>사유</TableHead>
              <TableHead>VPN ID</TableHead>
              <TableHead>신청 사용자 / 부서 / 소속사</TableHead>
              <TableHead>정책</TableHead>
              <TableHead>시작일</TableHead>
              <TableHead>만료일</TableHead>
              <TableHead>메일</TableHead>
              <TableHead>모바일</TableHead>
              <TableHead>OU</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={12} className="text-muted-foreground h-20 text-center">
                  조회된 데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => (
                <TableRow
                  key={u.id}
                  ref={u.id === focusId ? focusRow : undefined}
                  data-state={selected.includes(u.id) ? 'selected' : undefined}
                  className={u.id === focusId ? 'bg-primary/5 shadow-[inset_3px_0_0_var(--primary)]' : undefined}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selected.includes(u.id)}
                      disabled={disabled}
                      onCheckedChange={(v) =>
                        setSelected((prev) => (v ? [...prev, u.id] : prev.filter((id) => id !== u.id)))
                      }
                      aria-label={`${u.account} 선택`}
                    />
                  </TableCell>
                  <TableCell>
                    <ReviewBadge review={u.review} />
                  </TableCell>
                  <TableCell>
                    <ValidityBadge validity={u.validity} />
                  </TableCell>
                  <TableCell className="text-destructive text-xs">{u.reason}</TableCell>
                  <TableCell className="font-mono text-xs">{u.account}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{maskName(u.name)}</span>
                      <UserTypeBadge userType={u.userType} />
                      <span aria-hidden="true" className="bg-border h-4 w-px shrink-0" />
                      <span className="text-muted-foreground">{u.department}</span>
                      <span aria-hidden="true" className="bg-border h-4 w-px shrink-0" />
                      <span className="text-muted-foreground">{u.affiliation}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{policyText(u)}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{u.startDate ?? '-'}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{u.expiresAt}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{maskEmail(u.email)}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{u.mobile}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{u.ou}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={current}
        pages={pages}
        size={size}
        total={users.length}
        onPage={setPage}
        onSize={(next) => {
          setSize(next)
          setPage(1)
        }}
      />
    </section>
  )
}
