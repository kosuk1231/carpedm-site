'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

export default function HeroCinematic() {
  const sectionRef = useRef(null);
  const lenis = useLenis();

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
    if (!sectionRef.current) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 캐치프라이즈를 단어 단위로 쪼개서 키네틱 타이포로 띄운다 (기존 3D 센터피스 자리를 대체).
    const split = new SplitText('.hc-line', { type: 'words', wordsClass: 'hc-word' });
    // 강조할 두 단어("작동하는", "도구로")만 그라디언트 색을 입힌다 — <em> 중첩은 SplitText가
    // 공백 없는 조사("도구로")와 태그 경계에서 단어를 잘못 쪼개 텍스트가 사라지는 문제가 있어 피한다.
    document.querySelectorAll('.hc-line-strong .hc-word').forEach((word, i) => {
      if (i < 2) word.classList.add('hc-word-accent');
    });
    const revealTargets = ['.hc-kicker', '.hc-sub', '.hc-actions', '.hc-short', '.hc-scroll'];

    if (reduced) {
      gsap.set(revealTargets, { opacity: 1, y: 0, clearProps: 'transform' });
      gsap.set(split.words, { opacity: 1, yPercent: 0, rotateX: 0, filter: 'none' });
    } else {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
      tl.from('.hc-kicker', { opacity: 0, y: 14, duration: 0.6 })
        .from(split.words, {
          opacity: 0,
          yPercent: 130,
          rotateX: -55,
          filter: 'blur(16px)',
          duration: 1.05,
          stagger: 0.055,
          ease: 'power4.out',
        }, '-=0.25')
        .from('.hc-sub', { opacity: 0, y: 16, duration: 0.7 }, '-=0.55')
        .from('.hc-actions', { opacity: 0, y: 14, duration: 0.6 }, '-=0.4')
        .from('.hc-short', { opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.hc-scroll', { opacity: 0, duration: 0.7 }, '-=0.3');

      // 강조 문구("작동하는 도구")에 느린 그라디언트 셰이머를 반복해서 살아있는 느낌을 유지한다.
      gsap.to('.hc-word-accent', {
        backgroundPosition: '200% center',
        duration: 6,
        ease: 'none',
        repeat: -1,
        delay: tl.duration(),
      });
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
        .to('.hc-type-stage', { opacity: 0.2, scale: 0.92, y: -24 }, 0)
        .to('.hc-footer', { opacity: 0.15 }, 0);
    }

    return () => split.revert();
  }, { scope: sectionRef });

  return (
    <header className="hero-cinematic" id="overview" ref={sectionRef}>
      <div className="hc-bg" aria-hidden="true" />

      <div className="hc-content">
        <p className="hc-kicker"><span>FIELD-BUILT</span> 사회복지 현장의 스마트워크 · AI 전환</p>
      </div>

      <div className="hc-stage">
        <div className="hc-type-stage">
          <h1 className="hc-lede">
            <span className="hc-line">현장의 문제를</span>
            <span className="hc-line hc-line-strong">작동하는 도구로 바꿉니다.</span>
          </h1>
        </div>
      </div>

      <div className="hc-content">
        <p className="hc-sub">입문 교육에서 실무 심화, 컨설팅과 시스템 구축까지 <b>한 흐름으로 이어서</b> 맡습니다. AI·자동화·스마트워크·홍보·행사 운영을 설명으로 끝내지 않고, 현장에서 반복해서 쓸 수 있는 구조와 도구로 연결합니다.</p>
        <div className="hc-actions">
          <a className="hc-primary" href="#portfolio">대표 작업 보기 <b aria-hidden="true">↓</b></a>
          <a className="hc-secondary" href="#programs">강의·컨설팅 보기</a>
        </div>
      </div>

      <div className="hc-footer">
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
