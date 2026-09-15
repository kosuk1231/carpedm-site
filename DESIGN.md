---
version: 1.0
name: carpedm-design-system
description: 사회복지 현장 스마트워크·AI 전문가 CARPEDM(carpedm.kr)의 편집 디자인(에디토리얼) 인터페이스. 옅은 녹회색 종이 캔버스 위에 짙은 잉크 그린 텍스트, 브래스(황동) 단일 포인트 컬러. 그림자와 장식 없이 1px 헤어라인과 여백으로 위계를 만든다. 신문 지면처럼 절제된 톤 — 화려함 대신 신뢰감. 본문은 Pretendard, URL·코드성 텍스트는 모노스페이스. 모서리는 거의 각지게(2px), 굵은 상단 룰(2px ink)로 섹션의 시작을 선언한다.

colors:
  ink: "#10201D"            # 본문·제목. 검정 대신 아주 짙은 그린
  ink-2: "#1C3230"          # 보조 본문, 호버 배경
  paper: "#EEF1EF"          # 페이지 배경 (옅은 녹회색 종이)
  paper-2: "#F7F9F8"        # 카드·입력창 표면 (종이보다 한 단계 밝게)
  brass: "#C08A2E"          # 유일한 포인트. 강조 단어, 링크, 밑줄, 액티브 상태
  brass-soft: "#E8D6AE"     # brass의 연한 톤. 플레이스홀더, 링크 밑줄
  line: "#C6D0CC"           # 1px 헤어라인, 테두리
  muted: "#5A6B66"          # 보조 텍스트, 라벨, 캡션
  error: "#A33A26"          # 오류 텍스트
  on-ink: "#EEF1EF"         # 어두운 배경(ink) 위 텍스트 = paper
  on-ink-muted: "#A9BDB8"   # 어두운 배경 위 보조 텍스트

typography:
  display:                  # 히어로 lede, 워드마크
    fontFamily: "Pretendard, -apple-system, system-ui, sans-serif"
    fontSize: clamp(28px, 5vw, 46px)
    fontWeight: 800
    lineHeight: 1.24
    letterSpacing: -0.035em
  title:                    # 소제목 (workrow h3, cat-title)
    fontFamily: "Pretendard, sans-serif"
    fontSize: 19px
    fontWeight: 700
    letterSpacing: -0.02em
  section-label:            # 섹션 라벨 (.h2) — 크지 않고 '작게' 쓴다
    fontFamily: "Pretendard, sans-serif"
    fontSize: 13px
    fontWeight: 600
    color: muted
    note: "하단 1px line 보더와 함께. 섹션 제목은 소리치지 않는다"
  subheading:               # .h3 (표 그룹 제목)
    fontSize: 15px
    fontWeight: 700
  body:
    fontFamily: "Pretendard, sans-serif"
    fontSize: 15-16px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: -0.01em
  small:                    # 설명, dd, 표 본문
    fontSize: 14-14.5px
    lineHeight: 1.6-1.75
  caption:                  # dt 라벨, 표 헤더, 메타 정보
    fontSize: 11.5-13px
    color: muted
  stat-number:              # 통계 숫자
    fontSize: 28px
    fontWeight: 800
    letterSpacing: -0.03em
  mono:                     # URL, 짧은 주소, 코드성 텍스트
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
    letterSpacing: -0.02em

rounded:
  default: 2px              # 버튼, 카드, 입력창, 태그 전부 2px. 둥근 모서리 금지
  none: 0

shadows:
  none: "그림자를 쓰지 않는다. 깊이는 배경 단차(paper vs paper-2)와 1px line으로만"

spacing:
  section-gap: 64px         # .sec 상단 패딩
  block-gap: 20-28px
  inline-gap: 8-14px
  container: "max-width 1080px, 좌우 패딩 28px"
---

# CARPEDM Design System (carpedm.kr)

## Overview

사회복지 현장의 스마트워크·AI 전환을 돕는 1인 전문가 사이트. 잘 만든 인쇄물 —
신문 특집 지면이나 단정한 리포트 — 처럼 보여야 한다. 화면을 채우는 것은 색이나
그래픽이 아니라 **텍스트의 위계와 여백, 헤어라인**이다.

핵심 성격 세 가지:

1. **종이 위 잉크.** 배경은 순백이 아닌 옅은 녹회색 종이(`paper`), 글자는 순검정이
   아닌 짙은 잉크 그린(`ink`). 화면 전체가 한 색조(그린 계열) 안에서 움직인다.
2. **브래스 하나만 강조.** 포인트 컬러는 황동색(`brass`) 단 하나. 강조 단어,
   활성 상태, 링크, 밑줄에만 아껴 쓴다. 두 번째 포인트 컬러를 추가하지 않는다.
3. **선으로 만드는 구조.** 그림자·그라디언트 금지. 1px `line` 헤어라인, 2px `ink`
   상단 룰, 2px `brass` 왼쪽 룰로 영역을 나눈다.

## Colors

### Surface

| 토큰 | 값 | 용도 |
|---|---|---|
| `paper` | `#EEF1EF` | 페이지 배경 |
| `paper-2` | `#F7F9F8` | 카드, 입력창, 통계 타일 — 배경보다 한 단계 밝음 |
| `ink` | `#10201D` | 반전 영역(CTA 박스, 활성 토글)의 배경 |

### Text

| 토큰 | 값 | 용도 |
|---|---|---|
| `ink` | `#10201D` | 제목, 본문 강조 |
| `ink-2` | `#1C3230` | 본문 보조, 버튼 호버 |
| `muted` | `#5A6B66` | 설명문, 라벨, 캡션, 표 헤더 |
| `on-ink` | `#EEF1EF` | ink 배경 위 텍스트 |
| `on-ink-muted` | `#A9BDB8` | ink 배경 위 보조 텍스트 |

### Accent & Semantic

| 토큰 | 값 | 용도 |
|---|---|---|
| `brass` | `#C08A2E` | 강조 단어(`em`), 링크, 활성 밑줄, 포커스 아웃라인, CTA 버튼 배경 |
| `brass-soft` | `#E8D6AE` | 링크 밑줄, 플레이스홀더 |
| `line` | `#C6D0CC` | 모든 헤어라인과 테두리 |
| `error` | `#A33A26` | 오류 메시지 텍스트(배경 없이 글자색만) |

규칙: 성공/경고 색이 필요하면 brass 계열 안에서 해결하고, 새 색상 추가는 최후의 수단.

## Typography

### Font Family

- **본문·제목 전부 Pretendard.** 세리프 없음. 위계는 크기·굵기·색으로만.
- **모노스페이스는 의미가 있다.** `carpedm.kr/ax` 같은 URL, 짧은 주소, 코드성
  텍스트에만 `ui-monospace` 스택을 쓴다. 장식용으로 쓰지 않는다.

### Hierarchy

- 히어로 한 문장이 페이지에서 가장 크다: `clamp(28px, 5vw, 46px)/800/-0.035em`.
  강조 단어 하나만 `brass`로 물들인다 (예: "오늘 쓸 도구를 **오늘** 만듭니다").
- 섹션 제목(`.h2`)은 역설적으로 **13px 회색 라벨**이다. 하단 1px 헤어라인과 함께
  놓여 '지면의 코너 이름'처럼 기능한다. 큰 섹션 제목을 쓰지 않는 것이 이 시스템의
  가장 큰 특징이다.
- 소제목 19px/700, 본문 15–16px/1.7, 캡션 11.5–13px muted.
- 통계 숫자는 28px/800으로 유일하게 '숫자가 큰' 요소.

### Principles

- 자간은 항상 살짝 좁게 (-0.01em ~ -0.035em, 클수록 더 좁게).
- 본문 줄은 56–62ch에서 끊는다 (`max-width: 58ch` 등).
- 국문이 기본. 영문은 라벨(SMART WORK, AX)로 소문자 없이 짧게, `letter-spacing: 0.06em`.

## Layout

### Grid & Container

- 단일 컬럼 문서 흐름. `max-width: 1080px`, 좌우 28px.
- 2컬럼 그리드는 정보 짝(문제/해결, 소개/팩트, 용어/설명 dl)에만 쓴다.
- 카드 그리드는 `gap: 1px; background: line` 방식 — 카드 사이 간격이 아니라
  **1px 선으로 붙어 있는 신문 지면 분할**로 보이게 한다.

### Section Anatomy

```
.sec (padding-top 64px)
├─ .h2  13px muted 라벨 + 하단 1px line
├─ 필요 시 리드 문단 (15px muted, max-width 56ch)
└─ 내용 (행 단위로 1px line 구분)
```

### Signature Rules (선 사용법)

- **2px solid ink 상단 룰**: 워드마크 등 '여기서 중요한 것이 시작된다' 선언.
- **2px solid brass 왼쪽 룰**: 팩트 목록(`.facts`) 등 발췌 블록.
- **1px dashed line**: 기술 스택처럼 부록 성격의 행 구분.
- 나머지는 전부 1px solid `line`.

## Elevation & Depth

그림자 없음. 깊이 표현은 두 가지뿐:

1. 표면 단차 — `paper`(배경) 위에 `paper-2`(카드).
2. 반전 — 가장 강한 강조는 `ink` 배경 + `paper` 텍스트 (CTA 박스, 활성 +/− 토글).

호버도 그림자 대신 테두리색 변화(`line` → `ink`)나 배경 반전으로 처리한다.

## Shapes

- 모서리 반경은 **전부 2px**. pill, 원형, 큰 라운드 금지.
- 아이콘은 최소한으로. 아코디언 토글도 아이콘 폰트 대신 `+`/`−` 문자.
- 사진·일러스트 없이 텍스트로 승부하는 것이 기본. 이미지를 넣게 되면
  실제 화면 스크린샷(도구 증빙)만, 1px `line` 테두리를 둘러서.

## Components

### Top Navigation

- 로고(굵은 CARPEDM 800 + 한글 병기 13px muted) 좌측, 링크 하나("문의하기") 우측.
- 배경 없음, 스티키 아님. 높이를 만들지 말 것.

### Buttons

| 종류 | 스타일 |
|---|---|
| 기본(`.btn`) | `ink` 배경, `paper-2` 텍스트, 12×22px 패딩, 2px 라운드. 호버 시 `ink-2` |
| CTA 링크 | `brass` 배경, `ink` 텍스트, 12×24px — ink 반전 박스 안에서만 사용 |
| 보조(`.mini`) | 투명 배경 + 1px `line` 테두리, 13px. 호버 시 테두리 `ink` |
| 비활성 | `opacity: .38; cursor: not-allowed` |

### Cards & Containers

- 통계 타일(`.stats`): 1px-gap 그리드, 각 타일 `paper-2`, 라벨 12px muted + 숫자 28px/800.
- 안내 박스(`.common-note`): `paper-2` + 1px `line`, 본문 14.5px.
- 아코디언(`.cat`): `details/summary` 네이티브. 요약부에 제목/한 줄 설명/메타,
  우측 26px 정사각 `+` 박스. 열리면 박스가 ink 반전되고 `−`로 바뀐다.

### Inputs & Forms

- 라벨 13px muted 위, 입력창은 `paper-2` 배경 + 1px `line`, 13×14px 패딩.
- 특수 입력(슬러그): 테두리 없이 **3px brass 밑줄**만, brass 글자, 모노스페이스.
- 포커스는 공통 `outline: 2px brass, offset 2px`.
- 오류는 입력창 옆 13px `error` 텍스트. 모달·토스트 금지.

### Tables

- `.rtable`: 헤더 11.5px muted + 하단 1px `ink` 보더(헤더 아래만 진한 선),
  본문 행은 1px `line` 구분. 세로선·줄무늬·배경색 없음.

### Tags / Badges

- 12px muted, 1px `line` 테두리, 6×11px 패딩, 2px 라운드. 배경 채우지 않는다.

### CTA / Footer

- CTA: `ink` 배경 박스, 제목 22–30px/800, brass 버튼 하나. 페이지당 한 번.
- 푸터: 13px muted 한 줄, 좌우 배치.

## Do's and Don'ts

### Do

- 포인트가 필요하면 brass 하나로. 굵기·크기·여백으로 먼저 시도.
- 새 섹션은 `.h2` 13px 라벨 패턴을 그대로 따른다.
- 행 단위 정보는 1px `line`으로 구분하고 여백을 아끼지 않는다.
- URL·명령어는 모노스페이스로 구분한다.
- `prefers-reduced-motion` 존중 (이미 전역 처리).

### Don't

- 그림자, 그라디언트, 블러, 유리 효과 금지.
- 모서리 4px 이상 금지. pill 버튼 금지.
- 두 번째 포인트 컬러 금지 (파랑·빨강 계열 특히).
- 큰 섹션 제목 금지 — 섹션 제목은 항상 작은 라벨이다.
- 이모지·장식 아이콘을 본문 위계에 넣지 않는다.
- 애니메이션은 상태 전환 표시(복사됨 등) 이상으로 쓰지 않는다.

## Responsive Behavior

- 브레이크포인트는 **720px 하나**. 이하에서 모든 그리드가 1컬럼으로.
- `clamp()`로 히어로·워드마크 크기가 유동적으로 줄어든다.
- 터치 타깃: 버튼 패딩 유지(최소 44px 높이 근사), `.mini`도 6×12px 이상.
- 표는 좁은 화면에서 첫 열의 `white-space: nowrap`을 해제한다.

## Iteration Guide

새 페이지·컴포넌트를 추가할 때:

1. 먼저 기존 패턴(섹션 라벨, 1px-gap 그리드, dl 목록, rtable)에 끼워 넣을 수
   있는지 본다. 대부분 가능하다.
2. 새 토큰이 필요하면 `globals.css`의 `:root`에 추가하고 이 문서의 표를 갱신한다.
3. 색을 추가하고 싶다면 그 정보가 정말 색이어야만 구분되는지 다시 생각한다.

## Known Gaps

- 다크 모드 없음 (의도적 — 종이 메타포 유지).
- 아이콘 시스템 없음 (필요해지면 1.5px 스트로크 라인 아이콘으로 통일할 것).
- 이미지·스크린샷 스타일 가이드는 실제 도입 시점에 확정.
