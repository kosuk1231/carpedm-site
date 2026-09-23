import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NOTES, getNote } from '../../data/notes';

export const dynamicParams = false;

export function generateStaticParams() {
  return NOTES.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.description,
    alternates: { canonical: `https://www.carpedm.kr/notes/${note.slug}` },
    openGraph: {
      title: `${note.title} — CARPEDM`,
      description: note.description,
      url: `https://www.carpedm.kr/notes/${note.slug}`,
      type: 'article',
    },
  };
}

export default async function NotePage({ params }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <div className="wrap note-page">
      <nav className="nav">
        <Link href="/" className="brand">
          <b>CARPEDM</b>
          <span>FIELD-BUILT DIGITAL WORK</span>
        </Link>
        <div className="navmenu">
          <Link href="/#notes">실무 노트</Link>
          <Link href="/#programs">의뢰 가능한 프로그램</Link>
          <Link href="/#portfolio">만든 것</Link>
        </div>
        <Link className="navlink" href="/contact">
          <span>문의하기</span><b aria-hidden="true">↗</b>
        </Link>
      </nav>

      <header className="note-hero">
        <Link href="/#notes" className="pd-back">← 실무 노트</Link>
        <p className="pd-kicker"><span>FIELD NOTE {note.no}</span>{note.category}</p>
        <h1>{note.title}</h1>
        <p className="pd-lede">{note.description}</p>
        <div className="note-tags note-page-tags">
          {note.tags.map((tag) => <span key={tag}>{tag}</span>)}
          <span>{note.updated}</span>
        </div>
      </header>

      <main className="note-body">
        <p className="note-intro">{note.intro}</p>
        {note.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
        <aside className="note-takeaway">
          <span>TAKEAWAY</span>
          <strong>{note.takeaway}</strong>
        </aside>
      </main>

      <section className="pd-cta note-cta">
        <div>
          <span className="cta-kicker">RELATED PROGRAM</span>
          <h2>이 주제를 기관에서<br />직접 적용해 보고 싶다면</h2>
          <p>관련 강의·워크숍·컨설팅 프로그램의 대상, 시간별 구성, 준비물을 확인할 수 있습니다.</p>
        </div>
        <div className="pd-cta-actions">
          <Link href={`/programs/${note.relatedProgram}`} className="pd-cta-primary">
            <span>관련 프로그램</span>
            <strong>상세 구성 보기</strong>
            <b aria-hidden="true">→</b>
          </Link>
          <Link href="/contact" className="pd-cta-secondary">문의하기</Link>
        </div>
      </section>

      <section className="pd-sec pd-others">
        <div className="pd-sec-head">
          <span className="section-kicker">OTHER NOTES</span>
          <h2 className="h2">다른 실무 노트</h2>
        </div>
        <div className="pd-others-grid">
          {NOTES.filter((n) => n.slug !== note.slug).map((n) => (
            <Link href={`/notes/${n.slug}`} className="pd-other" key={n.slug}>
              <div><span>{n.no}</span><small>{n.category}</small></div>
              <strong>{n.title}</strong>
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
