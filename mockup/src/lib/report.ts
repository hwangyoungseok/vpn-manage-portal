import { reportFirst, reportLatest } from '@/data/mock'

// 조회 가능한 연도와, 연도별로 선택 가능한 월 (시작월 이전 · 기준월 이후 제외).
export const reportYears = Array.from(
  { length: reportLatest.year - reportFirst.year + 1 },
  (_, i) => reportLatest.year - i,
)

export function monthsOf(year: number): number[] {
  const from = year === reportFirst.year ? reportFirst.month : 1
  const to = year === reportLatest.year ? reportLatest.month : 12
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}
