import type { Acl } from '@/data/mock'

export function validateAcl(acl: Acl, existing: Acl[]): string | undefined {
  if (!/^[A-Za-z0-9_-]+$/.test(acl.name)) return 'ACL 이름은 영문, 숫자, 밑줄, 하이픈으로 입력하세요.'
  if (existing.some((item) => item.id !== acl.id && item.name.toLowerCase() === acl.name.toLowerCase())) {
    return '이미 사용 중인 ACL 이름입니다.'
  }
  if (!acl.entries.length) return 'ACL 항목을 한 개 이상 추가하세요.'
  for (const entry of acl.entries) {
    const parts = entry.destination.split('/')
    const octets = parts[0].split('.')
    if (parts.length > 2 || octets.length !== 4 || octets.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)
      || (parts.length === 2 && (!/^\d{1,2}$/.test(parts[1]) || Number(parts[1]) > 32))) {
      return '목적지는 올바른 IPv4 주소 또는 CIDR 대역으로 입력하세요.'
    }
    if (!['TCP', 'UDP', 'ICMP'].includes(entry.protocol)) return '프로토콜을 선택하세요.'
    if (entry.protocol !== 'ICMP' && entry.port !== 'any') {
      const valid = entry.port.split(',').every((part) => {
        if (!/^\d{1,5}(-\d{1,5})?$/.test(part)) return false
        const [start, end = start] = part.split('-').map(Number)
        return start >= 1 && end <= 65535 && start <= end
      })
      if (!valid) return '포트는 1~65535, 쉼표 목록, 범위(예: 8000-8080), 또는 any로 입력하세요.'
    }
  }
  const keys = acl.entries.map((entry) => `${entry.destination}|${entry.port}|${entry.protocol}`)
  if (new Set(keys).size !== keys.length) return '동일한 ACL 항목이 중복되어 있습니다.'
}
