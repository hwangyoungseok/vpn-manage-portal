import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, ClipboardList, Lock, Users } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { RequestStatusBadge, StatusBadge, UserTypeBadge } from '@/components/status-badge'
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
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  changeLabels,
  changeSummary,
  companySummary,
  reportLatest,
  requests,
  retentionPolicy,
} from '@/data/mock'
import { kindCounts } from '@/lib/request'
import { useMockStore } from '@/data/use-mock-store'
import { daysUntil, maskName } from '@/lib/format'

// P0-5 대시보드.
export function DashboardPage() {
  const { accounts } = useMockStore()
  const total = companySummary.reduce((sum, c) => sum + c.total, 0)
  const expiring = accounts.filter((a) => a.status === '만료임박')
  const locked = accounts.filter((a) => a.status === '잠김')
  const pending = requests.filter((r) => r.status === '대기' || r.status === '처리중')

  const changeTotals = [
    {
      label: '합계',
      value: changeSummary.reduce((acc, row) => acc + changeLabels.reduce((s, c) => s + row[c.key], 0), 0),
    },
    ...changeLabels.map((c) => ({
      label: c.label,
      value: changeSummary.reduce((acc, row) => acc + row[c.key], 0),
    })),
  ]

  const stats = [
    { label: '전체 계정', value: total, unit: '개', icon: Users, hint: '그룹사 5곳 합계' },
    {
      label: '만료 임박',
      value: expiring.length,
      unit: '건',
      icon: AlertTriangle,
      hint: '30일 이내 만료',
    },
    {
      label: '신청 대기',
      value: pending.length,
      unit: '건',
      icon: ClipboardList,
      hint: '대기 + 처리중',
    },
    { label: '잠김 계정', value: locked.length, unit: '개', icon: Lock, hint: '비밀번호 5회 오류' },
  ]

  return (
    <>
      <PageHeader
        title="대시보드"
        description="VPN 계정 현황과 처리가 필요한 항목을 한눈에 확인합니다."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{s.label}</CardDescription>
                <s.icon className="text-muted-foreground size-4" />
              </div>
              <CardTitle className="text-2xl tabular-nums">
                {s.value.toLocaleString()}
                <span className="text-muted-foreground ml-1 text-sm font-normal">{s.unit}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 이번 달 변경 건수 요약. 상세 추이는 사용자 변경관리 현황에서 본다. */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">이번 달 변경관리</CardTitle>
          <CardDescription>
            {reportLatest.year}년 {reportLatest.month}월 · 신청 시스템 {changeSummary.length}곳 합계
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" render={<Link to="/changes" />}>
              변경관리 현황 <ArrowRight className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 xl:grid-cols-8">
            {changeTotals.map((c) => (
              <div key={c.label} className="min-w-0">
                <dt className="text-muted-foreground truncate text-xs">{c.label}</dt>
                <dd className="text-lg font-semibold tabular-nums">{c.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">만료 임박 계정</CardTitle>
            <CardDescription>사용자 구분별 기한 정책에 따라 산출됩니다.</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link to="/accounts" />}>
                전체 보기 <ArrowRight className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>계정</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>그룹사</TableHead>
                    <TableHead>구분</TableHead>
                    <TableHead>만료일</TableHead>
                    <TableHead className="text-right">남은 일수</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiring.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.account}</TableCell>
                      <TableCell>{maskName(a.name)}</TableCell>
                      <TableCell className="text-muted-foreground">{a.company}</TableCell>
                      <TableCell>
                        <UserTypeBadge userType={a.userType} />
                      </TableCell>
                      <TableCell className="tabular-nums">{a.expiresAt}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <Badge
                          variant="outline"
                          className="border-amber-500/20 bg-amber-500/10 font-normal text-amber-700 dark:text-amber-300"
                        >
                          D-{daysUntil(a.expiresAt)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">그룹사별 계정</CardTitle>
            <CardDescription>전체 {total.toLocaleString()}개</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companySummary.map((c) => (
              <div key={c.company} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{c.company}</span>
                  <span className="text-muted-foreground tabular-nums">{c.total}</span>
                </div>
                <Progress value={(c.total / total) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">처리 대기 신청</CardTitle>
            <CardDescription>연계 시스템에서 넘어온 신청 건</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link to="/requests" />}>
                전체 보기 <ArrowRight className="size-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {kindCounts(r.items).map((k) => (
                      <Badge key={k.kind} variant="secondary" className="font-normal">
                        {k.kind} {k.count}
                      </Badge>
                    ))}
                    <span className="truncate text-sm">
                      {r.company} · {r.items.length}명
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {r.sourceSystem} · {r.sourceNo} · {r.requestedAt}
                  </p>
                </div>
                <RequestStatusBadge status={r.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">사용자 구분별 기한 정책</CardTitle>
            <CardDescription>요구사항 §7 기준</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>구분</TableHead>
                  <TableHead>계정 최대 기한</TableHead>
                  <TableHead>미접속 삭제 기준</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retentionPolicy.map((p) => (
                  <TableRow key={p.userType}>
                    <TableCell>
                      <UserTypeBadge userType={p.userType} />
                    </TableCell>
                    <TableCell className="tabular-nums">{p.maxTerm}</TableCell>
                    <TableCell className="text-muted-foreground">{p.idleDelete}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">잠김 계정</CardTitle>
          <CardDescription>타 관리자가 잠김을 해제할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {locked.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <StatusBadge status={a.status} />
                <span className="font-mono text-xs">{a.account}</span>
                <span className="truncate text-sm">{maskName(a.name)}</span>
              </div>
              <Button variant="outline" size="sm">
                잠김 해제
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
