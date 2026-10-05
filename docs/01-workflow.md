# RemoteHub 개발 워크플로우

## 에이전트 워크플로우

> **새 세션을 시작하면 반드시 `PLAN.md`와 `PROGRESS.md`를 먼저 읽고 현재 상황을 파악한 뒤 작업을 시작한다.**

### PLAN.md — 작업 계획
- 현재 진행 중인 Phase와 남은 태스크 목록을 관리한다.
- 각 태스크는 담당자(에이전트), 상태, 의존 관계를 명시한다.
- 새로운 태스크가 생기면 PLAN.md에 추가하고, 완료/변경 시 즉시 업데이트한다.
- 형식:
  ```
  ## Phase N: 제목
  | 태스크 | 담당 | 상태 | 의존 | 비고 |
  |--------|------|------|------|------|
  | 태스크 설명 | agent-id | pending/in-progress/done/blocked | 선행 태스크 | 메모 |
  ```

### PROGRESS.md — 진행 기록
- 각 에이전트가 작업을 시작/완료할 때마다 기록한다.
- 최신 항목이 위로 오도록 역순으로 작성한다.
- 다음 에이전트가 읽었을 때 "지금 어디까지 됐고, 무엇을 해야 하는지" 즉시 파악할 수 있어야 한다.
- 형식:
  ```
  ## YYYY-MM-DD HH:MM — agent-id
  ### 완료한 작업
  - 작업 내용 (관련 파일 경로 포함)
  ### 다음 할 일
  - 다음 에이전트가 이어서 해야 할 작업
  ### 이슈/참고
  - 발견된 문제, 결정 사항, 주의점
  ```

### 에이전트 작업 규칙
1. **시작**: `/sync`로 컨텍스트 파악 (또는 수동으로 PLAN.md → PROGRESS.md 읽기)
2. **레퍼런스 확인**: 태스크에 관련된 기존 조사 자료가 있는지 `/ref`로 검색
3. **태스크 선택**: `/next`로 다음 수행 가능한 태스크 확인
4. **작업 중**: PLAN.md 해당 태스크 상태를 `in-progress`로 변경
5. **완료 시**: `/done <태스크명>`으로 완료 처리
6. **블로커 발생 시**: `/blocked <태스크명> <이유>`로 블로커 기록
7. **조사 완료 시**: 새로 알게 된 기술 정보는 `/save-ref`로 반드시 저장
8. **전체 워크플로우**: `/implement-task`로 선택→구현→검증→기록까지 한번에 수행

### 사용 가능한 스킬 (Claude Code: `.claude/skills/` · Codex: `.agents/skills/`)

| 스킬 | 용도 | 예시 |
|------|------|------|
| `/sync` | 현재 프로젝트 상황 요약 | `/sync` |
| `/next` | 다음 수행 가능한 태스크 제안 | `/next` |
| `/done` | 태스크 완료 처리 + 기록 | `/done Ldap 인증 구현` |
| `/blocked` | 태스크 블로커 기록 | `/blocked Ldap 서버 연동 이슈` |
| `/review` | 코드 리뷰 (보안, 버그, 컨벤션) | `/review` 또는 `/review src/` |
| `/test` | 테스트 실행 + 결과 요약 | `/test backend` 또는 `/test all` |
| `/setup-check` | 개발 환경 점검 | `/setup-check` |
| `/implement-task` | 태스크 풀 워크플로우 | `/implement-task Ldap 로그인` |
| `/branch` | feature 브랜치 + worktree 생성 | `/branch feat/ldap-login` |
| `/pr` | PR 생성 | `/pr` |
| `/ref` | 레퍼런스 검색/조회 | `/ref gmail oauth`, `/ref --tag api`, `/ref --list` |
| `/save-ref` | 조사 결과를 레퍼런스로 저장 | `/save-ref f5 VPN API 조사 결과` |

### 서브에이전트 (Claude Code: `.claude/agents/` · Codex: `.agents/agents/`)

ASP.NET Core, EF Core, SQL Server 기반의 계층형 DDD 모놀리식 구조에 맞춰 태스크를 전문 에이전트에게 위임한다. 병렬 작업은 담당 파일과 의존 관계가 분리된 경우에 수행한다.

| 에이전트 | 역할 | 사용 가능한 스킬 | 병렬 가능 |
|----------|------|-----------------|-----------|
| **planner** | 계층별 태스크 분해/할당, 의존 관계 조율, PLAN.md 관리 | sync, next, done, blocked, ref | - |
| **backend-dev** | ASP.NET Core API, 도메인·애플리케이션 로직, EF Core 매핑·마이그레이션, SQL Server 연동 구현 | ref, done, blocked, review, test | API 계약 확정 후 frontend-dev와 병렬 |
| **frontend-dev** | VPN 관리 화면, 사용자 입력 검증, 백엔드 API 연동 구현. UI 기술은 프로젝트에서 확정한 방식을 따른다 | ref, done, blocked, review, test | API 계약 확정 후 backend-dev와 병렬 |
| **researcher** | .NET 기술, LDAP 인증 및 VPN 연동 API 조사, references/ 저장 | ref, save-ref | 조사 결과에 의존하지 않는 작업과 병렬 |
| **reviewer** | 계층 간 의존 관계, 인증·권한, EF Core 쿼리·마이그레이션, 테스트 검토 (읽기 전용) | ref, review | - |

공유 DTO와 API 계약은 구현 전에 합의한다. 도메인 모델, DbContext, EF Core 마이그레이션 등 서로 영향을 주는 변경은 담당자를 정해 순서대로 진행한다.

#### 병렬 실행 패턴

```
# 패턴 1: 조사 + 기존 코드 탐색 병렬, 결과 확인 후 구현
researcher(LDAP 인증·VPN 연동 API 조사) ─┐
                                         ├→ backend-dev(ASP.NET Core 연동 구현)
backend-dev(기존 도메인·연동 코드 탐색) ─┘

# 패턴 2: API 계약 확정 후 백엔드 + 관리 화면 병렬
planner(API 계약·담당 파일 합의)
  ├→ backend-dev(API·애플리케이션 로직·EF Core 구현) ─┐
  └→ frontend-dev(VPN 관리 화면·API 연동 구현) ──────┴→ 통합 검증 → reviewer(리뷰) → planner(기록)

# 패턴 3: 풀 파이프라인 (/implement-task)
planner(계층별 계획) → researcher(필요한 조사) → API 계약 확정
  → backend-dev + frontend-dev(독립 작업 병렬 구현)
  → dotnet build / dotnet test + 관리 화면 검증 → reviewer(리뷰) → planner(기록)
```

## Git 워크플로우 (GitHub Flow + Worktree)

- **main** 브랜치는 항상 배포 가능한 상태를 유지한다.
- 모든 작업은 feature 브랜치에서 진행하고 PR로 병합한다.
- git worktree를 사용하여 브랜치별 독립 디렉토리에서 작업한다.
- worktree 기본 경로: `C:/Users/rlarb/coding/.worktrees/`

### 브랜치 네이밍
- `feat/<설명>` — 새 기능
- `fix/<설명>` — 버그 수정
- `refactor/<설명>` — 리팩토링
- `docs/<설명>` — 문서

### 작업 플로우
1. `/branch feat/기능명` → 브랜치 + worktree 생성
2. worktree 디렉토리에서 작업
3. 커밋 + push
4. `/pr` → PR 생성
5. 리뷰 후 main에 병합
