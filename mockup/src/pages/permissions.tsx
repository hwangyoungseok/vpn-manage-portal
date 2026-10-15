import { useState } from 'react'
import { Check, Minus } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMockStore } from '@/data/use-mock-store'
import type { AdminRole } from '@/data/mock'

// P0-12 권한 관리 (요구사항 §9). 관리자 계정 관리와 분리된 화면이다.

const roles: { role: AdminRole; description: string; tone: string }[] = [
  {
    role: 'Admin',
    description: '전체 권한. 관리자 계정과 권한, 접속 허용 IP를 변경할 수 있다.',
    tone: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  {
    role: '운영자',
    description:
      '일상 운영 권한. 계정 · 정책 · IP를 다루지만 관리자 생성 · 삭제와 권한 변경은 할 수 없다.',
    tone: 'bg-muted text-muted-foreground border-transparent',
  },
]

function Allowed({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
      <Check className="size-3.5" />
      허용
    </span>
  ) : (
    <span className="text-muted-foreground inline-flex items-center gap-1">
      <Minus className="size-3.5" />
      불가
    </span>
  )
}

function Toggle({ ok, label, onClick }: { ok: boolean; label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" aria-pressed={ok} aria-label={label} onClick={onClick}>
      <Allowed ok={ok} />
    </Button>
  )
}

export function PermissionsPage() {
  const { admins, permissions, savePermission } = useMockStore()
  const [notice, setNotice] = useState<{ text: string; error?: boolean }>()
  const toggle = (label: string, role: 'admin' | 'operator', allowed: boolean) => {
    const failure = savePermission(label, role, !allowed)
    setNotice(failure ? { text: failure, error: true } : { text: `${label} 권한을 ${role === 'admin' ? 'Admin' : '운영자'}에서 ${allowed ? '불가' : '허용'}으로 변경했습니다.` })
  }
  return (
    <>
      <PageHeader
        title="권한"
        requirement="§9"
        description="역할별로 수행 가능한 작업을 정의합니다. 역할 부여는 관리자 화면에서 합니다. 권한 매트릭스의 허용 · 불가를 눌러 바꿀 수 있습니다."
      />

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        {roles.map((r) => {
          const count = admins.filter((a) => a.role === r.role).length
          const allowed = permissions.filter((p) =>
            r.role === 'Admin' ? p.admin : p.operator,
          ).length
          return (
            <Card key={r.role}>
              <CardHeader>
                <CardTitle className="text-base">
                  <Badge variant="outline" className={`font-normal ${r.tone}`}>
                    {r.role}
                  </Badge>
                </CardTitle>
                <CardDescription>{r.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">소속 관리자 </span>
                    <span className="tabular-nums">{count}명</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">허용 권한 </span>
                    <span className="tabular-nums">
                      {allowed} / {permissions.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">권한 매트릭스</CardTitle>
          <CardDescription>
            {notice ? notice.text : '허용 · 불가를 눌러 역할별 권한을 바꿉니다. 변경은 저장됩니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>권한</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">운영자</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((p) => (
                  <TableRow key={p.label}>
                    <TableCell className="font-medium">{p.label}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.detail}</TableCell>
                    <TableCell className="text-center">
                      <Toggle ok={p.admin} label={`${p.label} Admin`} onClick={() => toggle(p.label, 'admin', p.admin)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Toggle ok={p.operator} label={`${p.label} 운영자`} onClick={() => toggle(p.label, 'operator', p.operator)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">역할 추가</CardTitle>
          <CardDescription>
            요건이 생기면 역할을 추가하고 권한을 조합할 수 있도록 설계합니다. 현재는 Admin과
            운영자 두 역할만 사용합니다.
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  )
}
