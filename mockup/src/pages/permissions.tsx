import { Check, Minus } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { admins } from '@/data/mock'
import type { AdminRole } from '@/data/mock'

// P0-12 권한 관리 (요구사항 §9). 관리자 계정 관리와 분리된 화면이다.

const permissions: { label: string; detail: string; admin: boolean; operator: boolean }[] = [
  { label: '계정 생성 · 삭제', detail: 'VPN 사용자 계정 등록과 삭제', admin: true, operator: true },
  { label: '정책 생성 · 삭제', detail: 'ACL 생성, 매핑, 해제', admin: true, operator: true },
  { label: 'IP 할당', detail: '대역 내 고정 IP 할당과 회수', admin: true, operator: true },
  { label: '목록 확인 · 다운로드', detail: '계정 · 정책 조회와 엑셀 내보내기', admin: true, operator: true },
  { label: '신청 처리', detail: '연계 신청 승인 · 반려', admin: true, operator: true },
  { label: '그룹사 관리', detail: '그룹사 등록 · 수정, 그룹 ACL 관리', admin: true, operator: true },
  { label: '감사 로그 조회', detail: '관리자 행위 내역 열람', admin: true, operator: true },
  { label: '관리자 생성 · 삭제', detail: '관리자 계정 추가와 삭제', admin: true, operator: false },
  { label: '권한 변경', detail: '역할 부여와 회수', admin: true, operator: false },
  { label: '접속 허용 IP 관리', detail: '시스템 접속 가능 IP 등록 · 삭제', admin: true, operator: false },
  { label: '계정 잠김 해제', detail: '타 관리자의 잠김 해제', admin: true, operator: false },
]

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

export function PermissionsPage() {
  return (
    <>
      <PageHeader
        title="권한"
        requirement="§9"
        description="역할별로 수행 가능한 작업을 정의합니다. 역할 부여는 관리자 화면에서 합니다."
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
            운영자는 관리자 생성 · 삭제, 권한 변경, 접속 허용 IP 관리를 할 수 없습니다.
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
                      <Allowed ok={p.admin} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Allowed ok={p.operator} />
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
