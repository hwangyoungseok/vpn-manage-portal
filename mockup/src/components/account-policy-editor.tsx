import { useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'

import { AclForm } from '@/components/acl-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Account, Acl } from '@/data/mock'
import { useMockStore } from '@/data/use-mock-store'

// P0-8 계정 정책 편집 (요구사항 §1.2).
// ACL 신규 생성 방식과 기존 ACL 매핑 방식 두 가지를 모두 보여준다.
export function AccountPolicyEditor({
  account,
  onNotice,
}: {
  account: Account
  onNotice: (notice: string) => void
}) {
  const { acls, savePolicies } = useMockStore()
  const [mode, setMode] = useState<'map' | 'create'>('map')
  const [names, setNames] = useState(account.acls)
  const [created, setCreated] = useState<Acl[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const allAcls = [...acls, ...created]
  const applied = allAcls.filter((acl) => names.includes(acl.name))
  const available = allAcls.filter((acl) => !names.includes(acl.name))
  const dirty = names.length !== account.acls.length || names.some((name) => !account.acls.includes(name))

  function changeNames(next: string[]) {
    setNames(next)
    onNotice('')
    setError(undefined)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          기존 ACL을 매핑하거나, 새 ACL을 만들어 IP · 포트를 직접 지정합니다.
        </p>
        <Button
          size="sm"
          disabled={!dirty}
          onClick={() => {
            const failure = savePolicies(account.id, names, created.filter((acl) => names.includes(acl.name)))
            setError(failure)
            if (!failure) {
              setCreated([])
              onNotice('정책 변경을 저장했습니다.')
            }
          }}
        >
          변경 사항 적용
        </Button>
      </div>
      {error ? <p role="alert" className="text-destructive text-sm">{error}</p> : null}
      {dirty ? (
        <p role="status" className="text-muted-foreground text-sm">
          저장하지 않은 정책 변경이 있습니다. ‘변경 사항 적용’을 눌러 저장하세요.
        </p>
      ) : null}

      <div>
        <Label className="text-muted-foreground mb-2 block text-xs">적용된 ACL</Label>
        <div className="space-y-2">
          {applied.length === 0 ? (
            <p className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
              적용된 정책이 없습니다.
            </p>
          ) : (
            applied.map((acl) => (
              <div key={acl.id} className="rounded-md border">
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium">{acl.name}</span>
                      {acl.shared ? (
                        <Badge variant="secondary" className="font-normal">
                          그룹 ACL
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">{acl.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${acl.name} 정책 제거`}
                    onClick={() => changeNames(names.filter((name) => name !== acl.name))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <Separator />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>목적지</TableHead>
                      <TableHead>포트</TableHead>
                      <TableHead>프로토콜</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acl.entries.map((e) => (
                      <TableRow key={`${acl.id}-${e.destination}-${e.port}-${e.protocol}`}>
                        <TableCell className="font-mono text-xs">{e.destination}</TableCell>
                        <TableCell className="font-mono text-xs">{e.port}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{e.protocol}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          )}
        </div>
      </div>

      <Separator />

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'map' | 'create')}>
        <TabsList>
          <TabsTrigger value="map">
            <Link2 className="size-4" />
            기존 ACL 매핑
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="size-4" />
            새 ACL 생성
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-3 pt-4">
          <p className="text-muted-foreground text-xs">
            미리 정의된 그룹 ACL을 이 계정 정책에 매핑합니다. ACL 이름은 신청 시스템과 연계됩니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="min-w-[240px] flex-1">
                <SelectValue placeholder="매핑할 ACL 선택" />
              </SelectTrigger>
              <SelectContent>
                {available.map((acl) => (
                  <SelectItem key={acl.id} value={acl.name}>
                    {acl.name} — {acl.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              disabled={!selected || !available.some((acl) => acl.name === selected)}
              onClick={() => {
                if (selected) changeNames([...names, selected])
                setSelected(null)
              }}
            >
              매핑 추가
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4 pt-4">
          <p className="text-muted-foreground text-xs">
            새 ACL 이름을 만들고 필요한 IP · 포트를 직접 삽입합니다.
          </p>
          <AclForm
            existing={allAcls}
            onSubmit={(acl) => {
              setCreated((prev) => [...prev, acl])
              changeNames([...names, acl.name])
              return undefined
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
