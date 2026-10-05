import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  requirement,
  actions,
}: {
  title: string
  description?: string
  requirement?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {requirement ? (
            <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[11px]">
              요구사항 {requirement}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
