import { useState } from 'react'
import { Save } from 'lucide-react'

import { Choice, Field } from '@/components/form-fields'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { CodeItem } from '@/data/mock'

type Form = Omit<CodeItem, 'id' | 'groupCode' | 'order' | 'active'> & { order: string; active: 'Y' | 'N' }

// 코드 등록 · 수정 팝업. target이 없으면 groupCode 아래에 새 코드를 등록한다.
export function CodeDialog({
  open,
  groupCode,
  groupLabel,
  target,
  siblings,
  onOpenChange,
  onSave,
}: {
  open: boolean
  groupCode: string | null
  groupLabel: string
  target: CodeItem | null
  siblings: CodeItem[]
  onOpenChange: (open: boolean) => void
  onSave: (item: CodeItem, isNew: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open ? (
          <CodeForm
            key={target?.id ?? 'new'}
            groupCode={groupCode}
            groupLabel={groupLabel}
            target={target}
            siblings={siblings}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function CodeForm({
  groupCode,
  groupLabel,
  target,
  siblings,
  onSave,
}: {
  groupCode: string | null
  groupLabel: string
  target: CodeItem | null
  siblings: CodeItem[]
  onSave: (item: CodeItem, isNew: boolean) => void
}) {
  const nextOrder = Math.max(0, ...siblings.map((c) => c.order)) + 1
  const [form, setForm] = useState<Form>(
    target
      ? { ...target, order: String(target.order), active: target.active ? 'Y' : 'N' }
      : { order: String(nextOrder), code: '', name: '', description: '', vpnGroupId: '', policyCode: '', partition: '', active: 'Y' },
  )
  const [error, setError] = useState<string>()

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(undefined)
  }

  function save() {
    const order = Number(form.order)
    const value = form.code.trim()
    if (!Number.isInteger(order) || order < 1) return setError('순서는 1 이상의 정수로 입력하세요.')
    if (!value) return setError('코드를 입력하세요.')
    if (!form.name.trim()) return setError('코드명을 입력하세요.')
    if (siblings.some((c) => c.id !== target?.id && c.code.toLowerCase() === value.toLowerCase()))
      return setError(`${groupLabel}에 ${value} 코드가 이미 있습니다.`)
    onSave(
      {
        ...form,
        id: target?.id ?? `${groupCode ?? 'GROUP'}-${value}-${crypto.randomUUID().slice(0, 8)}`,
        groupCode,
        order,
        code: value,
        name: form.name.trim(),
        active: form.active === 'Y',
      },
      !target,
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{target ? `코드 수정 — ${target.code}` : '코드 등록'}</DialogTitle>
        <DialogDescription>{groupLabel}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[100px_1fr_1fr]">
        <Field label="순서" required>
          <Input
            type="number"
            min={1}
            value={form.order}
            onChange={(e) => set('order', e.target.value)}
            className="tabular-nums"
            aria-label="순서"
          />
        </Field>
        <Field label="코드" required>
          <Input
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            readOnly={target !== null}
            className="font-mono text-xs read-only:bg-muted/50"
            aria-label="코드"
          />
        </Field>
        <Field label="코드명" required>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} aria-label="코드명" />
        </Field>
        <div className="sm:col-span-3">
          <Field label="코드설명">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              aria-label="코드설명"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
            />
          </Field>
        </div>
        <Field label="VPN 그룹 ID">
          <Input
            value={form.vpnGroupId}
            onChange={(e) => set('vpnGroupId', e.target.value)}
            className="font-mono text-xs"
            aria-label="VPN 그룹 ID"
          />
        </Field>
        <Field label="정책코드 (통제포트, 생산망제한)">
          <Input
            value={form.policyCode}
            onChange={(e) => set('policyCode', e.target.value)}
            className="font-mono text-xs"
            aria-label="정책코드"
          />
        </Field>
        <Field label="Partition">
          <Input
            value={form.partition}
            onChange={(e) => set('partition', e.target.value)}
            className="font-mono text-xs"
            aria-label="Partition"
          />
        </Field>
        <Field label="사용유무" required>
          <Choice
            label="사용유무"
            value={form.active}
            onChange={(v) => set('active', v as Form['active'])}
            options={['N']}
            format={() => '미사용 (N)'}
            empty={['Y', '사용 (Y)']}
            className="w-full"
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
        <Button onClick={save}>
          <Save className="size-4" />
          저장
        </Button>
      </DialogFooter>
    </>
  )
}
