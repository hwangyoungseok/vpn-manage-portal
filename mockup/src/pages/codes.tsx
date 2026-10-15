import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { CodeDialog } from '@/components/code-dialog'
import { Choice, Field } from '@/components/form-fields'
import { PageHeader } from '@/components/layout/page-header'
import { TablePagination } from '@/components/table-pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { codes as seedCodes } from '@/data/mock'
import type { CodeItem } from '@/data/mock'

const GROUP = 'GROUP'
const head = ['순서', '코드', '코드명', '코드설명', 'VPN 그룹 ID', '정책코드(통제포트, 생산망제한)', 'Partition', '사용유무']

// 코드관리. 그룹 코드 목록과, 그룹을 고르면 그 그룹의 세부 코드 목록을 관리한다.
export function CodesPage() {
  const [items, setItems] = useState<CodeItem[]>(seedCodes)
  const [group, setGroup] = useState(GROUP)
  const [keyword, setKeyword] = useState('')
  const [applied, setApplied] = useState('')
  const [checked, setChecked] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [dialog, setDialog] = useState<{ target: CodeItem | null } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notice, setNotice] = useState<{ text: string; error?: boolean }>()

  const groups = items.filter((c) => c.groupCode === null).sort((a, b) => a.order - b.order)
  const groupCode = group === GROUP ? null : group
  const current = groups.find((g) => g.code === groupCode)
  const groupLabel = current ? `${current.code} ${current.name}` : '그룹 코드'
  const siblings = items.filter((c) => c.groupCode === groupCode)
  const rows = siblings
    .filter((c) => {
      const k = applied.trim().toLowerCase()
      return k === '' || c.code.toLowerCase().includes(k) || c.name.toLowerCase().includes(k)
    })
    .sort((a, b) => a.order - b.order)

  const pages = Math.max(1, Math.ceil(rows.length / size))
  const currentPage = Math.min(page, pages)
  const visible = rows.slice((currentPage - 1) * size, currentPage * size)
  const allChecked = visible.length > 0 && visible.every((c) => checked.includes(c.id))

  function changeGroup(next: string) {
    setGroup(next)
    setKeyword('')
    setApplied('')
    setChecked([])
    setPage(1)
    setConfirmDelete(false)
    setNotice(undefined)
  }

  function search(e: FormEvent) {
    e.preventDefault()
    setApplied(keyword)
    setPage(1)
  }

  function edit() {
    if (checked.length !== 1) return setNotice({ text: '수정할 코드를 하나만 선택하세요.', error: true })
    setDialog({ target: items.find((c) => c.id === checked[0]) ?? null })
  }

  function remove() {
    const targets = items.filter((c) => checked.includes(c.id))
    if (targets.length === 0) return setNotice({ text: '삭제할 코드를 선택하세요.', error: true })
    const used = targets.filter((t) => t.groupCode === null && items.some((c) => c.groupCode === t.code))
    if (used.length > 0)
      return setNotice({
        text: `세부 코드가 있는 그룹은 삭제할 수 없습니다: ${used.map((u) => u.code).join(', ')}`,
        error: true,
      })
    if (!confirmDelete) {
      setConfirmDelete(true)
      return setNotice({ text: `‘삭제 확인’을 누르면 ${targets.length}건이 삭제됩니다.`, error: true })
    }
    setItems((prev) => prev.filter((c) => !checked.includes(c.id)))
    setChecked([])
    setConfirmDelete(false)
    setNotice({ text: `${targets.length}건을 삭제했습니다.` })
  }

  function toggle(id: string, on: boolean) {
    setChecked((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)))
    setConfirmDelete(false)
  }

  return (
    <>
      <PageHeader title="코드관리" description="화면과 연동에서 쓰는 공통 코드를 그룹 단위로 관리합니다." />

      <div className="space-y-4">
        <Card size="sm" className="bg-muted/40">
          <CardContent>
            <form onSubmit={search} className="flex flex-wrap items-end gap-x-4 gap-y-3">
              <Field label="그룹코드">
                <Choice
                  label="그룹코드"
                  value={group}
                  onChange={changeGroup}
                  options={groups.map((g) => g.code)}
                  format={(v) => `${v} ${groups.find((g) => g.code === v)?.name ?? ''}`}
                  empty={[GROUP, '그룹 코드']}
                  className="w-[300px]"
                />
              </Field>
              <Field label="세부코드">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="코드 · 코드명"
                  className="w-[200px]"
                  aria-label="세부코드 검색"
                />
              </Field>
              <Button type="submit" variant="outline">
                <Search className="size-4" />
                조회
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {notice ? (
            <p
              role={notice.error ? 'alert' : 'status'}
              className={notice.error ? 'text-destructive text-sm' : 'text-sm text-emerald-700 dark:text-emerald-400'}
            >
              {notice.text}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              {groupLabel} · {rows.length}건
              {groupCode === null ? ' · 코드명을 누르면 세부 코드로 이동합니다.' : ''}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setNotice(undefined)
                setDialog({ target: null })
              }}
            >
              <Plus className="size-4" />
              등록
            </Button>
            <Button size="sm" variant="outline" onClick={edit}>
              <Pencil className="size-4" />
              수정
            </Button>
            <Button size="sm" variant="destructive" onClick={remove}>
              <Trash2 className="size-4" />
              {confirmDelete ? '삭제 확인' : '삭제'}
            </Button>
          </div>
        </div>

        <Card className="pb-2">
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 pl-4">
                      <Checkbox
                        checked={allChecked}
                        onCheckedChange={(v) =>
                          setChecked((prev) =>
                            v
                              ? [...new Set([...prev, ...visible.map((c) => c.id)])]
                              : prev.filter((id) => !visible.some((c) => c.id === id)),
                          )
                        }
                        aria-label="전체 선택"
                      />
                    </TableHead>
                    {head.map((h) => (
                      <TableHead key={h} className="text-center">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={head.length + 1} className="text-muted-foreground h-20 text-center">
                        조회된 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visible.map((c) => {
                      const detailCount = items.filter((x) => x.groupCode === c.code).length
                      return (
                        <TableRow key={c.id} data-state={checked.includes(c.id) ? 'selected' : undefined}>
                          <TableCell className="pl-4">
                            <Checkbox
                              checked={checked.includes(c.id)}
                              onCheckedChange={(v) => toggle(c.id, v === true)}
                              aria-label={`${c.code} 선택`}
                            />
                          </TableCell>
                          <TableCell className="text-center tabular-nums">{c.order}</TableCell>
                          <TableCell className="text-center font-mono text-xs">{c.code}</TableCell>
                          <TableCell className="text-center">
                            {groupCode === null ? (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 hover:underline"
                                onClick={() => changeGroup(c.code)}
                              >
                                {c.name}
                                <span className="text-muted-foreground text-xs">({detailCount})</span>
                                <ChevronRight className="text-muted-foreground size-3.5" />
                              </button>
                            ) : (
                              c.name
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground min-w-[280px] text-xs whitespace-pre-line">
                            {c.description}
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">{c.vpnGroupId}</TableCell>
                          <TableCell className="text-center font-mono text-xs">{c.policyCode}</TableCell>
                          <TableCell className="text-center font-mono text-xs">{c.partition}</TableCell>
                          <TableCell
                            className={c.active ? 'text-center' : 'text-muted-foreground text-center'}
                          >
                            {c.active ? 'Y' : 'N'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              page={currentPage}
              pages={pages}
              size={size}
              total={rows.length}
              onPage={setPage}
              onSize={(next) => {
                setSize(next)
                setPage(1)
              }}
            />
          </CardContent>
        </Card>
      </div>

      <CodeDialog
        open={dialog !== null}
        groupCode={dialog?.target?.groupCode ?? groupCode}
        groupLabel={groupLabel}
        target={dialog?.target ?? null}
        siblings={siblings}
        onOpenChange={(next) => !next && setDialog(null)}
        onSave={(item, isNew) => {
          setItems((prev) => (isNew ? [...prev, item] : prev.map((c) => (c.id === item.id ? item : c))))
          setDialog(null)
          setChecked([])
          setNotice({ text: isNew ? `${item.code} 코드를 등록했습니다.` : `${item.code} 코드를 수정했습니다.` })
        }}
      />
    </>
  )
}
