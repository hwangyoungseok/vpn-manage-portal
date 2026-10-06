import { useState } from 'react'
import type { ReactElement } from 'react'
import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminRole, AdminUser } from '@/data/mock'
import { cn } from '@/lib/utils'

// 요구사항 §9: 8자 이상, 소문자 · 대문자 · 특수문자 중 3종 이상 포함.
const charClasses = [
  { label: '소문자', test: (v: string) => /[a-z]/.test(v) },
  { label: '대문자', test: (v: string) => /[A-Z]/.test(v) },
  { label: '숫자', test: (v: string) => /[0-9]/.test(v) },
  { label: '특수문자', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

type Mode = 'create' | 'edit'

export function AdminFormDialog({
  mode,
  admin,
  trigger,
  onSubmit,
  existingAccounts,
}: {
  mode: Mode
  admin?: AdminUser
  trigger: ReactElement
  onSubmit: (admin: AdminUser) => string | undefined
  existingAccounts: AdminUser[]
}) {
  const isEdit = mode === 'edit'
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()

  const initial = {
    account: admin?.account ?? '',
    name: admin?.name ?? '',
    role: admin?.role ?? ('운영자' as AdminRole),
    mfa: admin?.mfa ?? true,
    locked: admin?.locked ?? false,
    resetPassword: !isEdit,
    password: '',
    confirm: '',
  }
  const [form, setForm] = useState(initial)

  const passed = charClasses.filter((c) => c.test(form.password))
  const longEnough = form.password.length >= 8
  const passwordOk = longEnough && passed.length >= 3
  const confirmOk = form.confirm.length > 0 && form.password === form.confirm
  const passwordSectionOk = !form.resetPassword || (passwordOk && confirmOk)
  const duplicate = existingAccounts.some((item) => item.id !== admin?.id && item.account.toLowerCase() === form.account.trim().toLowerCase())
  const canSubmit =
    form.account.trim() !== '' && form.name.trim() !== '' && passwordSectionOk && !duplicate

  function set<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function submit() {
    if (!canSubmit) return
    const failure = onSubmit({
      id: admin?.id ?? crypto.randomUUID(),
      account: form.account.trim(),
      name: form.name.trim(),
      role: form.role,
      email: admin?.email ?? `${form.account.trim()}@example.com`,
      locked: form.locked,
      failCount: form.locked ? (admin?.failCount ?? 5) : 0,
      lastLoginAt: admin?.lastLoginAt ?? '-',
      mfa: form.mfa,
    })
    setError(failure)
    if (!failure) setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) { setForm(initial); setError(undefined) }
      }}
    >
      <DialogTrigger render={trigger} />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? '관리자 수정' : '관리자 추가'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `${admin?.account} 계정의 정보를 변경합니다. 변경 내역은 감사 로그에 기록됩니다.`
              : '새 관리자 계정을 등록합니다. 생성 내역은 감사 로그에 기록됩니다.'}
          </DialogDescription>
        </DialogHeader>
        <p className="text-muted-foreground text-xs">목업의 비밀번호 입력은 정책 확인용입니다. 비밀번호를 저장하거나 로그인 인증에 사용하지 않습니다.</p>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-account">계정</Label>
              <Input
                id="admin-account"
                value={form.account}
                onChange={(e) => set('account', e.target.value)}
                placeholder="admin.gildong"
                className="font-mono"
                disabled={isEdit}
              />
              {isEdit ? (
                <p className="text-muted-foreground text-xs">계정은 변경할 수 없습니다.</p>
              ) : null}
              {duplicate ? <p role="alert" className="text-destructive text-xs">이미 등록된 관리자 계정입니다.</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-name">이름</Label>
              <Input
                id="admin-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="홍길동"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-role">권한</Label>
            <Select
              value={form.role}
              onValueChange={(v) => set('role', (v ?? '운영자') as AdminRole)}
            >
              <SelectTrigger id="admin-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin — 전체 권한</SelectItem>
                <SelectItem value="운영자">운영자 — 계정 · 정책 · IP 운영</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {form.role === 'Admin'
                ? '관리자 생성 · 삭제, 권한 변경, 접속 허용 IP 관리까지 가능합니다.'
                : '관리자 생성 · 삭제와 권한 변경은 할 수 없습니다.'}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox
              id="admin-mfa"
              checked={form.mfa}
              onCheckedChange={(v) => set('mfa', v === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="admin-mfa" className="font-normal">
                MFA 사용
              </Label>
              <p className="text-muted-foreground text-xs leading-relaxed">
                로그인 시 OTP 2단계 인증을 요구합니다.
              </p>
            </div>
          </div>

          {isEdit && admin?.locked ? (
            <div className="flex items-start gap-3 rounded-md border border-rose-500/20 bg-rose-500/5 p-3">
              <Checkbox
                id="admin-unlock"
                checked={!form.locked}
                onCheckedChange={(v) => set('locked', v !== true)}
              />
              <div className="space-y-1">
                <Label htmlFor="admin-unlock" className="font-normal">
                  계정 잠김 해제
                </Label>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  로그인 실패 횟수가 0으로 초기화됩니다.
                </p>
              </div>
            </div>
          ) : null}

          {isEdit ? (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <Checkbox
                  id="admin-reset"
                  checked={form.resetPassword}
                  onCheckedChange={(v) => set('resetPassword', v === true)}
                />
                <Label htmlFor="admin-reset" className="font-normal">
                  비밀번호 재설정
                </Label>
              </div>
            </>
          ) : null}

          {form.resetPassword ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="admin-password">비밀번호</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <Rule ok={longEnough} label="8자 이상" />
                  <span className="text-muted-foreground/50">·</span>
                  {charClasses.map((c) => (
                    <Rule key={c.label} ok={c.test(form.password)} label={c.label} />
                  ))}
                  <span className="text-muted-foreground">
                    ({passed.length}/4 — 3종 이상 필요)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-confirm">비밀번호 확인</Label>
                <Input
                  id="admin-confirm"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                />
                {form.confirm.length > 0 && !confirmOk ? (
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    비밀번호가 일치하지 않습니다.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        {error ? <p role="alert" className="text-destructive text-sm">{error}</p> : null}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button disabled={!canSubmit} onClick={submit}>
            {isEdit ? '저장' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground',
      )}
    >
      {ok ? <Check className="size-3" /> : <X className="size-3" />}
      {label}
    </span>
  )
}
