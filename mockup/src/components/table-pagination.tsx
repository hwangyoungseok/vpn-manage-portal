import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 표 하단 페이지 이동. 레거시 화면의 "페이지 n / m · 보기 a - b / c" 배치를 따른다.
export function TablePagination({
  page,
  pages,
  size,
  total,
  onPage,
  onSize,
}: {
  page: number
  pages: number
  size: number
  total: number
  onPage: (page: number) => void
  onSize: (size: number) => void
}) {
  const from = total === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, total)
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-2">
      <span className="hidden sm:block sm:w-24" />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => onPage(1)} aria-label="첫 페이지">
          <ChevronsLeft />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="이전 페이지">
          <ChevronLeft />
        </Button>
        <span className="text-muted-foreground px-2 text-xs tabular-nums">
          페이지 {page} / {pages}
        </span>
        <Button variant="ghost" size="icon-sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="다음 페이지">
          <ChevronRight />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled={page >= pages} onClick={() => onPage(pages)} aria-label="마지막 페이지">
          <ChevronsRight />
        </Button>
        <Select value={String(size)} onValueChange={(v) => onSize(Number(v ?? 5))}>
          <SelectTrigger size="sm" className="ml-1 w-[72px]" aria-label="페이지당 행 수">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span className="text-muted-foreground text-xs tabular-nums sm:w-24 sm:text-right">
        보기 {from} - {to} / {total}
      </span>
    </div>
  )
}
