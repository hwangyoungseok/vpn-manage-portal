import { useId, useState } from 'react'
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
  const address = octets.reduce((value, octet) => value * 256 + octet, 0)
  if (address % 2 ** (32 - prefix) !== 0) return null
  return 2 ** (32 - prefix) - 2
}

const emptyForm = { company: '', cidr: '', purpose: '' }

export function IpRangeDialog({ range, ranges, onSave }: {
  range?: IpRange
  ranges: IpRange[]
  onSave: (range: IpRange) => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const id = useId()
  const inUse = (range?.assigned ?? 0) > 0

  const cidr = form.cidr.trim()
  const total = hostCount(cidr)
  const cidrTouched = form.cidr.length > 0
  const cidrOk = total !== null
  const duplicate = ranges.some((item) => item.id !== range?.id && item.cidr === cidr)
  const canSubmit = form.company !== '' && cidrOk && !duplicate && form.purpose.trim() !== ''

  function submit() {
    if (!canSubmit || total === null) return
    onSave({
      id: range?.id ?? crypto.randomUUID(),
      company: inUse ? range!.company : form.company,
      cidr: inUse ? range!.cidr : cidr,
      total: inUse ? range!.total : total,
      assigned: range?.assigned ?? 0,
      purpose: form.purpose.trim(),
    })
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setForm(range ? { company: range.company, cidr: range.cidr, purpose: range.purpose } : emptyForm)
      }}
    >
      <DialogTrigger render={<Button size="sm" variant={range ? 'ghost' : 'default'} />}>
        {!range && <Plus className="size-4" />}
        {range ? '수정' : '대역 추가'}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>IP 대역 {range ? '수정' : '추가'}</DialogTitle>
          <DialogDescription>
            {range
              ? 'IP 대역 정보를 수정하고 저장합니다.'
              : '그룹사에 새 IP 대역을 등록합니다. 등록한 대역 안에서 고정 IP를 할당할 수 있습니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-company`}>그룹사</Label>
            <Select
              value={form.company}
              disabled={inUse}
              onValueChange={(v) => setForm((p) => ({ ...p, company: v ?? '' }))}
            >
              <SelectTrigger id={`${id}-company`} className="w-full">
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
            <Label htmlFor={`${id}-cidr`}>대역 (CIDR)</Label>
            <Input
              id={`${id}-cidr`}
              disabled={inUse}
              value={form.cidr}
              onChange={(e) => setForm((p) => ({ ...p, cidr: e.target.value }))}
              placeholder="10.105.0.0/24"
              className="font-mono"
            />
            {cidrTouched && !cidrOk ? (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                네트워크 시작 주소와 프리픽스 /8 ~ /30을 입력하세요 (예: 10.105.0.0/24).
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                {cidrOk
                  ? `사용 가능 주소 ${total?.toLocaleString()}개`
                  : '예: 10.105.0.0/24'}
              </p>
            )}
            {duplicate && <p role="alert" className="text-destructive text-xs">이미 등록된 대역입니다.</p>}
            {inUse && (
              <p className="text-muted-foreground text-xs">
                IP가 {range?.assigned.toLocaleString()}개 할당되어 그룹사와 대역은 변경할 수 없습니다. 용도는 수정할 수 있습니다.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${id}-purpose`}>용도</Label>
            <Input
              id={`${id}-purpose`}
              value={form.purpose}
              onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
              placeholder="예: 신규 협력사"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button disabled={!canSubmit} onClick={submit}>
            {range ? '저장' : '등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
