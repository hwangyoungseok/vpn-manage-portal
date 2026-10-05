# RemoteHub 진행 기록

> 최신 항목이 위로 온다. `/done`, `/blocked`가 이 파일 최상단에 기록을 추가한다.

## 2026-10-05 — planner

### 완료한 작업
- **결정: React는 목업 전용.** `mockup/`은 화면 디자인 합의용 프로토타입이고, 제품 구현은 ASP.NET Core MVC + Razor View로 확정했다.
- 반영 위치: `PLAN.md` (Phase 0 서문 · 원칙 · P2-9), `AGENTS.md` 프로젝트 개요, `docs/01-workflow.md` 에이전트 표, `frontend-dev` 에이전트 정의 (.claude/.agents 양쪽)
- `PLAN.md` 미결 사항에서 "React 정식 도입 여부" 항목 제거 (결정 완료)

### 다음 할 일
- **P0-16 목업 전체 흐름 점검 및 이해관계자 리뷰** — 남은 Phase 0 태스크
- 리뷰 후 P0-17(지적사항 반영) 또는 Phase 1 착수

### 이슈/참고
- P2-9는 "목업 이식"이 아니라 `mockup/`을 레퍼런스로 한 **MVC + Razor 재구현**이다. 목업 코드를 제품으로 옮기지 않는다.

## 2026-10-05 — frontend-dev

### 완료한 작업
- **P0-1 ~ P0-15 완료** — `mockup/`에 VPN 서비스 목업 웹사이트 구현
  - 스택: Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui (base-ui 기반)
  - 화면 11개 / 라우트 10개: 로그인, 대시보드, 신청 목록, 계정·정책 목록, 계정 상세,
    그룹사 관리, IP 대역·고정 IP, 삭제 사용자, 관리자·권한, 감사 로그, 월간 리포팅
  - 더미 데이터: `src/data/mock.ts` · 마스킹 규칙: `src/lib/format.ts`
  - 차트 팔레트는 `src/index.css`의 `--chart-1..4`로 교체 (shadcn 기본값이 무채색이라 범주 식별 불가)
- 검증: `npx tsc -b` 통과, `npm run build` 통과, 라이트/다크 전 화면 렌더 확인

### 다음 할 일
- **P0-16 목업 전체 흐름 점검 및 이해관계자 리뷰** — Phase 0의 마지막 태스크
- 리뷰에서 **React 정식 도입 여부**를 결정해야 Phase 2의 P2-9 방향이 확정된다

### 이슈/참고
- shadcn v4는 Radix가 아니라 **@base-ui/react** 기반이다. `asChild` 대신 `render` prop을 쓰고,
  Select의 `onValueChange`는 `string | null`을 넘긴다. 새 화면 작성 시 주의.
- recharts가 `react-is`를 peer로 요구해 별도 설치했다.
- 목업은 React인데 `AGENTS.md`·`docs/01-workflow.md`·`frontend-dev` 에이전트 정의는
  여전히 "ASP.NET Core MVC + Razor" 기준이다. P0-16 결정 후 일괄 정리가 필요하다.

## 2026-10-05 — planner

### 완료한 작업
- 하네스 구성: `.claude/agents/` 5종, `.claude/skills/` 12종 등록 (`.agents/`는 Codex용으로 유지)
- `CLAUDE.md`를 `@./AGENTS.md` import 문법으로 교체
- `.gitattributes` 추가 (텍스트 LF 통일, Windows 전용 파일만 CRLF)
- `PLAN.md` 초안 작성 — Phase 0(목업) ~ Phase 6(리포팅)

### 다음 할 일
- Phase 0 목업 착수

### 이슈/참고
- `docs/02.project-overview.md`가 빈 파일이고, `docs/03-architecture.md`·`docs/adr/README.md`는 존재하지 않는다. P1-1~P1-3에서 처리한다.
- `docs/01-workflow.md`의 worktree 기본 경로가 현재 사용자 환경과 다르다 (P1-5).
- 요구사항 미결 사항은 `PLAN.md` 최하단 표에 정리했다. Phase 3 착수 전 확정이 필요하다.
