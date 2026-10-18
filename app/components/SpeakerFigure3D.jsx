'use client';

import { useEffect, useRef, useState } from 'react';

// 프로필 옆에 띄우는 작은 3D 아바타(FDE Wizard 킷으로 고석우님 사진 기준으로 만든 치비 캐릭터).
// 기존 정적 프로필 사진(kosukwoo-site-clean.jpg)은 그대로 두고, 이건 그 옆에 덧붙는 장식 위젯이다.
// WebGL을 못 쓰거나 로드에 실패하면 그냥 아무것도 안 그리고 사라진다(레이아웃 깨짐 없음).
export default function SpeakerFigure3D() {
  const hostRef = useRef(null);
  const stageRef = useRef(null);
  const [mode, setMode] = useState(null); // null(판단 전) | '3d' | 'off'

  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement('canvas');
      ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { ok = false; }
    setMode(ok ? '3d' : 'off');
  }, []);

  useEffect(() => {
    if (mode !== '3d') return;
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      let THREE, GLTFLoader;
      try {
        [THREE, { GLTFLoader }] = await Promise.all([
          import('three'),
          import('three/addons/loaders/GLTFLoader.js'),
        ]);
      } catch { setMode('off'); return; }
      if (disposed) return;

      const host = hostRef.current;
      if (!host) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch { setMode('off'); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
      cam.position.set(0, 1.3, 4.0);
      cam.lookAt(0, 1.2, 0);

      scene.add(new THREE.HemisphereLight(0xfff4e0, 0x2a2018, 1.6));
      const key = new THREE.DirectionalLight(0xfff3df, 1.9);
      key.position.set(1.6, 2.4, 2.0);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffe0b0, 0.6);
      rim.position.set(-1.8, 1.2, -1.5);
      scene.add(rim);

      let mixer = null;
      let idleAction = null;
      let waveAction = null;
      let rig = null;

      const loader = new GLTFLoader();
      // 일부 재질(eye·tie·skin_face·suit_torso)은 블렌더에서 색이 노드 그래프로 들어가 있어
      // glTF 내보내기가 baseColor를 못 읽고 흰색 기본값으로 떨어진다(clearcoat·sheen 같은 단순 값은 살아남음).
      // params.py COLORS 값으로 직접 보정한다.
      const COLOR_FIXUP = {
        eye: 0x6b4632,     // iris
        skin_face: 0xf0bc98,
        suit_torso: 0x141a35,
        tie: 0x18215a,
      };

      loader.load(
        '/char/kosukwoo-wizard.glb',
        (gltf) => {
          if (disposed) return;
          rig = gltf.scene;
          rig.traverse((o) => {
            const hex = o.material && COLOR_FIXUP[o.material.name];
            if (hex !== undefined) o.material.color.setHex(hex);
          });
          scene.add(rig);

          mixer = new THREE.AnimationMixer(rig);
          const byName = (n) => gltf.animations.find((a) => a.name === n);
          const idleClip = byName('idle');
          const waveClip = byName('wave');
          if (idleClip) {
            idleAction = mixer.clipAction(idleClip);
            idleAction.play();
          }
          if (waveClip) waveAction = mixer.clipAction(waveClip);
        },
        undefined,
        () => { if (!disposed) setMode('off'); },
      );

      const resize = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let active = true;
      const io = new IntersectionObserver(([e]) => { active = e.isIntersecting; }, { threshold: 0.1 });
      if (stageRef.current) io.observe(stageRef.current);

      // 가끔 손인사 동작을 한 번 끼워 넣고 다시 대기 동작으로 돌아감
      let waveTimer = window.setInterval(() => {
        if (!mixer || !waveAction || !idleAction || !active) return;
        waveAction.reset().setLoop(THREE.LoopOnce, 1).play();
        waveAction.clampWhenFinished = true;
        idleAction.crossFadeTo(waveAction, 0.25, false);
        window.setTimeout(() => {
          if (disposed) return;
          idleAction.reset().play();
          waveAction.crossFadeTo(idleAction, 0.3, false);
        }, 1800);
      }, 9000);

      const timer = new THREE.Timer();
      const loop = () => {
        if (!disposed && active) {
          timer.update();
          const dt = timer.getDelta();
          mixer?.update(dt);
          if (rig) rig.rotation.y = Math.sin(timer.getElapsed() * 0.35) * 0.35;
          renderer.render(scene, cam);
        }
        raf = requestAnimationFrame(loop);
      };
      let raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.clearInterval(waveTimer);
        ro.disconnect();
        io.disconnect();
        mixer?.stopAllAction();
        scene.traverse((o) => {
          o.geometry?.dispose?.();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m?.dispose?.());
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();
    return () => { disposed = true; cleanup(); };
  }, [mode]);

  if (mode === 'off') return null;
  return (
    <div className="speaker-figure" ref={stageRef}>
      <span>3D 아바타 · WIP</span>
      <div className="speaker-figure-stage" ref={hostRef} aria-hidden="true" />
      <p>사진 한 장으로 만든 3D 캐릭터(FDE Wizard 킷 활용) — 다듬는 중입니다.</p>
    </div>
  );
}
