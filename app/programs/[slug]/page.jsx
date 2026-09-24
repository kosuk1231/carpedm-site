import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROGRAMS, getProgram } from '../../data/programs';
import { PROFILE_PDF } from '../../data/speaker-kit';
import ProfilePdfButton from '../../components/ProfilePdfButton';
import { LIVE_STREAM_SUMMARY, LIVE_STREAMS_BY_YEAR } from '../../data/live-streams';

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params; // Next 15: params 는 Promise
  const program = getProgram(slug);
  if (!program) return {};
  const title = `${program.title} — 의뢰 가능한 프로그램`;
  return {
    title,
    description: program.desc,
    alternates: { canonical: `https://www.carpedm.kr/programs/${program.slug}` },
    openGraph: {
      title: `${program.title} — CARPEDM`,
      description: program.desc,
      url: `https://www.carpedm.kr/programs/${program.slug}`,
      type: 'article',
    },
  };
}

function contactHref(program) {
  // 프로그램별 기본 문의 유형을 데이터에서 명시해 잘못된 자동 추론을 피합니다.
  const type = program.contactType || '강의';
  return `/contact?program=${program.slug}&type=${encodeURIComponent(type)}`;
}

export default async function ProgramPage({ params }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();
  const d = program.detail;
  const others = PROGRAMS.filter((p) => p.slug !== program.slug);
  const ask = contactHref(program);

  return (
    <div className="wrap pd">
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
        <Link className="navlink" href={ask}>
          <span>이 프로그램 문의</span><b aria-hidden="true">↗</b>
        </Link>
      </nav>

      <header className="pd-hero">
        <Link href="/#programs" className="pd-back">← 의뢰 가능한 프로그램</Link>
        <div className="pd-hero-grid">
          <div>
            <p className="pd-kicker"><span>PROGRAM {program.index}</span>{program.type}</p>
            <h1>{program.title}</h1>
            <p className="pd-lede">{d.lede}</p>
            <div className="pd-tags">
              {program.tags.map((t) => <span key={t}>{t}</span>)}
            </div>
            {program.image ? (
              <figure className="pd-hero-visual">
                <img src={program.image} alt={program.imageAlt || ''} loading="eager" />
                <figcaption>{program.imageCaption || '《샌드위치 사회복지사 생존기술》 강의 자료에서'}</figcaption>
              </figure>
            ) : null}
          </div>
          <aside className="pd-side">
            <span className="pd-side-label">AT A GLANCE</span>
            <dl>
              <div><dt>권장 인원</dt><dd>{d.format.people}</dd></div>
              <div><dt>진행 방식</dt><dd>{d.format.method}</dd></div>
              <div><dt>장소</dt><dd>{d.format.place}</dd></div>
              <div><dt>참고</dt><dd>{d.format.note}</dd></div>
            </dl>
            <div className="pd-side-result">
              <span>RESULT</span>
              <b>{program.result}</b>
            </div>
            <Link href={ask} className="pd-side-cta">이 프로그램 문의하기 <b aria-hidden="true">→</b></Link>
            <ProfilePdfButton
              filename={PROFILE_PDF.filename}
              version={PROFILE_PDF.version}
              updated={PROFILE_PDF.updated}
              size={PROFILE_PDF.size}
              mode="preview"
              className="pd-side-sub profile-pdf-inline"
              showMeta={false}
            />
          </aside>
        </div>
      </header>

      <section className="pd-sec">
        <div className="pd-sec-head">
          <span className="section-kicker">WHO IT&apos;S FOR</span>
          <h2 className="h2">이런 분께 맞습니다</h2>
        </div>
        <ul className="pd-audience">
          {d.audience.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </section>

      <section className="pd-sec">
        <div className="pd-sec-head">
          <span className="section-kicker">CURRICULUM</span>
          <h2 className="h2">시간에 따라 이렇게 구성합니다</h2>
          <p>{d.curriculumIntro || '기관 사정에 맞춰 2시간·3시간·6시간 중에서 고르거나 조합할 수 있습니다. 실습 비중이 커질수록 참여자가 직접 만들어 가져가는 것이 늘어납니다.'}</p>
        </div>
        <div className="pd-curriculum">
          {d.curriculum.map((c, i) => (
            <article className={`pd-course${i === 1 ? ' is-recommended' : ''}`} key={c.hours}>
              <div className="pd-course-head">
                <strong>{c.hours}</strong>
                <span>{c.label}</span>
                {i === 1 ? <em>권장 구성</em> : null}
              </div>
              <ol>
                {c.items.map((it) => <li key={it}>{it}</li>)}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="pd-sec pd-two">
        <div>
          <div className="pd-sec-head">
            <span className="section-kicker">PREPARATION</span>
            <h2 className="h2">준비물과 사전 준비</h2>
          </div>
          <ul className="pd-list">
            {d.prep.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
        <div>
          <div className="pd-sec-head">
            <span className="section-kicker">TAKEAWAYS</span>
            <h2 className="h2">참가자가 가져가는 것</h2>
          </div>
          <ul className="pd-list pd-list-check">
            {d.outcomes.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </section>

      {program.slug === 'live-streaming' ? (
        <section className="pd-sec live-history">
          <div className="pd-sec-head">
            <span className="section-kicker">LIVE OPERATIONS · 2019—2026</span>
            <h2 className="h2">자체 중계 운영 기록</h2>
            <p>2019년부터 협회 유튜브 자체 중계를 운영하며 경험을 축적했습니다. 정책토론회·성과공유회·기념행사·온오프믹스 행사와 국회 등 외부 간담회 중계까지 직접 운영합니다.</p>
          </div>

          <div className="live-summary">
            <div><strong>{LIVE_STREAM_SUMMARY.totalCount}건</strong><span>전체 라이브 운영</span></div>
            <div><strong>{LIVE_STREAM_SUMMARY.featuredCount}건</strong><span>조회수 500+ 공개 목록</span></div>
            <div><strong>2019—2026</strong><span>자체 운영 경험 누적</span></div>
            <div><strong>국회 등</strong><span>외부 간담회 중계 경험</span></div>
          </div>

          <p className="live-note">아래 목록은 조회수 500회 이상 영상만 정리했습니다. 그 외 영상은 개별 표기하지 않고 전체 {LIVE_STREAM_SUMMARY.totalCount}건 운영 건수에만 포함했습니다.</p>

          <div className="live-year-list">
            {Object.entries(LIVE_STREAMS_BY_YEAR)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, items], yearIndex) => (
                <details className="live-year" key={year} open={yearIndex === 0}>
                  <summary>
                    <strong>{year}</strong>
                    <span>{items.length}건 · 조회수 500회 이상</span>
                    <b aria-hidden="true">＋</b>
                  </summary>
                  <div className="live-stream-list">
                    {items.map((item) => (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="live-stream-row" key={item.url}>
                        <time>{item.date.slice(5).replace('-', '.')}</time>
                        <strong>{item.title}</strong>
                        <span>{item.views.toLocaleString('ko-KR')}회</span>
                        <b aria-hidden="true">↗</b>
                      </a>
                    ))}
                  </div>
                </details>
              ))}
          </div>
        </section>
      ) : d.videos ? (
        <section className="pd-sec">
          <div className="pd-sec-head">
            <span className="section-kicker">WORKS</span>
            <h2 className="h2">직접 만든 영상</h2>
            <p>{d.videosIntro} 재생하면 유튜브에서 불러옵니다.</p>
          </div>
          <div className="pd-videos">
            {d.videos.map((v) => (
              <figure className={`pd-video${v.kind === 'short' ? ' is-short' : ''}`} key={v.id}>
                <div className="pd-video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.id}`}
                    title={v.title}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <figcaption>
                  <strong>{v.title}</strong>
                  <span>{v.note}</span>
                  <a href={v.kind === 'short' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">유튜브에서 보기 ↗</a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="pd-sec pd-two">
        <div>
          <div className="pd-sec-head">
            <span className="section-kicker">PROOF</span>
            <h2 className="h2">관련 사례와 도구</h2>
          </div>
          <ul className="pd-related">
            {d.related.map((r) => (
              <li key={r.name}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <span>{r.name}</span>
                    <small className="mono">{r.label} ↗</small>
                  </a>
                ) : (
                  <Link href={r.href}>
                    <span>{r.name}</span>
                    <small>사이트 내 사례 보기 ↘</small>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="pd-sec-head">
            <span className="section-kicker">RECENT</span>
            <h2 className="h2">최근 진행</h2>
          </div>
          <ul className="pd-list pd-list-recent">
            {d.recent.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <p className="pd-more"><Link href="/#fieldlog">현장 기록 전체 보기</Link> · <Link href="/#record">전체 강의 이력</Link></p>
        </div>
      </section>

      <section className="pd-cta">
        <div>
          <span className="cta-kicker">INQUIRY</span>
          <h2>일정과 인원만 알려 주시면<br />맞는 구성으로 제안드립니다.</h2>
          <p>문의폼에서 이 프로그램이 미리 선택됩니다. 내부 결재용으로 강사 프로필 PDF와 공문용 소개문도 바로 받으실 수 있습니다.</p>
        </div>
        <div className="pd-cta-actions">
          <Link href={ask} className="pd-cta-primary">
            <span>문의폼으로 이동</span>
            <strong>{program.title} 문의하기</strong>
            <b aria-hidden="true">→</b>
          </Link>
          <Link href="/#speaker-kit" className="pd-cta-secondary">강사 프로필 · 소개문 받기</Link>
        </div>
      </section>

      <section className="pd-sec pd-others">
        <div className="pd-sec-head">
          <span className="section-kicker">OTHER PROGRAMS</span>
          <h2 className="h2">다른 프로그램</h2>
        </div>
        <div className="pd-others-grid">
          {others.map((p) => (
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
