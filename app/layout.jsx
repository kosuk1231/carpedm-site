import './globals.css';

export const metadata = {
  title: 'CARPEDM 카르페디엠',
  description: '사회복지 현장의 스마트워크 · AI 전환. 강의와 컨설팅, 그리고 직접 만든 도구들.',
  metadataBase: new URL('https://carpedm.kr'),
  openGraph: {
    title: 'CARPEDM 카르페디엠',
    description: '오늘 쓸 도구를 오늘 만듭니다.',
    url: 'https://carpedm.kr',
    siteName: 'CARPEDM',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
