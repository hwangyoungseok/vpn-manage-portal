import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, ShieldCheck, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

// P0-4 로그인 화면 목업. 인증 로직은 없고 단계 전환만 보여준다 (요구사항 §9, §10).
export function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const navigate = useNavigate()

  return (
    <div className="bg-muted/40 grid min-h-svh place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">RemoteHub</div>
            <div className="text-muted-foreground text-xs">VPN 관리 콘솔</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {step === 'credentials' ? '관리자 로그인' : '2단계 인증'}
            </CardTitle>
            <CardDescription>
              {step === 'credentials'
                ? '등록된 관리자 계정으로 로그인합니다.'
                : 'OTP 앱에 표시된 6자리 코드를 입력하세요.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'credentials' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="account">계정</Label>
                  <Input id="account" placeholder="admin.hong" defaultValue="admin.hong" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input id="password" type="password" defaultValue="mockpassword" />
                  <p className="text-muted-foreground text-xs">
                    8자 이상, 소문자 · 대문자 · 특수문자 중 3종 이상 포함
                  </p>
                </div>
                <Button className="w-full" onClick={() => setStep('mfa')}>
                  <KeyRound className="size-4" />
                  로그인
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">인증 코드</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-lg tracking-[0.4em]"
                  />
                </div>
                <Button className="w-full" onClick={() => navigate('/')}>
                  <Smartphone className="size-4" />
                  인증 후 입장
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('credentials')}
                >
                  이전 단계
                </Button>
              </>
            )}

            <Separator />
            <p className="text-muted-foreground text-xs leading-relaxed">
              접속 허용 IP로 등록된 네트워크에서만 로그인할 수 있습니다. 비밀번호 5회 오류 시
              계정이 잠깁니다.
            </p>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          목업 화면 — 아무 값이나 입력해도 통과합니다.
        </p>
      </div>
    </div>
  )
}
