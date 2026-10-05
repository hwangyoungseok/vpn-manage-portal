import { Download } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { changeLabels, changeSummary, companySummary, monthlyTrend } from '@/data/mock'
import { formatDiff } from '@/lib/format'

// P0-14 월간 리포팅 (요구사항 §12).
// 범주 색은 index.css의 --chart-1..4 (dataviz validate_palette.js 검증 통과).
// 척도가 다른 지표는 축을 공유하지 않고 차트를 분리한다.

const compositionConfig = {
  employee: { label: '정직원', color: 'var(--chart-1)' },
  partner: { label: '협력사', color: 'var(--chart-2)' },
  vip: { label: 'VIP', color: 'var(--chart-3)' },
} satisfies ChartConfig

const flowConfig = {
  created: { label: '신규 등록', color: 'var(--chart-1)' },
  deleted: { label: '삭제', color: 'var(--chart-2)' },
} satisfies ChartConfig

const totalConfig = {
  total: { label: '전체 계정', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function ReportsPage() {
  const totals = companySummary.reduce(
    (acc, c) => ({
      total: acc.total + c.total,
      created: acc.created + c.created,
      deletedRequest: acc.deletedRequest + c.deletedRequest,
      deletedExpired: acc.deletedExpired + c.deletedExpired,
      deletedIdle: acc.deletedIdle + c.deletedIdle,
      prevDiff: acc.prevDiff + c.prevDiff,
    }),
    { total: 0, created: 0, deletedRequest: 0, deletedExpired: 0, deletedIdle: 0, prevDiff: 0 },
  )
  const deletedTotal = totals.deletedRequest + totals.deletedExpired + totals.deletedIdle

  return (
    <>
      <PageHeader
        title="월간 리포팅"
        requirement="§12"
        description="2026년 10월 기준 · 회사별 사용자 현황과 변경 관리 현황"
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            엑셀 다운로드
          </Button>
        }
      />

      {/* 헤드라인 — 차트보다 수치 하나가 빠른 지표는 stat tile로 */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: '전체 사용자', value: totals.total, sub: `전월 대비 ${formatDiff(totals.prevDiff)}` },
          { label: '신규 등록', value: totals.created, sub: '이번 달 누적' },
          { label: '삭제', value: deletedTotal, sub: '사유 3종 합계' },
          { label: '순증감', value: totals.created - deletedTotal, sub: '신규 − 삭제' },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {s.value > 0 && s.label === '순증감' ? '+' : ''}
                {s.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">회사별 사용자 현황</TabsTrigger>
          <TabsTrigger value="changes">월간 변경 관리 현황</TabsTrigger>
        </TabsList>

        {/* §12.1 회사별 사용자 현황 */}
        <TabsContent value="users" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">회사별 사용자 구성</CardTitle>
              <CardDescription>
                그룹사별 전체 사용자를 구분(정직원 · 협력사 · VIP)으로 나눠 표시합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={compositionConfig} className="h-[320px] w-full">
                <BarChart
                  accessibilityLayer
                  data={companySummary}
                  layout="vertical"
                  margin={{ left: 8, right: 48 }}
                >
                  <CartesianGrid horizontal={false} strokeOpacity={0.4} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  {/* 합계는 축 라벨에 붙인다. 마지막 스택 세그먼트에 LabelList를 달면
                      해당 구분이 0인 회사에서 라벨이 사라진다. */}
                  <YAxis
                    type="category"
                    dataKey="company"
                    width={160}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: string) =>
                      `${value}  ${companySummary.find((c) => c.company === value)?.total ?? ''}`
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {/* 2px 표면 간격으로 인접 채움을 분리 */}
                  <Bar
                    dataKey="employee"
                    stackId="a"
                    fill="var(--color-employee)"
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                  <Bar
                    dataKey="partner"
                    stackId="a"
                    fill="var(--color-partner)"
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                  <Bar
                    dataKey="vip"
                    stackId="a"
                    fill="var(--color-vip)"
                    stroke="var(--card)"
                    strokeWidth={2}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">회사별 상세</CardTitle>
              <CardDescription>
                삭제 건수는 요청 · 기간만료 · 장기미사용 사유로 구분합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>회사</TableHead>
                      <TableHead className="text-right">전체</TableHead>
                      <TableHead className="text-right">VIP</TableHead>
                      <TableHead className="text-right">정직원</TableHead>
                      <TableHead className="text-right">협력사</TableHead>
                      <TableHead className="text-right">전월 증감</TableHead>
                      <TableHead className="text-right">신규</TableHead>
                      <TableHead className="text-right">요청 삭제</TableHead>
                      <TableHead className="text-right">기간 만료</TableHead>
                      <TableHead className="text-right">장기 미사용</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companySummary.map((c) => (
                      <TableRow key={c.company}>
                        <TableCell className="font-medium">{c.company}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.total}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.vip}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.employee}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.partner}</TableCell>
                        <TableCell
                          className={
                            c.prevDiff > 0
                              ? 'text-right tabular-nums text-emerald-700 dark:text-emerald-400'
                              : c.prevDiff < 0
                                ? 'text-right tabular-nums text-rose-700 dark:text-rose-400'
                                : 'text-muted-foreground text-right tabular-nums'
                          }
                        >
                          {formatDiff(c.prevDiff)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{c.created}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {c.deletedRequest}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {c.deletedExpired}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{c.deletedIdle}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>합계</TableCell>
                      <TableCell className="text-right tabular-nums">{totals.total}</TableCell>
                      <TableCell colSpan={3} />
                      <TableCell className="text-right tabular-nums">
                        {formatDiff(totals.prevDiff)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{totals.created}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {totals.deletedRequest}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {totals.deletedExpired}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {totals.deletedIdle}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">전체 계정 추이</CardTitle>
                <CardDescription>최근 6개월</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={totalConfig} className="h-[220px] w-full">
                  <LineChart accessibilityLayer data={monthlyTrend} margin={{ left: 4, right: 20 }}>
                    <CartesianGrid vertical={false} strokeOpacity={0.4} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis domain={['dataMin - 20', 'dataMax + 20']} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                      activeDot={{ r: 5 }}
                    >
                      {/* 모든 점에 숫자를 달면 축 눈금과 겹치고 읽기도 어렵다.
                          마지막 값 하나만 직접 라벨링한다. */}
                      <LabelList
                        dataKey="total"
                        content={(props) => {
                          const { x, y, value, index } = props as {
                            x: number
                            y: number
                            value: number
                            index: number
                          }
                          if (index !== monthlyTrend.length - 1) return null
                          return (
                            <text
                              x={x}
                              y={y - 12}
                              textAnchor="end"
                              fontSize={12}
                              fontWeight={500}
                              className="fill-foreground"
                            >
                              {value}
                            </text>
                          )
                        }}
                      />
                    </Line>
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">월간 신규 · 삭제</CardTitle>
                <CardDescription>
                  전체 계정 수와 척도가 달라 축을 공유하지 않고 분리했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={flowConfig} className="h-[220px] w-full">
                  <BarChart accessibilityLayer data={monthlyTrend} margin={{ left: 4 }}>
                    <CartesianGrid vertical={false} strokeOpacity={0.4} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="created" fill="var(--color-created)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="deleted" fill="var(--color-deleted)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* §12.2 월간 변경 관리 현황 */}
        <TabsContent value="changes" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">신청 시스템별 변경 건수</CardTitle>
              <CardDescription>
                변경 유형이 7종이라 차트보다 표가 읽기 쉽습니다. 회사별 집계는 위 탭에서
                확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>신청 시스템</TableHead>
                      {changeLabels.map((c) => (
                        <TableHead key={c.key} className="text-right">
                          {c.label}
                        </TableHead>
                      ))}
                      <TableHead className="text-right">합계</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changeSummary.map((row) => {
                      const sum = changeLabels.reduce((acc, c) => acc + row[c.key], 0)
                      return (
                        <TableRow key={row.system}>
                          <TableCell className="font-medium">{row.system}</TableCell>
                          {changeLabels.map((c) => (
                            <TableCell key={c.key} className="text-right tabular-nums">
                              {row[c.key] === 0 ? (
                                <span className="text-muted-foreground">-</span>
                              ) : (
                                row[c.key]
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-medium tabular-nums">
                            {sum}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>합계</TableCell>
                      {changeLabels.map((c) => (
                        <TableCell key={c.key} className="text-right tabular-nums">
                          {changeSummary.reduce((acc, row) => acc + row[c.key], 0)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right tabular-nums">
                        {changeSummary.reduce(
                          (acc, row) => acc + changeLabels.reduce((s, c) => s + row[c.key], 0),
                          0,
                        )}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
