# Auto-Healing Frontend

React + Vite 기반의 AIOps 대시보드 프론트엔드입니다.

현재 프론트는 "백엔드가 아직 완전히 붙지 않아도 발표와 흐름 검증이 가능한 상태"를 목표로 구성되어 있습니다.

핵심 원칙은 다음과 같습니다.

- 장애 목록은 백엔드 `GET /api/v1/incidents` API를 우선 사용
- API 실패 시에도 fallback incident 데이터로 화면을 유지
- 메트릭, 알림, 복구 히스토리, 일부 리포트 흐름은 mock 데이터 기반으로 시연 가능
- loading / empty / error / route error / runtime error 대응 화면 포함
- 라우트 코드 스플리팅 적용으로 페이지 단위 lazy loading 구성

원본 시각 디자인은 아래 Figma 파일을 기반으로 시작했습니다.
`https://www.figma.com/design/7YTrVb4SSEYxhdOtgiFq6C/User-dashboard`

## 현재 구현 범위

### 주요 화면

- `/`
  메인 대시보드
  metric 카드, 리소스 차트, incident snapshot, 최근 장애 테이블, 상세 모달
- `/analytics`
  incidents 화면
  상태 분포, severity 비율, 검색/필터/페이지네이션 포함 장애 테이블
- `/reports`
  analytics / reports 화면
  severity 필터, 기간 필터, 상태 분포 차트, PDF/CSV export mock
- `/recovery`
  recovery history 화면
  상태/서버/기간 필터, 검색, approve/reject mock 인터랙션
- `/settings`
  settings 화면
  dirty state, reset, validation, success banner, mock save 흐름

### 공통 UX

- 상태 배지 시스템
  `Normal / Warning / Incident / Awaiting Approval / Recovering / Resolved / Failed`
- incident 상세 모달 탭 구조
  `Summary / Logs / Metrics / AI Analysis / Recovery`
- 알림 센터 패널
  토스트 + 알림 목록 패널 + 읽음 처리 mock
- approve / reject payload/type/api mock
- route loading fallback
- 전역 ErrorBoundary
- route error 화면

## 실제 API와 mock의 경계

### 실제 API 사용

- `GET /api/v1/incidents`
  장애 로그 조회

관련 파일:

- [src/shared/api/client.ts](./src/shared/api/client.ts)
- [src/entities/incident/api/getIncidents.ts](./src/entities/incident/api/getIncidents.ts)
- [src/entities/incident/types.ts](./src/entities/incident/types.ts)

### 현재 mock 사용

- metric 카드
- overview chart
- fallback incident 데이터
- recovery history
- notification center
- approve / reject review API mock
- reports export UI mock
- settings save UX mock

관련 파일:

- [src/shared/mocks/dashboard.ts](./src/shared/mocks/dashboard.ts)
- [src/entities/dashboard/types.ts](./src/entities/dashboard/types.ts)
- [src/entities/incident/api/reviewRecoveryAction.ts](./src/entities/incident/api/reviewRecoveryAction.ts)

## 현재 프론트에서 가능한 시연 흐름

- incident 목록 조회
  API 성공 시 실제 incident 사용
  API 실패 시 fallback incident로 유지
- incident 상세 모달 열기
  탭 구조, 타임라인, recovery 추천 액션 확인 가능
- approve / reject 실행
  payload/response mock 기반 상태 변경 가능
- 알림 센터 열기
  mock 알림 목록, unread 처리, severity/status 표시 가능
- recovery history 탐색
  검색, 상태 필터, 서버 필터, 기간 필터 사용 가능
- reports export 버튼 클릭
  PDF/CSV export 준비 흐름 mock 확인 가능
- settings 수정 및 저장
  dirty state, reset, validation, success banner 확인 가능
- runtime/route error fallback
  예외 발생 시 복구 가능한 에러 화면 표시

## 주요 구현 파일

### 라우팅 / 앱 레벨

- [src/app/App.tsx](./src/app/App.tsx)
- [src/app/AppErrorBoundary.tsx](./src/app/AppErrorBoundary.tsx)
- [src/routes/index.tsx](./src/routes/index.tsx)
- [src/routes/RouteErrorPage.tsx](./src/routes/RouteErrorPage.tsx)
- [src/layouts/DashboardLayout.tsx](./src/layouts/DashboardLayout.tsx)

### 도메인 / 상태 해석

- [src/entities/incident/types.ts](./src/entities/incident/types.ts)
- [src/entities/incident/status.ts](./src/entities/incident/status.ts)
- [src/entities/incident/api/reviewRecoveryAction.ts](./src/entities/incident/api/reviewRecoveryAction.ts)
- [src/entities/dashboard/types.ts](./src/entities/dashboard/types.ts)

### 화면

- [src/features/overview/OverviewPage.tsx](./src/features/overview/OverviewPage.tsx)
- [src/features/incidents/IncidentsPage.tsx](./src/features/incidents/IncidentsPage.tsx)
- [src/features/reports/ReportsPage.tsx](./src/features/reports/ReportsPage.tsx)
- [src/features/recovery/RecoveryHistoryPage.tsx](./src/features/recovery/RecoveryHistoryPage.tsx)
- [src/features/settings/SettingsPage.tsx](./src/features/settings/SettingsPage.tsx)
- [src/features/notifications/NotificationCenter.tsx](./src/features/notifications/NotificationCenter.tsx)

### 주요 컴포넌트

- [src/features/incidents/components/IncidentDetailsModal.tsx](./src/features/incidents/components/IncidentDetailsModal.tsx)
- [src/features/incidents/components/IncidentTimeline.tsx](./src/features/incidents/components/IncidentTimeline.tsx)
- [src/features/overview/components/IncidentTable.tsx](./src/features/overview/components/IncidentTable.tsx)
- [src/features/overview/components/MetricCard.tsx](./src/features/overview/components/MetricCard.tsx)
- [src/shared/ui/status-badge.tsx](./src/shared/ui/status-badge.tsx)
- [src/shared/ui/state-blocks.tsx](./src/shared/ui/state-blocks.tsx)

## 디렉터리 구조

```text
src/
  app/                    # 앱 시작점, 전역 에러 바운더리
  entities/               # 도메인 타입, 상태 해석, API 계층
    dashboard/
    incident/
  features/               # 페이지와 페이지 전용 컴포넌트
    incidents/
    notifications/
    overview/
    recovery/
    reports/
    settings/
  layouts/                # 공통 레이아웃
  routes/                 # react-router 설정 및 route error 화면
  shared/
    api/                  # axios client
    mocks/                # 발표용 mock 데이터
    ui/                   # 공용 UI 컴포넌트
  styles/                 # 전역 스타일
```

## 실행 방법

### 1. 프론트엔드 디렉터리로 이동

```bash
cd /srv/auto-healing/auto-healing-FE
```

### 2. Node 버전 확인

권장: Node 20 이상

```bash
node -v
npm -v
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

기본 접속 주소:

- `http://localhost:5173`

## 백엔드 연동

기본 API base URL은 다음 중 하나를 사용합니다.

- `VITE_API_BASE_URL`
- 미설정 시 `http://localhost:8000/api/v1`

현재 incidents 조회는 `/incidents` 엔드포인트를 사용합니다.

즉 FastAPI가 `http://localhost:8000`에서 떠 있으면 프론트에서 incident 데이터를 가져올 수 있고, 실패하면 자동으로 fallback incident로 전환됩니다.

관련 파일:

- [src/shared/api/client.ts](./src/shared/api/client.ts)
- [vite.config.ts](./vite.config.ts)

## 빌드

```bash
npm run build
```

현재 프로덕션 빌드는 통과합니다.

## 현재 발표용 포인트

- API가 없더라도 주요 화면이 거의 모두 유지됩니다.
- mock 데이터가 incident / alert / recovery 흐름으로 연결되어 있어서 시나리오형 데모가 가능합니다.
- approve / reject, export, settings save 같은 인터랙션은 백엔드 연결 전 mock 흐름으로 시연할 수 있습니다.
- 1440px, 1920px 발표 화면을 고려해 레이아웃과 상단 헤더 밀도를 정리했습니다.

## 아직 백엔드 연결이 필요한 영역

- websocket 실시간 연결
- 실시간 메트릭 API 연동
- heal API 실제 호출
- AI 분석 결과 실데이터 연결
- recovery 실행 상태 실시간 반영
- prediction 결과 실데이터 차트화
- reports export 실제 파일 다운로드
- settings save 실제 API 저장

## 참고

- 알림 센터와 recovery history는 현재 mock 데이터 기반입니다.
- route error / runtime error 화면이 있어도, 실제 에러 발생 원인을 대체하지는 않습니다.
- Recharts 관련 청크는 분리되어 있으며, 현재 빌드 기준 페이지 lazy loading이 적용되어 있습니다.
