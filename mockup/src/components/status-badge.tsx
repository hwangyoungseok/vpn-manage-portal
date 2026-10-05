import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AccountStatus, DeleteReason, RequestStatus, UserType } from '@/data/mock'

const tone = {
  neutral: 'bg-muted text-muted-foreground border-transparent',
  info: 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300',
  good: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
  warn: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300',
  bad: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300',
  vip: 'bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300',
} as const

type Tone = keyof typeof tone

function Pill({ label, variant }: { label: string; variant: Tone }) {
  return (
    <Badge variant="outline" className={cn('font-normal', tone[variant])}>
      {label}
    </Badge>
  )
}

const accountTone: Record<AccountStatus, Tone> = {
  사용중: 'good',
  만료임박: 'warn',
  만료: 'neutral',
  잠김: 'bad',
}

const userTypeTone: Record<UserType, Tone> = {
  정직원: 'info',
  협력사: 'neutral',
  생산협력사: 'neutral',
  VIP: 'vip',
}

const requestTone: Record<RequestStatus, Tone> = {
  대기: 'warn',
  처리중: 'info',
  완료: 'good',
  반려: 'bad',
}

const reasonTone: Record<DeleteReason, Tone> = {
  요청삭제: 'info',
  기간만료삭제: 'warn',
  장기미사용삭제: 'neutral',
}

export const StatusBadge = ({ status }: { status: AccountStatus }) => (
  <Pill label={status} variant={accountTone[status]} />
)

export const UserTypeBadge = ({ userType }: { userType: UserType }) => (
  <Pill label={userType} variant={userTypeTone[userType]} />
)

export const RequestStatusBadge = ({ status }: { status: RequestStatus }) => (
  <Pill label={status} variant={requestTone[status]} />
)

export const DeleteReasonBadge = ({ reason }: { reason: DeleteReason }) => (
  <Pill label={reason} variant={reasonTone[reason]} />
)

export const ResultBadge = ({ result }: { result: '성공' | '실패' }) => (
  <Pill label={result} variant={result === '성공' ? 'good' : 'bad'} />
)
