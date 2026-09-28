import Link from 'next/link';

export const metadata = {
  title: '서비스 약관',
  description: 'CARPEDM이 운영하는 개인 업무 자동화 애플리케이션 openclaw의 서비스 약관입니다.',
  alternates: { canonical: 'https://www.carpedm.kr/terms' },
};

export default function Terms() {
  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="brand">
          <b>CARPEDM</b>
          <span>FIELD-BUILT DIGITAL WORK</span>
        </Link>
        <div className="navmenu">
          <Link href="/#programs">의뢰 가능한 프로그램</Link>
          <Link href="/#portfolio">만든 것</Link>
          <Link href="/#speaker">강사 소개</Link>
        </div>
        <a className="navlink" href="mailto:kosuk1231@carpedm.kr">
          <span>이메일로 문의</span><b aria-hidden="true">↗</b>
        </a>
      </nav>

      <article className="legal">
        <span className="section-kicker">TERMS OF SERVICE</span>
        <h1 className="h2">서비스 약관</h1>
        <p className="legal-date">최종 수정일: 2026년 9월 28일</p>

        <h2>1. 목적</h2>
        <p>
          본 약관은 CARPEDM 카르페디엠(이하 &ldquo;운영자&rdquo;)이 제공하는 개인 업무 자동화
          애플리케이션 <strong>openclaw</strong>(이하 &ldquo;본 앱&rdquo;)의 이용 조건과 절차를
          정합니다.
        </p>

        <h2>2. 서비스의 성격</h2>
        <p>
          본 앱은 운영자 본인과 운영자가 명시적으로 승인한 소수 이용자의 업무 보조를 위해 만들어진{' '}
          <strong>비영리 개인용 도구</strong>입니다. 불특정 다수를 대상으로 판매되거나 상업적으로
          제공되지 않으며, 이용료를 받지 않습니다.
        </p>

        <h2>3. 제공 기능</h2>
        <ul>
          <li>이용자가 권한을 부여한 Google Calendar의 일정 조회 및 요약 전달</li>
          <li>이용자의 요청에 따른 일정 등록·수정</li>
        </ul>

        <h2>4. 이용 조건</h2>
        <ul>
          <li>
            본 앱의 이용에는 Google 계정 인증이 필요하며, 이용자는 인증 과정에서 요청되는 권한
            범위를 확인한 뒤 동의 여부를 스스로 결정합니다.
          </li>
          <li>
            이용자는{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
              Google 계정 권한 관리
            </a>
            에서 언제든 권한을 철회할 수 있으며, 철회 시 본 앱의 이용은 즉시 중단됩니다.
          </li>
          <li>
            이용자는 자신의 계정과 인증 정보를 스스로 관리할 책임이 있으며, 타인에게 양도하거나
            공유해서는 안 됩니다.
          </li>
        </ul>

        <h2>5. 금지 행위</h2>
        <ul>
          <li>본 앱을 통해 타인의 정보에 무단으로 접근하는 행위</li>
          <li>본 앱의 정상적인 운영을 방해하는 행위</li>
          <li>관련 법령 또는 Google의 정책을 위반하는 행위</li>
        </ul>

        <h2>6. 개인정보</h2>
        <p>
          이용자의 정보 처리에 관한 사항은 <Link href="/privacy">개인정보처리방침</Link>을 따릅니다.
        </p>

        <h2>7. 면책</h2>
        <p>
          본 앱은 무상으로 &ldquo;있는 그대로(as-is)&rdquo; 제공됩니다. 운영자는 본 앱의 무중단
          작동, 특정 목적에의 적합성, 결과의 정확성을 보증하지 않습니다. 본 앱이 제공하는 일정
          요약은 참고 자료이며, 중요한 일정은 이용자가 Google Calendar 원본으로 직접 확인해야
          합니다.
        </p>
        <p>
          운영자의 고의 또는 중대한 과실이 없는 한, 본 앱의 이용 또는 이용 불능으로 발생한 손해에
          대하여 책임을 지지 않습니다.
        </p>

        <h2>8. 서비스의 변경 및 중단</h2>
        <p>
          운영자는 사전 통지 없이 본 앱의 기능을 변경하거나 제공을 중단할 수 있습니다. 본 앱은
          개인용 도구이므로 지속적인 제공이 보장되지 않습니다.
        </p>

        <h2>9. 약관의 변경</h2>
        <p>본 약관이 변경되는 경우 이 페이지에 변경된 내용과 최종 수정일을 게시합니다.</p>

        <h2>10. 준거법</h2>
        <p>본 약관은 대한민국 법령에 따라 해석되고 적용됩니다.</p>

        <h2>11. 문의</h2>
        <p>
          본 약관에 관한 문의는 <a href="mailto:kosuk1231@carpedm.kr">kosuk1231@carpedm.kr</a> 로 보내 주시기
          바랍니다.
        </p>
      </article>

      <footer className="foot">
        <span>CARPEDM 카르페디엠</span>
        <Link href="/privacy" className="footlink mono">개인정보처리방침</Link>
      </footer>
    </div>
  );
}
