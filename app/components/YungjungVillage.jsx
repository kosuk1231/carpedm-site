'use client';

import { useCallback, useEffect, useState } from 'react';
import Village3D from './Village3D';
import CampusIntro from './CampusIntro';
import { CAMPS } from '../data/agents';

// 홈 첫 화면의 CARPEDM 캠퍼스(3D).
// - PC: 3D 캠퍼스를 배경으로 띄우고, '둘러보기'를 눌러야 조작이 켜집니다.
// - 휴대폰·좁은 화면: 처음엔 캠퍼스 정지 그림만 보여 주고, '둘러보기'를 누를 때 3D를 불러옵니다(첫 화면 속도·배터리).
// - WebGL 을 못 쓰는 브라우저: 공간 목록만 보여 줍니다.
export default function YungjungVillage() {
  const [mode, setMode] = useState(null);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement('canvas');
      ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { ok = false; }
    const light = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;
    setMode(!ok ? 'plain' : light ? 'poster' : '3d');
  }, []);
  const fail = useCallback(() => setMode('plain'), []);

  if (mode === '3d') return <Village3D onFail={fail} autoStart={auto} />;
  return (
    <section className="yv" aria-label="CARPEDM 캠퍼스">
      <div className={`yv-stage ${mode === 'poster' ? 'yv-poster' : 'yv-plain'}`}>
        {mode === 'poster' && (
          <>
            <a className="yv-skipbar" href="#overview">3D 건너뛰고 내용 보기 ↓</a>
            <CampusIntro onStart={() => { setAuto(true); setMode('3d'); }} />
          </>
        )}
        {mode === 'plain' && (
          <div className="yv-plain-inner">
            <b>사회복지 현장 AI·스마트워크 강의·컨설팅</b>
            <p>이 브라우저에서는 3D 캠퍼스를 열 수 없습니다. 각 공간으로 바로 가실 수 있습니다.</p>
            <div>
              {CAMPS.map((c) => <a key={c.key} href={c.link.href}>{c.no} {c.what} · {c.place}</a>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
