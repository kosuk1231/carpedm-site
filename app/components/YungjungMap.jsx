'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AGENTS, CAMPS } from '../data/agents';

// 융중 작전도: 세로 스크롤을 두루마리의 가로 이동으로 바꿉니다.
// 좁은 화면이나 '동작 줄이기' 설정에서는 진영을 세로로 쌓아 보여 줍니다(스크롤 가로채기 없음).
const WIDE = '(min-width: 821px) and (prefers-reduced-motion: no-preference)';

function CampLink({ link }) {
  const inner = <>{link.label} <b aria-hidden="true">→</b></>;
  if (link.href.startsWith('/')) return <Link className="ym-link" href={link.href}>{inner}</Link>;
  return <a className="ym-link" href={link.href}>{inner}</a>;
}

export default function YungjungMap() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [wide, setWide] = useState(false);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(null);
  const [rosterOpen, setRosterOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!wide || !section || !track) {
      if (track) track.style.transform = '';
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const run = section.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / (run || 1)));
      const shift = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${-p * shift}px,0,0)`;
      section.style.setProperty('--ym-p', p.toFixed(4));
      setActive(Math.min(CAMPS.length - 1, Math.round(p * (CAMPS.length - 1))));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [wide]);

  useEffect(() => {
    if (!open && !rosterOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(null); setRosterOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, rosterOpen]);

  const goTo = (i) => {
    const section = sectionRef.current;
    if (!section) return;
    if (!wide) {
      document.getElementById(`ym-camp-${CAMPS[i].key}`)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const run = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (run * i) / (CAMPS.length - 1), behavior: 'smooth' });
  };

  const agent = open ? AGENTS[open] : null;

  return (
    <section
      ref={sectionRef}
      className={`ym ${wide ? 'ym-wide' : 'ym-stack'}`}
      style={wide ? { height: `${CAMPS.length * 90}vh` } : undefined}
      aria-label="융중 작전도"
    >
      <div className="ym-stage">
        <div className="ym-rod ym-rod-left" aria-hidden="true" />
        <div className="ym-rod ym-rod-right" aria-hidden="true" />

        <div className="ym-track" ref={trackRef}>
          <svg className="ym-path" viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 70 C 40 30, 80 30, 100 62 S 160 90, 200 58 S 260 28, 300 64 S 360 92, 400 56 S 460 30, 500 66 S 560 86, 600 60" />
          </svg>

          {CAMPS.map((camp, i) => (
            <article className={`ym-camp ym-camp-${camp.key}`} id={`ym-camp-${camp.key}`} key={camp.key}>
              <div className="ym-flag" aria-hidden="true"><span>{camp.no}</span></div>
              <div className="ym-card">
                <span className="ym-place">{camp.place}</span>
                <h2 className="ym-title">{camp.title}</h2>
                <p>{camp.body}</p>
                <div className="ym-actions">
                  <CampLink link={camp.link} />
                  {camp.roster && (
                    <button type="button" className="ym-link ym-link-ghost" onClick={() => setRosterOpen(true)}>
                      장수 명부 펼치기
                    </button>
                  )}
                </div>
              </div>

              {camp.image && (
                <figure className="ym-scene">
                  <img src={camp.image} alt={camp.imageAlt} loading="eager" />
                </figure>
              )}

              {camp.agents.length > 0 && (
                <div className="ym-pieces">
                  {camp.agents.map((id) => {
                    const a = AGENTS[id];
                    return (
                      <button type="button" className="ym-piece" key={id} onClick={() => setOpen(id)} aria-label={`${a.name} — ${a.role}, 장수 카드 열기`}>
                        <img src={`/agents/${id}.png`} alt="" loading="lazy" />
                        <span className="ym-tag"><b>{a.emoji}</b> {a.name}<small>{a.role}</small></span>
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>

        <nav className="ym-route" aria-label="작전도 진영 바로가기">
          {CAMPS.map((camp, i) => (
            <button type="button" key={camp.key} className={i === active ? 'on' : ''} onClick={() => goTo(i)}>
              <b>{camp.no}</b>{camp.place}
            </button>
          ))}
          <a className="ym-skip" href="#overview">목록으로 보기 ↓</a>
        </nav>
      </div>

      {agent && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label={`${agent.name} 장수 카드`} onClick={() => setOpen(null)}>
          <div className="ym-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <img src={`/agents/${open}.png`} alt={`${agent.name} 페이퍼크래프트 피규어`} />
            <div>
              <span className="ym-place">{agent.emoji} {agent.role}</span>
              <h3>{agent.name} <small>자 {agent.style}</small></h3>
              <p>{agent.desc}</p>
              <dl>
                <div><dt>쓰는 모델</dt><dd>{agent.model}</dd></div>
                <div><dt>에이전트 id</dt><dd className="mono">{open}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {rosterOpen && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label="장수 명부" onClick={() => setRosterOpen(false)}>
          <div className="ym-sheet ym-roster" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setRosterOpen(false)} aria-label="닫기">×</button>
            <h3>장수 명부</h3>
            <p className="ym-roster-lede">사용자는 제갈량하고만 이야기합니다. 나머지 장수는 제갈량이 일에 맞춰 부릅니다.</p>
            <ul>
              {Object.entries(AGENTS).map(([id, a]) => (
                <li key={id}>
                  <button type="button" onClick={() => { setRosterOpen(false); setOpen(id); }}>
                    <img src={`/agents/${id}.png`} alt="" loading="lazy" />
                    <strong>{a.name}</strong>
                    <span>{a.role}</span>
                    <small>{a.model}</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
