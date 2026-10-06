import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  FileBarChart,
  Globe2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ScrollText,
  ShieldCheck,
  Sun,
  Trash2,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useMockStore } from '@/data/use-mock-store'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  req: string
}

const nav: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { to: '/', label: '대시보드', icon: LayoutDashboard, req: '' },
      { to: '/requests', label: '신청 목록', icon: ClipboardList, req: '§2' },
      { to: '/accounts', label: '계정 · 정책', icon: Users, req: '§3' },
      { to: '/companies', label: '그룹사 관리', icon: Building2, req: '§4' },
      { to: '/ip-ranges', label: 'IP 대역 · 고정 IP', icon: Globe2, req: '§5 §6' },
      { to: '/deleted', label: '삭제 사용자', icon: Trash2, req: '§8' },
      { to: '/reports', label: '월간 리포팅', icon: FileBarChart, req: '§12' },
    ],
  },
  {
    label: '관리',
    items: [
      { to: '/admins', label: '관리자', icon: ShieldCheck, req: '§9' },
      { to: '/permissions', label: '권한', icon: KeyRound, req: '§9' },
      { to: '/audit', label: '감사 로그', icon: ScrollText, req: '§11' },
    ],
  },
]

function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return { dark, toggle: () => setDark((v) => !v) }
}

export function AppShell() {
  const { error, reset } = useMockStore()
  const { dark, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto flex max-w-[1600px]">
        {/* 사이드바 */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r bg-background transition-transform lg:sticky lg:top-0 lg:h-svh lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center gap-2 px-5">
            <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">RemoteHub</div>
              <div className="text-muted-foreground text-xs">VPN 관리</div>
            </div>
          </div>
          <Separator />
          <nav className="space-y-1 p-3">
            {nav.map((section, i) => (
              <div key={section.label ?? i} className={i > 0 ? 'pt-4' : undefined}>
                {section.label ? (
                  <div className="text-muted-foreground/70 px-3 pb-1 text-[11px] font-medium tracking-wide">
                    {section.label}
                  </div>
                ) : null}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                        )
                      }
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.req ? (
                        <span className="text-muted-foreground/60 text-[10px] tabular-nums">
                          {item.req}
                        </span>
                      ) : null}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="bg-muted/50 rounded-md p-3 text-xs leading-relaxed">
              <Badge variant="outline" className="mb-2">
                목업
              </Badge>
              <p className="text-muted-foreground">
                관리자 · ACL · 계정 정책은 이 브라우저에 저장됩니다. VPN·AD 연동은 없습니다.
              </p>
              <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => {
                if (window.confirm('추가·수정한 관리자, ACL, 계정 정책, 감사 로그를 기본 목업 데이터로 초기화하시겠습니까?')) {
                  if (!reset()) window.location.reload()
                }
              }}>목업 데이터 초기화</Button>
            </div>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}

        {/* 본문 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/80 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu className="size-4" />
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="테마 전환">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">홍길</AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-medium">홍길동</div>
                <div className="text-muted-foreground text-xs">Admin</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="로그아웃"
              render={<NavLink to="/login" />}
            >
              <LogOut className="size-4" />
            </Button>
          </header>
          <main className="min-w-0 flex-1 p-4 lg:p-6">
            {error ? <p role="alert" className="text-destructive mb-4 rounded-md border p-3 text-sm">{error}</p> : null}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
