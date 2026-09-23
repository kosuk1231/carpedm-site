# CARPEDM 문의 에이전트 연동

## 목적

사이트 문의가 접수되면 기존 Google Apps Script 흐름은 그대로 유지합니다.

1. 스프레드시트 저장
2. 관리자 메일 알림
3. 문의자에게 접수 확인 자동 회신
4. 선택적으로 OpenClaw/에이전트 웹훅 호출

에이전트는 **최종 답변을 자동 발송하는 역할이 아니라 초안 작성과 알림을 우선**합니다. 사람 확인 없이 견적·일정·확정 답변을 보내지 않는 구조가 기본입니다.

## Vercel 환경 변수

- `CONTACT_AGENT_WEBHOOK`: OpenClaw 또는 중계 서버의 HTTPS 엔드포인트
- `CONTACT_AGENT_SECRET`: 사이트와 에이전트가 공유하는 긴 임의 문자열

둘 중 하나라도 없으면 에이전트 연동은 건너뛰고 기존 문의 접수는 정상 동작합니다.

## 웹훅 요청

헤더:

```
Content-Type: application/json
X-CARPEDM-Secret: <CONTACT_AGENT_SECRET>
```

예시 payload:

```json
{
  "event": "contact.received",
  "mode": "draft_only",
  "requestedActions": [
    "summarize_inquiry",
    "draft_reply",
    "notify_owner",
    "suggest_next_steps"
  ],
  "id": "CD-260924-AB12",
  "receivedAt": "2026-09-23T15:20:00.000Z",
  "inquiry": {
    "type": "강의",
    "program": "ai-vibecoding",
    "programTitle": "생성형 AI 실무 · 바이브코딩",
    "org": "OO복지관",
    "name": "김OO",
    "phone": "010-0000-0000",
    "email": "name@org.or.kr",
    "schedule": "11월 평일 오후",
    "headcount": "21~50명",
    "method": "오프라인",
    "message": "중간관리자 대상 3시간 실습을 희망합니다."
  }
}
```

## OpenClaw 권장 역할 분담

### main / 제갈량
- 문의 요약
- 문의 유형·프로그램·일정·인원·특이사항 구조화
- 다음 행동 결정
- developer/critic 필요 여부 판단

### developer
- 시스템 구축·자동화 문의일 때 기술 범위 초안
- 필요한 사전 정보 체크리스트
- 예상 구현 단계 정리
- 견적 금액은 자동 확정하지 않음

### critic
- 회신 초안의 과장 표현·누락·불명확한 약속 검토
- 개인정보나 민감정보가 초안에 불필요하게 포함됐는지 확인

## Telegram 알림 예시

```
[CARPEDM 새 문의]
접수번호: CD-260924-AB12
기관: OO복지관
유형: 실습 워크숍
프로그램: 생성형 AI 실무 · 바이브코딩
희망: 11월 평일 오후 / 30명 / 오프라인

요약:
- 중간관리자 대상 3시간 실습 희망
- 기관 업무 사례를 활용하고 싶음

추천 다음 행동:
1. 가능한 일정 확인
2. 3시간 권장 구성 회신
3. 개인정보 제거 예시자료 준비 안내

[회신 초안 보기]
```

## 자동 회신 원칙

현재 GAS의 접수 확인 메일은 즉시 자동 발송해도 됩니다.
이는 “접수되었습니다 / 영업일 기준 2일 안에 확인하겠습니다” 수준의 확인 메일입니다.

에이전트가 작성한 아래 내용은 사람 승인 후 발송을 권장합니다.

- 구체적 강의안
- 일정 확정
- 비용·견적
- 구축 범위와 납기
- 계약·세금계산서 관련 답변

## 추후 확장

1. 에이전트 초안을 Telegram 인라인 버튼으로 승인/수정
2. 승인된 답변을 Gmail 또는 CARPEDM 메일로 발송
3. 스프레드시트 상태를 `신규 → 확인 → 회신 → 확정 → 완료`로 자동 갱신
4. 확정 문의는 Calendar에 일정 후보/확정 일정 등록
5. 종료 후 만족도 설문과 후기 요청 자동화
