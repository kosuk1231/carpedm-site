'use client';

import Link from 'next/link';
import { CAMPS } from '../data/agents';

// 건물 안내 카드. 팀원은 캠퍼스를 따로 돌아다니므로 건물 카드에는 넣지 않습니다.

export default function VillageCards({ open, setOpen }) {
  const camp = open?.kind === 'place' ? CAMPS.find((c) => c.key === open.id) : null;
  return (
    <>
      {camp && (
        <div className="ym-modal" role="dialog" aria-modal="true" aria-label={camp.place} onClick={() => setOpen(null)}>
          <div className="ym-sheet yv-place-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ym-close" onClick={() => setOpen(null)} aria-label="닫기">×</button>
            <div>
              <span className="ym-place">{camp.no} · {camp.place}</span>
              <h3>{camp.title}</h3>
              <p>{camp.body}</p>
              <div className="ym-actions">
                {camp.link.href.startsWith('/')
                  ? <Link className="ym-link" href={camp.link.href}>{camp.link.label} <b aria-hidden="true">→</b></Link>
                  : <a className="ym-link" href={camp.link.href} onClick={() => setOpen(null)}>{camp.link.label} <b aria-hidden="true">→</b></a>}
                <span className="ym-key-hint"><kbd>Space</kbd> 또는 <kbd>Enter</kbd>로 바로 이동 · <kbd>Esc</kbd> 닫기</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
