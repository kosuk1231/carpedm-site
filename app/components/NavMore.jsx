'use client';

import { useEffect, useRef, useState } from 'react';

// 좁은 화면(휴대폰)에서 상단 메뉴 대신 여는 메뉴. 항목을 누르면 닫힙니다.
export default function NavMore({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [open]);
  return (
    <div className={`navmore ${open ? 'is-open' : ''}`} ref={ref}>
      <button type="button" className="navmore-btn" aria-expanded={open} aria-controls="navmore-list" onClick={() => setOpen((v) => !v)}>
        {open ? '닫기' : '메뉴'}
      </button>
      {open && (
        <div className="navmore-list" id="navmore-list">
          {items.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        </div>
      )}
    </div>
  );
}
