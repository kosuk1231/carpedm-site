import { ImageResponse } from 'next/og';

export const alt = 'CARPEDM 카르페디엠 — 오늘 쓸 도구를 오늘 만듭니다';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT_URL =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff';

export default async function OpengraphImage() {
  const fontData = await fetch(FONT_URL).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#EEF1EF',
          color: '#10201D',
          padding: '72px 80px',
          fontFamily: 'Pretendard',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, color: '#5A6B66' }}>
            사회복지 현장의 스마트워크 · AI 전환
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 28,
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.22,
              letterSpacing: '-0.03em',
            }}
          >
            <span>오늘 쓸 도구를</span>
            <span>
              <span style={{ color: '#C08A2E' }}>오늘</span>
              {' '}만듭니다.
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '3px solid #10201D',
            paddingTop: 28,
            fontSize: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.06em' }}>CARPEDM</span>
            <span style={{ fontSize: 24, color: '#5A6B66' }}>카르페디엠</span>
          </div>
          <span style={{ color: '#C08A2E' }}>carpedm.kr</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Pretendard', data: fontData, weight: 700, style: 'normal' }],
    }
  );
}
