'use client';

import Link from 'next/link';
import { AGENTS, CAMPS } from '../data/agents';

// 장수 카드와 진영 안내. 2.5D·3D 마을이 함께 씁니다.
export default function VillageCards({ open, setOpen }) {
  const agent = open?.kind === 'agent' ? AGENTS[open.id] : null;
  const camp = open?.kind === 'place' ? CAMPS.find((c) => c.key === open.id) : null;
  return (
    <>
      {agent && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label={`${agent.name} 장수 카드`} onClick={() => setOpen(null)}>
          <div className="ym-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <img src={`/agents/${open.id}.png`} alt={`${agent.name} 페이퍼크래프트 피규어`} />
            <div>
              <span className="ym-place">{agent.emoji} {agent.role}</span>
              <h3>{agent.name} <small>자 {agent.style}</small></h3>
              <p className="yv-quote">“{agent.greet}”</p>
              <p>{agent.desc}</p>
              <dl>
                <div><dt>에이전트 id</dt><dd className="mono">{open.id}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {camp && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label={camp.place} onClick={() => setOpen(null)}>
          <div className="ym-sheet yv-place-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <div>
              <span className="ym-place">{camp.no} · {camp.place}</span>
              <h3>{camp.title}</h3>
              <p>{camp.body}</p>
              {camp.agents.length > 0 && (
                <div className="yv-crew">
                  {camp.agents.map((id) => (
                    <button type="button" key={id} onClick={() => setOpen({ kind: 'agent', id })}>
                      <img src={`/agents/${id}.png`} alt="" />
                      <span>{AGENTS[id].name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="ym-actions">
                {camp.link.href.startsWith('/')
                  ? <Link className="ym-link" href={camp.link.href}>{camp.link.label} <b aria-hidden="true">→</b></Link>
                  : <a className="ym-link" href={camp.link.href} onClick={() => setOpen(null)}>{camp.link.label} <b aria-hidden="true">→</b></a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
