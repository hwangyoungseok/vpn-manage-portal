import { useState } from 'react'
import type { ReactElement } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Acl, AclEntry } from '@/data/mock'
import { validateAcl } from '@/lib/acl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Props = {
  acl?: Acl
  shared?: boolean
  existing: Acl[]
  onSubmit: (acl: Acl) => string | undefined
  onCancel?: () => void
}
const emptyEntry = (): AclEntry => ({ destination: '', port: '', protocol: 'TCP' })

export function AclForm({ acl, shared = false, existing, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(acl?.name ?? '')
  const [description, setDescription] = useState(acl?.description ?? '')
  const [entries, setEntries] = useState<AclEntry[]>(acl ? structuredClone(acl.entries) : [emptyEntry()])
  const [error, setError] = useState<string>()

  function update(index: number, patch: Partial<AclEntry>) {
    setEntries((prev) => prev.map((entry, i) => i === index ? { ...entry, ...patch } : entry))
    setError(undefined)
  }

  return (
    <form className="space-y-4" onSubmit={(event) => {
      event.preventDefault()
      const next: Acl = { id: acl?.id ?? crypto.randomUUID(), name: name.trim(), description: description.trim(), shared: acl?.shared ?? shared,
        entries: entries.map((entry) => ({ ...entry, destination: entry.destination.trim(), port: entry.protocol === 'ICMP' ? 'any' : entry.port.replace(/\s/g, '').toLowerCase() })) }
      const validation = validateAcl(next, existing)
      if (validation) return setError(validation)
      const failure = onSubmit(next)
      setError(failure)
      if (!failure && !acl) { setName(''); setDescription(''); setEntries([emptyEntry()]) }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="acl-name">ACL 이름</Label>
          <Input id="acl-name" value={name} onChange={(event) => { setName(event.target.value); setError(undefined) }} placeholder="ACL_NEW_ACCESS" className="font-mono" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acl-desc">설명</Label>
          <Input id="acl-desc" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="용도를 입력하세요" />
        </div>
      </div>
      {entries.map((entry, index) => (
        <div key={index} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor={`acl-dest-${index}`}>목적지 IP / 대역 {index + 1}</Label>
            <Input id={`acl-dest-${index}`} value={entry.destination} onChange={(event) => update(index, { destination: event.target.value })} placeholder="10.20.30.0/24" className="font-mono" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`acl-port-${index}`}>포트 {index + 1}</Label>
            <Input id={`acl-port-${index}`} value={entry.protocol === 'ICMP' ? 'any' : entry.port} disabled={entry.protocol === 'ICMP'} onChange={(event) => update(index, { port: event.target.value })} placeholder="443,8000-8080" className="font-mono" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`acl-proto-${index}`}>프로토콜 {index + 1}</Label>
            <Select value={entry.protocol} onValueChange={(value) => update(index, { protocol: (value ?? 'TCP') as AclEntry['protocol'] })}>
              <SelectTrigger id={`acl-proto-${index}`}><SelectValue /></SelectTrigger>
              <SelectContent>{(['TCP', 'UDP', 'ICMP'] as const).map((protocol) => <SelectItem key={protocol} value={protocol}>{protocol}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="ghost" size="icon" aria-label={`항목 ${index + 1} 제거`} disabled={entries.length === 1} onClick={() => setEntries((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="size-4" /></Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => setEntries((prev) => [...prev, emptyEntry()])}><Plus className="size-4" />항목 추가</Button>
      {error ? <p role="alert" className="text-destructive text-sm">{error}</p> : null}
      <div className="flex justify-end gap-2">
        {onCancel ? <Button type="button" variant="outline" onClick={onCancel}>취소</Button> : null}
        <Button type="submit">{acl ? '저장' : shared ? '그룹 ACL 추가' : 'ACL 생성 및 매핑 추가'}</Button>
      </div>
    </form>
  )
}

export function AclFormDialog({ trigger, ...props }: Props & { trigger: ReactElement }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{props.acl ? '그룹 ACL 수정' : '그룹 ACL 추가'}</DialogTitle>
          <DialogDescription>목적지 IP · 포트 · 프로토콜을 지정합니다. 저장한 ACL은 계정 정책에서 선택할 수 있습니다.</DialogDescription>
        </DialogHeader>
        {open ? <AclForm {...props} onCancel={() => setOpen(false)} onSubmit={(acl) => { const error = props.onSubmit(acl); if (!error) setOpen(false); return error }} /> : null}
      </DialogContent>
    </Dialog>
  )
}
