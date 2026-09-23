'use client';

import { useEffect, useState } from 'react';

// 텍스트를 클립보드에 복사하는 버튼. 실패하면(구형 브라우저·권한 거부) 안내만 바꿉니다.
export default function CopyButton({ text, label = '복사', copiedLabel = '복사했습니다', className = '' }) {
  const [state, setState] = useState('idle'); // idle | copied | failed

  useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => setState('idle'), 1800);
    return () => clearTimeout(t);
  }, [state]);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // 클립보드 API가 없는 환경: 임시 textarea 로 복사
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <button
      type="button"
      className={`copy-btn ${state !== 'idle' ? `is-${state}` : ''} ${className}`.trim()}
      onClick={copy}
      aria-live="polite"
    >
      {state === 'copied' ? copiedLabel : state === 'failed' ? '직접 선택해 복사해 주세요' : label}
    </button>
  );
}
