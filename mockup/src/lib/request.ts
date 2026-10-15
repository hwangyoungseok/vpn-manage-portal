import { requestKinds, type RequestItem, type RequestKind } from '@/data/mock'

// 신청 건 안의 구분별 사용자 수. 신청 구분 순서를 따른다.
export function kindCounts(items: RequestItem[]): { kind: RequestKind; count: number }[] {
  return requestKinds
    .map((kind) => ({ kind, count: items.filter((item) => item.kind === kind).length }))
    .filter((k) => k.count > 0)
}

// 요청 ACL의 첫 항목을 프로토콜://목적지:포트 형태로 줄여 보여준다.
export function policyText(item: RequestItem): string {
  const acl = item.requestedAcls.find((a) => a.action === '추가') ?? item.requestedAcls[0]
  const entry = acl?.entries[0]
  if (!acl || !entry) return item.kind === '삭제' ? '전체 해제' : '기존 정책 유지'
  const more = acl.entries.length + item.requestedAcls.length - 2
  return `${acl.action === '삭제' ? '- ' : ''}${entry.protocol}://${entry.destination}:${entry.port}${more > 0 ? ` 외 ${more}` : ''}`
}
