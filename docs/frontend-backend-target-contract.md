# Frontend-Backend Target Contract

이 문서는 `auto-healing-FE`와 `auto-healing-BE`가 최종적으로 맞춰야 할 **목표 API 계약** 초안입니다.

중요:

- 이 문서는 **현재 프론트 구현 상태 설명 문서가 아닙니다**
- 현재 프론트가 임시로 쓰는 mock/fallback 계약과 다를 수 있습니다
- 백엔드와의 합의가 필요한 목표 상태를 정리한 문서입니다

현재 구현 참고용 문서:

- [frontend-backend-api-spec.md](./frontend-backend-api-spec.md)

## 1. 목적

- 백엔드가 실제로 제공해야 할 우선순위 높은 API 계약 정리
- 프론트 mock/fallback 흐름을 실제 API로 교체하기 위한 기준 제공
- 상태값, 에러 응답, 페이지네이션 형식 통일

## 2. Base URL

- 기본 API base URL: `http://localhost:8000/api/v1`

## 3. 공통 규칙

- 날짜/시간은 ISO 8601 UTC 문자열 사용
- enum은 문자열 사용
- nullable 필드는 `null` 허용
- 목록 응답은 `items + meta` 형식 권장
- 공통 에러 응답은 아래 형식 권장

```json
{
  "code": "INCIDENT_NOT_FOUND",
  "message": "Incident 101 was not found.",
  "details": {
    "incidentId": 101
  }
}
```

권장 에러 코드:

- `VALIDATION_ERROR`
- `INCIDENT_NOT_FOUND`
- `RECOVERY_ACTION_NOT_FOUND`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_SERVER_ERROR`

## 4. 상태값 계약

### 4.1 Incident Status

- `normal`
- `warning`
- `firing`
- `pending`
- `approved`
- `running`
- `resolved`
- `failed`
- `rejected`

### 4.2 Recovery Action Status

- `pending`
- `approved`
- `running`
- `resolved`
- `failed`
- `rejected`

### 4.3 Alert Feed Status

- `new`
- `acknowledged`
- `resolved`

### 4.4 Severity

- `critical`
- `warning`
- `info`

## 5. 우선순위 높은 API

### 5.1 GET `/incidents`

장애 목록 조회 API.

#### Query Parameters

- `page`: number, optional
- `page_size`: number, optional
- `status`: string, optional
- `severity`: string, optional
- `instance`: string, optional
- `search`: string, optional
- `date_from`: ISO datetime, optional
- `date_to`: ISO datetime, optional

#### Response

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
      "incident_id": 101,
      "created_at": "2026-03-30T07:00:00Z",
      "updated_at": "2026-03-30T07:10:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 54,
  "total_pages": 3
}
```

#### Incident Fields

- `id`: number
- `alert_name`: string
- `severity`: string
- `status`: string
- `instance`: string | null
- `summary`: string | null
- `description`: string | null
- `fingerprint`: string | null
- `starts_at`: string
- `ends_at`: string | null
- `incident_id`: number | null
- `created_at`: string
- `updated_at`: string | null

### 5.2 GET `/incidents/{incident_id}`

장애 상세 조회 API.

이 API는 프론트 상세 모달의 mock 로그/메트릭/분석 영역을 실제 데이터로 교체하기 위한 우선순위 높은 항목입니다.

#### Response

```json
{
  "incident": {
    "id": 101,
    "alert_name": "HighCPU",
    "severity": "critical",
    "status": "pending",
    "instance": "server-01",
    "summary": "CPU usage remains over 90% after deployment batch A.",
    "description": "Pod worker saturation persists and response latency is climbing across the checkout service.",
    "fingerprint": "fallback_fp_001",
    "starts_at": "2026-03-30T07:00:00Z",
    "ends_at": null,
    "incident_id": 101,
    "created_at": "2026-03-30T07:00:00Z",
    "updated_at": "2026-03-30T07:10:00Z"
  },
  "logs": [
    "[INFO] Alert received for HighCPU",
    "[WARN] Instance: server-01",
    "[ERROR] Pod worker saturation persists"
  ],
  "metrics": [
    { "label": "CPU", "value": "92%", "change": "+18%" },
    { "label": "Memory", "value": "71%", "change": "+4%" },
    { "label": "Disk I/O", "value": "56%", "change": "-2%" }
  ],
  "analysis": {
    "summary": "Potential cause: resource contention detected around server-01.",
    "confidence": "87%",
    "priority": "Immediate",
    "recommended_next_step": "Review service health, validate recent deploy changes, and approve automated recovery if alerts persist."
  }
}
```

### 5.3 GET `/recovery-actions`

복구 이력 목록 조회 API.

#### Query Parameters

- `page`: number, optional
- `page_size`: number, optional
- `status`: string, optional
- `target`: string, optional
- `search`: string, optional
- `date_from`: ISO datetime, optional
- `date_to`: ISO datetime, optional

#### Response

```json
{
  "items": [
    {
      "id": "heal-003",
      "incidentId": 103,
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

### 5.4 GET `/incidents/{incident_id}/recovery-actions`

장애별 복구 이력 조회 API.

이 API는 incident detail modal과 이후 E2E 흐름 화면을 위해 필요합니다.

#### Response

```json
{
  "items": [
    {
      "id": "heal-003",
      "incidentId": 103,
      "incidentName": "MemoryPressure",
      "action": "Increase cache limit",
      "target": "server-03",
      "status": "pending",
      "startedAt": "2026-03-30T08:20:00Z",
      "completedAt": null,
      "summary": "Awaiting admin approval before applying config change."
    }
  ]
}
```

### 5.5 POST `/recovery-actions/{id}/approve`

관리자 승인 API.

#### Request Body

```json
{
  "requestedBy": "demo.admin",
  "reason": "Approved from incident detail modal.",
  "incidentId": 103,
  "fingerprint": "fallback_fp_003",
  "target": "server-03"
}
```

#### Response

```json
{
  "recoveryActionId": "heal-003",
  "decision": "approve",
  "nextStatus": "approved",
  "reviewedAt": "2026-03-30T08:31:00Z",
  "reviewedBy": "demo.admin",
  "message": "Recovery action approved for server-03."
}
```

### 5.6 POST `/recovery-actions/{id}/reject`

관리자 거절 API.

#### Request Body

```json
{
  "requestedBy": "demo.admin",
  "reason": "Rejected from incident detail modal.",
  "incidentId": 103,
  "fingerprint": "fallback_fp_003",
  "target": "server-03"
}
```

#### Response

```json
{
  "recoveryActionId": "heal-003",
  "decision": "reject",
  "nextStatus": "rejected",
  "reviewedAt": "2026-03-30T08:31:00Z",
  "reviewedBy": "demo.admin",
  "message": "Recovery action rejected for server-03."
}
```

### 5.7 POST `/heal`

실제 복구 실행 API.

이 API는 승인 이후 백엔드 auto-healing 실행과 연결되는 핵심 API입니다.

#### Request Body

```json
{
  "incidentId": 103,
  "recoveryActionId": "heal-003",
  "action": "Increase cache limit",
  "target": "server-03",
  "approvedBy": "demo.admin"
}
```

#### Response

```json
{
  "recoveryActionId": "heal-003",
  "status": "running",
  "startedAt": "2026-03-30T08:32:00Z",
  "message": "Recovery execution started for server-03."
}
```

### 5.8 GET `/alerts/feed`

알림 센터용 feed API.

#### Query Parameters

- `page`: number, optional
- `page_size`: number, optional
- `status`: string, optional
- `severity`: string, optional
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

## 6. 선택 확장 API

### 6.1 PATCH `/alerts/{id}/read`

알림 읽음 상태를 서버 저장할 경우 권장.

```json
{
  "read": true,
  "readBy": "demo.admin"
}
```

### 6.2 POST `/reports/export`

보고서 export API.

### 6.3 PUT `/settings`

설정 저장 API.

## 7. 페이지네이션 메타

```json
{
  "page": 1,
  "page_size": 20,
  "total": 54,
  "total_pages": 3
}
```

## 8. 백엔드와 반드시 먼저 맞출 항목

1. `GET /incidents` 응답 형식은 `items + meta`로 통일할지 여부
2. `GET /incidents/{id}` 상세 응답 구조
3. `POST /recovery-actions/{id}/approve`
4. `POST /recovery-actions/{id}/reject`
5. `POST /heal`
6. `GET /recovery-actions`
7. `GET /incidents/{id}/recovery-actions`
8. `GET /alerts/feed`
9. 공통 에러 응답 형식
10. 상태 enum 표

## 9. 현재 문서 사용 가이드

- 프론트 현재 구현 확인: [frontend-backend-api-spec.md](./frontend-backend-api-spec.md)
- 백엔드와 목표 계약 합의: 이 문서 사용
- 둘이 다를 경우: 이 문서를 기준으로 합의 후 프론트 구현을 추후 교체
