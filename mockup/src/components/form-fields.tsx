import type { ReactNode } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 조회 영역 · 편집 팝업에서 쓰는 라벨 + 입력 묶음.
export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">
        {required ? <span className="text-destructive mr-0.5">*</span> : null}
        {label}
      </span>
      {children}
    </div>
  )
}

export function Choice({
  label,
  value,
  onChange,
  options,
  empty,
  format = (v) => v,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  empty: [value: string, text: string]
  format?: (value: string) => string
  className?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? empty[0])}>
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue>{(v) => (v === empty[0] || v == null ? empty[1] : format(String(v)))}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={empty[0]}>{empty[1]}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {format(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
