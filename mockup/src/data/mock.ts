// P0-3 목업 더미 데이터 제공자.
// 실제 연동/영속화는 Phase 2 이후에 붙인다. 이 파일은 그때 제거 대상이다.

export type UserType = '정직원' | '협력사' | '생산협력사' | 'VIP'
export type AccountStatus = '사용중' | '만료임박' | '만료' | '잠김'
export type RequestKind =
  | '신규'
  | '기간연장'
  | '삭제'
  | '정책추가'
  | '정책삭제'
  | '정책변경'
  | '정보변경'
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
}

export interface VpnRequest {
  id: string
  kind: RequestKind
  status: RequestStatus
  account: string
  name: string
  company: string
  userType: UserType
  sourceSystem: string
  sourceNo: string
  requestedAt: string
  requestedBy: string
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

export interface IpRange {
  id: string
  company: string
  cidr: string
  total: number
  assigned: number
  purpose: string
}

export interface StaticIp {
  id: string
  ip: string
  company: string
  account: string
  name: string
  assignedAt: string
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

export const acls: Acl[] = [
  {
    id: 'ACL-ERP-RO',
    name: 'ACL_ERP_READONLY',
    description: 'ERP 조회 전용',
    shared: true,
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

export const accounts: Account[] = [
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
    sourceSystem: '그룹웨어',
    sourceNo: 'GW-2026-03117',
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
    sourceSystem: '그룹웨어',
    sourceNo: 'GW-2026-00812',
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
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-01044',
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
    sourceSystem: '그룹웨어',
    sourceNo: 'GW-2025-09920',
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
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-02231',
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
    sourceSystem: 'EAI',
    sourceNo: 'EAI-2025-77310',
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
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-03008',
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
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-01520',
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
    sourceSystem: '그룹웨어',
    sourceNo: 'GW-2026-01904',
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
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2025-08841',
  },
]

export const requests: VpnRequest[] = [
  {
    id: 'R2026-1041',
    kind: '신규',
    status: '대기',
    account: 'etv.limjy',
    name: '임주은',
    company: '이테버스',
    userType: '정직원',
    sourceSystem: '그룹웨어',
    sourceNo: 'GW-2026-10410',
    requestedAt: '2026-10-05 09:12',
    requestedBy: '임주은',
  },
  {
    id: 'R2026-1040',
    kind: '정책추가',
    status: '대기',
    account: 'hst.leejh',
    name: '이준호',
    company: '한성테크',
    userType: '협력사',
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-04120',
    requestedAt: '2026-10-05 08:47',
    requestedBy: '한성테크 관리자',
  },
  {
    id: 'R2026-1039',
    kind: '기간연장',
    status: '처리중',
    account: 'sjm.ohms',
    name: '오민석',
    company: '세진물산',
    userType: '생산협력사',
    sourceSystem: 'EAI',
    sourceNo: 'EAI-2026-55120',
    requestedAt: '2026-10-04 17:30',
    requestedBy: 'EAI 자동연계',
  },
  {
    id: 'R2026-1038',
    kind: '삭제',
    status: '완료',
    account: 'dmi.seoha',
    name: '서하준',
    company: '대명정보시스템',
    userType: '협력사',
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-04098',
    requestedAt: '2026-10-04 11:05',
    requestedBy: '대명정보 관리자',
  },
  {
    id: 'R2026-1037',
    kind: '정보변경',
    status: '완료',
    account: 'park.jiyoung',
    name: '박지영',
    company: '이테버스',
    userType: '정직원',
    sourceSystem: '그룹웨어',
    sourceNo: 'GW-2026-10340',
    requestedAt: '2026-10-03 14:22',
    requestedBy: '박지영',
  },
  {
    id: 'R2026-1036',
    kind: '정책변경',
    status: '반려',
    account: 'dmi.kangty',
    name: '강태윤',
    company: '대명정보시스템',
    userType: '협력사',
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-04055',
    requestedAt: '2026-10-02 10:18',
    requestedBy: '대명정보 관리자',
  },
  {
    id: 'R2026-1035',
    kind: '신규',
    status: '완료',
    account: 'etvp.jungha',
    name: '정하늘',
    company: '이테버스파트너스',
    userType: '협력사',
    sourceSystem: '협력사포털',
    sourceNo: 'PP-2026-03008',
    requestedAt: '2026-10-01 09:40',
    requestedBy: '파트너스 관리자',
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
    detail: '협력사 계약 종료 (PP-2026-04098)',
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

export const ipRanges: IpRange[] = [
  { id: 'N01', company: '이테버스', cidr: '10.100.0.0/16', total: 65534, assigned: 412, purpose: '정직원 · VIP' },
  { id: 'N02', company: '이테버스', cidr: '10.100.1.0/24', total: 254, assigned: 12, purpose: 'VIP 고정 IP' },
  { id: 'N03', company: '이테버스', cidr: '10.100.12.0/24', total: 254, assigned: 97, purpose: '개발 조직' },
  { id: 'N04', company: '한성테크', cidr: '10.101.8.0/24', total: 254, assigned: 94, purpose: '유지보수 협력사' },
  { id: 'N05', company: '대명정보시스템', cidr: '10.102.4.0/24', total: 254, assigned: 57, purpose: 'SI 개발 협력사' },
  { id: 'N06', company: '세진물산', cidr: '10.103.2.0/24', total: 254, assigned: 23, purpose: '생산 협력사' },
  { id: 'N07', company: '이테버스파트너스', cidr: '10.104.6.0/24', total: 254, assigned: 168, purpose: '컨설팅' },
]

export const staticIps: StaticIp[] = [
  { id: 'S01', ip: '10.100.1.5', company: '이테버스', account: 'choi.sera', name: '최세라', assignedAt: '2025-11-03' },
  { id: 'S02', ip: '10.100.3.77', company: '이테버스', account: 'kim.doyun', name: '김도윤', assignedAt: '2026-02-17' },
  { id: 'S03', ip: '10.101.8.17', company: '한성테크', account: 'hst.leejh', name: '이준호', assignedAt: '2026-04-20' },
  { id: 'S04', ip: '10.103.2.14', company: '세진물산', account: 'sjm.ohms', name: '오민석', assignedAt: '2025-10-22' },
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
    detail: '요청 삭제 (PP-2026-04098)',
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

export const changeSummary: ChangeSummary[] = [
  { system: '그룹웨어', created: 24, extended: 31, deleted: 6, policyAdded: 18, policyRemoved: 4, policyChanged: 9, infoChanged: 12 },
  { system: '협력사포털', created: 17, extended: 22, deleted: 12, policyAdded: 25, policyRemoved: 7, policyChanged: 14, infoChanged: 5 },
  { system: 'EAI', created: 2, extended: 14, deleted: 4, policyAdded: 3, policyRemoved: 1, policyChanged: 2, infoChanged: 3 },
  { system: '수동(엑셀)', created: 0, extended: 2, deleted: 1, policyAdded: 1, policyRemoved: 0, policyChanged: 0, infoChanged: 1 },
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

export const monthlyTrend = [
  { month: '05월', total: 712, created: 38, deleted: 14 },
  { month: '06월', total: 731, created: 34, deleted: 15 },
  { month: '07월', total: 740, created: 29, deleted: 20 },
  { month: '08월', total: 748, created: 31, deleted: 23 },
  { month: '09월', total: 751, created: 27, deleted: 24 },
  { month: '10월', total: 754, created: 43, deleted: 40 },
]

// 사용자 구분별 기한 정책 (요구사항 §7). 생산협력사 미접속 기준은 미확정.
export const retentionPolicy: { userType: UserType; maxTerm: string; idleDelete: string }[] = [
  { userType: '정직원', maxTerm: '1년', idleDelete: '6개월 이상 미접속' },
  { userType: '협력사', maxTerm: '6개월', idleDelete: '3개월 이상 미접속' },
  { userType: '생산협력사', maxTerm: '1년', idleDelete: '1년 (확정 필요)' },
  { userType: 'VIP', maxTerm: '1년', idleDelete: '6개월 이상 미접속' },
]
