import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { IpRange, StaticIp } from '@/data/mock'
import { accounts } from '@/data/mock'
import { maskName } from '@/lib/format'

// 대역 내 미사용 주소를 하나 고른다. 목업이므로 할당 수 기준으로 단순 계산한다.
function nextIp(cidr: string, used: string[]): string {
  const [base] = cidr.split('/')
  const octets = base.split('.').map(Number)
  for (let i = 1; i < 254; i += 1) {
    const candidate = [octets[0], octets[1], octets[2], i].join('.')
    if (!used.includes(candidate)) return candidate
  }
  return base
}

const emptyForm = { cidr: '', account: '', ip: '' }

export function StaticIpDialog({
  ranges,
  assigned,
  onAssign,
}: {
  ranges: IpRange[]
  assigned: StaticIp[]
  onAssign: (ip: StaticIp, rangeId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const range = ranges.find((r) => r.cidr === form.cidr)
  const account = accounts.find((a) => a.account === form.account)
  // 선택한 대역의 그룹사 소속 계정만 보여준다.
  const selectable = range ? accounts.filter((a) => a.company === range.company) : []
  const canSubmit = form.cidr !== '' && form.account !== ''

  function submit() {
    if (!canSubmit || !range || !account) return
    const ip =
      form.ip.trim() !== ''
        ? form.ip.trim()
        : nextIp(
            range.cidr,
            assigned.map((s) => s.ip),
          )
    onAssign(
      {
        id: `S${Date.now()}`,
        ip,
        company: range.company,
        account: account.account,
        name: account.name,
        assignedAt: '2026-10-06',
      },
      range.id,
    )
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setForm(emptyForm)
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        고정 IP 할당
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>고정 IP 할당</DialogTitle>
          <DialogDescription>
            선택한 그룹사 대역 안에서 사용 가능한 IP를 계정에 할당합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="static-range">대역</Label>
            <Select
              value={form.cidr}
              onValueChange={(v) => setForm({ cidr: v ?? '', account: '', ip: '' })}
            >
              <SelectTrigger id="static-range" className="w-full">
                <SelectValue placeholder="대역 선택" />
              </SelectTrigger>
              <SelectContent>
                {ranges.map((r) => (
                  <SelectItem key={r.id} value={r.cidr}>
                    {r.company} — {r.cidr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {range ? (
              <p className="text-muted-foreground text-xs tabular-nums">
                {range.purpose} · 할당 {range.assigned.toLocaleString()} /{' '}
                {range.total.toLocaleString()}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="static-account">계정</Label>
            <Select
              value={form.account}
              onValueChange={(v) => setForm((p) => ({ ...p, account: v ?? '' }))}
              disabled={!range}
            >
              <SelectTrigger id="static-account" className="w-full">
                <SelectValue placeholder={range ? '계정 선택' : '대역을 먼저 선택하세요'} />
              </SelectTrigger>
              <SelectContent>
                {selectable.map((a) => (
                  <SelectItem key={a.id} value={a.account}>
                    {a.account} — {maskName(a.name)} ({a.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {range && selectable.length === 0 ? (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                해당 그룹사에 등록된 계정이 없습니다.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="static-ip">IP</Label>
            <Input
              id="static-ip"
              value={form.ip}
              onChange={(e) => setForm((p) => ({ ...p, ip: e.target.value }))}
              placeholder="자동 할당 또는 직접 입력"
              className="font-mono"
            />
            <p className="text-muted-foreground text-xs">
              비워두면 대역 내 미사용 IP가 자동 할당됩니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button disabled={!canSubmit} onClick={submit}>
            할당
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
