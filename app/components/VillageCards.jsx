'use client';

import Link from 'next/link';
import { AGENTS, CAMPS } from '../data/agents';

// 팀원 카드와 건물 안내.
// 캐릭터 그림이 아직 없으면 이모지 원판으로 대신합니다(img 에 경로를 넣으면 그림을 씁니다).
function Portrait({ a, size }) {
  if (a.img) return <img className={`yv-portrait yv-portrait-${size}`} src={a.img} alt={`${a.name} 그림`} />;
  return <span className={`yv-portrait yv-portrait-${size} is-${a.kind}`} aria-hidden="true">{a.emoji}</span>;
}

export default function VillageCards({ open, setOpen }) {
  const agent = open?.kind === 'agent' ? AGENTS[open.id] : null;
  const camp = open?.kind === 'place' ? CAMPS.find((c) => c.key === open.id) : null;
  return (
    <>
      {agent && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label={`${agent.name} 카드`} onClick={() => setOpen(null)}>
          <div className="ym-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <Portrait a={agent} size="lg" />
            <div>
              <span className="ym-place">{agent.emoji} {agent.role}</span>
              <h3>{agent.name} <small>{agent.kind === 'robot' ? '로봇' : agent.title}</small></h3>
              <p className="yv-quote">“{agent.greet}”</p>
              <p>{agent.desc}</p>
              {!agent.notAgent && (
                <dl>
                  <div><dt>AI 에이전트</dt><dd className="mono">{open.id}</dd></div>
                </dl>
              )}
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
                      <Portrait a={AGENTS[id]} size="sm" />
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
