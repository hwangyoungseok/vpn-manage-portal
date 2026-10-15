import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Search } from 'lucide-react'

import { Choice, Field } from '@/components/form-fields'
import { GroupIpDialog } from '@/components/group-ip-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { companies, groupIps as seedGroupIps, userTypes } from '@/data/mock'
import type { GroupIp } from '@/data/mock'
import { ipToNumber } from '@/lib/ip'

const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/

type Filters = { company: string; userType: string; auto: string; name: string; ip: string }
const emptyFilters: Filters = { company: 'all', userType: 'all', auto: 'all', name: '', ip: '' }

// P0-10 그룹 IP 관리 (요구사항 §5, §6).
// 회사 · 사용자 구분별 VPN IP 대역과 수동(고정) IP 대역을 관리한다.
// 신규는 버튼으로, 수정 · 삭제는 행을 눌러 같은 팝업에서 처리한다.
export function IpRangesPage() {
  const [items, setItems] = useState<GroupIp[]>(seedGroupIps)
  const [draft, setDraft] = useState<Filters>(emptyFilters)
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [dialog, setDialog] = useState<{ target: GroupIp | null } | null>(null)
  const [notice, setNotice] = useState<string>()

  const rows = items.filter((g) => {
    const ip = filters.ip.trim()
    const hitIp =
      ip === '' ||
      (ipv4.test(ip)
        ? ipToNumber(g.rangeStart) <= ipToNumber(ip) && ipToNumber(ip) <= ipToNumber(g.rangeEnd)
        : [g.rangeStart, g.rangeEnd, g.manualStart, g.manualEnd].some((v) => v.includes(ip)))
    return (
      hitIp &&
      (filters.company === 'all' || g.company === filters.company) &&
      (filters.userType === 'all' || g.userType === filters.userType) &&
      (filters.auto === 'all' || (g.autoAssign ? 'Y' : 'N') === filters.auto) &&
      g.name.toLowerCase().includes(filters.name.trim().toLowerCase())
    )
  })

  function search(e: FormEvent) {
    e.preventDefault()
    setFilters(draft)
  }

  function open(target: GroupIp | null) {
    setDialog({ target })
    setNotice(undefined)
  }

  return (
    <>
      <PageHeader
        title="그룹 IP 관리"
        requirement="§5 §6"
        description="회사 · 사용자 구분별 VPN IP 대역과 수동 할당(고정 IP) 대역을 관리합니다."
      />

      <div className="space-y-4">
        {/* 조회 조건 */}
        <Card size="sm" className="bg-muted/40">
          <CardContent>
            <form onSubmit={search} className="flex flex-wrap items-end gap-x-4 gap-y-3">
              <Field label="회사">
                <Choice
                  label="회사"
                  value={draft.company}
                  onChange={(v) => setDraft({ ...draft, company: v })}
                  options={companies.map((c) => c.name)}
                  empty={['all', '전체']}
                  className="w-[160px]"
                />
              </Field>
              <Field label="사용자구분">
                <Choice
                  label="사용자구분"
                  value={draft.userType}
                  onChange={(v) => setDraft({ ...draft, userType: v })}
                  options={userTypes}
                  empty={['all', '전체']}
                  className="w-[130px]"
                />
              </Field>
              <Field label="할당여부">
                <Choice
                  label="할당여부"
                  value={draft.auto}
                  onChange={(v) => setDraft({ ...draft, auto: v })}
                  options={['Y', 'N']}
                  format={(v) => (v === 'Y' ? '자동 (Y)' : '수동 (N)')}
                  empty={['all', '전체']}
                  className="w-[120px]"
                />
              </Field>
              <Field label="이름">
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-[160px]"
                  aria-label="이름 검색"
                />
              </Field>
              <Field label="IP대역">
                <Input
                  value={draft.ip}
                  onChange={(e) => setDraft({ ...draft, ip: e.target.value })}
                  placeholder="IP를 넣으면 포함 대역 조회"
                  className="w-[200px] font-mono text-xs"
                  aria-label="IP대역 검색"
                />
              </Field>
              <Button type="submit" variant="outline" className="ml-auto">
                <Search className="size-4" />
                조회
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {notice ? (
            <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
              {notice}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              {rows.length}건 표시 / 전체 {items.length}건 · 행을 누르면 수정 · 삭제할 수 있습니다.
            </p>
          )}
          <Button size="sm" onClick={() => open(null)}>
            <Plus className="size-4" />
            신규
          </Button>
        </div>

        <Card>
          <CardHeader className="sr-only">
            <CardTitle>그룹 IP 목록</CardTitle>
            <CardDescription>회사 · 사용자 구분별 IP 대역</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table className="text-center">
                <TableHeader>
                  <TableRow>
                    {['이름', '자동할당', 'IP대역', '수동IP', '회사', '사용자 구분'].map((h) => (
                      <TableHead key={h} className="text-center">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="text-muted-foreground h-20">
                        조회된 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((g) => (
                      <TableRow
                        key={g.id}
                        data-state={dialog?.target?.id === g.id ? 'selected' : undefined}
                        className="cursor-pointer"
                        onClick={() => open(g)}
                      >
                        <TableCell className="font-mono text-xs">
                          <button
                            type="button"
                            className="hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              open(g)
                            }}
                          >
                            {g.name}
                          </button>
                        </TableCell>
                        <TableCell>{g.autoAssign ? 'Y' : 'N'}</TableCell>
                        <TableCell className="font-mono text-xs tabular-nums">
                          {g.rangeStart} ~ {g.rangeEnd}
                        </TableCell>
                        <TableCell className="font-mono text-xs tabular-nums">
                          {g.manualStart} ~ {g.manualEnd}
                        </TableCell>
                        <TableCell>{g.company}</TableCell>
                        <TableCell>{g.userType}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <GroupIpDialog
        open={dialog !== null}
        target={dialog?.target ?? null}
        items={items}
        onOpenChange={(next) => !next && setDialog(null)}
        onSave={(item, isNew) => {
          setItems((prev) => (isNew ? [...prev, item] : prev.map((g) => (g.id === item.id ? item : g))))
          setDialog(null)
          setNotice(isNew ? `${item.name}을(를) 등록했습니다.` : `${item.name}을(를) 저장했습니다.`)
        }}
        onDelete={(item) => {
          setItems((prev) => prev.filter((g) => g.id !== item.id))
          setDialog(null)
          setNotice(`${item.name}을(를) 삭제했습니다.`)
        }}
      />
    </>
  )
}
