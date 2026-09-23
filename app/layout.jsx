import './globals.css';

// Vercel 도메인 설정이 carpedm.kr → www 로 308 리다이렉트하므로
// 검색엔진용 대표 주소(canonical)는 최종 주소인 www 로 맞춥니다.
const SITE = 'https://www.carpedm.kr';
const PRETENDARD_CSS =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css';
const HAHMLET_CSS =
  'https://fonts.googleapis.com/css2?family=Hahmlet:wght@500;600;700&display=swap';

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'CARPEDM 카르페디엠 — 사회복지 현장의 스마트워크 · AI 전환',
    template: '%s — CARPEDM',
  },
  description:
    '사회복지 현장의 스마트워크 · AI 전환. 강의와 컨설팅, 그리고 현장에서 실제로 돌아가는 직접 만든 도구들.',
  alternates: { canonical: SITE },
  openGraph: {
    title: 'CARPEDM 카르페디엠',
    description: '오늘 쓸 도구를 오늘 만듭니다.',
    url: SITE,
    siteName: 'CARPEDM',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CARPEDM 카르페디엠',
    description: '오늘 쓸 도구를 오늘 만듭니다.',
  },
};

// 검색엔진이 사이트 성격을 이해하도록 넣는 구조화 데이터입니다.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'CARPEDM 카르페디엠',
  url: SITE,
  email: 'kosuk1231@carpedm.kr',
  description:
    '사회복지 현장의 스마트워크 · AI 전환 강의와 컨설팅. 행사 운영, 회의·소통, 업무 효율화, 캠페인·홍보 도구 구축.',
  areaServed: '대한민국',
  knowsAbout: [
    '스마트워크',
    '생성형 AI 활용',
    '디지털 전환',
    'Google Workspace',
    'Google Apps Script',
    '기관 홍보 영상',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {/* React 19가 아래 link 태그들을 <head>로 끌어올립니다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" precedence="default" href={PRETENDARD_CSS} />
        <link rel="stylesheet" precedence="default" href={HAHMLET_CSS} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
