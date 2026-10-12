'use client';

import { useCallback, useEffect, useState } from 'react';
import Village3D from './Village3D';
import VillageIso from './VillageIso';

// 홈 첫 화면의 융중 마을. WebGL 이 되는 기기에서는 3D, 아니면 가벼운 2.5D 로 보여 줍니다.
// 방문자가 고른 방식은 이 브라우저에 기억합니다.
export default function YungjungVillage() {
  const [mode, setMode] = useState(null);
  const [gl, setGl] = useState(false);

  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement('canvas');
      ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { ok = false; }
    let saved = null;
    try { saved = localStorage.getItem('yv-mode'); } catch { /* 저장소를 못 쓰는 브라우저 */ }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setGl(ok);
    setMode(!ok ? 'iso' : saved || (reduce ? 'iso' : '3d'));
  }, []);

  const choose = useCallback((m) => {
    setMode(m);
    try { localStorage.setItem('yv-mode', m); } catch { /* 무시 */ }
  }, []);
  const fail = useCallback(() => setMode('iso'), []);
  const toIso = useCallback(() => choose('iso'), [choose]);
  const to3d = useCallback(() => choose('3d'), [choose]);

  if (!mode) return <section className="yv" aria-hidden="true"><div className="yv-stage" /></section>;
  if (mode === '3d') return <Village3D onSwitch={toIso} onFail={fail} />;
  return <VillageIso onSwitch={gl ? to3d : undefined} />;
}
