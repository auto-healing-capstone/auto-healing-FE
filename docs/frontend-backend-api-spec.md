# Frontend-Backend API Specification

이 문서는 현재 프론트엔드 구현을 기준으로 정리한 백엔드 연동 명세입니다.

> 이 문서는 `현재 FE 구현/호환 기준` 참고용입니다.
> 백엔드와 최종 합의할 목표 계약은
> [frontend-backend-target-contract.md](./frontend-backend-target-contract.md)
> 문서를 기준으로 확인하는 것을 권장합니다.

목적은 다음과 같습니다.

- 프론트가 이미 사용 중인 API 계약을 명확히 공유
- mock으로 먼저 구현된 인터랙션의 실제 API 형태를 합의
- 상태값, 페이지네이션, 에러 응답 형식을 일관되게 정리

관련 프론트 기준 파일:

- [src/entities/incident/types.ts](../src/entities/incident/types.ts)
- [src/entities/incident/status.ts](../src/entities/incident/status.ts)
- [src/entities/dashboard/types.ts](../src/entities/dashboard/types.ts)
- [src/entities/incident/api/reviewRecoveryAction.ts](../src/entities/incident/api/reviewRecoveryAction.ts)
- [src/shared/mocks/dashboard.ts](../src/shared/mocks/dashboard.ts)

## 1. Base URL

- 기본 API base URL: `http://localhost:8000/api/v1`
- 프론트 axios client 기준:
  [src/shared/api/client.ts](../src/shared/api/client.ts)

## 2. 공통 응답 규칙

- 날짜/시간은 ISO 8601 UTC 문자열 사용 권장
- enum은 문자열 사용
- nullable 필드는 `null` 허용
- 목록 응답은 가능하면 페이지네이션 메타 포함 권장
- 프론트는 목록 API를 `배열` 또는 `items + meta` 둘 다 수용하도록 준비됨
- 프론트는 API 우선 호출 후 실패 시 fallback mock으로 내려오도록 구현됨
- polling 기본 틀은 10초 기준으로 준비되어 있으며 websocket 도입 전까지 재사용 가능

### 공통 에러 응답 형식

```json
{
  "code": "INCIDENT_NOT_FOUND",
  "message": "Incident 101 was not found.",
  "details": {
    "incidentId": 101
  }
}
```

필드 정의:

- `code`
  프론트 분기용 고정 에러 코드
- `message`
  사용자/로그용 메시지
- `details`
  선택적 추가 정보

권장 에러 코드:

- `VALIDATION_ERROR`
- `INCIDENT_NOT_FOUND`
- `RECOVERY_ACTION_NOT_FOUND`
- `EXPORT_NOT_SUPPORTED`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_SERVER_ERROR`

## 3. 상태값 명세

프론트는 백엔드 원본 상태값을 화면용 단계로 해석합니다.

### 3.1 Incident Status Enum

- `normal`
- `warning`
- `firing`
- `pending`
- `approved`
- `running`
- `resolved`
- `failed`
- `rejected`

### 3.2 Recovery Action Status Enum

- `pending`
- `approved`
- `running`
- `resolved`
- `failed`
- `rejected`

### 3.3 Alert Feed Status Enum

- `new`
- `acknowledged`
- `resolved`

### 3.4 Severity Enum

- `critical`
- `warning`
- `info`

### 3.5 프론트 화면 해석 규칙

| Backend Status | Frontend Flow Label |
|---|---|
| `normal` | Normal |
| `warning` | Warning |
| `firing` | Incident |
| `pending` | Awaiting Approval |
| `approved` | Recovering |
| `running` | Recovering |
| `resolved` | Resolved |
| `failed` | Failed |
| `rejected` | Failed |

근거:
[src/entities/incident/status.ts](../src/entities/incident/status.ts)

## 4. Incident API

### 4.1 GET `/incidents`

장애 목록 조회 API.
현재 프론트가 직접 사용 중인 핵심 API입니다.

#### Query Parameters

- `page`: number, optional
- `page_size`: number, optional
- `status`: string, optional
- `severity`: string, optional
- `instance`: string, optional
- `search`: string, optional
- `date_from`: ISO datetime, optional
- `date_to`: ISO datetime, optional

예시:

```text
GET /api/v1/incidents?page=1&page_size=20&status=firing&severity=critical&instance=server-01&search=cpu
```

#### 현재 프론트 호환 응답 형식

```json
[
  {
    "id": 101,
    "alert_name": "HighCPU",
    "severity": "critical",
    "status": "firing",
    "instance": "server-01",
    "summary": "CPU usage remains over 90% after deployment batch A.",
    "description": "Pod worker saturation persists and response latency is climbing across the checkout service.",
    "fingerprint": "fallback_fp_001",
    "starts_at": "2026-03-30T07:00:00Z",
    "ends_at": null,
    "incident_id": null,
    "created_at": "2026-03-30T07:00:00Z",
    "updated_at": null
  }
]
```

#### Incident Field Definition

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | number | Y | 프론트 row key 및 상세 식별자 |
| `alert_name` | string | Y | 장애 이름 |
| `severity` | string | Y | `critical`, `warning`, `info` 권장 |
| `status` | string | Y | incident status enum |
| `instance` | string \| null | Y | 대상 서버/인스턴스 |
| `summary` | string \| null | Y | 짧은 요약 |
| `description` | string \| null | Y | 상세 설명 |
| `fingerprint` | string \| null | Y | 알림 고유 식별자 |
| `starts_at` | string | Y | 장애 시작 시각 |
| `ends_at` | string \| null | Y | 종료 시각 |
| `incident_id` | number \| null | Y | 내부 연계 ID |
| `created_at` | string | Y | 생성 시각 |
| `updated_at` | string \| null | Y | 수정 시각 |

근거:
[src/entities/incident/types.ts](../src/entities/incident/types.ts)

#### 권장 확장 응답 형식

장기적으로는 페이지네이션 메타 포함 형식 권장:

```json
{
  "items": [
    {
      "id": 101,
      "alert_name": "HighCPU",
      "severity": "critical",
      "status": "firing",
      "instance": "server-01",
      "summary": "CPU usage remains over 90% after deployment batch A.",
      "description": "Pod worker saturation persists and response latency is climbing across the checkout service.",
      "fingerprint": "fallback_fp_001",
      "starts_at": "2026-03-30T07:00:00Z",
      "ends_at": null,
      "incident_id": null,
      "created_at": "2026-03-30T07:00:00Z",
      "updated_at": null
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 54,
  "total_pages": 3
}
```

## 5. Recovery Review API

approve / reject용 API입니다.
현재 프론트는 mock 계약으로 이 흐름을 사용 중입니다.

### 5.1 POST `/recovery-actions/{recovery_action_id}/review`

#### Path Parameter

- `recovery_action_id`: string

#### Request Body

```json
{
  "incidentId": 103,
  "recoveryActionId": "heal-003",
  "decision": "approve",
  "requestedBy": "demo.admin",
  "reason": "Approved from incident detail modal.",
  "fingerprint": "fallback_fp_003",
  "target": "server-03"
}
```

#### Request Field Definition

| Field | Type | Required | Description |
|---|---|---:|---|
| `incidentId` | number | Y | 연관 incident ID |
| `recoveryActionId` | string | Y | recovery action ID |
| `decision` | `approve \| reject` | Y | 승인/거절 |
| `requestedBy` | string | Y | 요청 사용자 |
| `reason` | string | N | 승인/거절 사유 |
| `fingerprint` | string \| null | N | incident fingerprint |
| `target` | string \| null | N | 대상 서버/리소스 |

#### Response Body

```json
{
  "incidentId": 103,
  "recoveryActionId": "heal-003",
  "decision": "approve",
  "nextStatus": "approved",
  "reviewedAt": "2026-03-30T08:31:00Z",
  "reviewedBy": "demo.admin",
  "message": "Recovery action approved for server-03."
}
```

#### Response Field Definition

| Field | Type | Required | Description |
|---|---|---:|---|
| `incidentId` | number | Y | incident ID |
| `recoveryActionId` | string | Y | recovery action ID |
| `decision` | `approve \| reject` | Y | 요청 결과 |
| `nextStatus` | recovery action status enum | Y | 상태 전이 결과 |
| `reviewedAt` | string | Y | 처리 시각 |
| `reviewedBy` | string | Y | 처리 사용자 |
| `message` | string | Y | 프론트 토스트 메시지용 |

#### 권장 상태 전이 규칙

- `approve` → `nextStatus: "approved"`
- `reject` → `nextStatus: "rejected"`

추후 실제 실행 엔진 연결 시:

- 승인 완료 후 `approved`
- 실행 시작 후 `running`
- 실행 성공 후 `resolved`
- 실행 실패 후 `failed`

근거:

- [src/entities/incident/types.ts](../src/entities/incident/types.ts)
- [src/entities/incident/api/reviewRecoveryAction.ts](../src/entities/incident/api/reviewRecoveryAction.ts)

## 6. Recovery History API

프론트 recovery history 화면에서 기대하는 응답 구조입니다.
현재 프론트는 `GET /recovery-actions`를 우선 호출하고 실패 시 `recoveryHistoryMock`으로 fallback 합니다.

### 6.1 GET `/recovery-actions`

#### Query Parameters

- `page`: number, optional
- `page_size`: number, optional
- `status`: string, optional
- `target`: string, optional
- `search`: string, optional
- `date_from`: ISO datetime, optional
- `date_to`: ISO datetime, optional

예시:

```text
GET /api/v1/recovery-actions?page=1&page_size=20&status=pending&target=server-03
```

#### Response

```json
{
  "items": [
    {
      "id": "heal-003",
      "incidentName": "MemoryPressure",
      "action": "Increase cache limit",
      "target": "server-03",
      "status": "pending",
      "startedAt": "2026-03-30T08:20:00Z",
      "completedAt": null,
      "summary": "Awaiting admin approval before applying config change."
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 5,
  "total_pages": 1
}
```

#### Recovery History Item Definition

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | string | Y | recovery action ID |
| `incidentName` | string | Y | 연관 incident 이름 |
| `action` | string | Y | 수행 액션 이름 |
| `target` | string | Y | 대상 서버/리소스 |
| `status` | string | Y | recovery action status enum |
| `startedAt` | string | Y | 시작 시각 |
| `completedAt` | string \| null | Y | 완료 시각 |
| `summary` | string | Y | 요약 설명 |

근거:
[src/entities/dashboard/types.ts](../src/entities/dashboard/types.ts)

## 7. Notification Feed API

알림 센터 패널에서 기대하는 계약입니다.
현재 프론트는 `GET /alerts/feed`를 우선 호출하고 실패 시 `alertFeedMock`으로 fallback 합니다.

### 7.1 GET `/alerts/feed`

#### Query Parameters

- `page`: number, optional
- `page_size`: number, optional
- `status`: `new | acknowledged | resolved`, optional
- `severity`: `critical | warning | info`, optional
- `target`: string, optional

#### Response

```json
{
  "items": [
    {
      "id": "alert-feed-1",
      "title": "Critical Incident Detected",
      "message": "HighCPU exceeded threshold on server-01.",
      "severity": "critical",
      "timestamp": "2026-03-30T08:10:00Z",
      "source": "Prometheus Alertmanager",
      "target": "server-01",
      "status": "new"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 6,
  "total_pages": 1
}
```

#### Alert Item Definition

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | string | Y | 알림 ID |
| `title` | string | Y | 알림 제목 |
| `message` | string | Y | 알림 본문 |
| `severity` | string | Y | severity enum |
| `timestamp` | string | Y | 발생 시각 |
| `source` | string | N | 생성 시스템명 |
| `target` | string | N | 대상 서버/리소스 |
| `status` | string | N | `new`, `acknowledged`, `resolved` |

근거:
[src/entities/dashboard/types.ts](../src/entities/dashboard/types.ts)

### 7.2 선택 확장: PATCH `/alerts/{id}/read`

현재 프론트는 읽음 상태를 로컬로만 관리합니다.
서버 저장이 필요하면 아래 형태 권장:

```json
{
  "read": true,
  "readBy": "demo.admin"
}
```

## 8. Reports Export API

현재 프론트는 mock export UI를 사용합니다.
실제 백엔드 계약은 아래 중 하나 권장입니다.

### 8.1 POST `/reports/export`

#### Request Body

```json
{
  "format": "pdf",
  "filters": {
    "severity": "critical",
    "range": "24h",
    "status": "incident"
  }
}
```

#### Response Option A: Job 생성형

```json
{
  "jobId": "export-001",
  "format": "pdf",
  "status": "queued",
  "message": "PDF export queued with 5 filtered incidents and summary charts."
}
```

#### Response Option B: 동기 다운로드형

```json
{
  "format": "pdf",
  "downloadUrl": "/api/v1/reports/export/export-001/download",
  "expiresAt": "2026-03-30T09:00:00Z"
}
```

프론트가 필요로 하는 최소 필드:

- `format`
- `status` 또는 `downloadUrl`
- `message`

## 9. Settings Save API

현재 프론트는 mock save UX를 사용 중입니다.

### 9.1 PUT `/settings`

#### Request Body

```json
{
  "profile": {
    "name": "John Doe",
    "email": "john.doe@company.com",
    "role": "System Administrator",
    "timezone": "UTC"
  },
  "notifications": {
    "critical": true,
    "warning": true,
    "info": false,
    "email": true,
    "slack": true
  },
  "ai": {
    "autoResolve": false,
    "predictionEnabled": true,
    "sensitivity": "75"
  },
  "integrations": {
    "backendBaseUrl": "http://localhost:8000/api/v1",
    "webhookChannel": "#aiops-alerts"
  }
}
```

#### Response

```json
{
  "saved": true,
  "savedAt": "2026-03-30T08:40:00Z",
  "message": "Settings saved successfully."
}
```

## 10. 페이지네이션 / 필터 공통 규칙

### Pagination Query

- `page`
  1-based integer
- `page_size`
  integer

### Pagination Response Meta

```json
{
  "page": 1,
  "page_size": 20,
  "total": 54,
  "total_pages": 3
}
```

### Incident Filters

- `status`
- `severity`
- `instance`
- `search`
- `date_from`
- `date_to`

### Recovery Filters

- `status`
- `target`
- `search`
- `date_from`
- `date_to`

### Alert Feed Filters

- `status`
- `severity`
- `target`
- `page`
- `page_size`

## 11. 프론트 fallback/mock vs 실제 연동 예정 구분

### 이미 실제 API 사용 중

- `GET /incidents`

### API 우선 호출 + fallback 준비 완료

- `GET /incidents`
- `GET /recovery-actions`
- `GET /alerts/feed`
- `POST /recovery-actions/{id}/review`
- metrics/cards API 함수 틀
- metrics/chart API 함수 틀
- 공통 polling/fallback 훅

### 프론트 계약만 먼저 만든 항목

- recovery approve / reject
- recovery history 조회
- notification feed 조회
- reports export
- settings save

### 현재 mock/fallback 처리 중

- metric 카드 수치
- 리소스 차트
- notification center fallback 데이터
- recovery history fallback 데이터
- approve / reject fallback 처리 결과
- export 준비 메시지
- settings save 성공 상태

## 12. 백엔드와 우선 합의가 필요한 쟁점

1. incident 목록 응답을 배열로 유지할지 `items + meta`로 확장할지
2. `approved`와 `running`을 recovery 단계에서 어떻게 분리할지
3. `rejected`를 incident status에도 둘지, recovery action status에만 둘지
4. notification 읽음 상태를 서버에 저장할지
5. reports export를 동기 다운로드로 할지 job 방식으로 할지
6. settings를 단일 저장으로 할지 섹션별 저장으로 나눌지

## 13. 백엔드 공유 시 최소 우선순위 세트

가장 먼저 맞추면 좋은 항목:

1. `GET /incidents`
2. `POST /recovery-actions/{id}/review`
3. `GET /recovery-actions`
4. `GET /alerts/feed`
5. 상태값 enum 표
6. 공통 에러 응답 형식
7. 페이지네이션 메타 형식
