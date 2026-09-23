# 문의폼 → 스프레드시트 연결 설정

문의폼(`#contact`)은 `POST /api/contact` → Google Apps Script 웹앱 → 스프레드시트 **강의 문의**(`1q4ulu2tv8sKWWJi6vLMwm_13M6jpLZTs7uzjcWJammE`)로 저장됩니다.
환경 변수가 없으면 폼은 자동으로 **이메일 대체 경로**(작성 내용을 담은 mailto)를 안내하므로, 배포 순서와 무관하게 사이트가 깨지지 않습니다.

## 흐름

```
방문자 폼 입력 ─▶ /api/contact (검증·honeypot·비밀키 부착)
                    └─▶ Apps Script doPost ─▶ '문의' 시트 appendRow
                                            ├─▶ 담당자 알림 메일 (ADMIN_EMAIL)
                                            └─▶ 문의자 접수 확인 메일 (자동 회신)
```

## 1. Apps Script 배포 (스프레드시트 쪽)

1. 스프레드시트 **강의 문의** 열기 → 확장 프로그램 → Apps Script
2. `docs/contact-form-apps-script.gs` 내용을 `Code.gs`에 붙여 넣고 저장
3. 프로젝트 설정(⚙) → **스크립트 속성**에 추가
   - `SHARED_SECRET` : 임의의 긴 문자열 (예: `openssl rand -hex 24` 결과)
   - `ADMIN_EMAIL` : 알림 받을 주소 (비우면 스크립트 소유자 메일로 감)
4. 에디터에서 `setup` 함수를 한 번 실행 → 권한 승인 → `문의` 시트와 헤더가 생성됨
5. 배포 → **새 배포** → 유형 **웹 앱**
   - 실행 계정: **나**
   - 액세스 권한: **모든 사용자** (익명 포함 — 비밀키로 걸러냅니다)
6. 표시되는 웹 앱 URL(`https://script.google.com/macros/s/…/exec`) 복사

> 스크립트를 수정한 뒤에는 배포 → 배포 관리 → 새 버전으로 다시 배포해야 반영됩니다.

## 2. Vercel 환경 변수

프로젝트 Settings → Environment Variables (Preview·Production 모두)

| 이름 | 값 |
| --- | --- |
| `CONTACT_GAS_URL` | 1-6의 웹 앱 URL |
| `CONTACT_SECRET` | 1-3의 `SHARED_SECRET`과 동일한 문자열 |

저장 후 재배포하면 적용됩니다. 로컬 개발은 `.env.local`에 같은 두 값을 넣습니다.

## 3. 확인

- 브라우저에서 웹 앱 URL을 직접 열면 `{"ok":true,"service":"carpedm-contact"}` 가 보여야 합니다.
- 사이트 `#contact`에서 테스트 문의를 보내면 `문의` 시트에 한 행이 추가되고, 담당자 알림·접수 확인 메일이 발송됩니다.
- 시트의 **상태** 열은 드롭다운(신규 → 확인 → 회신 → 확정 → 완료 / 보류)으로 관리합니다.

## 시트 컬럼

`접수일시 · 접수번호 · 상태 · 문의유형 · 관심프로그램 · 기관명 · 담당자 · 연락처 · 이메일 · 희망일정 · 예상인원 · 진행방식 · 문의내용 · 개인정보동의 · 유입페이지 · 브라우저 · 메모`

접수번호는 `CD-YYMMDD-XXXX` 형식으로 사이트와 메일, 시트에서 같은 값을 씁니다.

## 다음 단계 (포트폴리오 6번째 케이스로 확장)

- 상태가 `확정`으로 바뀌면 강의계획서(DOCX) 자동 생성 → 문의자 메일 발송
- 알림톡(Solapi) 연결로 담당자 즉시 알림
- 월별 문의 통계 대시보드 (시트 피벗 또는 별도 화면)


## 7. 선택: OpenClaw/에이전트 연동

문의 저장과 접수 확인 메일이 정상 동작한 뒤 에이전트를 붙입니다.

Vercel 환경 변수:

```
CONTACT_AGENT_WEBHOOK=https://<agent-or-relay-endpoint>
CONTACT_AGENT_SECRET=<long-random-secret>
```

두 값이 없으면 문의폼은 기존 GAS 흐름만 사용합니다. 값을 설정하면 스프레드시트 저장 성공 후 에이전트 웹훅으로 동일한 문의가 전달됩니다.

권장 흐름은 **접수 확인은 자동**, **구체적 회신은 에이전트가 초안을 만들고 사람이 승인**하는 방식입니다. 견적·일정 확정·구축 범위는 사람 확인 없이 자동 발송하지 않습니다.

상세 payload와 OpenClaw 역할 분담은 `docs/contact-agent-integration.md`를 참고합니다.
