---
version: 2.0
name: carpedm-design-system
description: 사회복지 현장 스마트워크·AI 전문가 CARPEDM(carpedm.kr)의 웜 휴머니스트 매거진 인터페이스. 따뜻한 크림 캔버스 위에 세리프(Hahmlet) 제목과 산세리프(Pretendard) 본문, 틸 그린과 살구색 투 톤 포인트. 흰 카드에 아주 옅은 그림자, 14px 라운드. 잡지의 특집 지면처럼 품위 있고 사람 냄새가 나되, 촌스럽지 않게 — 세리프의 온기와 AI 전문가다운 정돈이 공존한다.

colors:
  canvas: "#F6F2E9"         # 페이지 배경 (따뜻한 크림)
  card: "#FFFEFB"           # 카드·입력창 표면 (거의 흰색)
  ink: "#211D16"            # 제목, 강한 텍스트
  body: "#4C463C"           # 본문
  muted: "#7E7666"          # 라벨, 캡션, 보조 텍스트
  teal: "#43706A"           # 제1 포인트. 강조 단어, 링크, 버튼, 통계 숫자, CTA 배경
  teal-deep: "#355A55"      # teal 호버
  teal-soft: "#EBF0EC"      # teal 연한 배경 (배지)
  apricot: "#E0995A"        # 제2 포인트. CTA 버튼, 단축주소 슬러그, 온기 담당
  apricot-soft: "#F6E3CE"   # 형광펜 하이라이트, 연한 배경
  line: "#E4DCCB"           # 헤어라인, 카드 테두리
  error: "#A33A26"          # 오류 텍스트
  on-teal: "#F3F1E9"        # teal 배경 위 텍스트
  on-teal-muted: "#C5D4CF"  # teal 배경 위 보조 텍스트

typography:
  display:                  # 히어로 lede
    fontFamily: "Hahmlet, 'Noto Serif KR', serif"
    fontSize: clamp(36px, 5.4vw, 60px)
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.015em
  section-title:            # 섹션 제목 (.h2) — v1과 달리 크고 당당한 세리프
    fontFamily: "Hahmlet, serif"
    fontSize: clamp(24px, 3vw, 32px)
    fontWeight: 600
  card-title:               # 카드·행 소제목
    fontFamily: "Hahmlet, serif"
    fontSize: 21px
    fontWeight: 600
  subheading:               # .h3 (표 그룹 제목)
    fontFamily: "Hahmlet, serif"
    fontSize: 17px
    fontWeight: 600
  body:
    fontFamily: "Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: 15-16px
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: -0.005em
  small:
    fontSize: 14-14.5px
    lineHeight: 1.65
  badge:                    # 영문 라벨 배지 (SMART WORK, AX …)
    fontSize: 11px
    fontWeight: 800
    letterSpacing: 0.14em
    color: teal
    background: teal-soft
  stat-number:
    fontFamily: "Hahmlet, serif"
    fontSize: 34px
    fontWeight: 600
    color: teal
  mono:                     # URL, 짧은 주소
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
    letterSpacing: -0.02em

rounded:
  card: 14px
  button: 10px
  badge: 6px
  cta: 18px

shadows:
  card: "0 6px 18px rgba(60,50,30,.05)"
  raised: "0 10px 28px rgba(60,50,30,.07)"
  note: "그림자는 항상 이 두 값만. 진한 그림자·글로우 금지"

spacing:
  section-gap: 76px
  card-gap: 18px
  container: "max-width 1060px, 좌우 패딩 28px"
---

# CARPEDM Design System v2 (carpedm.kr)

## Overview

사회복지 현장의 스마트워크·AI 전환을 돕는 1인 전문가 사이트. 잘 만든 잡지의
특집 지면 — 세리프 제목이 이끌고, 여백이 숨을 쉬고, 흰 카드가 내용을 받치는 —
을 지향한다.

핵심 성격 세 가지:

1. **세리프가 목소리다.** 제목은 전부 Hahmlet(함렛). 세리프의 품위와 온기가
   "사람 중심 사회복지"를 말하고, 기하학적 골격이 "AI·디지털 전문가"를 말한다.
   본문은 Pretendard로 담백하게.
2. **틸과 살구, 역할 분담.** 틸 그린(`teal`)은 신뢰 — 링크, 버튼, 숫자, CTA 배경.
   살구색(`apricot`)은 온기 — 형광펜 하이라이트, 단축주소, CTA 안의 행동 버튼.
   두 색이 한 화면에 같이 설 때는 틸이 바탕, 살구가 점정.
3. **크림 위의 흰 카드.** 배경(`canvas`)은 따뜻한 크림, 내용은 거의 흰
   카드(`card`) 위에. 카드는 1px `line` 테두리 + 옅은 그림자 + 14px 라운드.

## Colors

### Surface

| 토큰 | 값 | 용도 |
|---|---|---|
| `canvas` | `#F6F2E9` | 페이지 배경 |
| `card` | `#FFFEFB` | 카드, 입력창, 통계 타일 |
| `teal` | `#43706A` | CTA 박스 배경 (반전 영역) |
| `teal-soft` | `#EBF0EC` | 배지 배경 |
| `apricot-soft` | `#F6E3CE` | 형광펜 하이라이트, 연한 강조 배경 |

### Text

| 토큰 | 값 | 용도 |
|---|---|---|
| `ink` | `#211D16` | 제목, 강조 |
| `body` | `#4C463C` | 본문 |
| `muted` | `#7E7666` | 라벨, 캡션, 표 헤더 |
| `on-teal` | `#F3F1E9` | teal 배경 위 |
| `on-teal-muted` | `#C5D4CF` | teal 배경 위 보조 |

### Accent & Semantic

| 토큰 | 값 | 용도 |
|---|---|---|
| `teal` | `#43706A` | 링크, 버튼, 배지 글자, 통계 숫자, 강조 단어 |
| `teal-deep` | `#355A55` | teal 요소 호버 |
| `apricot` | `#E0995A` | CTA 행동 버튼, 슬러그 강조, 포인트 언더라인 |
| `line` | `#E4DCCB` | 헤어라인, 카드 테두리 |
| `error` | `#A33A26` | 오류 텍스트 |

규칙: 세 번째 포인트 컬러 금지. 성공/경고가 필요하면 틸/살구 계열 안에서 해결.

## Typography

### Font Family

- **제목: Hahmlet** (Google Fonts, 500·600·700). 굵기는 600이 기본, 700은 절제.
- **본문: Pretendard.** 세리프 본문 금지 — 세리프는 제목의 특권으로 남긴다.
- **모노스페이스**는 `carpedm.kr/ax` 같은 URL·코드성 텍스트 전용.

### Hierarchy

- 히어로: `clamp(36px, 5.4vw, 60px)/600`, 줄간 1.3. 강조 단어 하나만 틸 색 +
  살구 형광펜(`apricot-soft` 블록을 글자 뒤에 12px 높이로 깐다).
- 섹션 제목(`.h2`): 24–32px 세리프. v1의 "작은 라벨" 규칙은 폐기 — 이 시스템은
  제목이 당당하게 크다. 옆이나 아래에 muted 보조문을 단다.
- 카드 제목 21px 세리프, 본문 15–16px/1.75, 캡션 12.5–13px muted.
- 영문 라벨(SMART WORK 등)은 11px/800 대문자 배지 — `teal-soft` 배경 + teal 글자.

### Principles

- 세리프 자간은 거의 손대지 않는다 (-0.015em 이하로만). 산세리프 본문은 -0.005em.
- 본문 줄은 44–60ch에서 끊는다.
- 숫자가 주인공인 곳(통계)은 세리프 600으로 크게, 틸 색.

## Layout

### Grid & Container

- `max-width: 1060px`, 좌우 28px.
- 히어로는 **비대칭 2단**: 왼쪽 카피(1.3fr) + 오른쪽 보조 카드(0.7fr, 살짝 뜬
  그림자). 820px 이하에서 1단.
- 내용 카드는 2컬럼 그리드, `gap: 18px`. 카드끼리 붙이지 않는다(1px-gap 지면
  분할은 v1의 유산 — 사용하지 않음).

### Section Anatomy

```
.sec (padding-top 76px)
├─ .headrow  세리프 제목(좌) + muted 보조문(우, baseline 정렬)
└─ 카드 그리드 / 목록 / 표
```

### Signature Moves

- **형광펜 하이라이트**: 히어로 강조 단어 뒤 `apricot-soft` 블록. 페이지당 1회.
- **뜬 보조 카드**: 히어로 우측의 단축주소 카드 — 이 사이트의 정체성(단축링크)을
  첫 화면에서 보여주는 장치. `shadow-raised` + 점선 구분선.
- **네비 하단 1px ink 라인**: 지면의 시작 선언. 이것만은 v1에서 계승.

## Elevation & Depth

- 카드: `0 6px 18px rgba(60,50,30,.05)` — 있는 듯 없는 듯.
- 띄운 카드(히어로 보조 카드): `0 10px 28px rgba(60,50,30,.07)`.
- 반전 영역은 `teal` 배경 + `on-teal` 텍스트 (CTA, 활성 토글).
- 이 두 그림자 외의 그림자·글로우·그라디언트 금지.

## Shapes

- 카드 14px, 버튼 10px, 배지 6px, CTA 박스 18px. pill(999px)은 쓰지 않는다.
- 아코디언 토글은 `+`/`−` 문자를 28px 원각 사각형에.
- 이미지를 넣게 되면 실제 화면 스크린샷만, 14px 라운드 + 1px `line` 테두리.

## Components

### Top Navigation

- 로고: 세리프 CARPEDM 700 + 한글 병기 13px muted. 우측 "문의하기"는 teal 배경
  흰 글자 버튼(10px 라운드). 네비 하단 1px `ink` 보더.

### Buttons

| 종류 | 스타일 |
|---|---|
| 기본(`.btn`) | `teal` 배경, `on-teal` 글자, 12×24px, 10px 라운드. 호버 `teal-deep` |
| CTA 행동 | `apricot` 배경, `ink` 글자 — teal 반전 박스 안에서만 |
| 보조(`.mini`) | `card` 배경 + 1px `line` 테두리, 13px. 호버 시 테두리 `teal` |
| 비활성 | `opacity: .38` |

### Cards & Containers

- 기본 카드: `card` 배경, 1px `line`, 14px 라운드, `shadow-card`, 패딩 28px.
- 통계 타일: 카드와 동일 + 세리프 숫자 34px teal, 라벨 13px muted.
- 배지: `teal-soft` 배경, teal 글자, 6px 라운드, 5×10px 패딩.
- 아코디언: 카드 모양 그대로, 열리면 토글 사각형이 teal 반전.

### Inputs & Forms

- 라벨 13px muted 위, 입력창 `card` 배경 + 1px `line`, 10px 라운드, 13×14px 패딩.
- 포커스: `outline: 2px teal, offset 2px`.
- 슬러그 특수 입력: 테두리 없이 3px `apricot` 밑줄, 모노스페이스.
- 오류는 입력창 옆 13px `error` 텍스트. 모달·토스트 금지.

### Tables

- 헤더 11.5px muted + 하단 1px `ink` 보더, 본문 행 1px `line` 구분.
- 세로선·줄무늬 금지. 표가 큰 화면 요소일 때는 카드에 담아도 좋다(패딩 24px).

### CTA / Footer

- CTA: `teal` 배경 18px 라운드 박스. 좌측 세리프 제목 + 보조문, 우측 `apricot`
  버튼 (좁은 화면에선 세로). 페이지당 한 번.
- 푸터: 13px muted 한 줄.

## Do's and Don'ts

### Do

- 제목은 Hahmlet, 본문은 Pretendard — 예외 없이.
- 강조가 필요하면 먼저 세리프·크기·틸 색으로, 그다음이 살구 하이라이트.
- 카드 그림자는 정의된 두 값만.
- URL·명령어는 모노스페이스.
- `prefers-reduced-motion` 존중.

### Don't

- 세 번째 포인트 컬러 금지 (특히 파랑·빨강 원색).
- 세리프 본문 금지. 형광펜 하이라이트 남용 금지(페이지당 1회).
- pill 버튼, 진한 그림자, 그라디언트, 유리 효과 금지.
- 아이콘 폰트·이모지를 위계에 넣지 않는다.
- 크림 캔버스 위에 순백(#FFF) 대신 `card`(#FFFEFB)를 쓴다 — 눈부심 방지.

## Responsive Behavior

- 브레이크포인트 **820px**(히어로 2단→1단)과 **720px**(카드 그리드→1단, 표 완화).
- 세리프 제목은 `clamp()`로 유동.
- 터치 타깃 44px 근사 유지.
- 표는 좁은 화면에서 첫 열 nowrap 해제.

## Iteration Guide

1. 새 콘텐츠는 기존 패턴(headrow, 카드 그리드, 배지, 통계 타일, rtable)에 먼저
   끼워 넣는다.
2. 새 토큰이 필요하면 `globals.css`의 `:root`와 이 문서를 같이 갱신한다.
3. OG 이미지·파비콘도 이 팔레트를 따른다 (틸 배경 파비콘, 크림 캔버스 OG).

## Known Gaps

- 다크 모드 없음 (의도적 — 크림 지면 메타포 유지).
- OG 이미지는 Hahmlet 대신 Pretendard Bold 사용 (satori가 가변 TTF를 안정적으로
  못 읽음 — 정적 Hahmlet TTF를 구하면 교체).
- 아이콘 시스템 없음 (필요 시 1.5px 스트로크 라인 아이콘으로 통일).
