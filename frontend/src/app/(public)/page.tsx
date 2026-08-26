import Image from "next/image";
import Link from "next/link";

import { siteDescription, siteName, siteUrl } from "@/lib/site";

import styles from "./page.module.css";

const planningSteps = [
  {
    number: "01",
    title: "여행지 선택",
    description: "가고 싶은 도시와 장소를 가볍게 담아보세요.",
    accent: "blue",
    icon: "pin",
  },
  {
    number: "02",
    title: "일정 생성",
    description: "여행 날짜에 맞춰 하루별 계획을 정리해요.",
    accent: "violet",
    icon: "calendar",
  },
  {
    number: "03",
    title: "경로 최적화",
    description: "장소 순서를 다듬어 이동 부담을 줄여요.",
    accent: "green",
    icon: "route",
  },
] as const;

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  url: siteUrl.href,
  description: siteDescription,
  applicationCategory: "TravelApplication",
  operatingSystem: "Any",
  inLanguage: "ko-KR",
  featureList: ["여행지 선택", "여행 일정 생성", "이동 경로 최적화"],
};

function StepIcon({ type }: { type: (typeof planningSteps)[number]["icon"] }) {
  if (type === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.4" />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
        <path d="M8 3v5M16 3v5M4 10h16" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18h2a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h-1" />
      <path d="m11 12 2.5 3L16 12" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <script
        id="truvel-web-application-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <a className={styles.skipLink} href="#main-content">
        본문으로 바로가기
      </a>

      <header className={styles.header}>
        <nav className={styles.nav} aria-label="주요 메뉴">
          <Link className={styles.brand} href="/" aria-label="Truvel 홈">
            <span className={styles.brandMark} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Truvel</span>
          </Link>

          <div className={styles.navLinks}>
            <a href="#how-it-works">이용 방법</a>
            <Link href="/auth/login" prefetch={false}>
              로그인
            </Link>
            <Link
              className={styles.navCta}
              href="/auth/register"
              prefetch={false}
            >
              무료로 시작하기
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span aria-hidden="true">✦</span>
                여행은 가볍게, 계획은 빈틈없이
              </p>
              <h1 id="hero-title">
                가고 싶은 곳만 고르세요.
                <br />
                여행의 흐름은 <strong>Truvel</strong>이 만들게요.
              </h1>
              <p className={styles.heroDescription}>
                여행지 선택부터 일정 생성, 이동 경로 최적화까지.
                <br className={styles.desktopBreak} /> 복잡했던 여행 계획을
                하나의 흐름으로 완성하세요.
              </p>

              <div className={styles.heroActions}>
                <Link
                  className={styles.primaryButton}
                  href="/auth/login"
                  prefetch={false}
                >
                  여행 시작하기
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  className={styles.secondaryButton}
                  href="/auth/register"
                  prefetch={false}
                >
                  회원가입
                </Link>
              </div>

              <ul className={styles.heroBenefits} aria-label="Truvel 주요 특징">
                <li>
                  <span aria-hidden="true">✓</span>한곳에서 이어지는 여행 계획
                </li>
                <li>
                  <span aria-hidden="true">✓</span>모바일에서도 간편하게
                </li>
              </ul>
            </div>

            <div
              className={styles.heroVisual}
              aria-label="Truvel 여행 경로 화면 미리보기"
            >
              <div className={styles.plane} aria-hidden="true">
                <Image
                  src="/icons/plane.png"
                  alt=""
                  width={151}
                  height={84}
                  priority
                />
              </div>

              <div className={styles.destinationCard}>
                <span className={styles.destinationFlag} aria-hidden="true">
                  🇰🇷
                </span>
                <span>
                  <small>이번 여행</small>
                  <strong>서울 · 3일</strong>
                </span>
              </div>

              <div className={styles.phone}>
                <div className={styles.phoneTop}>
                  <span>9:41</span>
                  <span className={styles.phonePill} />
                  <span>•••</span>
                </div>
                <div className={styles.mapImage}>
                  <Image
                    src="/icons/EXmap.png"
                    alt="서울역 주변의 여행 경로 지도 예시"
                    fill
                    priority
                    sizes="(max-width: 767px) 78vw, 360px"
                  />
                  <div className={`${styles.mapPin} ${styles.mapPinOne}`}>
                    <span>1</span>
                  </div>
                  <div className={`${styles.mapPin} ${styles.mapPinTwo}`}>
                    <span>2</span>
                  </div>
                  <div className={`${styles.mapPin} ${styles.mapPinThree}`}>
                    <span>3</span>
                  </div>
                </div>
                <div className={styles.tripSheet}>
                  <span className={styles.sheetHandle} />
                  <div className={styles.sheetHeading}>
                    <span>
                      <small>DAY 1</small>
                      <strong>서울, 우리만의 속도로</strong>
                    </span>
                    <span className={styles.readyBadge}>동선 준비 완료</span>
                  </div>
                  <div className={styles.routeList}>
                    <div>
                      <span className={styles.routeDot}>1</span>
                      <p>
                        <strong>서울역</strong>
                        <small>여행의 시작</small>
                      </p>
                    </div>
                    <div>
                      <span className={styles.routeLine} />
                      <small>이동하기 좋은 순서로 정리했어요</small>
                    </div>
                    <div>
                      <span className={styles.routeDot}>2</span>
                      <p>
                        <strong>남산</strong>
                        <small>오후 일정</small>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.luggageCard}>
                <Image
                  src="/icons/image1.png"
                  alt="여행 가방 일러스트"
                  width={96}
                  height={96}
                />
                <span>
                  <strong>준비 끝!</strong>
                  <small>이제 떠나볼까요?</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.processSection}
          id="how-it-works"
          aria-labelledby="process-title"
        >
          <div className={styles.sectionHeading}>
            <p>HOW IT WORKS</p>
            <h2 id="process-title">세 단계면 여행 계획이 완성돼요</h2>
            <span>해야 할 일은 줄이고, 기대되는 순간에 더 집중하세요.</span>
          </div>

          <ol className={styles.stepGrid}>
            {planningSteps.map((step, index) => (
              <li className={styles.stepCard} key={step.number}>
                <div className={`${styles.stepIcon} ${styles[step.accent]}`}>
                  <StepIcon type={step.icon} />
                </div>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < planningSteps.length - 1 ? (
                  <span className={styles.stepArrow} aria-hidden="true">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section
          className={styles.featureSection}
          aria-labelledby="feature-title"
        >
          <div className={styles.featureIllustration} aria-hidden="true">
            <div className={styles.orbit}>
              <span>서울역</span>
              <span>남산</span>
              <span>한강</span>
              <div className={styles.orbitCenter}>TRUVEL</div>
            </div>
          </div>

          <div className={styles.featureCopy}>
            <p>ONE FLOW, BETTER TRIP</p>
            <h2 id="feature-title">흩어진 여행 계획을 하나의 흐름으로</h2>
            <ul>
              <li>
                <span aria-hidden="true">01</span>
                <div>
                  <strong>선택한 장소는 그대로</strong>
                  <p>가고 싶은 곳을 놓치지 않고 일정으로 연결해요.</p>
                </div>
              </li>
              <li>
                <span aria-hidden="true">02</span>
                <div>
                  <strong>날짜별 일정은 한눈에</strong>
                  <p>복잡한 계획도 하루 단위로 편하게 확인해요.</p>
                </div>
              </li>
              <li>
                <span aria-hidden="true">03</span>
                <div>
                  <strong>이동 순서는 더 자연스럽게</strong>
                  <p>여행의 리듬을 해치지 않도록 경로를 다듬어요.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="cta-title">
          <div className={styles.ctaSparkle} aria-hidden="true">
            ✦
          </div>
          <p>다음 여행, 어디로 떠날까요?</p>
          <h2 id="cta-title">설레는 여행의 시작을 Truvel과 함께하세요.</h2>
          <div className={styles.ctaActions}>
            <Link
              className={styles.ctaButton}
              href="/auth/login"
              prefetch={false}
            >
              지금 여행 만들기 <span aria-hidden="true">→</span>
            </Link>
            <Link
              className={styles.ctaTextLink}
              href="/auth/register"
              prefetch={false}
            >
              처음이신가요? 회원가입
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>
          <Link className={styles.brand} href="/" aria-label="Truvel 홈">
            <span className={styles.brandMark} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Truvel</span>
          </Link>
          <p>여행의 시작부터 마지막 동선까지.</p>
        </div>
        <small>© Truvel. All rights reserved.</small>
      </footer>
    </div>
  );
}
