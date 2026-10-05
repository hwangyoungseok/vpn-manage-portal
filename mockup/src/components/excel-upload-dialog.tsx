import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const requiredColumns = [
  '계정',
  '이름',
  '그룹사',
  '사용자 구분',
  '근거 시스템',
  '근거 번호',
]

// P0-6 엑셀 업로드 (요구사항 §2).
// 목업이므로 파일을 읽거나 전송하지 않는다. 선택한 파일 이름만 보여준다.
export function ExcelUploadDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setFile(null)
    setDragging(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Upload className="size-4" />
        엑셀 업로드
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>엑셀 업로드</DialogTitle>
          <DialogDescription>
            연계되지 않은 신청을 일괄 등록합니다. 업로드 파일은 암호화 해제 후 처리됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="flex items-center gap-3 rounded-md border p-3">
              <FileSpreadsheet className="text-muted-foreground size-8 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={reset} aria-label="선택 해제">
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                setFile(e.dataTransfer.files?.[0] ?? null)
              }}
              className={cn(
                'grid w-full place-items-center gap-2 rounded-md border border-dashed p-8 text-center transition-colors',
                dragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:bg-muted/50',
              )}
            >
              <FileSpreadsheet className="text-muted-foreground size-8" />
              <span className="text-sm">파일을 끌어다 놓거나 클릭해 선택하세요</span>
              <span className="text-muted-foreground text-xs">.xlsx · .xls</span>
            </button>
          )}

          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-xs font-medium">필수 컬럼</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {requiredColumns.map((c) => (
                <span key={c} className="bg-background rounded border px-1.5 py-0.5 text-xs">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              근거 시스템과 근거 번호가 없는 행은 등록되지 않습니다. 업로드 결과는 감사 로그에
              기록됩니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button disabled={!file} onClick={() => setOpen(false)}>
            업로드
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
