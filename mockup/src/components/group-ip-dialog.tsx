import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Save, Trash2 } from 'lucide-react'

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
import { companies, userTypes } from '@/data/mock'
import type { GroupIp, UserType } from '@/data/mock'
import { validateGroupIp } from '@/lib/ip'

type Form = Omit<GroupIp, 'id' | 'autoAssign' | 'userType'> & {
  autoAssign: '' | 'Y' | 'N'
  userType: UserType | ''
}

const emptyForm: Form = {
  name: '',
  autoAssign: '',
  rangeStart: '',
  rangeEnd: '',
  manualStart: '',
  manualEnd: '',
  company: '',
  userType: '',
}

// 그룹 IP 등록 · 수정 팝업. target이 없으면 신규 등록이다.
export function GroupIpDialog({
  open,
  target,
  items,
  onOpenChange,
  onSave,
  onDelete,
}: {
  open: boolean
  target: GroupIp | null
  items: GroupIp[]
  onOpenChange: (open: boolean) => void
  onSave: (item: GroupIp, isNew: boolean) => void
  onDelete: (item: GroupIp) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open ? (
          <GroupIpForm
            key={target?.id ?? 'new'}
            target={target}
            items={items}
            onSave={onSave}
            onDelete={onDelete}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function GroupIpForm({
  target,
  items,
  onSave,
  onDelete,
}: {
  target: GroupIp | null
  items: GroupIp[]
  onSave: (item: GroupIp, isNew: boolean) => void
  onDelete: (item: GroupIp) => void
}) {
  const [form, setForm] = useState<Form>(
    target ? { ...target, autoAssign: target.autoAssign ? 'Y' : 'N' } : emptyForm,
  )
  const [error, setError] = useState<string>()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const code = companies.find((c) => c.name === form.company)?.code
  const suggestedName = code && form.rangeStart ? `${code}_${form.rangeStart}` : ''

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(undefined)
    setConfirmDelete(false)
  }

  function save() {
    if (!form.autoAssign) return setError('할당여부를 선택하세요.')
    if (!form.userType) return setError('사용자구분을 선택하세요.')
    const item: GroupIp = {
      ...form,
      id: target?.id ?? crypto.randomUUID(),
      name: form.name.trim() || suggestedName,
      autoAssign: form.autoAssign === 'Y',
      userType: form.userType,
    }
    const failure = validateGroupIp(item, items)
    if (failure) return setError(failure)
    onSave(item, !target)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{target ? `대역 수정 — ${target.name}` : '신규 대역 등록'}</DialogTitle>
        <DialogDescription>
          수동IP대역은 IP대역 안에서 고정 IP로 지정할 범위입니다. 이름을 비우면 회사코드_시작IP로 정합니다.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="이름">
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={suggestedName || '회사코드_시작IP'}
            className="font-mono text-xs"
            aria-label="이름"
          />
        </Field>
        <Field label="할당여부" required>
          <Choice
            label="할당여부"
            value={form.autoAssign}
            onChange={(v) => set('autoAssign', v as Form['autoAssign'])}
            options={['Y', 'N']}
            format={(v) => (v === 'Y' ? '자동 (Y)' : '수동 (N)')}
            empty={['', '선택']}
            className="w-full"
          />
        </Field>
        <Field label="IP대역" required>
          <IpPair
            label="IP대역"
            start={form.rangeStart}
            end={form.rangeEnd}
            onStart={(v) => set('rangeStart', v)}
            onEnd={(v) => set('rangeEnd', v)}
          />
        </Field>
        <Field label="수동IP대역" required>
          <IpPair
            label="수동IP대역"
            start={form.manualStart}
            end={form.manualEnd}
            onStart={(v) => set('manualStart', v)}
            onEnd={(v) => set('manualEnd', v)}
          />
        </Field>
        <Field label="회사" required>
          <div className="flex gap-2">
            <Choice
              label="회사"
              value={form.company}
              onChange={(v) => set('company', v)}
              options={companies.map((c) => c.name)}
              empty={['', '선택']}
              className="min-w-0 flex-1"
            />
            <Button variant="outline" render={<Link to="/companies" />}>
              <Building2 className="size-4" />
              회사추가
            </Button>
          </div>
        </Field>
        <Field label="사용자구분" required>
          <Choice
            label="사용자구분"
            value={form.userType}
            onChange={(v) => set('userType', v as Form['userType'])}
            options={userTypes}
            empty={['', '선택']}
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
        {target ? (
          <Button
            variant="destructive"
            className="sm:mr-auto"
            onClick={() => {
              if (!confirmDelete) {
                setConfirmDelete(true)
                setError(`‘삭제 확인’을 누르면 ${target.name} 대역이 삭제됩니다.`)
                return
              }
              onDelete(target)
            }}
          >
            <Trash2 className="size-4" />
            {confirmDelete ? '삭제 확인' : '삭제'}
          </Button>
        ) : null}
        <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
        <Button onClick={save}>
          <Save className="size-4" />
          저장
        </Button>
      </DialogFooter>
    </>
  )
}

function IpPair({
  label,
  start,
  end,
  onStart,
  onEnd,
}: {
  label: string
  start: string
  end: string
  onStart: (value: string) => void
  onEnd: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Input
        value={start}
        onChange={(e) => onStart(e.target.value)}
        placeholder="시작 IP"
        className="min-w-0 font-mono text-xs"
        aria-label={`${label} 시작`}
      />
      <span className="text-muted-foreground">~</span>
      <Input
        value={end}
        onChange={(e) => onEnd(e.target.value)}
        placeholder="끝 IP"
        className="min-w-0 font-mono text-xs"
        aria-label={`${label} 끝`}
      />
    </div>
  )
}
