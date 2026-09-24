import Link from 'next/link';
import ContactForm from '../components/ContactForm';
import ProfilePdfButton from '../components/ProfilePdfButton';
import { PROGRAMS } from '../data/programs';
import { PROFILE_PDF } from '../data/speaker-kit';

export const metadata = {
  title: '강의·컨설팅 문의',
  description: '사회복지 현장의 스마트워크 · 생성형 AI · 업무 자동화 · 행사 디지털 운영 강의와 컨설팅 문의. 일정과 인원만 알려 주시면 맞는 구성으로 회신드립니다.',
  alternates: { canonical: 'https://www.carpedm.kr/contact' },
  openGraph: {
    title: '강의·컨설팅 문의 — CARPEDM',
    description: '일정과 인원만 알려 주시면 맞는 구성으로 제안드립니다.',
    url: 'https://www.carpedm.kr/contact',
  },
};

const STEPS = [
  ['문의 접수', '폼 제출 즉시 접수번호와 확인 메일'],
  ['내용 확인 · 회신', '영업일 2일 안에 구성·일정 제안'],
  ['강의계획서 · 견적', '내부 결재용 자료 전달'],
  ['확정 · 진행', '사전 준비 안내 → 진행 → 결과 공유'],
];

const GOOD_TO_KNOW = [
  ['대상', '직급·직무·인원. 실습형은 30명 내외를 권장합니다.'],
  ['시간', '강의·실습은 2~6시간, 행사 운영은 일정과 범위에 맞춰 별도 구성합니다.'],
  ['장소·장비', '오프라인·온라인 모두 가능. 실습 시 1인 1노트북과 Wi-Fi.'],
  ['예산', '범위를 알려 주시면 그 안에서 가능한 구성을 먼저 제안합니다.'],
];

export default function ContactPage() {
  const programs = PROGRAMS.map((p) => ({ slug: p.slug, index: p.index, title: p.title }));

  return (
    <div className="wrap contact-page">
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

      <header className="contact-hero">
        <Link href="/" className="pd-back">← 홈으로</Link>
        <p className="pd-kicker"><span>CONTACT</span>강의 · 컨설팅 · 시스템 구축</p>
        <h1>일정과 인원만 알려 주시면<br />맞는 구성으로 제안드립니다.</h1>
        <p className="pd-lede">기대하는 변화를 한두 줄만 적어 주셔도 됩니다. 접수되면 확인 메일이 바로 가고, 내용을 보고 영업일 기준 2일 안에 회신드립니다.</p>
      </header>

      <section className="contact-grid contact-grid-page">
        <aside className="contact-side">
          <figure className="kraft-visual contact-visual">
            <img src="/illust/kraft-15.webp" alt="사람에게 집중하기 — 도구는 수단, 되찾은 시간" loading="lazy" />
            <figcaption>도구는 수단입니다. 되찾은 시간이 사람에게 가도록 설계합니다.</figcaption>
          </figure>
          <div className="contact-side-block">
            <span>HOW IT WORKS</span>
            <ol>
              {STEPS.map(([b, s]) => (
                <li key={b}><b>{b}</b><small>{s}</small></li>
              ))}
            </ol>
          </div>

          <div className="contact-side-block">
            <span>GOOD TO KNOW</span>
            <dl className="contact-facts">
              {GOOD_TO_KNOW.map(([dt, dd]) => (
                <div key={dt}><dt>{dt}</dt><dd>{dd}</dd></div>
              ))}
            </dl>
          </div>

          <div className="contact-side-block">
            <span>FOR APPROVAL</span>
            <p>결재용 자료가 먼저 필요하면 모바일에서도 바로 열어 확인할 수 있습니다.</p>
            <ProfilePdfButton
              filename={PROFILE_PDF.filename}
              version={PROFILE_PDF.version}
              updated={PROFILE_PDF.updated}
              size={PROFILE_PDF.size}
              mode="preview"
              className="contact-side-download"
              showMeta={false}
            />
            <p><Link href="/#speaker-kit">공문용 100자·300자 소개문</Link>도 복사해 쓰실 수 있습니다.</p>
          </div>

          <div className="contact-side-block contact-side-mail">
            <span>EMAIL</span>
            <a href="mailto:kosuk1231@carpedm.kr" className="mono">kosuk1231@carpedm.kr</a>
            <p>폼이 불편하시면 이메일로 보내 주세요. 같은 방식으로 회신드립니다.</p>
          </div>
        </aside>

        <div className="contact-form-shell">
          <ContactForm programs={programs} />
        </div>
      </section>

      <section className="pd-sec contact-programs">
        <div className="pd-sec-head">
          <span className="section-kicker">PROGRAMS</span>
          <h2 className="h2">어떤 프로그램인지 먼저 보고 싶다면</h2>
        </div>
        <div className="pd-others-grid five">
          {PROGRAMS.map((p) => (
            <Link href={`/programs/${p.slug}`} className="pd-other" key={p.slug}>
              <div><span>{p.index}</span><small>{p.type}</small></div>
              <strong>{p.title}</strong>
              <b aria-hidden="true">↘</b>
            </Link>
          ))}
        </div>
      </section>

      <footer className="foot">
        <span>CARPEDM 카르페디엠</span>
        <Link href="/" className="footlink">홈으로</Link>
      </footer>
    </div>
  );
}
