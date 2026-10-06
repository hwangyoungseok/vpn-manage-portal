# RemoteHub 진행 기록

> 최신 항목이 위로 온다. `/done`, `/blocked`가 이 파일 최상단에 기록을 추가한다.

## 2026-10-06 15:11 — planner

### 완료한 작업
- P0-20: Legacy VPN 시연 확인 체크리스트 작성 (`docs/04-legacy-vpn-review-checklist.md`). 신규·변경·삭제/실패 시연 순서, 화면별 확인 질문, 미결 요구사항, 회의 결과와 후속 확인 기록 표를 정리했다.
- 미팅 일정: 2026-10-07 오전 10:00, Teams. 요구사항 참조와 문서 내부 링크 확인.

### 다음 할 일
- Legacy VPN 시연 후 확인 결과를 기록하고 P0-16 리뷰 결과 및 P0-17 목업 수정 범위를 정리한다.

### 이슈/참고
- 체크리스트 작성 완료이며, Legacy 운영 방식 확인과 이해관계자 리뷰 자체는 아직 진행 전이다.

## 2026-10-06 — frontend-dev

### 완료한 작업
- **P0-19 완료**: `npm run build`가 `dist/index.html` · `index.js` · `index.css` 세 파일만 생성하도록 변경 (`mockup/vite.config.ts`). HTML에 상대 경로로 JS·CSS를 참조하며, JS는 일반 스크립트(IIFE), 폰트는 CSS에 포함한다.
- 화면 이동을 `HashRouter`로 변경 (`mockup/src/App.tsx`). 파일 직접 열기와 세부 화면 새로고침을 지원하며 개발 서버의 HMR은 유지한다.
- 파일 전달·더블클릭 사용 방법, 해시 주소, 서버와 파일 저장소의 차이를 `mockup/README.md`에 기록.
- 검증: 빌드·타입 검사 통과, lint 오류 없음(기존 경고 6건). 세 파일을 공백이 포함된 별도 폴더에 복사해 Chrome `file://`로 실행. 관리자 추가·새로고침 유지, 그룹 ACL 생성·계정 매핑·감사 로그, 12개 화면, 폰트와 라이트/다크 표시 확인. 외부 HTTP 요청·리소스 로딩 실패·런타임 예외 없음. Vite 개발 모드와 해시 화면 이동도 확인.

### 다음 할 일
- P0-16 이해관계자 목업 리뷰. 전달 시 `mockup/dist/`의 세 파일을 함께 제공한다.

### 이슈/참고
- 직접 열 대상은 소스의 `mockup/index.html`이 아니라 빌드 결과 `mockup/dist/index.html`이다. 서버 접속과 파일 직접 열기의 브라우저 저장소는 별개이며 파일 위치 이동 시 데이터가 따라가지 않을 수 있다.

## 2026-10-06 — frontend-dev (작업 시작)

### 진행 중인 작업
- P0-19: HTML·JS·CSS를 별도 파일로 빌드하고 `file://`에서 화면 이동과 브라우저 저장이 동작하도록 변경한다.

### 다음 할 일
- 분리 빌드, 파일 직접 열기, 관리자·ACL 저장 유지와 개발 서버 확인.

## 2026-10-06 — frontend-dev

### 완료한 작업
- **P0-18 완료**: 관리자 추가·수정·삭제·잠김 해제와 그룹 ACL 추가·수정·삭제를 브라우저에 저장 (`mockup/src/data/mock-store.tsx`, `data/use-mock-store.ts`).
- 계정 상세에서 기존 ACL 매핑·해제 및 복수 항목의 새 ACL 생성 후 ‘변경 사항 적용’으로 함께 저장 (`pages/account-detail.tsx`, `components/acl-form.tsx`). 계정 목록과 그룹 ACL 화면에도 변경 반영.
- ACL 이름 변경 시 계정 매핑 갱신, 사용 중 ACL 삭제 방지, 마지막 Admin 삭제·역할 변경 방지, 중복 이름과 IP/CIDR·포트 입력 검증 (`lib/acl.ts`).
- 변경 내용을 감사 로그에 저장하고, 여러 탭의 변경 반영·저장 실패 안내·손상 데이터 대체·기본 데이터 초기화 구현. 사용 범위는 `mockup/README.md`에 기록.
- 검증: `npm run build` 통과, `npm run lint` 오류 없음(기존 경고 6건). 별도 Chrome 프로필에서 관리자·ACL CRUD, 계정 매핑/해제, 새로고침·화면 간 유지, 감사 로그, 중복·IP·포트 검증, 저장 실패/손상 데이터/초기화 확인. 추가로 잠김 해제, 마지막 Admin 보호, 다른 탭의 생성·삭제 반영 확인.

### 다음 할 일
- P0-16 전체 목업 흐름 및 이해관계자 리뷰.

### 이슈/참고
- 데이터는 동일 브라우저·접속 주소의 `remotehub.mock.v1` 키에만 저장하며 서버·VPN·AD와 연동하지 않는다. 로그인·MFA는 기존 단계 전환 목업이고, 비밀번호는 저장하거나 감사 로그에 기록하지 않는다.
- 신청·그룹사 등록·IP·다운로드·기간 연장 등 나머지 기능은 기존 목업 범위이다.

## 2026-10-06 — frontend-dev (작업 시작)

### 진행 중인 작업
- P0-18: 관리자·ACL CRUD와 계정별 정책 적용을 `localStorage`에 연결한다. 더미 시드와 디자인 프로토타입 범위는 유지한다.

### 다음 할 일
- 저장·새로고침·화면 간 반영과 입력 검증 확인, 빌드 및 lint 실행.

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
