import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { acls, companies } from '@/data/mock'

// P0-9 그룹사 관리 (요구사항 §4).
export function CompaniesPage() {
  return (
    <>
      <PageHeader
        title="그룹사 관리"
        requirement="§4"
        description="사용 그룹사를 관리하고, 그룹사별 사용자 · 정책을 분리합니다."
        actions={
          <Dialog>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="size-4" />
              그룹사 등록
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>그룹사 등록</DialogTitle>
                <DialogDescription>
                  등록한 그룹사 단위로 사용자와 정책, IP 대역이 분리 관리됩니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">그룹사명</Label>
                  <Input id="company-name" placeholder="예: 한성테크" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-code">코드</Label>
                  <Input id="company-code" placeholder="예: HST" className="font-mono" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">취소</Button>
                <Button>등록</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">그룹사 목록</CardTitle>
            <CardDescription>{companies.length}곳 등록</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>그룹사</TableHead>
                    <TableHead>코드</TableHead>
                    <TableHead className="text-right">사용자</TableHead>
                    <TableHead className="text-right">IP 대역</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs">{c.code}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c.userCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{c.ipRangeCount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            c.active
                              ? 'border-emerald-500/20 bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground border-transparent font-normal'
                          }
                        >
                          {c.active ? '사용' : '미사용'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          수정
                        </Button>
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
            <CardTitle className="text-base">그룹 ACL</CardTitle>
            <CardDescription>
              미리 정의한 ACL입니다. 이름이 신청 시스템과 연계됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {acls
              .filter((a) => a.shared)
              .map((acl) => (
                <div key={acl.id} className="rounded-md border p-3">
                  <div className="font-mono text-xs font-medium">{acl.name}</div>
                  <p className="text-muted-foreground mt-1 text-xs">{acl.description}</p>
                  <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                    항목 {acl.entries.length}개
                  </p>
                </div>
              ))}
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="size-4" />
              그룹 ACL 추가
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
