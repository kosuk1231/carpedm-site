# carpedm.kr 개선 설계 (2026-09-15, 승인됨)

## 배경

- carpedm.kr = Cloudflare Worker(단축링크, KV+D1) → 통과 시 Vercel Next.js 15 사이트(kosuk1231/carpedm-site, 공개 저장소).
- 요청: awesome-design-md 방식 적용 + 포트폴리오 개선 제안 + 보안 점검.
- 결정(사용자 승인): 커스텀 DESIGN.md 작성(리디자인 없음), 보안은 보고 + 즉시 수정, 배포는 확인 후.

## 범위

### 1. DESIGN.md (저장소 루트)
awesome-design-md 형식(YAML 토큰 프런트매터 + Overview/Colors/Typography/Layout/Elevation/Shapes/Components/Do-Don't/Responsive 섹션)으로 현재 디자인 체계를 성문화. 팔레트: ink #10201D / paper #EEF1EF / brass #C08A2E. Pretendard, 모서리 반경 2px, 플랫(그림자 없음), 1px 라인 편집 디자인.

### 2. Worker 보안 수정 (~/Desktop/carpedm-worker/src/index.js)
- decodeURIComponent 예외 처리 (잘못된 인코딩 → 500 방지)
- ADMIN_TOKEN 상수 시간 비교 (SHA-256 다이제스트 비교)
- KV 기반 로그인 실패 rate limit: IP당 10회/10분
- target ≤ 2048자, title ≤ 100자 제한
- 관리자 API 응답 Cache-Control: no-store
- PASS_THROUGH에 opengraph-image, twitter-image 추가

### 3. 사이트 보안 (carpedm-site)
- next.config.mjs headers(): CSP(frame-ancestors 'none' 포함), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- app/admin/layout.jsx: robots noindex
- app/robots.js: /admin 차단, sitemap 선언

### 4. 포트폴리오 기본기
- app/icon.svg (파비콘), app/opengraph-image.js (공유 미리보기), app/sitemap.js
- layout.jsx: JSON-LD(Person), 메타데이터 보강(canonical, twitter card)
- globals.css의 CDN @import 제거 → layout에서 preconnect + stylesheet link

### 5. 보고
- 보안 점검 결과 요약(수정됨/보고만: 공개 저장소 여부, vercel.app 직접 접근 등)
- 포트폴리오 콘텐츠 제안(이름·프로필, 스크린샷, 후기, 문의 폼 등)

## 비범위
- 사이트 리디자인, 콘텐츠 수정, 새 페이지 추가
- D1 데이터 보존 정책 변경

## 검증
- next build 성공, wrangler deploy --dry-run 성공
- 배포는 사용자 확인 후: git push(Xcode 라이선스 동의 필요) + wrangler deploy
