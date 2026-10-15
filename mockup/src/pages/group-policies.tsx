import { useState } from 'react'
import type { ReactElement } from 'react'
import { Plus, Search } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { authSources, companies, groupPolicies as seedPolicies, policyKinds, userTypes } from '@/data/mock'
import type { AuthSource, GroupPolicy, PolicyKind, UserType } from '@/data/mock'

const ALL = '전체'

function Field({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? value)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const companyNames = companies.map((c) => c.name)
const emptyForm = (): Omit<GroupPolicy, 'id'> => ({
  company: companyNames[0],
  userType: '정직원',
  vpnGroupId: '',
  policyKind: '그룹',
  ad: '공용',
  otp: '공용',
})

// 그룹 정책 등록 · 수정 팝업. 수정이면 기존 값이 채워져 열린다.
function PolicyFormDialog({
  policy,
  trigger,
  onSubmit,
}: {
  policy?: GroupPolicy
  trigger: ReactElement
  onSubmit: (value: Omit<GroupPolicy, 'id'>) => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  function handleOpenChange(next: boolean) {
    if (next) {
      if (policy) {
        const { id, ...rest } = policy
        void id
        setForm(rest)
      } else {
        setForm(emptyForm())
      }
    }
    setOpen(next)
  }

  const valid = form.vpnGroupId.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{policy ? '그룹 정책 수정' : '그룹 정책 등록'}</DialogTitle>
          <DialogDescription>그룹사와 사용자구분별로 VPN 그룹과 인증 방식을 지정합니다.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field id="gp-company" label="회사" value={form.company} options={companyNames} onChange={(v) => set('company', v)} />
          <Field id="gp-kind" label="사용자구분" value={form.userType} options={userTypes} onChange={(v) => set('userType', v as UserType)} />
          <div className="space-y-2">
            <Label htmlFor="gp-vpn">VPN 그룹 ID</Label>
            <Input
              id="gp-vpn"
              value={form.vpnGroupId}
              onChange={(e) => set('vpnGroupId', e.target.value)}
              placeholder="예: HMGPTR"
              className="font-mono"
            />
          </div>
          <Field id="gp-ptype" label="정책구분" value={form.policyKind} options={policyKinds} onChange={(v) => set('policyKind', v as PolicyKind)} />
          <Field id="gp-ad" label="AD인증" value={form.ad} options={authSources} onChange={(v) => set('ad', v as AuthSource)} />
          <Field id="gp-otp" label="OTP인증" value={form.otp} options={authSources} onChange={(v) => set('otp', v as AuthSource)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              onSubmit({ ...form, vpnGroupId: form.vpnGroupId.trim().toUpperCase() })
              setOpen(false)
            }}
          >
            {policy ? '저장' : '등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type Filter = { company: string; userType: string; policyKind: string; ad: string; otp: string }
const noFilter: Filter = { company: ALL, userType: ALL, policyKind: ALL, ad: ALL, otp: ALL }

// 그룹 정책 관리 (요구사항 §4). 원본 IAMS-VPN의 그룹 정책 관리 화면을 기준으로 한다.
export function GroupPoliciesPage() {
  const [policies, setPolicies] = useState<GroupPolicy[]>(seedPolicies)
  const [draft, setDraft] = useState<Filter>(noFilter)
  const [filter, setFilter] = useState<Filter>(noFilter)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string>()

  const rows = policies.filter(
    (p) =>
      (filter.company === ALL || p.company === filter.company) &&
      (filter.userType === ALL || p.userType === filter.userType) &&
      (filter.policyKind === ALL || p.policyKind === filter.policyKind) &&
      (filter.ad === ALL || p.ad === filter.ad) &&
      (filter.otp === ALL || p.otp === filter.otp),
  )
  const setD = (key: keyof Filter) => (value: string) => setDraft((prev) => ({ ...prev, [key]: value }))

  function add(value: Omit<GroupPolicy, 'id'>) {
    setPolicies((prev) => [...prev, { ...value, id: `GP-${Date.now()}` }])
    setNotice(`${value.company} · ${value.userType} 정책을 등록했습니다.`)
  }

  function update(id: string, value: Omit<GroupPolicy, 'id'>) {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...value, id } : p)))
    setNotice(`${value.company} · ${value.userType} 정책을 저장했습니다.`)
  }

  function remove(p: GroupPolicy) {
    if (confirmId !== p.id) {
      setConfirmId(p.id)
      setNotice(`‘삭제 확인’을 누르면 ${p.company} · ${p.userType} 정책이 삭제됩니다.`)
      return
    }
    setPolicies((prev) => prev.filter((item) => item.id !== p.id))
    setConfirmId(null)
    setNotice(`${p.company} · ${p.userType} 정책을 삭제했습니다.`)
  }

  return (
    <>
      <PageHeader
        title="그룹 정책 관리"
        requirement="§4"
        description="그룹사와 사용자구분별로 VPN 그룹, 정책구분, AD · OTP 인증 방식(공용 / 자사)을 관리합니다."
        actions={
          <PolicyFormDialog
            onSubmit={add}
            trigger={
              <Button size="sm">
                <Plus className="size-4" />
                그룹 정책 등록
              </Button>
            }
          />
        }
      />

      <Card>
        <CardHeader className="gap-4">
          <form
            className="grid items-end gap-3 sm:grid-cols-3 lg:grid-cols-6"
            onSubmit={(e) => {
              e.preventDefault()
              setFilter(draft)
            }}
          >
            <Field id="gps-company" label="회사" value={draft.company} options={[ALL, ...companyNames]} onChange={setD('company')} />
            <Field id="gps-kind" label="사용자구분" value={draft.userType} options={[ALL, ...userTypes]} onChange={setD('userType')} />
            <Field id="gps-ptype" label="정책구분" value={draft.policyKind} options={[ALL, ...policyKinds]} onChange={setD('policyKind')} />
            <Field id="gps-ad" label="AD인증" value={draft.ad} options={[ALL, ...authSources]} onChange={setD('ad')} />
            <Field id="gps-otp" label="OTP인증" value={draft.otp} options={[ALL, ...authSources]} onChange={setD('otp')} />
            <Button type="submit" size="sm">
              <Search className="size-4" />
              조회
            </Button>
          </form>
          <CardDescription>
            {notice ?? `${rows.length}건 표시 / 전체 ${policies.length}건`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회사</TableHead>
                  <TableHead>사용자구분</TableHead>
                  <TableHead>VPN 그룹 ID</TableHead>
                  <TableHead>정책구분</TableHead>
                  <TableHead>AD인증</TableHead>
                  <TableHead>OTP인증</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="text-muted-foreground h-20 text-center">
                      조회된 그룹 정책이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.company}</TableCell>
                      <TableCell>{p.userType}</TableCell>
                      <TableCell className="font-mono text-xs">{p.vpnGroupId}</TableCell>
                      <TableCell>{p.policyKind}</TableCell>
                      <TableCell>{p.ad}</TableCell>
                      <TableCell>{p.otp}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <PolicyFormDialog
                            policy={p}
                            onSubmit={(value) => update(p.id, value)}
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
                            onClick={() => remove(p)}
                          >
                            {confirmId === p.id ? '삭제 확인' : '삭제'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
