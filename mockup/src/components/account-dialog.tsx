import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, MoreHorizontal, Search, Trash2, UserX } from 'lucide-react'

import { AccountPolicyEditor } from '@/components/account-policy-editor'
import { ReviewBadge, StatusBadge } from '@/components/status-badge'
import { TablePagination } from '@/components/table-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  requests,
  type Account,
  type AdFlags,
  type OtpMethod,
  type OtpServer,
  type UserType,
  type VpnState,
} from '@/data/mock'
import { useMockStore } from '@/data/use-mock-store'
import { maskEmail, maskName } from '@/lib/format'

const userTypes: UserType[] = ['협력사', '정직원', 'VIP', '생산협력사']
const vpnStates: VpnState[] = ['사용', '추가검증', 'AD미반영']
const otpServers: OtpServer[] = ['공용 OTP', '자사 OTP']
const otpMethods: OtpMethod[] = ['전체', '메일', '모바일']
const adFlagLabels: { key: keyof AdFlags; label: string }[] = [
  { key: 'mustChangePassword', label: '다음 로그온 시 사용자가 반드시 암호를 변경해야 함' },
  { key: 'cannotChangePassword', label: '사용자가 암호를 변경할 수 없음' },
  { key: 'passwordNeverExpires', label: '암호 사용기간 제한 없음' },
]

// 사용자 관리 팝업 (요구사항 §1.2 · §1.3 · §3). 목록에서 사용자를 누르면 열린다.
export function AccountDialog({
  account,
  onOpenChange,
}: {
  account: Account | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={account !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] min-h-[min(720px,calc(100vh-2rem))] content-start gap-5 overflow-y-auto p-6 sm:max-w-[min(1200px,calc(100%-2rem))]">
        {account ? (
          <AccountPanel key={account.id} account={account} onClose={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function AccountPanel({ account, onClose }: { account: Account; onClose: () => void }) {
  const [notice, setNotice] = useState<{ text: string; error?: boolean }>()

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 pr-8">
          <DialogTitle className="text-lg">사용자 관리</DialogTitle>
          <span className="text-muted-foreground font-mono text-xs">{account.account}</span>
          <StatusBadge status={account.status} />
        </div>
        <DialogDescription>
          사용자 정보와 정책, 신청 · 관리 이력을 확인하고 수정합니다.
        </DialogDescription>
      </DialogHeader>
      {notice?.text ? (
        <p
          role={notice.error ? 'alert' : 'status'}
          className={
            notice.error ? 'text-destructive text-sm' : 'text-sm text-emerald-700 dark:text-emerald-400'
          }
        >
          {notice.text}
        </p>
      ) : null}

      <Tabs defaultValue="profile" className="min-w-0">
        <TabsList>
          <TabsTrigger value="profile">사용자정보</TabsTrigger>
          <TabsTrigger value="policy">정책정보</TabsTrigger>
          <TabsTrigger value="requests">신청이력</TabsTrigger>
          <TabsTrigger value="audit">관리이력</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="pt-4">
          <ProfileForm account={account} onNotice={setNotice} onDeleted={onClose} />
        </TabsContent>
        <TabsContent value="policy" className="pt-4">
          <AccountPolicyEditor account={account} onNotice={(text) => setNotice({ text })} />
        </TabsContent>
        <TabsContent value="requests" className="pt-4">
          <RequestHistory account={account} />
        </TabsContent>
        <TabsContent value="audit" className="pt-4">
          <AuditHistory account={account} />
        </TabsContent>
      </Tabs>
    </>
  )
}

function ProfileForm({
  account,
  onNotice,
  onDeleted,
}: {
  account: Account
  onNotice: (notice: { text: string; error?: boolean }) => void
  onDeleted: () => void
}) {
  const { saveAccount, deleteAccount } = useMockStore()
  const [form, setForm] = useState(account)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set<K extends keyof Account>(key: K, value: Account[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // 검색 · 찾기 · 변경 팝업은 별도 화면으로 제공한다. 목업에서는 안내만 표시한다.
  const pending = (what: string) => () => onNotice({ text: `${what} 화면은 다음 목업 단계에서 제공합니다.` })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNotice({ text: '장기미사용 조치 대상으로 등록했습니다. 삭제 7일 전 · 1일 전 안내 메일이 발송됩니다.' })}
        >
          <UserX className="size-4" />
          장기미사용 조치
        </Button>
        <Button
          size="sm"
          onClick={() => {
            const failure = saveAccount(form)
            onNotice(failure ? { text: failure, error: true } : { text: '사용자 정보를 수정했습니다.' })
          }}
        >
          수정
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true)
              onNotice({ text: '삭제하려면 ‘삭제 확인’을 한 번 더 누르세요. VPN · AD 계정이 함께 삭제됩니다.', error: true })
              return
            }
            const failure = deleteAccount(account.id)
            if (failure) onNotice({ text: failure, error: true })
            else onDeleted()
          }}
        >
          <Trash2 className="size-4" />
          {confirmDelete ? '삭제 확인' : '삭제'}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="-mb-px grid grid-cols-[100px_1fr] text-sm lg:grid-cols-[110px_1fr_110px_1fr] lg:[&>*:nth-child(4n+3)]:border-l">
          <Field label="VPN ID" required>
            <span className="text-muted-foreground shrink-0">{form.company}</span>
            <Input value={form.account} readOnly className="h-7 max-w-[200px] font-mono text-xs" aria-label="VPN ID" />
            <Button variant="outline" size="xs" onClick={pending('VPN ID 검색')}>
              <Search />
              검색
            </Button>
          </Field>
          <Field label="상태">
            <Radios label="상태" value={form.vpnState} options={vpnStates} onChange={(v) => set('vpnState', v)} />
            <CheckLabel checked={form.forceApply} onChange={(v) => set('forceApply', v)}>
              강제적용
            </CheckLabel>
          </Field>

          <Field label="계정구분" required>
            <Radios label="계정구분" value={form.userType} options={userTypes} onChange={(v) => set('userType', v)} />
          </Field>
          <Field label="이름" required>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="h-7 max-w-[200px]" aria-label="이름" />
          </Field>

          <Field label="소속사" required>
            <Input value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} className="h-7 max-w-[200px]" aria-label="소속사" />
            <CheckLabel checked={form.affiliationIsGroup} onChange={(v) => set('affiliationIsGroup', v)}>
              그룹사
            </CheckLabel>
          </Field>
          <Field label="소속팀" required>
            <Input value={form.department} onChange={(e) => set('department', e.target.value)} className="h-7 max-w-[200px]" aria-label="소속팀" />
          </Field>

          <Field label="메일">
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-7 max-w-[260px]" aria-label="메일" />
          </Field>
          <Field label="모바일">
            <Input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} className="h-7 max-w-[200px]" aria-label="모바일" />
          </Field>

          <Field label="VPN IP">
            <span className="font-mono text-xs">{form.assignedIp}</span>
            <Button variant="outline" size="xs" onClick={pending('VPN IP 찾기')}>
              <Search />
              찾기
            </Button>
          </Field>
          <Field label="시작일">
            <span className="tabular-nums">{form.createdAt}</span>
          </Field>

          <Field label="만료일" required>
            <Input type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} className="h-7 w-[150px]" aria-label="만료일" />
          </Field>
          <Field label="AD 확인일">
            <span className="tabular-nums">{form.adCheckedAt}</span>
          </Field>

          <Field label="AD인증">
            <div className="space-y-1.5 py-1">
              {adFlagLabels.map((f) => (
                <CheckLabel
                  key={f.key}
                  checked={form.adFlags[f.key]}
                  onChange={(v) => set('adFlags', { ...form.adFlags, [f.key]: v })}
                >
                  {f.label}
                </CheckLabel>
              ))}
            </div>
          </Field>
          <Field label="OU">
            <span className="text-muted-foreground font-mono text-xs">{form.ou}</span>
            <Button variant="outline" size="xs" onClick={pending('OU 변경')}>
              <Search />
              변경
            </Button>
          </Field>

          <Field label="AD상태">
            <span>{form.adStatus}</span>
          </Field>
          <Field label="비밀번호">
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                set('adFlags', { ...form.adFlags, mustChangePassword: true })
                onNotice({ text: '임의 비밀번호로 재설정하고 다음 로그온 시 변경하도록 했습니다. ‘수정’을 눌러 반영하세요.' })
              }}
            >
              <KeyRound />
              변경
            </Button>
          </Field>

          <Field label="1차인증서버">
            <Radios label="1차인증서버" value={form.otpServer} options={otpServers} onChange={(v) => set('otpServer', v)} />
          </Field>
          <Field label="OTP방법">
            <Radios label="OTP방법" value={form.otpMethod} options={otpMethods} onChange={(v) => set('otpMethod', v)} />
          </Field>

          <Field label="변경이력(요약)">
            <textarea
              value={form.changeNote}
              onChange={(e) => set('changeNote', e.target.value)}
              rows={3}
              aria-label="변경이력(요약)"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
            />
          </Field>
          <Field label="MAC 주소">
            <Input
              value={form.macAddress}
              onChange={(e) => set('macAddress', e.target.value)}
              placeholder="00:00:00:00:00:00"
              className="h-7 max-w-[200px] font-mono text-xs"
              aria-label="MAC 주소"
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <>
      <div className="bg-muted/50 text-muted-foreground flex items-center justify-center border-b px-2 py-2 text-center text-xs font-medium">
        {required ? <span className="text-destructive mr-0.5">*</span> : null}
        {label}
      </div>
      <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-l px-3 py-2">{children}</div>
    </>
  )
}

function Radios<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as T)}
      aria-label={label}
      className="flex w-auto flex-wrap gap-x-4 gap-y-2"
    >
      {options.map((o) => (
        <Label key={o} className="font-normal">
          <RadioGroupItem value={o} />
          {o}
        </Label>
      ))}
    </RadioGroup>
  )
}

function CheckLabel({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <Label className="font-normal">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      {children}
    </Label>
  )
}

// 신청 데이터의 VPN ID 체계가 계정과 달라 목업에서는 이름 + 신청사로 연결한다.
function RequestHistory({ account }: { account: Account }) {
  const rows = requests.flatMap((request) =>
    request.items
      .filter((item) => item.name === account.name && request.company === account.company)
      .map((item) => ({ request, item })),
  )
  return (
    <HistoryTable
      empty="신청 이력이 없습니다."
      head={['근거번호', '구분', '신청일시', '만료일', '점검', '상태']}
      rows={rows.map(({ request, item }) => ({
        key: item.id,
        cells: [
          <Link
            key="no"
            to={`/requests/${request.id}?item=${item.id}`}
            className="font-mono text-xs hover:underline"
          >
            {request.sourceNo}
          </Link>,
          <Badge key="kind" variant="secondary" className="font-normal">
            {item.kind}
          </Badge>,
          <span key="at" className="text-muted-foreground tabular-nums">{request.requestedAt}</span>,
          <span key="exp" className="tabular-nums">{item.expiresAt}</span>,
          <ReviewBadge key="review" review={item.review} />,
          <span key="status" className="text-muted-foreground">{request.status}</span>,
        ],
      }))}
    />
  )
}

const historyHead = [
  '종류', '처리일시', '처리자', '근거번호', '메일', '휴대폰', '만료일', '최초암호변경', '암호변경불가',
  '암호기간제한없음', '1차인증서버', 'OTP 방법', '신청정책', 'VPN ID', 'VPN IP', 'OU',
]

const yn = (value: boolean) => (value ? 'Y' : 'N')

// 처리 시점의 계정 상태 스냅샷 목록. 신청정책은 펼쳐서 ACL을 확인한다.
function AuditHistory({ account }: { account: Account }) {
  const { accountHistory } = useMockStore()
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [openId, setOpenId] = useState<string | null>(null)
  const rows = accountHistory
    .filter((h) => h.accountId === account.id)
    .sort((x, y) => y.at.localeCompare(x.at))
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(page, pages)
  const visible = rows.slice((current - 1) * size, current * size)

  return (
    <div className="rounded-lg border pb-2">
      <div className="overflow-x-auto">
        <Table className="text-center">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {historyHead.map((h) => (
                <TableHead key={h} className="text-center text-xs">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={historyHead.length} className="text-muted-foreground h-20">
                  조회된 데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((h) => (
                <Fragment key={h.id}>
                  <TableRow data-state={openId === h.id ? 'selected' : undefined}>
                    <TableCell>
                      <Badge variant={h.kind === '삭제' ? 'destructive' : 'secondary'} className="font-normal">
                        {h.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{h.at}</TableCell>
                    <TableCell>{maskName(h.actor)}</TableCell>
                    <TableCell className="font-mono text-xs">{h.sourceNo}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{h.email ? maskEmail(h.email) : ''}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{h.mobile}</TableCell>
                    <TableCell className="tabular-nums">{h.expiresAt}</TableCell>
                    <TableCell>{yn(h.adFlags.mustChangePassword)}</TableCell>
                    <TableCell>{yn(h.adFlags.cannotChangePassword)}</TableCell>
                    <TableCell>{yn(h.adFlags.passwordNeverExpires)}</TableCell>
                    <TableCell>{h.otpServer}</TableCell>
                    <TableCell>{h.otpMethod}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        aria-expanded={openId === h.id}
                        aria-label={`${h.at} 신청정책 보기`}
                        onClick={() => setOpenId(openId === h.id ? null : h.id)}
                      >
                        <MoreHorizontal />
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{h.account}</TableCell>
                    <TableCell className="font-mono text-xs">{h.assignedIp}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{h.ou}</TableCell>
                  </TableRow>
                  {openId === h.id ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={historyHead.length} className="bg-muted/30 text-left">
                        <div className="flex flex-wrap items-center gap-2 px-2">
                          <span className="text-muted-foreground text-xs">신청정책</span>
                          {h.acls.length === 0 ? (
                            <span className="text-muted-foreground text-xs">없음</span>
                          ) : (
                            h.acls.map((acl) => (
                              <Badge key={acl} variant="outline" className="font-mono text-[10px]">
                                {acl}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={current}
        pages={pages}
        size={size}
        total={rows.length}
        onPage={setPage}
        onSize={(next) => {
          setSize(next)
          setPage(1)
        }}
      />
    </div>
  )
}

function HistoryTable({
  head,
  rows,
  empty,
}: {
  head: string[]
  rows: { key: string; cells: ReactNode[] }[]
  empty: string
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {head.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={head.length} className="text-muted-foreground h-20 text-center">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.key}>
                {r.cells.map((c, i) => (
                  <TableCell key={i}>{c}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
