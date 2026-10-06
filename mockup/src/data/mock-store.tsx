import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { accounts, acls, admins, auditLogs } from './mock'
import type { Account, Acl, AdminUser, AuditLog } from './mock'
import { validateAcl } from '@/lib/acl'
import { MockStoreContext } from './use-mock-store'

const STORAGE_KEY = 'remotehub.mock.v1'
type Data = { admins: AdminUser[]; acls: Acl[]; accounts: Account[]; auditLogs: AuditLog[] }
type Result = string | undefined
const seeds: Data = { admins, acls, accounts, auditLogs }

// Validate persisted rows against the seed shape before any page consumes them.
function hasShape(value: unknown, sample: unknown): boolean {
  if (sample === null) return value === null || typeof value === 'string'
  if (Array.isArray(sample)) return Array.isArray(value) && value.every((item) => hasShape(item, sample[0]))
  if (typeof sample === 'object') {
    return value !== null && typeof value === 'object' && Object.entries(sample).every(([key, field]) =>
      hasShape((value as Record<string, unknown>)[key], field))
  }
  return typeof value === typeof sample
}

function read(): { data: Data; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { data: structuredClone(seeds) }
    const parsed: unknown = JSON.parse(raw)
    if (!hasShape(parsed, seeds)) throw new Error('Invalid mock data')
    return { data: parsed as Data }
  } catch {
    return { data: structuredClone(seeds), error: '저장된 목업 데이터를 읽을 수 없어 기본 데이터를 표시합니다. 브라우저 저장소 설정을 확인하거나 목업 데이터를 초기화하세요.' }
  }
}

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(read)
  const [data, setData] = useState(initial.data)
  const [error, setError] = useState(initial.error)
  const current = useRef(data)

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return
      const next = read()
      current.current = next.data
      setData(next.data)
      setError(next.error)
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function commit(next: Data, log?: Pick<AuditLog, 'action' | 'target' | 'detail'>): Result {
    if (log) next = { ...next, auditLogs: [{
      ...log, id: crypto.randomUUID(), at: new Date().toLocaleString('sv-SE'),
      actor: '홍길동', role: 'Admin', ip: '127.0.0.1', result: '성공',
    }, ...next.auditLogs] }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      current.current = next
      setData(next)
      setError(undefined)
    } catch {
      const message = '브라우저 저장소에 저장하지 못했습니다. 저장소 용량과 브라우저 설정을 확인하세요.'
      setError(message)
      return message
    }
  }

  function saveAdmin(admin: AdminUser): Result {
    const prev = current.current
    const old = prev.admins.find((item) => item.id === admin.id)
    if (!admin.account.trim() || !admin.name.trim()) return '계정과 이름을 입력하세요.'
    if (prev.admins.some((item) => item.id !== admin.id && item.account.toLowerCase() === admin.account.toLowerCase())) return '이미 등록된 관리자 계정입니다.'
    if (old?.role === 'Admin' && admin.role !== 'Admin' && prev.admins.filter((item) => item.role === 'Admin').length === 1) return 'Admin 역할의 관리자를 한 명 이상 유지해야 합니다.'
    return commit({ ...prev, admins: old ? prev.admins.map((item) => item.id === admin.id ? admin : item) : [...prev.admins, admin] }, {
      action: old ? '관리자 수정' : '관리자 생성', target: admin.account,
      detail: old ? `역할 ${old.role} → ${admin.role}, MFA ${admin.mfa ? '사용' : '미사용'}, 잠김 ${admin.locked ? '유지' : '없음'}` : `역할 ${admin.role}, MFA ${admin.mfa ? '사용' : '미사용'}`,
    })
  }

  function deleteAdmin(id: string): Result {
    const prev = current.current
    const admin = prev.admins.find((item) => item.id === id)
    if (!admin) return '관리자를 찾을 수 없습니다.'
    if (admin.role === 'Admin' && prev.admins.filter((item) => item.role === 'Admin').length === 1) return '마지막 Admin 관리자는 삭제할 수 없습니다.'
    return commit({ ...prev, admins: prev.admins.filter((item) => item.id !== id) }, { action: '관리자 삭제', target: admin.account, detail: `${admin.name} 관리자 삭제` })
  }

  function saveAcl(acl: Acl): Result {
    const prev = current.current
    const validation = validateAcl(acl, prev.acls)
    if (validation) return validation
    const old = prev.acls.find((item) => item.id === acl.id)
    return commit({ ...prev,
      acls: old ? prev.acls.map((item) => item.id === acl.id ? acl : item) : [...prev.acls, acl],
      accounts: old ? prev.accounts.map((item) => ({ ...item, acls: item.acls.map((name) => name === old.name ? acl.name : name) })) : prev.accounts,
    }, { action: old ? 'ACL 수정' : 'ACL 생성', target: acl.name, detail: `${old ? `${old.name} → ${acl.name}, ` : ''}항목 ${acl.entries.length}개` })
  }

  function deleteAcl(id: string): Result {
    const prev = current.current
    const acl = prev.acls.find((item) => item.id === id)
    if (!acl) return 'ACL을 찾을 수 없습니다.'
    if (prev.accounts.some((item) => item.acls.includes(acl.name))) return '계정에 적용 중인 ACL입니다. 계정 정책에서 매핑을 제거한 뒤 삭제하세요.'
    return commit({ ...prev, acls: prev.acls.filter((item) => item.id !== id) }, { action: 'ACL 삭제', target: acl.name, detail: '미사용 ACL 삭제' })
  }

  function savePolicies(accountId: string, names: string[], created: Acl[]): Result {
    const prev = current.current
    const account = prev.accounts.find((item) => item.id === accountId)
    if (!account) return '계정을 찾을 수 없습니다.'
    const nextAcls = [...prev.acls]
    for (const acl of created) {
      const validation = validateAcl(acl, nextAcls)
      if (validation) return validation
      if (nextAcls.some((item) => item.id === acl.id)) return '이미 등록된 ACL입니다.'
      nextAcls.push(acl)
    }
    if (names.some((name) => !nextAcls.some((acl) => acl.name === name))) return '변경된 ACL이 있습니다. 페이지를 새로고침하고 다시 선택하세요.'
    return commit({ ...prev, acls: nextAcls, accounts: prev.accounts.map((item) => item.id === accountId ? { ...item, acls: [...new Set(names)] } : item) }, {
      action: '정책 변경', target: account.account, detail: `ACL: ${account.acls.join(', ') || '없음'} → ${names.join(', ') || '없음'}${created.length ? ` (신규 ACL ${created.map((acl) => acl.name).join(', ')})` : ''}`,
    })
  }

  return <MockStoreContext.Provider value={{ ...data, error, saveAdmin, deleteAdmin, saveAcl, deleteAcl, savePolicies, reset: () => commit(structuredClone(seeds)) }}>{children}</MockStoreContext.Provider>
}
