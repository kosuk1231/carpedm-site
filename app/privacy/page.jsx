import Link from 'next/link';

export const metadata = {
  title: '개인정보처리방침',
  description: 'CARPEDM이 운영하는 개인 업무 자동화 애플리케이션 openclaw의 개인정보처리방침입니다.',
  alternates: { canonical: 'https://www.carpedm.kr/privacy' },
};

export default function Privacy() {
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
        <span className="section-kicker">PRIVACY POLICY</span>
        <h1 className="h2">개인정보처리방침</h1>
        <p className="legal-date">최종 수정일: 2026년 9월 28일</p>

        <p>
          CARPEDM 카르페디엠(이하 &ldquo;운영자&rdquo;)은 개인 업무 자동화 애플리케이션{' '}
          <strong>openclaw</strong>(이하 &ldquo;본 앱&rdquo;)를 운영합니다. 본 앱은 운영자 본인과
          운영자가 명시적으로 승인한 소수의 이용자가 자신의 업무를 정리하기 위해 사용하는 비영리
          개인용 도구이며, 불특정 다수를 대상으로 하는 상용 서비스가 아닙니다.
        </p>

        <h2>1. 접근하는 정보</h2>
        <p>
          본 앱은 이용자가 Google 계정으로 <strong>명시적으로 권한을 부여한 경우에 한하여</strong>{' '}
          다음 정보에 접근합니다.
        </p>
        <ul>
          <li>
            <strong>Google Calendar 데이터</strong> — 캘린더 목록, 일정 제목, 시작·종료 시각, 장소,
            설명
          </li>
          <li>
            요청 권한 범위: <code>https://www.googleapis.com/auth/calendar</code> (일정 조회 및 등록)
          </li>
        </ul>
        <p>
          본 앱은 별도의 회원가입 절차가 없으며, 이름·연락처·주소·결제정보 등 이용자가 직접 입력하는
          개인정보를 수집하지 않습니다.
        </p>

        <h2>2. 이용 목적</h2>
        <ul>
          <li>이용자 본인에게 당일 및 향후 일정 요약을 전달</li>
          <li>이용자의 요청에 따른 일정 등록·수정</li>
        </ul>
        <p>위 목적 외의 용도로는 이용하지 않습니다.</p>

        <h2>3. 보관 및 파기</h2>
        <ul>
          <li>
            Google OAuth 인증 토큰은 <strong>이용자 본인이 관리하는 기기의 파일에만</strong>{' '}
            저장되며, 소유자만 읽을 수 있도록 파일 접근 권한이 제한됩니다. 운영자가 관리하는 별도의
            서버나 데이터베이스에 저장되지 않습니다.
          </li>
          <li>
            일정 내용은 어떠한 저장소에도 축적하지 않으며, 요청을 처리하는 시점에만 일시적으로
            사용한 뒤 폐기됩니다.
          </li>
          <li>
            이용자는{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
              Google 계정 권한 관리
            </a>
            에서 언제든 접근 권한을 철회할 수 있으며, 철회 즉시 모든 접근이 중단됩니다. 기기에
            저장된 토큰 파일을 삭제하면 인증 정보는 완전히 파기됩니다.
          </li>
        </ul>

        <h2>4. 제3자 제공</h2>
        <p>
          본 앱은 취득한 Google 사용자 데이터를 제3자에게 판매·양도·대여하지 않으며, 광고 목적으로
          사용하지 않습니다. 사람이 데이터를 열람하는 인적 검토도 수행하지 않습니다.
        </p>
        <p>
          다만 이용자가 명시적으로 요청한 일정 요약을 생성하기 위해, 해당 요청을 처리하는 범위에서
          생성형 AI 모델 제공사(Anthropic, Google, OpenAI 등)의 API로 일정 텍스트가 전송될 수
          있습니다. 이는 이용자가 요청한 기능을 제공하기 위한 목적에 한정되며, 전송된 내용은 해당
          제공사의 정책에 따라 처리됩니다.
        </p>

        <h2>5. Google API Services User Data Policy 준수</h2>
        <p>
          본 앱이 Google API로부터 취득한 정보를 이용하고 다른 앱으로 전송하는 행위는,{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
          >
            Google API 서비스 사용자 데이터 정책
          </a>
          의 제한적 사용(Limited Use) 요건을 포함한 모든 요건을 준수합니다.
        </p>

        <h2>6. 보안</h2>
        <p>
          인증 정보는 소유자만 접근 가능한 권한으로 로컬에 보관하며, Google과의 통신은 전 구간
          HTTPS로 암호화됩니다. 본 앱은 이용자의 Google 계정 비밀번호를 수집하거나 저장하지
          않습니다.
        </p>

        <h2>7. 아동의 개인정보</h2>
        <p>본 앱은 만 14세 미만 아동을 대상으로 하지 않으며, 해당 연령의 정보를 수집하지 않습니다.</p>

        <h2>8. 방침의 변경</h2>
        <p>
          본 방침이 변경되는 경우 이 페이지에 변경된 내용과 최종 수정일을 게시합니다.
        </p>

        <h2>9. 문의</h2>
        <p>
          개인정보 처리에 관한 문의는{' '}
          <a href="mailto:kosuk1231@carpedm.kr">kosuk1231@carpedm.kr</a> 로 보내 주시기 바랍니다.
        </p>
      </article>

      <footer className="foot">
        <span>CARPEDM 카르페디엠</span>
        <Link href="/terms" className="footlink mono">서비스 약관</Link>
      </footer>
    </div>
  );
}
