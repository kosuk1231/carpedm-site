'use client';

import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const WIZARD_SRC = '/char/kosukwoo-wizard.glb';

// 블렌더 노드 그래프 색이 glTF 로 안 넘어오는 재질 보정값.
// SpeakerFigure3D.jsx 와 동일 모델(kosukwoo-wizard.glb)을 쓰므로 같은 보정을 그대로 재사용한다.
const COLOR_FIXUP = {
  eye: 0x6b4632,
  skin_face: 0xf0bc98,
  suit_torso: 0x141a35,
  tie: 0x18215a,
};

// ---------- Suspense 용 GLB 리소스 캐시 (throw-promise 패턴) ----------
// 모듈 스코프에 한 번만 로더를 만들어 두고, 같은 페이지에서 여러 번 마운트돼도
// 네트워크 요청과 파싱을 다시 하지 않는다.
let wizardResource = null;
function getWizardResource() {
  if (wizardResource) return wizardResource;
  let status = 'pending';
  let payload;
  const promise = (async () => {
    const [THREE, { GLTFLoader }] = await Promise.all([
      import('three'),
      import('three/addons/loaders/GLTFLoader.js'),
    ]);
    const loader = new GLTFLoader();
    const gltf = await new Promise((resolve, reject) => {
      loader.load(WIZARD_SRC, resolve, undefined, reject);
    });
    return { THREE, gltf };
  })();
  promise.then(
    (value) => { status = 'success'; payload = value; },
    (error) => { status = 'error'; payload = error; },
  );
  wizardResource = {
    read() {
      if (status === 'pending') throw promise;
      if (status === 'error') throw payload;
      return payload;
    },
  };
  return wizardResource;
}

// Suspense 는 throw 된 Promise 만 잡는다 — GLB 로드가 실패(네트워크·디코딩 오류)해서
// 진짜 Error 가 throw 되면 여기서 잡아 정적 폴백으로 내려준다.
class WizardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

// 실제 3D 렌더링. getWizardResource().read()가 로드 전이면 Promise를 throw 해서
// 상위 <Suspense>가 fallback을 보여주게 만든다(React 19 Suspense 표준 패턴).
function WizardStage({ active }) {
  const { THREE, gltf } = getWizardResource().read();
  const hostRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // SpeakerFigure3D.jsx와 같은 카메라 프레이밍(검증된 값) — 모델이 잘리지 않게 그대로 재사용.
    const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    cam.position.set(0, 1.3, 4.0);
    cam.lookAt(0, 1.2, 0);

    scene.add(new THREE.HemisphereLight(0x8fa8ff, 0x0b0905, 1.3));
    const key = new THREE.DirectionalLight(0xffe7bd, 2.0);
    key.position.set(2.0, 3.0, 2.4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6ea89f, 1.1);
    rim.position.set(-2.4, 1.6, -2.0);
    scene.add(rim);
    const fill = new THREE.PointLight(0xe0995a, 0.7, 12);
    fill.position.set(0, 0.6, 2.4);
    scene.add(fill);

    const rig = gltf.scene;
    rig.traverse((o) => {
      const hex = o.material && COLOR_FIXUP[o.material.name];
      if (hex !== undefined) o.material.color.setHex(hex);
    });
    scene.add(rig);

    let mixer = null;
    let idleAction = null;
    let waveAction = null;
    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(rig);
      const byName = (n) => gltf.animations.find((a) => a.name === n);
      const idleClip = byName('idle');
      const waveClip = byName('wave');
      if (idleClip) {
        idleAction = mixer.clipAction(idleClip);
        idleAction.play();
      }
      if (waveClip) waveAction = mixer.clipAction(waveClip);
    }

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

    // 가끔 손인사 동작을 한 번 끼워 넣고 다시 대기 동작으로 돌아감 (SpeakerFigure3D와 동일 패턴)
    const waveTimer = window.setInterval(() => {
      if (!mixer || !waveAction || !idleAction || !activeRef.current) return;
      waveAction.reset().setLoop(THREE.LoopOnce, 1).play();
      waveAction.clampWhenFinished = true;
      idleAction.crossFadeTo(waveAction, 0.3, false);
      window.setTimeout(() => {
        idleAction.reset().play();
        waveAction.crossFadeTo(idleAction, 0.35, false);
      }, 1900);
    }, 11000);

    const timer = new THREE.Timer();
    let raf;
    const loop = () => {
      if (activeRef.current) {
        timer.update();
        const dt = timer.getDelta();
        mixer?.update(dt);
        // 천천히 공중에 떠서 도는 느낌: 작은 좌우 스윙 + 아주 느린 누적 회전
        rig.rotation.y = Math.sin(timer.getElapsed() * 0.22) * 0.5 + timer.getElapsed() * 0.05;
        rig.position.y = Math.sin(timer.getElapsed() * 0.6) * 0.035;
        renderer.render(scene, cam);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(waveTimer);
      ro.disconnect();
      mixer?.stopAllAction();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m?.dispose?.());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [THREE, gltf]);

  return <div className="hc-stage-canvas" ref={hostRef} />;
}

function HcStageFallback() {
  return (
    <div className="hc-stage-fallback" role="presentation">
      <span className="hc-stage-pulse" />
    </div>
  );
}

// WebGL 미지원 · 저사양(모바일/터치) · 로드 실패 시 공통으로 쓰는 가벼운 정적 폴백.
// public/campus/poster.webp 같은 "무거우면 정적 이미지로" 패턴을 그대로 따르되,
// 이 모델 전용 스크린샷이 없어 CSS 글로우로 대체했다(성능·용량 우선).
function HcStagePoster() {
  return (
    <div className="hc-stage-poster" role="presentation">
      <span className="hc-stage-pulse hc-stage-pulse-static" />
    </div>
  );
}

export default function HeroCinematic() {
  const sectionRef = useRef(null);
  const [capability, setCapability] = useState('pending'); // pending | '3d' | 'poster'
  const [inView, setInView] = useState(true);
  const lenis = useLenis();

  // WebGL 지원 + 저사양(터치/좁은 화면) 여부를 판단 — YungjungVillage.jsx와 같은 기준.
  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement('canvas');
      ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      ok = false;
    }
    const light = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;
    setCapability(ok && !light ? '3d' : 'poster');
  }, []);

  // 화면 밖으로 스크롤되면(예: #speaker 아래로 내려가면) 렌더 루프를 멈춰 배터리·GPU를 아낀다.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Lenis의 부드러운 스크롤 값을 GSAP ticker가 직접 구동하고, 매 틱마다 ScrollTrigger를 갱신한다.
  // (Lenis + GSAP 공식 연동 패턴. ReactLenis root는 autoRaf:false로 두고 여기서만 raf를 돌린다.)
  useEffect(() => {
    if (!lenis) return undefined;
    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tick);
    };
  }, [lenis]);

  useGSAP(() => {
    if (!sectionRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTargets = ['.hc-kicker', '.hc-line', '.hc-sub', '.hc-actions', '.hc-stage-shell', '.hc-stats', '.hc-short', '.hc-scroll'];

    if (reduced) {
      gsap.set(revealTargets, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
    } else {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
      tl.from('.hc-kicker', { opacity: 0, y: 14, duration: 0.6 })
        .from('.hc-line', { opacity: 0, y: 34, stagger: 0.14, duration: 0.85 }, '-=0.3')
        .from('.hc-sub', { opacity: 0, y: 16, duration: 0.7 }, '-=0.45')
        .from('.hc-actions', { opacity: 0, y: 14, duration: 0.6 }, '-=0.4')
        .from('.hc-stage-shell', { opacity: 0, scale: 0.9, duration: 1.1, ease: 'power2.out' }, '-=0.5')
        .from('.hc-stats', { opacity: 0, y: 12, duration: 0.6 }, '-=0.6')
        .from('.hc-short', { opacity: 0, duration: 0.6 }, '-=0.35')
        .from('.hc-scroll', { opacity: 0, duration: 0.7 }, '-=0.3');
    }

    // 히어로 → 다음 섹션(#speaker) 전환: 스크롤에 맞춰 다크 배경이 크림으로 자연스럽게 번진다.
    const blendTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
    blendTl.to('.hc-blend', { opacity: 1 }, 0);
    if (!reduced) {
      blendTl
        .to('.hc-content', { opacity: 0.1, y: -40 }, 0)
        .to('.hc-stage-shell', { opacity: 0.25, scale: 0.92, y: -24 }, 0)
        .to('.hc-footer', { opacity: 0.15 }, 0);
    }
  }, { scope: sectionRef });

  return (
    <header className="hero-cinematic" id="overview" ref={sectionRef}>
      <div className="hc-bg" aria-hidden="true" />

      <div className="hc-content">
        <p className="hc-kicker"><span>FIELD-BUILT</span> 사회복지 현장의 스마트워크 · AI 전환</p>
        <h1 className="hc-lede">
          <span className="hc-line">현장의 문제를</span>
          <span className="hc-line hc-line-strong"><em>작동하는 도구</em>로 바꿉니다.</span>
        </h1>
        <p className="hc-sub">입문 교육에서 실무 심화, 컨설팅과 시스템 구축까지 <b>한 흐름으로 이어서</b> 맡습니다. AI·자동화·스마트워크·홍보·행사 운영을 설명으로 끝내지 않고, 현장에서 반복해서 쓸 수 있는 구조와 도구로 연결합니다.</p>
        <div className="hc-actions">
          <a className="hc-primary" href="#portfolio">대표 작업 보기 <b aria-hidden="true">↓</b></a>
          <a className="hc-secondary" href="#programs">강의·컨설팅 보기</a>
        </div>
      </div>

      <div className="hc-stage" aria-hidden="true">
        <div className="hc-stage-shell">
          {capability === '3d' && (
            <WizardErrorBoundary fallback={<HcStagePoster />}>
              <Suspense fallback={<HcStageFallback />}>
                <WizardStage active={inView} />
              </Suspense>
            </WizardErrorBoundary>
          )}
          {capability === 'poster' && <HcStagePoster />}
        </div>
      </div>

      <div className="hc-footer">
        <div className="hc-stats" aria-label="PROOF POINTS 2026">
          <div><strong>500+</strong><span>전국 방문 기관</span></div>
          <div><strong>63</strong><span>3년 동행 기관</span></div>
          <div><strong>20+</strong><span>연간 강의·컨설팅</span></div>
          <div><strong>1,500</strong><span>최대 행사 운영</span></div>
        </div>
        <p className="hc-short">강의장에서 바로 부르는 짧은 주소 <b className="mono">carpedm.kr/ax</b></p>
        <a className="hc-scroll" href="#speaker" aria-label="다음 섹션으로 스크롤">
          <span className="hc-scroll-label">SCROLL</span>
          <span className="hc-scroll-line" aria-hidden="true" />
        </a>
      </div>

      <div className="hc-blend" aria-hidden="true" />
    </header>
  );
}
