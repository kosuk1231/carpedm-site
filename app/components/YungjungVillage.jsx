'use client';

import { useCallback, useEffect, useState } from 'react';
import Village3D from './Village3D';
import { CAMPS } from '../data/agents';

// 홈 첫 화면의 CARPEDM 캠퍼스(3D). WebGL 을 못 쓰는 브라우저에서는 건물 목록만 보여 줍니다.
export default function YungjungVillage() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement('canvas');
      ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { ok = false; }
    setMode(ok ? '3d' : 'plain');
  }, []);
  const fail = useCallback(() => setMode('plain'), []);

  if (mode === '3d') return <Village3D onFail={fail} />;
  return (
    <section className="yv" aria-label="CARPEDM 캠퍼스">
      <div className="yv-stage yv-plain">
        {mode === 'plain' && (
          <div className="yv-plain-inner">
            <b>CARPEDM 캠퍼스</b>
            <p>이 브라우저에서는 3D 캠퍼스를 열 수 없습니다. 각 공간으로 바로 가실 수 있습니다.</p>
            <div>
              {CAMPS.map((c) => <a key={c.key} href={c.link.href}>{c.no} {c.place}</a>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
