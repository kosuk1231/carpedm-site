import Link from 'next/link';
import CopyButton from './CopyButton';
import ProfilePdfButton from './ProfilePdfButton';
import { PROFILE_PDF, SPEAKER_KIT } from '../data/speaker-kit';

function countChars(text) {
  return { withSpace: text.length, noSpace: text.replace(/\s/g, '').length };
}

// 기존 speaker-materials 블록을 확장한 것입니다.
// PDF 다운로드 버튼 + 복사 가능한 소개문·이력 아코디언. 별도 대형 섹션을 만들지 않습니다.
export default function SpeakerKit() {
  return (
    <div className="speaker-kit" id="speaker-kit">
      <div className="speaker-kit-head">
        <div>
          <span>FOR ORGANIZERS</span>
          <strong>기관 담당자용 강사 자료</strong>
          <p>내부 결재·공문·강의계획서에 바로 쓰실 수 있도록 1페이지 프로필과 소개문을 준비했습니다.</p>
        </div>
        <ProfilePdfButton
          filename={PROFILE_PDF.filename}
          version={PROFILE_PDF.version}
          updated={PROFILE_PDF.updated}
          size={PROFILE_PDF.size}
        />
      </div>

      <div className="speaker-kit-list">
        {SPEAKER_KIT.map((item, i) => {
          const n = countChars(item.text);
          return (
            <details className="speaker-kit-item" key={item.id} open={i === 0}>
              <summary>
                <span className="speaker-kit-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="speaker-kit-title">
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
                <span className="speaker-kit-count">공백 포함 {n.withSpace}자 · 제외 {n.noSpace}자</span>
                <b aria-hidden="true">+</b>
              </summary>
              <div className="speaker-kit-body">
                <pre className={item.mono ? 'is-mono' : ''}>{item.text}</pre>
                <div className="speaker-kit-actions">
                  <CopyButton text={item.text} label={`${item.label} 복사`} />
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <p className="speaker-kit-note">
        사진 사용, 강의계획서, 견적이 필요하시면 <Link href="/contact">문의</Link>에 남겨 주세요. 프로그램별 계획서는 각 <a href="#programs">프로그램 상세</a>에서 확인할 수 있습니다.
      </p>
    </div>
  );
}
