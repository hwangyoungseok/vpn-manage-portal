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
import type { IpRange } from '@/data/mock'
import { companies } from '@/data/mock'

const cidrPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/

// 대역 크기는 프리픽스에서 계산한다 (네트워크 · 브로드캐스트 주소 제외).
function hostCount(cidr: string): number | null {
  const m = cidrPattern.exec(cidr)
  if (!m) return null
  const octets = m.slice(1, 5).map(Number)
  const prefix = Number(m[5])
  if (octets.some((o) => o > 255) || prefix < 8 || prefix > 30) return null
  return 2 ** (32 - prefix) - 2
}

const emptyForm = { company: '', cidr: '', purpose: '' }

export function IpRangeDialog({ onCreate }: { onCreate: (range: IpRange) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const total = hostCount(form.cidr)
  const cidrTouched = form.cidr.length > 0
  const cidrOk = total !== null
  const canSubmit = form.company !== '' && cidrOk && form.purpose.trim() !== ''

  function submit() {
    if (!canSubmit || total === null) return
    onCreate({
      id: `N${Date.now()}`,
      company: form.company,
      cidr: form.cidr.trim(),
      total,
      assigned: 0,
      purpose: form.purpose.trim(),
    })
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
        대역 추가
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>IP 대역 추가</DialogTitle>
          <DialogDescription>
            그룹사에 새 IP 대역을 등록합니다. 등록한 대역 안에서 고정 IP를 할당할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="range-company">그룹사</Label>
            <Select
              value={form.company}
              onValueChange={(v) => setForm((p) => ({ ...p, company: v ?? '' }))}
            >
              <SelectTrigger id="range-company" className="w-full">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="range-cidr">대역 (CIDR)</Label>
            <Input
              id="range-cidr"
              value={form.cidr}
              onChange={(e) => setForm((p) => ({ ...p, cidr: e.target.value }))}
              placeholder="10.105.0.0/24"
              className="font-mono"
            />
            {cidrTouched && !cidrOk ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                CIDR 표기가 올바르지 않습니다 (프리픽스 /8 ~ /30).
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                {cidrOk
                  ? `사용 가능 주소 ${total?.toLocaleString()}개`
                  : '예: 10.105.0.0/24'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="range-purpose">용도</Label>
            <Input
              id="range-purpose"
              value={form.purpose}
              onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
              placeholder="예: 신규 협력사"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button disabled={!canSubmit} onClick={submit}>
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
