import { useState } from 'react'

import { IpRangeDialog } from '@/components/ip-range-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { StaticIpDialog } from '@/components/static-ip-dialog'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { IpRange, StaticIp } from '@/data/mock'
import { ipRanges as seedRanges, staticIps as seedStaticIps } from '@/data/mock'
import { maskName } from '@/lib/format'

// P0-10 IP 대역 관리 + 고정 IP 할당 (요구사항 §5, §6).
export function IpRangesPage() {
  const [ranges, setRanges] = useState<IpRange[]>(seedRanges)
  const [statics, setStatics] = useState<StaticIp[]>(seedStaticIps)

  function assign(ip: StaticIp, rangeId: string) {
    setStatics((prev) => [...prev, ip])
    // 할당한 대역의 사용 수만 올린다 (같은 그룹사의 다른 대역은 건드리지 않는다).
    setRanges((prev) =>
      prev.map((r) => (r.id === rangeId ? { ...r, assigned: r.assigned + 1 } : r)),
    )
  }

  return (
    <>
      <PageHeader
        title="IP 대역 · 고정 IP"
        requirement="§5 §6"
        description="그룹사별 IP 대역을 관리하고, 대역 내에서 고정 IP를 할당합니다."
      />

      <Tabs defaultValue="ranges">
        <TabsList>
          <TabsTrigger value="ranges">IP 대역</TabsTrigger>
          <TabsTrigger value="static">고정 IP 할당</TabsTrigger>
        </TabsList>

        <TabsContent value="ranges" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">그룹사별 IP 대역</CardTitle>
              <CardDescription>{ranges.length}개 대역</CardDescription>
              <CardAction>
                <IpRangeDialog onCreate={(r) => setRanges((prev) => [...prev, r])} />
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>그룹사</TableHead>
                      <TableHead>대역 (CIDR)</TableHead>
                      <TableHead>용도</TableHead>
                      <TableHead className="w-[160px]">사용률</TableHead>
                      <TableHead className="text-right">할당 / 전체</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranges.map((r) => {
                      const pct = (r.assigned / r.total) * 100
                      return (
                        <TableRow key={r.id}>
                          <TableCell>{r.company}</TableCell>
                          <TableCell className="font-mono text-xs">{r.cidr}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {r.purpose}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5" />
                              <span className="text-muted-foreground w-10 shrink-0 text-right text-xs tabular-nums">
                                {pct > 0 && pct < 1 ? '<1' : Math.round(pct)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {r.assigned.toLocaleString()} / {r.total.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              수정
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="static" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">고정 IP 할당 내역</CardTitle>
              <CardDescription>{statics.length}건 할당</CardDescription>
              <CardAction>
                <StaticIpDialog ranges={ranges} assigned={statics} onAssign={assign} />
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>고정 IP</TableHead>
                      <TableHead>그룹사</TableHead>
                      <TableHead>계정</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>할당일</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statics.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs tabular-nums">{s.ip}</TableCell>
                        <TableCell className="text-muted-foreground">{s.company}</TableCell>
                        <TableCell className="font-mono text-xs">{s.account}</TableCell>
                        <TableCell>{maskName(s.name)}</TableCell>
                        <TableCell className="tabular-nums">{s.assignedAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            회수
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
