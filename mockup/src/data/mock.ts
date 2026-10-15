// P0-3 목업 더미 데이터 제공자.
// 목업 변경은 mock-store.tsx에서 브라우저에 저장한다. 제품의 서버 연동/영속화는 Phase 2 이후에 별도 구현한다.

export type UserType = '정직원' | '협력사' | '생산협력사' | 'VIP'
export const userTypes: UserType[] = ['정직원', '협력사', '생산협력사', 'VIP']
export type AccountStatus = '사용중' | '만료임박' | '만료' | '잠김'
export type RequestKind =
  | '신규'
  | '기간연장'
  | '삭제'
  | '정책추가'
  | '정책삭제'
  | '정책변경'
  | '정보변경'
export const requestKinds: RequestKind[] = ['신규', '기간연장', '삭제', '정책추가', '정책삭제', '정책변경', '정보변경']
export type RequestStatus = '대기' | '처리중' | '완료' | '반려'
export type DeleteReason = '요청삭제' | '기간만료삭제' | '장기미사용삭제'
export type AdminRole = 'Admin' | '운영자'

export interface Company {
  id: string
  name: string
  code: string
  userCount: number
  ipRangeCount: number
  active: boolean
}

export interface AclEntry {
  destination: string
  port: string
  protocol: 'TCP' | 'UDP' | 'ICMP'
}

export interface Acl {
  id: string
  name: string
  description: string
  entries: AclEntry[]
  shared: boolean
  // 그룹 ACL(shared)만 회사별로 구분한다. 계정별 개별 ACL에는 없다.
  company?: string
}

export interface Account {
  id: string
  account: string
  name: string
  company: string
  department: string
  userType: UserType
  status: AccountStatus
  assignedIp: string
  otp: boolean
  acls: string[]
  createdAt: string
  expiresAt: string
  lastAccessAt: string | null
  sourceSystem: string
  sourceNo: string
  // 사용자 관리 팝업의 사용자정보 탭 항목.
  affiliation: string
  affiliationIsGroup: boolean
  email: string
  mobile: string
  macAddress: string
  ou: string
  vpnState: VpnState
  forceApply: boolean
  adFlags: AdFlags
  adStatus: string
  adCheckedAt: string
  otpServer: OtpServer
  otpMethod: OtpMethod
  changeNote: string
}

export type VpnState = '사용' | '추가검증' | 'AD미반영'
export type OtpServer = '공용 OTP' | '자사 OTP'
export type OtpMethod = '전체' | '메일' | '모바일'

// AD 계정 옵션. 신규 계정은 다음 로그온 시 암호 변경을 기본으로 한다.
export interface AdFlags {
  mustChangePassword: boolean
  cannotChangePassword: boolean
  passwordNeverExpires: boolean
}

// 현재 계정 정책과 구분하여 보관하는 신청 당시의 요청 내용.
export interface RequestedAcl {
  name: string
  action: '추가' | '삭제'
  entries: AclEntry[]
}

// 신청 사용자 점검 결과. 유효성은 연계 수신 시 자동 검증, 점검은 운영자 판단이다.
export type ReviewState = '대기' | '확인' | '제외'
export type Validity = '성공' | '실패'

// 신청 건에 포함된 사용자 1명의 요청. 한 신청 건 안에 구분이 다른 요청이 함께 들어올 수 있다.
export interface RequestItem {
  id: string
  kind: RequestKind
  review: ReviewState
  validity: Validity
  reason: string
  account: string
  assignedIp: string
  name: string
  department: string
  affiliation: string
  userType: UserType
  startDate: string | null
  expiresAt: string
  email: string
  mobile: string
  ou: string
  requestedAcls: RequestedAcl[]
}

// 근거 시스템의 결재 1건. 신청사(company)와 신청자는 결재를 올린 쪽이다.
export interface VpnRequest {
  id: string
  status: RequestStatus
  company: string
  requestedBy: string
  requesterDepartment: string
  sourceSystem: string
  sourceNo: string
  requestedAt: string
  approvedAt: string
  processedBy: string | null
  processedAt: string | null
  mailedAt: string | null
  items: RequestItem[]
}

export interface DeletedUser {
  id: string
  account: string
  name: string
  company: string
  userType: UserType
  reason: DeleteReason
  deletedAt: string
  lastAccessAt: string | null
  detail: string
}

// 그룹 IP 관리 (요구사항 §5, §6). 회사 · 사용자 구분별 VPN IP 대역과,
// 그 안에서 운영자가 직접 지정하는 수동(고정) IP 대역을 둔다.
export interface GroupIp {
  id: string
  name: string
  autoAssign: boolean
  rangeStart: string
  rangeEnd: string
  manualStart: string
  manualEnd: string
  company: string
  userType: UserType
}

export interface AdminUser {
  id: string
  account: string
  name: string
  role: AdminRole
  email: string
  locked: boolean
  failCount: number
  lastLoginAt: string
  mfa: boolean
}

export interface AllowedIp {
  id: string
  ip: string
  label: string
  addedBy: string
  addedAt: string
}

export interface AuditLog {
  id: string
  at: string
  actor: string
  role: AdminRole
  action: string
  target: string
  detail: string
  ip: string
  result: '성공' | '실패'
}

export const companies: Company[] = [
  { id: 'C01', name: '이테버스', code: 'ETV', userCount: 412, ipRangeCount: 3, active: true },
  { id: 'C02', name: '이테버스파트너스', code: 'ETVP', userCount: 168, ipRangeCount: 1, active: true },
  { id: 'C03', name: '한성테크', code: 'HST', userCount: 94, ipRangeCount: 1, active: true },
  { id: 'C04', name: '대명정보시스템', code: 'DMI', userCount: 57, ipRangeCount: 1, active: true },
  { id: 'C05', name: '세진물산', code: 'SJM', userCount: 23, ipRangeCount: 1, active: false },
]

// 그룹 정책: 그룹사 × 사용자구분별 VPN 그룹과 인증 방식 (원본 IAMS-VPN 그룹 정책 관리 화면 기준).
export type PolicyKind = '개별' | '그룹'
export type AuthSource = '공용' | '자사'
export const policyKinds: PolicyKind[] = ['개별', '그룹']
export const authSources: AuthSource[] = ['공용', '자사']

export interface GroupPolicy {
  id: string
  company: string
  userType: UserType
  vpnGroupId: string
  policyKind: PolicyKind
  ad: AuthSource
  otp: AuthSource
}

export const groupPolicies: GroupPolicy[] = [
  { id: 'GP01', company: '이테버스', userType: '정직원', vpnGroupId: 'ETV', policyKind: '그룹', ad: '자사', otp: '공용' },
  { id: 'GP02', company: '이테버스', userType: '협력사', vpnGroupId: 'HMGPTR', policyKind: '개별', ad: '공용', otp: '공용' },
  { id: 'GP03', company: '이테버스파트너스', userType: '정직원', vpnGroupId: 'ETVP', policyKind: '그룹', ad: '자사', otp: '공용' },
  { id: 'GP04', company: '이테버스파트너스', userType: '협력사', vpnGroupId: 'HMGPTR', policyKind: '개별', ad: '공용', otp: '공용' },
  { id: 'GP05', company: '한성테크', userType: '협력사', vpnGroupId: 'HSTPTR', policyKind: '개별', ad: '자사', otp: '자사' },
  { id: 'GP06', company: '한성테크', userType: '정직원', vpnGroupId: 'HST', policyKind: '개별', ad: '자사', otp: '자사' },
  { id: 'GP07', company: '대명정보시스템', userType: '협력사', vpnGroupId: 'HMGPTR', policyKind: '개별', ad: '공용', otp: '공용' },
]

export const acls: Acl[] = [
  {
    id: 'ACL-ERP-RO',
    name: 'ACL_ERP_READONLY',
    description: 'ERP 조회 전용',
    shared: true,
    company: '이테버스파트너스',
    entries: [
      { destination: '10.20.10.0/24', port: '443', protocol: 'TCP' },
      { destination: '10.20.10.15', port: '1521', protocol: 'TCP' },
    ],
  },
  {
    id: 'ACL-GRP-DEV',
    name: 'ACL_GROUP_DEV',
    description: '개발 공통 (그룹 ACL)',
    shared: true,
    company: '이테버스',
    entries: [
      { destination: '10.30.0.0/16', port: '22,443,8080', protocol: 'TCP' },
      { destination: '10.30.5.0/24', port: '3389', protocol: 'TCP' },
    ],
  },
  {
    id: 'ACL-MES-PRD',
    name: 'ACL_MES_PROD',
    description: '생산 MES 접근',
    shared: true,
    company: '세진물산',
    entries: [{ destination: '172.16.40.0/22', port: '443,5432', protocol: 'TCP' }],
  },
  {
    id: 'ACL-VIP-ALL',
    name: 'ACL_VIP_FULL',
    description: 'VIP 전체 허용',
    shared: false,
    entries: [{ destination: '10.0.0.0/8', port: 'any', protocol: 'TCP' }],
  },
  {
    id: 'ACL-HST-001',
    name: 'ACL_HST_MAINT',
    description: '한성테크 유지보수 전용',
    shared: false,
    entries: [
      { destination: '10.20.30.40', port: '3389', protocol: 'TCP' },
      { destination: '10.20.30.41', port: '22', protocol: 'TCP' },
    ],
  },
]

type AccountSeed = Omit<
  Account,
  | 'affiliation' | 'affiliationIsGroup' | 'email' | 'mobile' | 'macAddress' | 'ou' | 'vpnState'
  | 'forceApply' | 'adFlags' | 'adStatus' | 'adCheckedAt' | 'otpServer' | 'otpMethod' | 'changeNote'
>

const accountSeeds: AccountSeed[] = [
  {
    id: 'A001',
    account: 'kim.minsu',
    name: '김민수',
    company: '이테버스',
    department: '플랫폼개발팀',
    userType: '정직원',
    status: '사용중',
    assignedIp: '10.100.12.41',
    otp: true,
    acls: ['ACL_GROUP_DEV', 'ACL_ERP_READONLY'],
    createdAt: '2026-03-02',
    expiresAt: '2027-03-01',
    lastAccessAt: '2026-10-04',
    sourceSystem: 'SRMS',
    sourceNo: 'SR-2026-03117',
  },
  {
    id: 'A002',
    account: 'park.jiyoung',
    name: '박지영',
    company: '이테버스',
    department: '인프라운영팀',
    userType: '정직원',
    status: '사용중',
    assignedIp: '10.100.12.52',
    otp: true,
    acls: ['ACL_GROUP_DEV'],
    createdAt: '2026-01-15',
    expiresAt: '2027-01-14',
    lastAccessAt: '2026-10-05',
    sourceSystem: 'SRMS',
    sourceNo: 'SR-2026-00812',
  },
  {
    id: 'A003',
    account: 'hst.leejh',
    name: '이준호',
    company: '한성테크',
    department: '유지보수',
    userType: '협력사',
    status: '만료임박',
    assignedIp: '10.101.8.17',
    otp: true,
    acls: ['ACL_HST_MAINT'],
    createdAt: '2026-04-20',
    expiresAt: '2026-10-19',
    lastAccessAt: '2026-09-28',
    sourceSystem: 'CSC',
    sourceNo: 'CS-2026-01044',
  },
  {
    id: 'A004',
    account: 'choi.sera',
    name: '최세라',
    company: '이테버스',
    department: '경영지원',
    userType: 'VIP',
    status: '사용중',
    assignedIp: '10.100.1.5',
    otp: true,
    acls: ['ACL_VIP_FULL'],
    createdAt: '2025-11-03',
    expiresAt: '2026-11-02',
    lastAccessAt: '2026-10-05',
    sourceSystem: 'SRMS',
    sourceNo: 'SR-2025-09920',
  },
  {
    id: 'A005',
    account: 'dmi.kangty',
    name: '강태윤',
    company: '대명정보시스템',
    department: 'SI개발',
    userType: '협력사',
    status: '사용중',
    assignedIp: '10.102.4.88',
    otp: false,
    acls: ['ACL_GROUP_DEV'],
    createdAt: '2026-06-11',
    expiresAt: '2026-12-10',
    lastAccessAt: '2026-10-01',
    sourceSystem: 'CSC',
    sourceNo: 'CS-2026-02231',
  },
  {
    id: 'A006',
    account: 'sjm.ohms',
    name: '오민석',
    company: '세진물산',
    department: '생산관리',
    userType: '생산협력사',
    status: '만료임박',
    assignedIp: '10.103.2.14',
    otp: true,
    acls: ['ACL_MES_PROD'],
    createdAt: '2025-10-22',
    expiresAt: '2026-10-21',
    lastAccessAt: '2026-07-15',
    sourceSystem: 'HDSTEEL',
    sourceNo: 'HD-2025-77310',
  },
  {
    id: 'A007',
    account: 'etvp.jungha',
    name: '정하늘',
    company: '이테버스파트너스',
    department: '컨설팅',
    userType: '협력사',
    status: '사용중',
    assignedIp: '10.104.6.23',
    otp: true,
    acls: ['ACL_ERP_READONLY'],
    createdAt: '2026-08-01',
    expiresAt: '2027-01-31',
    lastAccessAt: '2026-10-03',
    sourceSystem: 'CSC',
    sourceNo: 'CS-2026-03008',
  },
  {
    id: 'A008',
    account: 'hst.yoonsa',
    name: '윤상아',
    company: '한성테크',
    department: '유지보수',
    userType: '협력사',
    status: '잠김',
    assignedIp: '10.101.8.19',
    otp: true,
    acls: ['ACL_HST_MAINT'],
    createdAt: '2026-05-09',
    expiresAt: '2026-11-08',
    lastAccessAt: '2026-08-30',
    sourceSystem: 'CSC',
    sourceNo: 'CS-2026-01520',
  },
  {
    id: 'A009',
    account: 'kim.doyun',
    name: '김도윤',
    company: '이테버스',
    department: '보안팀',
    userType: '정직원',
    status: '사용중',
    assignedIp: '10.100.3.77',
    otp: true,
    acls: ['ACL_GROUP_DEV', 'ACL_VIP_FULL'],
    createdAt: '2026-02-17',
    expiresAt: '2027-02-16',
    lastAccessAt: '2026-10-05',
    sourceSystem: 'SRMS',
    sourceNo: 'SR-2026-01904',
  },
  {
    id: 'A010',
    account: 'dmi.seoha',
    name: '서하준',
    company: '대명정보시스템',
    department: 'SI개발',
    userType: '협력사',
    status: '만료',
    assignedIp: '10.102.4.91',
    otp: false,
    acls: [],
    createdAt: '2025-09-30',
    expiresAt: '2026-03-29',
    lastAccessAt: '2026-03-20',
    sourceSystem: 'CSC',
    sourceNo: 'CS-2025-08841',
  },
]

const aclGroupDev: RequestedAcl = {
  name: 'ACL_GROUP_DEV', action: '추가',
  entries: [
    { destination: '10.30.0.0/16', port: '22,443,8080', protocol: 'TCP' },
    { destination: '10.30.5.0/24', port: '3389', protocol: 'TCP' },
  ],
}

const aclErpReadonly: RequestedAcl = {
  name: 'ACL_ERP_READONLY', action: '추가',
  entries: [
    { destination: '10.20.10.0/24', port: '443', protocol: 'TCP' },
    { destination: '10.20.10.15', port: '1521', protocol: 'TCP' },
  ],
}

// 메일 · 모바일 · OU는 VPN ID에서 목업 값을 만든다. 나머지 기본값은 대기 · 성공이다.
function requestItem(
  item: Pick<RequestItem, 'id' | 'kind' | 'account' | 'assignedIp' | 'name' | 'department' | 'affiliation' | 'userType' | 'expiresAt'> &
    Partial<RequestItem>,
): RequestItem {
  const no = item.account.replace(/\D/g, '')
  return {
    review: '대기',
    validity: '성공',
    reason: '',
    startDate: null,
    email: `user${no}@example.com`,
    mobile: `010-****-${no.slice(-4)}`,
    ou: `OU=${item.userType},OU=${item.affiliation}`,
    requestedAcls: [],
    ...item,
  }
}

// 사용자정보 탭 항목은 계정 기본 정보에서 목업 값을 만든다.
export const accounts: Account[] = accountSeeds.map((a, i) => ({
  ...a,
  affiliation: a.userType === '정직원' || a.userType === 'VIP' ? a.company : `${a.company} 협력`,
  affiliationIsGroup: a.userType === '정직원' || a.userType === 'VIP',
  email: `${a.account}@example.com`,
  mobile: `010-****-${String(1200 + i * 37).slice(-4)}`,
  macAddress: '',
  ou: `OU=${a.department},OU=${a.company}`,
  vpnState: a.status === '잠김' ? '추가검증' : '사용',
  forceApply: false,
  adFlags: { mustChangePassword: true, cannotChangePassword: false, passwordNeverExpires: false },
  adStatus: a.status === '잠김' ? '잠김' : '정상',
  adCheckedAt: `${a.lastAccessAt ?? a.createdAt} 10:06:46`,
  otpServer: a.otp ? '공용 OTP' : '자사 OTP',
  otpMethod: '전체',
  changeNote: '',
}))

export type AccountHistoryKind = '등록' | '수정' | '기간연장' | '정책변경' | '삭제'

// 사용자 관리 > 관리이력. 처리 시점의 계정 상태를 스냅샷으로 남긴다.
export interface AccountHistory {
  id: string
  accountId: string
  kind: AccountHistoryKind
  at: string
  actor: string
  sourceNo: string
  email: string
  mobile: string
  expiresAt: string
  adFlags: AdFlags
  otpServer: OtpServer
  otpMethod: OtpMethod
  acls: string[]
  account: string
  assignedIp: string
  ou: string
}

export function accountSnapshot(
  account: Account,
  change: Pick<AccountHistory, 'id' | 'kind' | 'at' | 'actor'>,
): AccountHistory {
  return {
    ...change,
    accountId: account.id,
    sourceNo: account.sourceNo,
    email: account.email,
    mobile: account.mobile,
    expiresAt: account.expiresAt,
    adFlags: { ...account.adFlags },
    otpServer: account.otpServer,
    otpMethod: account.otpMethod,
    acls: [...account.acls],
    account: account.account,
    assignedIp: account.assignedIp,
    ou: account.ou,
  }
}

// 모든 계정에 등록 이력을 두고, 일부 계정에는 이후 처리 이력을 덧붙인다 (최신순).
export const accountHistory: AccountHistory[] = [
  accountSnapshot(
    { ...accounts[0], acls: ['ACL_GROUP_DEV', 'ACL_ERP_READONLY'] },
    { id: 'H101', kind: '정책변경', at: '2026-06-12 14:20:03', actor: '김수현' },
  ),
  accountSnapshot(
    { ...accounts[5] },
    { id: 'H102', kind: '기간연장', at: '2026-10-04 17:35:12', actor: '김수현' },
  ),
  accountSnapshot(
    { ...accounts[7], adFlags: { ...accounts[7].adFlags, mustChangePassword: true } },
    { id: 'H103', kind: '수정', at: '2026-09-01 09:12:40', actor: '이지원' },
  ),
  ...accounts.map((a) =>
    accountSnapshot(
      { ...a, acls: a.id === 'A001' ? ['ACL_GROUP_DEV'] : a.acls, expiresAt: a.id === 'A006' ? '2026-10-21' : a.expiresAt },
      { id: `H0${a.id.slice(1)}`, kind: '등록', at: `${a.createdAt} 10:06:46`, actor: '김수현' },
    ),
  ),
]

// 근거번호의 목업 소속사 코드: ETV 이테버스, HBS 한빛솔루션,
// SRP 새롬생산지원, MIT 미래정보기술, DIT 다온아이티.
export const requests: VpnRequest[] = [
  {
    id: 'R2026-1041',
    status: '대기',
    company: '이테버스',
    requestedBy: '임주은',
    requesterDepartment: '플랫폼개발팀',
    sourceSystem: 'SRMS',
    sourceNo: 'ETV-010410',
    requestedAt: '2026-10-05 09:12',
    approvedAt: '2026-10-05',
    processedBy: null,
    processedAt: null,
    mailedAt: null,
    items: [
      ...[
        ['VPN100041', '10.100.12.61', '임주은'],
        ['VPN100042', '10.100.12.62', '모건'],
        ['VPN100043', '10.100.12.63', '우영제'],
        ['VPN100044', '10.100.12.64', '김연호'],
        ['VPN100045', '10.100.12.65', '이경근'],
        ['VPN100046', '10.100.12.66', '조정호'],
        ['VPN100047', '10.100.12.67', '한서윤'],
      ].map(([account, assignedIp, name], i) =>
        requestItem({
          id: `R2026-1041-${i + 1}`,
          kind: '신규',
          account,
          assignedIp,
          name,
          department: '플랫폼개발팀',
          affiliation: '이테버스',
          userType: '정직원',
          startDate: '2026-10-05',
          expiresAt: '2027-10-04',
          requestedAcls: [aclGroupDev],
          ...(i === 4 ? { validity: '실패' as const, reason: '사용 중인 VPN ID' } : {}),
        }),
      ),
      requestItem({
        id: 'R2026-1041-8',
        kind: '기간연장',
        account: 'VPN100012',
        assignedIp: '10.100.12.41',
        name: '김민수',
        department: '플랫폼개발팀',
        affiliation: '이테버스',
        userType: '정직원',
        expiresAt: '2027-10-04',
      }),
      requestItem({
        id: 'R2026-1041-9',
        kind: '기간연장',
        account: 'VPN100013',
        assignedIp: '10.100.3.77',
        name: '김도윤',
        department: '보안팀',
        affiliation: '이테버스',
        userType: '정직원',
        expiresAt: '2027-10-04',
      }),
      requestItem({
        id: 'R2026-1041-10',
        kind: '정책추가',
        account: 'VPN100014',
        assignedIp: '10.100.12.52',
        name: '박지영',
        department: '인프라운영팀',
        affiliation: '이테버스',
        userType: '정직원',
        expiresAt: '2027-01-14',
        requestedAcls: [aclErpReadonly],
      }),
    ],
  },
  {
    id: 'R2026-1040',
    status: '대기',
    company: '한성테크',
    requestedBy: '한도윤',
    requesterDepartment: '유지보수',
    sourceSystem: 'CSC',
    sourceNo: 'HBS-004120',
    requestedAt: '2026-10-05 08:47',
    approvedAt: '2026-10-05',
    processedBy: null,
    processedAt: null,
    mailedAt: null,
    items: [
      requestItem({
        id: 'R2026-1040-1',
        kind: '정책추가',
        account: 'VPN200040',
        assignedIp: '10.101.8.17',
        name: '이준호',
        department: '협력사',
        affiliation: '한빛솔루션',
        userType: '협력사',
        expiresAt: '2026-10-19',
        requestedAcls: [{
          name: 'ACL_HST_MAINT', action: '추가',
          entries: [{ destination: '10.20.30.42', port: '443', protocol: 'TCP' }],
        }],
      }),
      requestItem({
        id: 'R2026-1040-2',
        kind: '정책추가',
        account: 'VPN200041',
        assignedIp: '10.101.8.19',
        name: '윤상아',
        department: '협력사',
        affiliation: '한빛솔루션',
        userType: '협력사',
        expiresAt: '2026-11-08',
        requestedAcls: [{
          name: 'ACL_HST_MAINT', action: '추가',
          entries: [{ destination: '10.20.30.42', port: '443', protocol: 'TCP' }],
        }],
      }),
      requestItem({
        id: 'R2026-1040-3',
        kind: '기간연장',
        account: 'VPN200040',
        assignedIp: '10.101.8.17',
        name: '이준호',
        department: '협력사',
        affiliation: '한빛솔루션',
        userType: '협력사',
        expiresAt: '2027-10-18',
        validity: '실패',
        reason: '협력사 기한 6개월 초과',
      }),
    ],
  },
  {
    id: 'R2026-1039',
    status: '처리중',
    company: '세진물산',
    requestedBy: '오민석',
    requesterDepartment: '생산관리',
    sourceSystem: 'HDSTEEL',
    sourceNo: 'SRP-055120',
    requestedAt: '2026-10-04 17:30',
    approvedAt: '2026-10-04',
    processedBy: null,
    processedAt: null,
    mailedAt: null,
    items: [
      ...[
        ['VPN300039', '10.103.2.14', '오민석', '확인'],
        ['VPN300040', '10.103.2.15', '배지훈', '대기'],
        ['VPN300041', '10.103.2.16', '문채원', '대기'],
      ].map(([account, assignedIp, name, review], i) =>
        requestItem({
          id: `R2026-1039-${i + 1}`,
          kind: '기간연장',
          account,
          assignedIp,
          name,
          department: '협력사',
          affiliation: '새롬생산지원',
          userType: '생산협력사',
          expiresAt: '2027-10-03',
          review: review as ReviewState,
        }),
      ),
      requestItem({
        id: 'R2026-1039-4',
        kind: '삭제',
        account: 'VPN300030',
        assignedIp: '10.103.2.9',
        name: '김태완',
        department: '협력사',
        affiliation: '새롬생산지원',
        userType: '생산협력사',
        expiresAt: '2026-10-21',
      }),
    ],
  },
  {
    id: 'R2026-1038',
    status: '완료',
    company: '대명정보시스템',
    requestedBy: '서지원',
    requesterDepartment: 'SI개발',
    sourceSystem: 'CSC',
    sourceNo: 'MIT-004098',
    requestedAt: '2026-10-04 11:05',
    approvedAt: '2026-10-04',
    processedBy: '김수현',
    processedAt: '2026-10-04 11:08',
    mailedAt: '2026-10-04 11:10',
    items: [
      requestItem({
        id: 'R2026-1038-1',
        kind: '삭제',
        review: '확인',
        account: 'VPN200038',
        assignedIp: '10.102.4.90',
        name: '서하준',
        department: '협력사',
        affiliation: '미래정보기술',
        userType: '협력사',
        expiresAt: '2026-03-29',
      }),
      requestItem({
        id: 'R2026-1038-2',
        kind: '삭제',
        review: '확인',
        account: 'VPN200039',
        assignedIp: '10.102.4.92',
        name: '신동하',
        department: '협력사',
        affiliation: '미래정보기술',
        userType: '협력사',
        expiresAt: '2026-09-30',
      }),
    ],
  },
  {
    id: 'R2026-1037',
    status: '완료',
    company: '이테버스',
    requestedBy: '박지영',
    requesterDepartment: '인프라운영팀',
    sourceSystem: 'SRMS',
    sourceNo: 'ETV-010340',
    requestedAt: '2026-10-03 14:22',
    approvedAt: '2026-10-03',
    processedBy: '김수현',
    processedAt: '2026-10-03 15:01',
    mailedAt: '2026-10-03 15:02',
    items: [
      requestItem({
        id: 'R2026-1037-1',
        kind: '정보변경',
        review: '확인',
        account: 'VPN100037',
        assignedIp: '10.100.12.52',
        name: '박지영',
        department: '인프라운영팀',
        affiliation: '이테버스',
        userType: '정직원',
        expiresAt: '2027-01-14',
      }),
    ],
  },
  {
    id: 'R2026-1036',
    status: '반려',
    company: '대명정보시스템',
    requestedBy: '서지원',
    requesterDepartment: 'SI개발',
    sourceSystem: 'CSC',
    sourceNo: 'MIT-004055',
    requestedAt: '2026-10-02 10:18',
    approvedAt: '2026-10-02',
    processedBy: '홍길동',
    processedAt: '2026-10-02 13:40',
    mailedAt: null,
    items: [
      requestItem({
        id: 'R2026-1036-1',
        kind: '정책변경',
        review: '제외',
        account: 'VPN200036',
        assignedIp: '10.102.4.91',
        name: '강태윤',
        department: '협력사',
        affiliation: '미래정보기술',
        userType: '협력사',
        expiresAt: '2026-12-10',
        requestedAcls: [
          {
            name: 'ACL_HST_MAINT', action: '삭제',
            entries: [
              { destination: '10.20.30.40', port: '3389', protocol: 'TCP' },
              { destination: '10.20.30.41', port: '22', protocol: 'TCP' },
            ],
          },
          aclErpReadonly,
        ],
      }),
    ],
  },
  {
    id: 'R2026-1035',
    status: '완료',
    company: '이테버스파트너스',
    requestedBy: '정태호',
    requesterDepartment: '컨설팅',
    sourceSystem: 'CSC',
    sourceNo: 'DIT-003008',
    requestedAt: '2026-10-01 09:40',
    approvedAt: '2026-10-01',
    processedBy: '김수현',
    processedAt: '2026-10-01 10:12',
    mailedAt: '2026-10-01 10:15',
    items: [
      requestItem({
        id: 'R2026-1035-1',
        kind: '신규',
        review: '확인',
        account: 'VPN200035',
        assignedIp: '10.104.6.23',
        name: '정하늘',
        department: '협력사',
        affiliation: '다온아이티',
        userType: '협력사',
        startDate: '2026-10-01',
        expiresAt: '2027-03-31',
        requestedAcls: [aclErpReadonly],
      }),
      requestItem({
        id: 'R2026-1035-2',
        kind: '신규',
        review: '제외',
        validity: '실패',
        reason: '협력사 기한 6개월 초과',
        account: 'VPN200034',
        assignedIp: '10.104.6.24',
        name: '나윤재',
        department: '협력사',
        affiliation: '다온아이티',
        userType: '협력사',
        startDate: '2026-10-01',
        expiresAt: '2027-09-30',
        requestedAcls: [aclErpReadonly],
      }),
    ],
  },
]

export const deletedUsers: DeletedUser[] = [
  {
    id: 'D001',
    account: 'dmi.seoha',
    name: '서하준',
    company: '대명정보시스템',
    userType: '협력사',
    reason: '요청삭제',
    deletedAt: '2026-10-04',
    lastAccessAt: '2026-03-20',
    detail: '협력사 계약 종료 (CS-2026-04098)',
  },
  {
    id: 'D002',
    account: 'old.parksm',
    name: '박성민',
    company: '한성테크',
    userType: '협력사',
    reason: '기간만료삭제',
    deletedAt: '2026-09-30',
    lastAccessAt: '2026-09-12',
    detail: '계정 기한 만료 (6개월)',
  },
  {
    id: 'D003',
    account: 'old.jeongha',
    name: '정하영',
    company: '이테버스',
    userType: '정직원',
    reason: '장기미사용삭제',
    deletedAt: '2026-09-28',
    lastAccessAt: '2026-03-25',
    detail: '6개월 이상 미접속',
  },
  {
    id: 'D004',
    account: 'old.kimtw',
    name: '김태완',
    company: '세진물산',
    userType: '생산협력사',
    reason: '장기미사용삭제',
    deletedAt: '2026-09-15',
    lastAccessAt: '2025-09-10',
    detail: '1년 이상 미접속',
  },
  {
    id: 'D005',
    account: 'old.leesr',
    name: '이소라',
    company: '이테버스파트너스',
    userType: '협력사',
    reason: '기간만료삭제',
    deletedAt: '2026-09-02',
    lastAccessAt: '2026-08-28',
    detail: '계정 기한 만료 (6개월)',
  },
]

export const groupIps: GroupIp[] = [
  { id: 'G01', name: 'ETV_10.100.0.1', autoAssign: false, rangeStart: '10.100.0.1', rangeEnd: '10.100.63.254', manualStart: '10.100.0.1', manualEnd: '10.100.3.254', company: '이테버스', userType: '정직원' },
  { id: 'G02', name: 'ETV_10.100.0.1', autoAssign: false, rangeStart: '10.100.0.1', rangeEnd: '10.100.63.254', manualStart: '10.100.1.1', manualEnd: '10.100.1.254', company: '이테버스', userType: 'VIP' },
  { id: 'G03', name: 'ETVP_10.104.0.1', autoAssign: true, rangeStart: '10.104.0.1', rangeEnd: '10.104.15.254', manualStart: '10.104.6.1', manualEnd: '10.104.6.254', company: '이테버스파트너스', userType: '협력사' },
  { id: 'G04', name: 'HST_10.101.0.1', autoAssign: true, rangeStart: '10.101.0.1', rangeEnd: '10.101.15.254', manualStart: '10.101.8.1', manualEnd: '10.101.8.254', company: '한성테크', userType: '협력사' },
  { id: 'G05', name: 'DMI_10.102.0.1', autoAssign: false, rangeStart: '10.102.0.1', rangeEnd: '10.102.7.254', manualStart: '10.102.4.1', manualEnd: '10.102.4.254', company: '대명정보시스템', userType: '협력사' },
  { id: 'G06', name: 'SJM_10.103.0.1', autoAssign: false, rangeStart: '10.103.0.1', rangeEnd: '10.103.3.254', manualStart: '10.103.2.1', manualEnd: '10.103.2.254', company: '세진물산', userType: '생산협력사' },
]

// 코드관리. groupCode가 null이면 그룹 코드, 아니면 해당 그룹의 세부 코드다.
export interface CodeItem {
  id: string
  groupCode: string | null
  order: number
  code: string
  name: string
  description: string
  vpnGroupId: string
  policyCode: string
  partition: string
  active: boolean
}

function code(
  groupCode: string | null,
  order: number,
  value: string,
  name: string,
  description = '',
  extra: Partial<Pick<CodeItem, 'vpnGroupId' | 'policyCode' | 'partition' | 'active'>> = {},
): CodeItem {
  return {
    id: `${groupCode ?? 'GROUP'}-${value}`,
    groupCode,
    order,
    code: value,
    name,
    description,
    vpnGroupId: '',
    policyCode: '',
    partition: '',
    active: true,
    ...extra,
  }
}

export const codes: CodeItem[] = [
  code(null, 1, 'C0002', '공용 회사', '협력사를 제외한 회사 목록'),
  code(null, 11, 'C0014', '신청관리 > 근거시스템', '신청 근거시스템 : SRMS/ASMS/HDSTEEL/CSC/협조전/메일/기타'),
  code(null, 12, 'C0001', '신청관리 > 신청상태', '대기 / 처리중 / 완료 / 반려'),
  code(null, 13, 'C0010', '신청관리 > 신청구분', '신규 / 기간연장 / 삭제 / 정책추가 / 정책삭제 / 정책변경 / 정보변경'),
  code(null, 14, 'C0018', '신청구분 > 신규요청 > 내부구분', '[C0010]신규요청에 대한 내부 코드 : 신규신청 / 정책추가 / 정책변경'),
  code(null, 15, 'C0025', '신청관리 > 예약정책 > 회사별 기본 정책', '사용자 관리 > 회사별 기본 정책\n- 신규신청 시, 신청하지 않아도 자동 신청된다.'),
  code(null, 16, 'C0026', '사용자관리 > 예약 정책', '사용자 관리 > 예약 정책\n- 신청관리의 시스템 예약어 관리\n- SYSTEM://, CODE:// 로 신청이 들어오면 자동으로 해당 시스템의 IP, Port 목록으로 치환된다.'),
  code(null, 17, 'C0027', '신청관리 > 기타정책', '기타정책(UDP 포트 정의)'),
  code(null, 18, 'C0017', '사용자관리 > 정책점검 > 사유', '통제포트, 생산망 등'),
  code(null, 19, 'C0003', '사용자관리 > 정책점검 > 상태', '일치 / 불일치 / 점검'),
  code(null, 20, 'C0030', '사용자관리 > 사용자구분', '정직원 / 협력사 / 생산협력사 / VIP'),
  code(null, 21, 'C0031', '사용자관리 > 삭제사유', '요청삭제 / 기간만료삭제 / 장기미사용삭제', { active: false }),

  code('C0002', 1, 'ETV', '이테버스'),
  code('C0002', 2, 'ETVP', '이테버스파트너스'),
  code('C0014', 1, 'SRMS', 'SRMS', '그룹웨어 신청 시스템'),
  code('C0014', 2, 'ASMS', 'ASMS', '계열사 신청 시스템'),
  code('C0014', 3, 'HDSTEEL', 'HDSTEEL', 'EAI 자동연계'),
  code('C0014', 4, 'CSC', 'CSC', '협력사 포털'),
  code('C0014', 5, 'COOP', '협조전', '협조전 결재'),
  code('C0014', 6, 'MAIL', '메일', '메일 접수 후 수동 등록'),
  code('C0014', 7, 'ETC', '기타', '엑셀 업로드 · 유선 접수'),
  ...(['대기', '처리중', '완료', '반려'] as const).map((v, i) => code('C0001', i + 1, `S0${i + 1}`, v)),
  ...(['신규', '기간연장', '삭제', '정책추가', '정책삭제', '정책변경', '정보변경'] as const).map((v, i) =>
    code('C0010', i + 1, `K0${i + 1}`, v),
  ),
  code('C0018', 1, 'N01', '신규신청'),
  code('C0018', 2, 'N02', '정책추가'),
  code('C0018', 3, 'N03', '정책변경'),
  code('C0025', 1, 'ETV', '이테버스 기본 정책', '전 직원 공통 접근', { vpnGroupId: 'GRP_ETV', policyCode: 'ACL_GROUP_DEV', partition: 'P_ETV' }),
  code('C0025', 2, 'HST', '한성테크 기본 정책', '유지보수 대상 서버만 허용', { vpnGroupId: 'GRP_HST', policyCode: 'ACL_HST_MAINT', partition: 'P_PARTNER' }),
  code('C0025', 3, 'SJM', '세진물산 기본 정책', '생산망 제한 적용', { vpnGroupId: 'GRP_SJM', policyCode: 'ACL_MES_PROD', partition: 'P_PROD' }),
  code('C0026', 1, 'SYSTEM://ERP', 'ERP 시스템', '10.20.10.0/24:443, 10.20.10.15:1521', { policyCode: 'ACL_ERP_READONLY' }),
  code('C0026', 2, 'CODE://DEV', '개발 공통', '10.30.0.0/16:22,443,8080', { policyCode: 'ACL_GROUP_DEV' }),
  code('C0027', 1, 'UDP-DNS', 'DNS', 'UDP 53'),
  code('C0027', 2, 'UDP-NTP', 'NTP', 'UDP 123'),
  code('C0017', 1, 'R01', '통제포트', '3389, 22 등 통제 대상 포트', { policyCode: 'BLOCK_ADMIN_PORT' }),
  code('C0017', 2, 'R02', '생산망', '생산망 대역 접근', { policyCode: 'LIMIT_PROD_NET' }),
  code('C0003', 1, 'P01', '일치'),
  code('C0003', 2, 'P02', '불일치'),
  code('C0003', 3, 'P03', '점검'),
  ...userTypes.map((v, i) => code('C0030', i + 1, `U0${i + 1}`, v)),
]

export const admins: AdminUser[] = [
  {
    id: 'M01',
    account: 'admin.hong',
    name: '홍길동',
    role: 'Admin',
    email: 'hong@example.com',
    locked: false,
    failCount: 0,
    lastLoginAt: '2026-10-05 08:30',
    mfa: true,
  },
  {
    id: 'M02',
    account: 'op.kimsh',
    name: '김수현',
    role: '운영자',
    email: 'kimsh@example.com',
    locked: false,
    failCount: 1,
    lastLoginAt: '2026-10-04 18:12',
    mfa: true,
  },
  {
    id: 'M03',
    account: 'op.leejw',
    name: '이지원',
    role: '운영자',
    email: 'leejw@example.com',
    locked: true,
    failCount: 5,
    lastLoginAt: '2026-10-02 09:55',
    mfa: true,
  },
  {
    id: 'M04',
    account: 'admin.parkhs',
    name: '박현수',
    role: 'Admin',
    email: 'parkhs@example.com',
    locked: false,
    failCount: 0,
    lastLoginAt: '2026-10-05 07:02',
    mfa: false,
  },
]

export const allowedIps: AllowedIp[] = [
  { id: 'P01', ip: '203.0.113.10', label: '본사 운영 PC', addedBy: '홍길동', addedAt: '2026-01-02' },
  { id: 'P02', ip: '203.0.113.11', label: '본사 운영 PC (예비)', addedBy: '홍길동', addedAt: '2026-01-02' },
  { id: 'P03', ip: '198.51.100.24/29', label: 'IDC 관리 대역', addedBy: '박현수', addedAt: '2026-03-18' },
]

export const auditLogs: AuditLog[] = [
  {
    id: 'L9001',
    at: '2026-10-05 09:14',
    actor: '김수현',
    role: '운영자',
    action: '계정 생성',
    target: 'etv.limjy',
    detail: '정직원 / 만료 2027-10-04 / ACL_GROUP_DEV',
    ip: '203.0.113.10',
    result: '성공',
  },
  {
    id: 'L9000',
    at: '2026-10-05 08:52',
    actor: '김수현',
    role: '운영자',
    action: '정책 추가',
    target: 'hst.leejh',
    detail: 'ACL_HST_MAINT에 10.20.30.42:443 추가',
    ip: '203.0.113.10',
    result: '성공',
  },
  {
    id: 'L8999',
    at: '2026-10-05 08:30',
    actor: '홍길동',
    role: 'Admin',
    action: '로그인',
    target: '-',
    detail: 'MFA 인증 완료',
    ip: '203.0.113.11',
    result: '성공',
  },
  {
    id: 'L8998',
    at: '2026-10-04 18:40',
    actor: '홍길동',
    role: 'Admin',
    action: '엑셀 다운로드',
    target: '계정·정책 목록',
    detail: '10건 (개인정보 제외)',
    ip: '203.0.113.11',
    result: '성공',
  },
  {
    id: 'L8997',
    at: '2026-10-04 17:35',
    actor: 'EAI 연계',
    role: '운영자',
    action: '기간 연장',
    target: 'sjm.ohms',
    detail: '만료 2026-10-21 → 2027-10-20',
    ip: '10.0.5.2',
    result: '성공',
  },
  {
    id: 'L8996',
    at: '2026-10-04 11:08',
    actor: '김수현',
    role: '운영자',
    action: '계정 삭제',
    target: 'dmi.seoha',
    detail: '요청 삭제 (CS-2026-04098)',
    ip: '203.0.113.10',
    result: '성공',
  },
  {
    id: 'L8995',
    at: '2026-10-02 09:58',
    actor: '이지원',
    role: '운영자',
    action: '로그인',
    target: '-',
    detail: '비밀번호 5회 오류 — 계정 잠김',
    ip: '203.0.113.10',
    result: '실패',
  },
  {
    id: 'L8994',
    at: '2026-10-01 14:20',
    actor: '박현수',
    role: 'Admin',
    action: '접속 허용 IP 추가',
    target: '198.51.100.24/29',
    detail: 'IDC 관리 대역',
    ip: '203.0.113.11',
    result: '성공',
  },
]

export interface CompanySummary {
  company: string
  total: number
  vip: number
  employee: number
  partner: number
  prevDiff: number
  created: number
  deletedRequest: number
  deletedExpired: number
  deletedIdle: number
}

export const companySummary: CompanySummary[] = [
  { company: '이테버스', total: 412, vip: 12, employee: 374, partner: 26, prevDiff: 18, created: 24, deletedRequest: 3, deletedExpired: 2, deletedIdle: 1 },
  { company: '이테버스파트너스', total: 168, vip: 2, employee: 0, partner: 166, prevDiff: -4, created: 6, deletedRequest: 7, deletedExpired: 2, deletedIdle: 1 },
  { company: '한성테크', total: 94, vip: 0, employee: 0, partner: 94, prevDiff: 5, created: 9, deletedRequest: 2, deletedExpired: 2, deletedIdle: 0 },
  { company: '대명정보시스템', total: 57, vip: 0, employee: 0, partner: 57, prevDiff: -2, created: 3, deletedRequest: 4, deletedExpired: 1, deletedIdle: 0 },
  { company: '세진물산', total: 23, vip: 0, employee: 0, partner: 23, prevDiff: 0, created: 1, deletedRequest: 0, deletedExpired: 0, deletedIdle: 1 },
]

export interface ChangeSummary {
  system: string
  created: number
  extended: number
  deleted: number
  policyAdded: number
  policyRemoved: number
  policyChanged: number
  infoChanged: number
}

// 신청 시스템은 고정 순서로 둔다 (차트 색 --chart-1..7이 이 순서를 따른다).
export const changeSummary: ChangeSummary[] = [
  { system: 'SRMS', created: 24, extended: 31, deleted: 6, policyAdded: 18, policyRemoved: 4, policyChanged: 9, infoChanged: 12 },
  { system: 'ASMS', created: 0, extended: 3, deleted: 0, policyAdded: 2, policyRemoved: 0, policyChanged: 1, infoChanged: 0 },
  { system: 'HDSTEEL', created: 2, extended: 14, deleted: 4, policyAdded: 3, policyRemoved: 1, policyChanged: 2, infoChanged: 3 },
  { system: 'CSC', created: 17, extended: 22, deleted: 12, policyAdded: 25, policyRemoved: 7, policyChanged: 14, infoChanged: 5 },
  { system: '협조전', created: 0, extended: 1, deleted: 0, policyAdded: 1, policyRemoved: 0, policyChanged: 0, infoChanged: 0 },
  { system: '메일', created: 0, extended: 0, deleted: 1, policyAdded: 0, policyRemoved: 0, policyChanged: 0, infoChanged: 1 },
  { system: '기타', created: 0, extended: 2, deleted: 1, policyAdded: 1, policyRemoved: 0, policyChanged: 0, infoChanged: 1 },
]

export const changeLabels: { key: keyof Omit<ChangeSummary, 'system'>; label: string }[] = [
  { key: 'created', label: '신규' },
  { key: 'extended', label: '기간연장' },
  { key: 'deleted', label: '삭제' },
  { key: 'policyAdded', label: '정책추가' },
  { key: 'policyRemoved', label: '정책삭제' },
  { key: 'policyChanged', label: '정책변경' },
  { key: 'infoChanged', label: '정보변경' },
]

// 월간 리포팅 조회 범위. 기준월(가장 최근 마감월)은 위 회사별 · 시스템별 집계 그대로다.
export const reportLatest = { year: 2026, month: 10 }
export const reportFirst = { year: 2025, month: 1 }

export interface MonthlyReport {
  companySummary: CompanySummary[]
  changeSummary: ChangeSummary[]
  trend: { month: string; total: number; created: number; deleted: number }[]
}

// 기준월로부터 몇 달 전인지. 0이면 기준월.
function monthsBack(year: number, month: number): number {
  return reportLatest.year * 12 + reportLatest.month - (year * 12 + month)
}

// 같은 입력이면 항상 같은 값을 내는 목업용 난수 (0 ~ 1).
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// 과거 달은 기준월에서 한 달씩 거슬러 올라가며 만든다.
// 전월 대비 증감 = 신규 − 삭제가 되도록, 전월 사용자 수는 이번 달에서 그 증감을 뺀 값이다.
function companyAt(c: CompanySummary, back: number, index: number): CompanySummary {
  if (back === 0) return c
  const later = companyAt(c, back - 1, index)
  const total = Math.max(0, later.total - later.prevDiff)
  const vary = (value: number, k: number, from = 0.6) =>
    Math.max(0, Math.round(value * (from + noise(back * 31 + index * 5 + k) * 0.8)))
  // 기준월은 신규가 많은 달이라, 과거 달 신규는 낮춰 월 순증이 완만하게 한다.
  const created = vary(c.created, 1, 0.3)
  const deletedRequest = vary(c.deletedRequest, 2)
  const deletedExpired = vary(c.deletedExpired, 3)
  const deletedIdle = vary(c.deletedIdle, 4)
  const ratio = c.total === 0 ? 0 : total / c.total
  const vip = Math.round(c.vip * ratio)
  const partner = Math.round(c.partner * ratio)
  return {
    ...c,
    total,
    vip,
    partner,
    employee: Math.max(0, total - vip - partner),
    prevDiff: created - deletedRequest - deletedExpired - deletedIdle,
    created,
    deletedRequest,
    deletedExpired,
    deletedIdle,
  }
}

function changeAt(row: ChangeSummary, back: number, index: number): ChangeSummary {
  if (back === 0) return row
  const next = { ...row }
  changeLabels.forEach(({ key }, k) => {
    next[key] = Math.max(0, Math.round(row[key] * (0.5 + noise(back * 17 + index * 11 + k))))
  })
  return next
}

function companiesAt(back: number): CompanySummary[] {
  return companySummary.map((c, i) => companyAt(c, back, i))
}

// 선택한 연월의 리포트. 추이는 선택 월까지 최근 6개월이다.
export function monthlyReport(year: number, month: number): MonthlyReport {
  const back = monthsBack(year, month)
  const trend = [5, 4, 3, 2, 1, 0].map((i) => {
    const rows = companiesAt(back + i)
    const m = (((month - 1 - i) % 12) + 12) % 12 + 1
    return {
      month: `${String(m).padStart(2, '0')}월`,
      total: rows.reduce((sum, c) => sum + c.total, 0),
      created: rows.reduce((sum, c) => sum + c.created, 0),
      deleted: rows.reduce((sum, c) => sum + c.deletedRequest + c.deletedExpired + c.deletedIdle, 0),
    }
  })
  return {
    companySummary: companiesAt(back),
    changeSummary: changeSummary.map((row, i) => changeAt(row, back, i)),
    trend,
  }
}

// 사용자 구분별 기한 정책 (요구사항 §7). 생산협력사 미접속 기준은 미확정.
export const retentionPolicy: { userType: UserType; maxTerm: string; idleDelete: string }[] = [
  { userType: '정직원', maxTerm: '1년', idleDelete: '6개월 이상 미접속' },
  { userType: '협력사', maxTerm: '6개월', idleDelete: '3개월 이상 미접속' },
  { userType: '생산협력사', maxTerm: '1년', idleDelete: '1년 (확정 필요)' },
  { userType: 'VIP', maxTerm: '1년', idleDelete: '6개월 이상 미접속' },
]

// 권한 매트릭스: 역할(Admin, 운영자)별 허용 여부 (요구사항 §9).
export type PermissionRole = 'admin' | 'operator'
export interface PermissionRow {
  label: string
  detail: string
  admin: boolean
  operator: boolean
}

export const permissions: PermissionRow[] = [
  { label: '계정 생성 · 삭제', detail: 'VPN 사용자 계정 등록과 삭제', admin: true, operator: true },
  { label: '정책 생성 · 삭제', detail: 'ACL 생성, 매핑, 해제', admin: true, operator: true },
  { label: 'IP 할당', detail: '대역 내 고정 IP 할당과 회수', admin: true, operator: true },
  { label: '목록 확인 · 다운로드', detail: '계정 · 정책 조회와 엑셀 내보내기', admin: true, operator: true },
  { label: '신청 처리', detail: '연계 신청 승인 · 반려', admin: true, operator: true },
  { label: '그룹사 관리', detail: '그룹사 등록 · 수정, 그룹 정책 · 그룹 ACL 관리', admin: true, operator: true },
  { label: '감사 로그 조회', detail: '관리자 행위 내역 열람', admin: true, operator: true },
  { label: '관리자 생성 · 삭제', detail: '관리자 계정 추가와 삭제', admin: true, operator: false },
  { label: '권한 변경', detail: '역할 부여와 회수', admin: true, operator: false },
  { label: '접속 허용 IP 관리', detail: '시스템 접속 가능 IP 등록 · 삭제', admin: true, operator: false },
  { label: '계정 잠김 해제', detail: '타 관리자의 잠김 해제', admin: true, operator: false },
]
