import type { GroupIp } from '@/data/mock'

const ipv4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

export function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, part) => acc * 256 + Number(part), 0)
}

// 그룹 IP 저장 전 검증. 같은 회사의 대역은 사용자 구분끼리 공유할 수 있지만,
// 다른 회사 대역과 겹치거나 같은 회사 · 사용자 구분이 중복되면 안 된다.
export function validateGroupIp(item: GroupIp, existing: GroupIp[]): string | undefined {
  if (!item.name.trim()) return '이름을 입력하세요.'
  if (!item.company) return '회사를 선택하세요.'
  const ips = [item.rangeStart, item.rangeEnd, item.manualStart, item.manualEnd]
  if (ips.some((ip) => !ipv4.test(ip))) return 'IP대역과 수동IP대역을 IPv4 형식으로 입력하세요.'
  const [start, end, manualStart, manualEnd] = ips.map(ipToNumber)
  if (start > end) return 'IP대역의 시작 IP가 끝 IP보다 큽니다.'
  if (manualStart > manualEnd) return '수동IP대역의 시작 IP가 끝 IP보다 큽니다.'
  if (manualStart < start || manualEnd > end) return '수동IP대역은 IP대역 안에 있어야 합니다.'
  const others = existing.filter((other) => other.id !== item.id)
  if (others.some((other) => other.company === item.company && other.userType === item.userType))
    return `${item.company} · ${item.userType} 대역이 이미 있습니다.`
  const clash = others.find(
    (other) =>
      other.company !== item.company &&
      ipToNumber(other.rangeStart) <= end &&
      start <= ipToNumber(other.rangeEnd),
  )
  if (clash) return `${clash.company}의 ${clash.name} 대역과 겹칩니다.`
}
