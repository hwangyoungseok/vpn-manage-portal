// P0-15 개인정보 표시 규칙 (요구사항 §10).
// 이름 가운데를 마스킹한다. 2자는 마지막 글자, 3자 이상은 가운데 전체를 가린다.
export function maskName(name: string): string {
  if (name.length <= 1) return name
  if (name.length === 2) return `${name[0]}*`
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`
}

// 엑셀 다운로드에서 제외되는 개인정보 항목 (요구사항 §3).
export const excludedFromExport = ['이메일', '전화번호', '주소']

export function formatDiff(diff: number): string {
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `${diff}`
  return '0'
}

export function daysUntil(dateText: string, today = new Date('2026-10-05')): number {
  const target = new Date(dateText)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
