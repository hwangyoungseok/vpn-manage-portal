import { useState } from 'react'
import type { ReactElement } from 'react'
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
import { companies as seedCompanies } from '@/data/mock'
import type { Company } from '@/data/mock'

// 그룹사 등록 · 수정 팝업. 수정이면 기존 그룹사명과 코드가 채워져 열린다.
function CompanyFormDialog({
  company,
  trigger,
  onSubmit,
}: {
  company?: Company
  trigger: ReactElement
  onSubmit: (name: string, code: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(company?.name ?? '')
      setCode(company?.code ?? '')
    }
    setOpen(next)
  }

  const valid = name.trim() !== '' && code.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{company ? '그룹사 수정' : '그룹사 등록'}</DialogTitle>
          <DialogDescription>
            등록한 그룹사 단위로 사용자와 정책이 분리 관리됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">그룹사명</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 한성테크"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-code">코드</Label>
            <Input
              id="company-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: HST"
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              onSubmit(name.trim(), code.trim().toUpperCase())
              setOpen(false)
            }}
          >
            {company ? '저장' : '등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// P0-9 그룹사 관리 (요구사항 §4).
export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(seedCompanies)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string>()

  function add(name: string, code: string) {
    setCompanies((prev) => [
      ...prev,
      { id: `C${String(prev.length + 1).padStart(2, '0')}-${Date.now()}`, name, code, userCount: 0, ipRangeCount: 0, active: true },
    ])
    setNotice(`${name} 그룹사를 등록했습니다.`)
  }

  function update(id: string, name: string, code: string) {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, name, code } : c)))
    setNotice(`${name} 그룹사를 저장했습니다.`)
  }

  function remove(c: Company) {
    if (confirmId !== c.id) {
      setConfirmId(c.id)
      setNotice(`‘삭제 확인’을 누르면 ${c.name} 그룹사가 삭제됩니다.`)
      return
    }
    setCompanies((prev) => prev.filter((item) => item.id !== c.id))
    setConfirmId(null)
    setNotice(`${c.name} 그룹사를 삭제했습니다.`)
  }

  return (
    <>
      <PageHeader
        title="그룹사 관리"
        requirement="§4"
        description="사용 그룹사를 등록 · 수정 · 삭제합니다. 그룹사별 인증 정책은 그룹 정책 관리에서 다룹니다."
        actions={
          <CompanyFormDialog
            onSubmit={add}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                그룹사 등록
              </Button>
            }
          />
        }
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">그룹사 목록</CardTitle>
            <CardDescription>{notice ?? `${companies.length}곳 등록`}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>그룹사</TableHead>
                    <TableHead>코드</TableHead>
                    <TableHead className="text-right">사용자</TableHead>
                    <TableHead className="w-40 text-end">상태</TableHead>
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
                      <TableCell className="text-end">
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
                        <div className="flex justify-end gap-1">
                          <CompanyFormDialog
                            company={c}
                            onSubmit={(name, code) => update(c.id, name, code)}
                            trigger={
                              <Button variant="ghost" size="sm">
                                수정
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => remove(c)}
                          >
                            {confirmId === c.id ? '삭제 확인' : '삭제'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
