import { ImageResponse } from 'next/og';

export const alt = 'CARPEDM 카르페디엠 — 현장의 문제를 작동하는 도구로 바꿉니다';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT_URL =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff';

// 폰트 CDN 에 닿지 못하는 환경(빌드 샌드박스·CDN 장애)에서도 빌드가 실패하지 않도록
// 폰트를 못 받으면 기본 폰트로 렌더링합니다.
async function loadFont() {
  try {
    const res = await fetch(FONT_URL);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      // woff 시그니처 확인 — 프록시가 HTML 오류 페이지를 돌려주는 경우 걸러냅니다.
      const head = String.fromCharCode(...new Uint8Array(buf.slice(0, 4)));
      if (head === 'wOFF') return buf;
    }
  } catch {
    /* CDN 실패 → 아래 로컬 폰트로 */
  }
  // 빌드 머신에 있는 폰트로 대체 (Vercel 에서는 보통 CDN 이 성공하므로 여기까지 오지 않습니다)
  const { readFile } = await import('node:fs/promises');
  const candidates = [
    '/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  ];
  for (const path of candidates) {
    try {
      const buf = await readFile(path);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } catch {
      /* 다음 후보 */
    }
  }
  return null;
}

export default async function OpengraphImage() {
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F6F2E9',
          color: '#211D16',
          padding: '72px 80px',
          fontFamily: 'Pretendard',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, color: '#607845', fontWeight: 700 }}>
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
            <span>현장의 문제를</span>
            <span>
              <span
                style={{
                  color: '#607845',
                  backgroundColor: '#FAEFE4',
                  padding: '0 12px',
                  borderRadius: 8,
                }}
              >
                작동하는 도구
              </span>
              {' '}로 바꿉니다.
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '3px solid #211D16',
            paddingTop: 28,
            fontSize: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.06em' }}>CARPEDM</span>
            <span style={{ fontSize: 24, color: '#7E7666' }}>카르페디엠</span>
          </div>
          <span style={{ color: '#D98B4F', fontWeight: 700 }}>carpedm.kr</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'Pretendard', data: fontData, weight: 700, style: 'normal' }] : [],
    }
  );
}
