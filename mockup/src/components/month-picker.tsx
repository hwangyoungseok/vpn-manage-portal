import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { monthsOf, reportYears } from '@/lib/report'

// 현황 화면 상단의 연 · 월 선택.
export function MonthPicker({
  year,
  month,
  onChange,
}: {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}) {
  function changeYear(next: number) {
    const months = monthsOf(next)
    onChange(next, Math.min(Math.max(month, months[0]), months[months.length - 1]))
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={String(year)} onValueChange={(v) => v && changeYear(Number(v))}>
        <SelectTrigger size="sm" className="w-[110px]" aria-label="연도">
          <SelectValue>{(v) => `${v}년`}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {reportYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}년
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(month)} onValueChange={(v) => v && onChange(year, Number(v))}>
        <SelectTrigger size="sm" className="w-[90px]" aria-label="월">
          <SelectValue>{(v) => `${v}월`}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {monthsOf(year).map((m) => (
            <SelectItem key={m} value={String(m)}>
              {m}월
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
