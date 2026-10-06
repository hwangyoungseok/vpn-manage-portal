# RemoteHub 작업 계획
---

## Phase 0: VPN 서비스 목업 웹사이트

`mockup/`에 Vite + React + TypeScript + Tailwind v4 + shadcn/ui로 클릭 가능한 목업을 만든다.
데이터는 `src/data/mock.ts`의 더미 데이터로 시작하며, 관리자·ACL·계정 정책·감사 로그 변경은 브라우저 `localStorage`에 저장한다. 백엔드·DB·외부 연동은 붙이지 않는다.
이 목업은 **화면을 그려 합의하기 위한 프로토타입**이다. 제품 코드로 이어가지 않으며, 본 구현은 Phase 1 이후 ASP.NET Core MVC + Razor View로 별도 진행한다. React는 `mockup/` 밖으로 나가지 않는다.

| 태스크 | 담당 | 상태 | 의존 | 비고 |
|--------|------|------|------|------|
| P0-1 Vite + React + TS 스캐폴딩, Tailwind v4 · shadcn/ui 초기화 | frontend-dev | done | - | `mockup/` |
| P0-2 공통 레이아웃·사이드바 내비게이션·테마(라이트/다크) 전환 | frontend-dev | done | P0-1 | `components/layout/app-shell.tsx` |
| P0-3 더미 데이터 제공자 (사용자·정책·그룹사·IP·로그 시드) | frontend-dev | done | P0-1 | `data/mock.ts` |
| P0-4 로그인 화면 목업 (ID/PW + MFA 단계, 인증 로직 없음) | frontend-dev | done | P0-2 | 요구사항 §9 §10 |
| P0-5 대시보드 (계정 수·만료 임박·신청 대기·잠김 카드) | frontend-dev | done | P0-2, P0-3 | |
| P0-6 신청 목록 화면 (필터, 일괄 선택, 엑셀 업로드 UI) | frontend-dev | done | P0-2, P0-3 | 요구사항 §2 |
| P0-7 계정·정책 목록 화면 (검색/필터, 구분 배지, 엑셀 다운로드) | frontend-dev | done | P0-2, P0-3 | 요구사항 §3 |
| P0-8 계정 상세·정책 편집 (ACL 기존 매핑 / 신규 생성 2가지 방식) | frontend-dev | done | P0-7 | 요구사항 §1.2 |
| P0-9 그룹사 관리 화면 (목록·등록 다이얼로그·그룹 ACL) | frontend-dev | done | P0-2, P0-3 | 요구사항 §4 |
| P0-10 IP 대역 관리 + 고정 IP 할당 화면 | frontend-dev | done | P0-9 | 요구사항 §5 §6 |
| P0-11 삭제 사용자 목록 화면 (삭제 사유 구분 표기) | frontend-dev | done | P0-2, P0-3 | 요구사항 §8 |
| P0-12 관리 메뉴 — 관리자(계정 추가·수정 모달) / 권한(역할·매트릭스) 분리 | frontend-dev | done | P0-2, P0-3 | 요구사항 §9 |
| P0-13 감사 로그 조회 화면 (관리자 행위 내역) | frontend-dev | done | P0-2, P0-3 | 요구사항 §11 |
| P0-14 월간 리포팅 화면 (회사별 현황·변경 관리 현황·추이 차트) | frontend-dev | done | P0-2, P0-3 | 요구사항 §12 |
| P0-15 이름 마스킹·개인정보 비표시 규칙 반영 | frontend-dev | done | P0-7 | 요구사항 §10, `lib/format.ts` |
| P0-16 목업 전체 흐름 점검 및 이해관계자 리뷰 피드백 정리 | planner | pending | P0-1~P0-15 | 리뷰 결과를 요구사항에 반영 |
| P0-17 리뷰 지적사항 반영 | frontend-dev | pending | P0-16 | 리뷰 후 범위 확정 |
| P0-18 관리자·ACL 관리 및 계정 정책을 localStorage로 동작시킴 | frontend-dev | done | P0-8, P0-9, P0-12, P0-13 | 브라우저 영속화, 감사 로그, 초기화, 입력 검증·브라우저 흐름 검증 완료 |
| P0-19 HTML·JS·CSS 분리 배포 및 HTML 직접 열기 지원 | frontend-dev | done | P0-18 | `dist/index.html` · `index.js` · `index.css`, 해시 라우팅, 파일 직접 열기·저장 검증 완료 |

### 목업 실행

```
cd mockup && npm install && npm run dev   # http://localhost:5173
```

파일 배포: `cd mockup && npm run build` 후 `dist/index.html` · `index.js` · `index.css`를
같은 폴더에 전달한다. `index.html` 직접 열기 지원, 화면 주소는 `#/admins` 등 해시 라우팅이다.

검증: `npx tsc -b` 통과, `npm run build` 통과, 전 화면 렌더 확인(라이트/다크).
차트 범주 색은 `src/index.css`의 `--chart-1..4`이며 dataviz 검증 스크립트를 두 모드 모두 통과했다.

## Phase 1: 기반 설계 및 문서 정비

목업 리뷰로 범위가 확정된 뒤, 구현 전에 아키텍처와 결정 이력을 문서로 고정한다.

| 태스크 | 담당 | 상태 | 의존 | 비고 |
|--------|------|------|------|------|
| P1-1 docs/02.project-overview.md 작성 (현재 빈 파일) | planner | pending | - | AGENTS.md가 참조 중 |
| P1-2 docs/03-architecture.md 작성 (계층형 DDD 레이어·패키지 구조) | planner | pending | P0-16 | AGENTS.md 참조, 파일 없음 |
| P1-3 docs/adr/README.md + ADR 템플릿 작성 | planner | pending | - | AGENTS.md 참조, 파일 없음 |
| P1-4 AGENTS.md 문서 참조 맵 경로 오류 수정 | planner | pending | - | 01.workflows.md → 01-workflow.md |
| P1-5 worktree 기본 경로 현재 환경에 맞게 수정 | planner | pending | - | docs/01-workflow.md의 경로가 다른 사용자 기준 |
| P1-6 솔루션 레이어 분리 (Domain / Application / Infrastructure / Web) | backend-dev | pending | P1-2 | Phase 0 Web 프로젝트를 기준으로 분해 |
| P1-7 코딩 컨벤션·네이밍 규칙 문서화 | planner | pending | P1-2 | |
| P1-8 CI 파이프라인 구성 (dotnet build / test) | backend-dev | pending | P1-6 | |
| P1-9 테스트 전략 수립 (단위/통합 범위, 테스트 프로젝트 생성) | backend-dev | pending | P1-6 | |

---

## Phase 2: 핵심 도메인 및 영속화

| 태스크 | 담당 | 상태 | 의존 | 비고 |
|--------|------|------|------|------|
| P2-1 도메인 모델링 (계정, 정책/ACL, 그룹사, IP 대역, 사용자 구분) | backend-dev | pending | P1-6 | |
| P2-2 사용자 구분별 기한 정책 도메인 규칙 구현 | backend-dev | pending | P2-1 | 요구사항 §7 표 기준, 구분 추가 가능하도록 |
| P2-3 EF Core DbContext·엔티티 매핑 | backend-dev | pending | P2-1 | 담당자 단독 진행 (충돌 위험) |
| P2-4 초기 마이그레이션 + SQL Server 로컬 구성 | backend-dev | pending | P2-3 | |
| P2-5 계정 CRUD 애플리케이션 서비스 | backend-dev | pending | P2-3 | |
| P2-6 정책/ACL CRUD 애플리케이션 서비스 | backend-dev | pending | P2-3 | |
| P2-7 그룹사 관리 + 그룹사별 사용자·정책 분리 | backend-dev | pending | P2-3 | 요구사항 §4 |
| P2-8 IP 대역 관리 + 고정 IP 할당 로직 | backend-dev | pending | P2-3 | 요구사항 §5, §6 |
| P2-9 관리 화면을 MVC + Razor로 구현 (`mockup/`을 디자인 레퍼런스로 사용) | frontend-dev | pending | P2-5, P2-6 | 목업은 이식 대상이 아닌 참조용 |

---

## Phase 3: 외부 시스템 연동

| 태스크 | 담당 | 상태 | 의존 | 비고 |
|--------|------|------|------|------|
| P3-1 VPN 장비 API 조사 및 레퍼런스 저장 | researcher | pending | - | `/save-ref` 필수 |
| P3-2 AD/LDAP 연동 방식 조사 및 레퍼런스 저장 | researcher | pending | - | `/save-ref` 필수 |
| P3-3 신청 시스템 EAI/API 연동 항목 정의 | planner | pending | - | 요구사항 §1.1, 항목 미정 |
| P3-4 신청 시스템 연동 구현 | backend-dev | pending | P3-3, P2-5 | |
| P3-5 VPN 계정 생성·정책 생성 연동 구현 | backend-dev | pending | P3-1, P2-6 | ACL 신규 생성 / 기존 매핑 두 방식 |
| P3-6 VPN 계정 정책 수정·삭제 연동 구현 | backend-dev | pending | P3-5 | |
| P3-7 그룹 ACL 신규·수정·삭제 구현 | backend-dev | pending | P3-5 | 신청 시스템과 ACL 이름 연계 |
| P3-8 AD 계정 생성·삭제·OU 처리 구현 | backend-dev | pending | P3-2, P2-5 | OU 신규 생성 포함 |
| P3-9 AD memberOf 추가·삭제, attribute 반영 구현 | backend-dev | pending | P3-8 | IP 주소, OTP 사용 여부 |
| P3-10 임의 비밀번호 생성 로직 구현 | backend-dev | pending | P3-8 | |
| P3-11 연동 정상 반영 여부 확인 로직 (VPN/AD 공통) | backend-dev | pending | P3-5, P3-8 | 요구사항 §1.2, §1.3 |
| P3-12 이메일 발송 연동 (생성 완료, 삭제, 삭제 예고 7일/1일 전) | backend-dev | pending | P2-5 | 요구사항 §1.4 |

---

## Phase 4: 배치 및 계정 수명 관리

| 태스크 | 담당 | 상태 | 의존 | 비고 |
|--------|------|------|------|------|
| P4-1 접속 이력 수집 배치 (전일 접속·마지막 접속일) | backend-dev | pending | P3-5 | 요구사항 §1.2 |
| P4-2 배치 실행 실패 감지 및 재확인 로직 | backend-dev | pending | P4-1 | 미실행 배치 재처리 |
| P4-3 계정 기한 만료 처리 배치 | backend-dev | pending | P2-2 | |
| P4-4 장기 미접속 계정 삭제 배치 | backend-dev | pending | P4-1, P2-2 | 구분별 기준 상이 |
| P4-5 만료·삭제 사용자 통보 연계 | backend-dev | pending | P4-3, P3-12 | 요구사항 §7 |
| P4-6 삭제 사유 기록 및 조회 (요청/만료/미사용) | backend-dev | pending | P4-4 | 요구사항 §8, §12.1 |

---

## Phase 5: 인증·권한·보안

| 태스크 | 담당 | 상태 | 의존 | 비고 |
|--------|------|------|------|------|
| P5-1 관리자 인증 구현 (로그인, 비밀번호 암호화) | backend-dev | pending | P2-3 | 요구사항 §9, §10 |
| P5-2 비밀번호 정책 (8자 이상, 소/대문자·특수문자 3종 이상) | backend-dev | pending | P5-1 | |
| P5-3 로그인 5회 실패 계정 잠김 + 타 관리자 해제 | backend-dev | pending | P5-1 | |
| P5-4 역할 기반 권한 분리 (Admin / 운영자) | backend-dev | pending | P5-1 | 운영자는 관리자 생성·삭제 불가 |
| P5-5 MFA 적용 | backend-dev | pending | P5-1 | 요구사항 §10 |
| P5-6 사용자 이름 가운데 마스킹 공통 처리 | backend-dev | pending | P2-1 | 요구사항 §10 |
| P5-7 관리자 행위 감사 로깅 (대상·변경 내용) | backend-dev | pending | P5-4 | 요구사항 §11 |
| P5-8 엑셀 다운로드 (개인정보 제외) + 다운로드 내역 로깅 | backend-dev | pending | P5-7 | 요구사항 §3 |
| P5-9 파일 업로드/다운로드 암호화 처리 | backend-dev | pending | P5-8 | AIP 암호화 Agent 확인 필요 |
| P5-10 보안 리뷰 (`/security-review`) | reviewer | pending | P5-1~P5-9 | |

---

## Phase 6: 리포팅

| 태스크 | 담당 | 상태 | 의존 | 비고 |
|--------|------|------|------|------|
| P6-1 회사별 사용자 현황 집계 (전체/VIP/정직원/협력사, 전월 증감) | backend-dev | pending | P2-7, P4-6 | 요구사항 §12.1 |
| P6-2 월간 변경 관리 현황 집계 (신청 시스템별·회사별 건수) | backend-dev | pending | P3-4, P5-8 | 요구사항 §12.2 |
| P6-3 리포팅 화면 실데이터 연결 | frontend-dev | pending | P6-1, P6-2, P0-14 | |

---

## 확인이 필요한 미결 사항

| 항목 | 관련 | 비고 |
|------|------|------|
| 신청 시스템 EAI/API 연동 항목 정의 | P3-3 | 요구사항 §1.1에 "정의 필요"로만 기재 |
| VPN 장비 모델·API 스펙 | P3-1 | 벤더·버전 확인 필요 |
| AD 연동 방식 (LDAP 확정 여부) | P3-2 | 요구사항 §1.3에 "LDAP?"로 기재 |
| 생산 협력사 미접속 삭제 기준 | P2-2 | 요구사항 §7 표에 "1년?"로 기재 |
| AIP 암호화 Agent 제공 범위 | P5-9 | 요구사항 §10에 "제공"으로만 기재 |
