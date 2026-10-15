import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'

import { PageHeader } from '@/components/layout/page-header'
import { MonthPicker } from '@/components/month-picker'
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { changeLabels, changeSummary, monthlyReport, reportLatest } from '@/data/mock'
import type { ChangeSummary } from '@/data/mock'
import { monthsOf } from '@/lib/report'

// 사용자 변경관리 현황 (요구사항 §12.2).
// 신청 시스템별 변경 건수를 연간 추이(차트)와 선택 월 상세(표)로 본다.
// 시스템 색은 index.css의 --chart-1..4 (dataviz validate_palette.js 검증 통과), 시스템 순서로 고정한다.

const systems = changeSummary.map((row) => row.system)
const chartConfig = Object.fromEntries(
  systems.map((system, i) => [`s${i}`, { label: system, color: `var(--chart-${i + 1})` }]),
) satisfies ChartConfig

const sumOf = (row: ChangeSummary) => changeLabels.reduce((acc, c) => acc + row[c.key], 0)

export function ChangeStatusPage() {
  const [year, setYear] = useState(reportLatest.year)
  const [month, setMonth] = useState(reportLatest.month)

  // 1 ~ 12월. 아직 마감되지 않은 달은 0이 아니라 빈 값으로 두어 선이 끊기게 한다.
  const trend = useMemo(() => {
    const available = monthsOf(year)
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const rows = available.includes(m) ? monthlyReport(year, m).changeSummary : null
      return {
        month: `${m}월`,
        ...Object.fromEntries(systems.map((_, s) => [`s${s}`, rows ? sumOf(rows[s]) : null])),
      }
    })
  }, [year])

  const rows = useMemo(() => monthlyReport(year, month).changeSummary, [year, month])
  const kindRows = [
    { label: '합계', value: (row: ChangeSummary) => sumOf(row) },
    ...changeLabels.map((c) => ({
      label: c.label === '신규' ? '신규요청' : c.label,
      value: (row: ChangeSummary) => row[c.key],
    })),
  ]

  return (
    <>
      <PageHeader
        title="사용자 변경관리 현황"
        requirement="§12.2"
        description={`${year}년 ${month}월 · 신청 시스템별 사용자 계정 변경 건수와 연간 추이`}
        actions={
          <>
            <MonthPicker
              year={year}
              month={month}
              onChange={(y, m) => {
                setYear(y)
                setMonth(m)
              }}
            />
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              엑셀 다운로드
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">월간 사용자 계정 변경관리 현황 및 작업이력</CardTitle>
            <CardDescription>
              {year}년 월별 변경 건수 합계입니다. 점선은 선택한 {month}월입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart accessibilityLayer data={trend} margin={{ left: 4, right: 16, top: 8 }}>
                <CartesianGrid vertical={false} strokeOpacity={0.4} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ReferenceLine x={`${month}월`} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {systems.map((_, i) => (
                  <Line
                    key={i}
                    dataKey={`s${i}`}
                    stroke={`var(--color-s${i})`}
                    strokeWidth={2}
                    dot={{ r: 4, fill: `var(--color-s${i})`, strokeWidth: 2, stroke: 'var(--card)' }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{month}월 구분별 변경 건수</CardTitle>
            <CardDescription>값이 없는 칸은 - 로 표시합니다.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>구분</TableHead>
                    <TableHead className="text-right">합계</TableHead>
                    {systems.map((system, i) => (
                      <TableHead key={system} className="text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className="size-2 rounded-[2px]"
                            style={{ background: `var(--chart-${i + 1})` }}
                          />
                          {system}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kindRows.map((k, index) => {
                    const total = rows.reduce((acc, row) => acc + k.value(row), 0)
                    return (
                      <TableRow key={k.label} className={index === 0 ? 'bg-muted/40 font-medium' : undefined}>
                        <TableCell className={index === 0 ? undefined : 'font-medium'}>{k.label}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{total}</TableCell>
                        {rows.map((row) => (
                          <TableCell key={row.system} className="text-right tabular-nums">
                            {k.value(row) === 0 ? <span className="text-muted-foreground">-</span> : k.value(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
