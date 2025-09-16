"use client";
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/OnboardingFooter";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import GlassContainer from "../components/GlassContainer";

export default function Home() {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 다크모드 감지
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const ITEMS_PER_PAGE = 4;
  const pageWidthRef = useRef(1105);
  function getPageWidth() {
    return pageWidthRef.current;
  }

  useEffect(() => {
    const track = document.querySelector(`.${styles.carouselTrack}`);
    if (!track) return;
    // Measure exact step width from children positions to avoid drift
    const children = Array.from(track.children);
    let measured = 1105;
    if (children.length >= ITEMS_PER_PAGE + 2) {
      const a = children[1];
      const b = children[1 + ITEMS_PER_PAGE];
      const ax = a.getBoundingClientRect().left;
      const bx = b.getBoundingClientRect().left;
      measured = Math.round(bx - ax);
    } else {
      const viewport = document.querySelector(`.${styles.carouselViewport}`);
      if (viewport) measured = viewport.clientWidth;
    }
    pageWidthRef.current = measured;
    const pageWidth = measured;
    const prev = track.style.transition;
    track.style.transition = "none";
    track.style.transform = `translateX(${-1 * pageWidth}px)`;
    track.setAttribute("data-index", "1");
    void track.offsetHeight; // reflow
    track.style.transition = prev;
  }, []);

  const carouselItems = [
    {
      title: "교육과정 설명회",
      caption: "새로운 교육과정에 대한 설명회",
      img: "/carousel/carousel-1.png",
    },
    {
      title: "새내기 새로배움터",
      caption: "새내기들을 위한 행사",
      img: "/carousel/carousel-2.png",
    },
    {
      title: "레플리카 공동구매",
      caption: "정보대학 레플리카 제작ㆍ공구",
      img: "/carousel/carousel-3.png",
    },
    {
      title: "동아리 박람회",
      caption: "정보대학 동아리를 소개하는 행사",
      img: "/carousel/carousel-4.png",
    },
    {
      title: "NE:XT Contest",
      caption: "정보대학 소프트웨어 경진대회",
      img: "/carousel/carousel-5.png",
    },
    {
      title: "Global Mentoring",
      caption: "국제학우 멘토ㆍ멘티",
      img: "/carousel/carousel-6.png",
    },
    {
      title: "E-Sports 대회",
      caption: "친목을 도모하는 테트리스 대회",
      img: "/carousel/carousel-7.png",
    },
    {
      title: "연사 초청 강연",
      caption: "학생들에게 조언을 주는 강연",
      img: "/carousel/carousel-8.png",
    },
    {
      title: "스승의 날 이벤트",
      caption: "교수님들께 감사의 메시지 전달",
      img: "/carousel/carousel-9.png",
    },
    {
      title: "오운완 챌린지",
      caption: "정보대 학우들의 건강 챙기기",
      img: "/carousel/carousel-10.png",
    },
    {
      title: "정보대, 낭만있을지도",
      caption: "정보대 학우들의 낭만 있는 여행 모음",
      img: "/carousel/carousel-11.png",
    },
    {
      title: "백준 챌린지",
      caption: "정보대 학우들의 코딩 능력 향상",
      img: "/carousel/carousel-12.png",
    },
    {
      title: "슬로건 공모전",
      caption: "정보대학의 정체성",
      img: "/carousel/carousel-13.png",
    },
    {
      title: "Uni-Con",
      caption: "경영ㆍ공대ㆍ디조와 협업한 창업공모전",
      img: "/carousel/carousel-14.png",
    },
    {
      title: "정보인의 날",
      caption: "정보대학 축제",
      img: "/carousel/carousel-15.png",
    },
    {
      title: "일일호프",
      caption: "간호대학과 협업한 행사",
      img: "/carousel/carousel-16.png",
    },
  ];

  const itemsPerPage = ITEMS_PER_PAGE;
  const extendedCarouselItems = [
    ...carouselItems.slice(-itemsPerPage),
    ...carouselItems,
    ...carouselItems.slice(0, itemsPerPage),
  ];

  // ========= Clubs carousel data =========
  const clubsItems = [
    {
      name: "AIKU",
      desc: "학술 | AI / 딥러닝 학회",
      logo: "/clubs/club-aiku.svg",
    },
    {
      name: "ALPS",
      desc: "학술 | 알고리즘 / PS",
      logo: "/clubs/club-alps.svg",
    },
    {
      name: "CAT&DOG",
      desc: "학술 | 게임 개발",
      logo: "/clubs/club-catdog.svg",
    },
    {
      name: "GDGoC KU",
      desc: "학술 | 개발 커뮤니티",
      logo: "/clubs/club-gdsc.png",
    },
    {
      name: "KUICS",
      desc: "학술 | 보안 / 해킹",
      logo: "/clubs/club-kuics.svg",
    },
    {
      name: "KWEB",
      desc: "학술 | 웹/앱 개발 학회",
      logo: "/clubs/club-kweb.svg",
    },
    { name: "LIBERTY", desc: "예체능 | 밴드", logo: "/clubs/club-liberty.svg" },
    {
      name: "소아달",
      desc: "예체능 | 사물놀이",
      logo: "/clubs/club-soadal.svg",
    },
  ];
  const clubsItemsPerPage = 4;
  const extendedClubsItems = [
    ...clubsItems.slice(-clubsItemsPerPage),
    ...clubsItems,
    ...clubsItems.slice(0, clubsItemsPerPage),
  ];

  // Measure page width for clubs carousel and set initial position
  const clubsPageWidthRef = useRef(1105);
  function getClubsPageWidth() {
    return clubsPageWidthRef.current;
  }
  useEffect(() => {
    const track = document.querySelector(`.${styles.clubsTrack}`);
    if (!track) return;
    const children = Array.from(track.children);
    let measured = 1105;
    if (children.length >= clubsItemsPerPage + 2) {
      const a = children[1];
      const b = children[1 + clubsItemsPerPage];
      const ax = a.getBoundingClientRect().left;
      const bx = b.getBoundingClientRect().left;
      measured = Math.round(bx - ax);
    } else {
      const viewport = document.querySelector(`.${styles.clubsViewport}`);
      if (viewport) measured = viewport.clientWidth;
    }
    clubsPageWidthRef.current = measured;
    const prev = track.style.transition;
    track.style.transition = "none";
    track.style.transform = `translateX(${-measured}px)`;
    track.setAttribute("data-index", "1");
    void track.offsetHeight;
    track.style.transition = prev;
  }, []);

  // Autosize captions to one line without overflow (fit down to 16px if needed)
  useEffect(() => {
    const fitSingleLine = () => {
      const targets = [
        { sel: `.${styles.carouselCardCaption}`, base: 20, min: 16 },
        { sel: `.${styles.clubDesc}`, base: 20, min: 16 },
        { sel: `.${styles.clubName}`, base: 40, min: 28 },
      ];
      targets.forEach(({ sel, base, min }) => {
        const nodes = document.querySelectorAll(sel);
        nodes.forEach((el) => {
          el.style.fontSize = base + "px";
          const maxWidth = el.clientWidth;
          if (!maxWidth) return;
          let size = base;
          while (size > min && el.scrollWidth > maxWidth) {
            size -= 0.5;
            el.style.fontSize = size + "px";
          }
        });
      });
    };

    fitSingleLine();
    window.addEventListener("resize", fitSingleLine);
    return () => window.removeEventListener("resize", fitSingleLine);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const HEADER_OFFSET = 83; // fixed header height compensation
    let isAnimating = false;
    let lastWheelTime = 0;
    const sectionNodes = Array.from(el.querySelectorAll("section"));

    const getCurrentIndex = () => {
      const scrollTop = el.scrollTop;
      let idx = 0;
      for (let i = 0; i < sectionNodes.length; i++) {
        const top = sectionNodes[i].offsetTop;
        if (scrollTop + HEADER_OFFSET >= top) idx = i;
      }
      return idx;
    };

    const animateTo = (top) => {
      isAnimating = true;
      el.scrollTo({ top, behavior: "smooth" });
      const unlock = () => {
        isAnimating = false;
      };
      const t = setTimeout(unlock, 700);
      el.addEventListener(
        "scrollend",
        () => {
          clearTimeout(t);
          unlock();
        },
        { once: true }
      );
    };

    const scrollToIndex = (idx) => {
      const clamped = Math.max(0, Math.min(sectionNodes.length - 1, idx));
      if (clamped === sectionNodes.length - 1) {
        animateTo(el.scrollHeight - el.clientHeight);
        return;
      }
      const targetTop = sectionNodes[clamped].offsetTop;
      animateTo(targetTop);
    };

    const onWheel = (e) => {
      const now = performance.now();
      if (isAnimating || now - lastWheelTime < 300) {
        e.preventDefault();
        return;
      }
      const delta = e.deltaY;
      if (Math.abs(delta) < 10) return;
      e.preventDefault();
      lastWheelTime = now;
      const cur = getCurrentIndex();
      scrollToIndex(cur + (delta > 0 ? 1 : -1));
    };

    const onKey = (e) => {
      if (isAnimating) return;
      if (["ArrowDown", "PageDown"].includes(e.key)) {
        e.preventDefault();
        scrollToIndex(getCurrentIndex() + 1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        scrollToIndex(getCurrentIndex() - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(sectionNodes.length - 1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("keydown", onKey);
    };
  }, []);

  // 모바일에서는 방패 로고만 표시
  if (isMobile) {
    return (
      <>
        <Header />
        <main
          className={styles.canvas}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 83px)", // 헤더 높이 제외
            backgroundColor: "transparent",
            gap: "24px",
            overflow: "hidden", // Footer 등이 보이지 않도록
            position: "relative",
          }}
        >
          <Image
            src="/onboarding-hero.png"
            alt="고려대학교 정보대학 로고"
            width={300}
            height={280}
            priority
            style={{
              maxWidth: "90vw",
              maxHeight: "60vh",
              objectFit: "contain",
            }}
          />
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.5",
              textAlign: "center",
              color: isDarkMode ? "#ffffff" : "#1a1a1a",
              margin: 0,
              padding: "0 20px",
              fontFamily:
                'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
              fontWeight: "500",
            }}
          >
            다양한 컨텐츠를 보시려면
            <br />
            노트북으로 접속해주세요.
          </p>
          <Link
            href="/lockers"
            style={{
              fontSize: "16px",
              fontFamily: "KIMM_BOLD, sans-serif",
              color: isDarkMode ? "#ffffff" : "#1a1a1a",
              textDecoration: "none",
              padding: "12px 24px",
              border: isDarkMode ? "2px solid #ffffff" : "2px solid #1a1a1a",
              borderRadius: "8px",
              backgroundColor: "transparent",
              transition: "all 0.2s ease",
              textAlign: "center",
              display: "inline-block",
              marginTop: "8px",
            }}
          >
            사물함 신청하러가기
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main ref={containerRef} className={styles.canvas} tabIndex={0}>
        {/* Section 1: Hero (982px height) */}
        <section className={styles.snapSection} aria-label="Hero">
          <div className={styles.heroRow}>
            <div className={styles.leftGroup}>
              <h1 className={styles.koTitle}>
                고려대학교
                <br />
                정보대학 학생회
              </h1>
              <div className={styles.dividerLine} aria-hidden="true" />
              <p className={styles.enTitle}>
                Korea University
                <br />
                College of Informatics
              </p>
            </div>
            <div className={styles.rightImageBox}>
              <Image
                src="/onboarding-hero.png"
                alt=""
                width={461}
                height={433}
                priority
                className={styles.rightImage}
              />
            </div>
          </div>
          <button
            className={styles.chevronBtn}
            aria-label="다음 섹션으로 이동"
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              const sections = el.querySelectorAll("section");
              if (sections.length > 1) {
                const nextTop = sections[1].offsetTop;
                el.scrollTo({ top: nextTop, behavior: "smooth" });
              }
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 25 L30 35 L45 25"
                stroke="#FBFBFB"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </section>

        {/* Section 2: About */}
        <section className={styles.snapSection} aria-label="About">
          {/* Centered symbol per Figma (239x231.63) at y=166 */}
          <div className={styles.aboutSymbol} aria-hidden="true">
            <Image
              src="/about-vectors.svg"
              alt=""
              width={239}
              height={232}
              priority
            />
          </div>
          <div className={styles.aboutWrap}>
            <p className={styles.aboutBody}>
              안녕하세요, 정보대학 제9대 학생회 ‘이음’입니다.
              <br />
              정보대학 학생회는 정보대학 학우분들의 목소리를 대변하고,
              <br />
              컴퓨터학과, 데이터과학과, 인공지능학과를 연결하는 역할을 합니다.
            </p>
            <div className={styles.aboutDivider} aria-hidden="true" />
            <p className={styles.aboutTitle}>
              ‘서로의 꿈을 이어 만드는 무한한 미래’
            </p>
            <p className={styles.aboutBody}>
              이음의 슬로건입니다.
              <br />
              저희 이음은 신입생 여러분들을 정보대학과 하나로 이어 새롭게
              만들어갈 무한한 미래를 기대하고 있습니다.
            </p>

            {/* -----페이지 완성 이후 추가 예정 ------- */}
            {/* <button className={styles.aboutButton} type="button">
              LEARN MORE
            </button> */}
          </div>
        </section>

        {/* Section 2.5: Carousel - 이음의 1년 */}
        <section
          className={`${styles.snapSection} ${styles.carouselSection}`}
          aria-label="이음의 1년"
        >
          <div className={styles.carouselHeader}>
            <h2 className={styles.carouselTitle}>이음의 1년</h2>
            <p className={styles.carouselSubtitle}>
              활동과 성과로 채워진 한 해의 여정입니다.
              <br />
              학우들을 위한 복지, 소통, 문화의 순간들을 모았습니다.
            </p>
          </div>

          <div className={styles.carouselRow}>
            <button
              className={styles.weekNavigationButton}
              aria-label="이전"
              onClick={() => {
                const track = document.querySelector(
                  `.${styles.carouselTrack}`
                );
                if (!track) return;
                const pageWidth = getPageWidth();
                const pagesLength = Math.ceil(
                  carouselItems.length / itemsPerPage
                );
                const current = Number(track.getAttribute("data-index") || "1");
                const next = current - 1;
                track.style.transition = "transform 0.4s ease";
                track.style.transform = `translateX(${-next * pageWidth}px)`;
                track.setAttribute("data-index", String(next));
                if (next === 0) {
                  track.addEventListener(
                    "transitionend",
                    () => {
                      track.style.transition = "none";
                      track.style.transform = `translateX(${-pagesLength * pageWidth}px)`;
                      track.setAttribute("data-index", String(pagesLength));
                      void track.offsetHeight;
                      track.style.transition = "";
                    },
                    { once: true }
                  );
                }
              }}
            >
              <svg
                width="10"
                height="20"
                viewBox="0 0 10 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2L2 10L10 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className={styles.carouselViewport}>
              <div className={styles.carouselTrack} data-index="1">
                {extendedCarouselItems.map((item, i) => (
                  <div className={styles.carouselCard} key={i}>
                    <div className={styles.carouselImageBox}>
                      <Image
                        src={item.img}
                        alt=""
                        width={250}
                        height={313}
                        className={styles.carouselImage}
                      />
                    </div>
                    <div className={styles.carouselCardTitle}>{item.title}</div>
                    <div className={styles.carouselCardCaption}>
                      {item.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={styles.weekNavigationButton}
              aria-label="다음"
              onClick={() => {
                const track = document.querySelector(
                  `.${styles.carouselTrack}`
                );
                if (!track) return;
                const pageWidth = getPageWidth();
                const pagesLength = Math.ceil(
                  carouselItems.length / itemsPerPage
                );
                const current = Number(track.getAttribute("data-index") || "1");
                const next = current + 1;
                track.style.transition = "transform 0.4s ease";
                track.style.transform = `translateX(${-next * pageWidth}px)`;
                track.setAttribute("data-index", String(next));
                if (next === pagesLength + 1) {
                  track.addEventListener(
                    "transitionend",
                    () => {
                      track.style.transition = "none";
                      track.style.transform = `translateX(${-pageWidth}px)`;
                      track.setAttribute("data-index", "1");
                      void track.offsetHeight;
                      track.style.transition = "";
                    },
                    { once: true }
                  );
                }
              }}
            >
              <svg
                width="10"
                height="20"
                viewBox="0 0 10 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 18L8 10L0 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* -----페이지 완성 이후 추가 예정 ------- */}
          {/* <button className={styles.carouselCta} type="button">LEARN MORE</button> */}
        </section>

        {/* Clubs carousel: 정보대학 동아리 */}
        <section
          className={`${styles.snapSection} ${styles.clubsSection}`}
          aria-label="정보대학 동아리"
        >
          <div className={styles.clubsHeader}>
            <h2 className={styles.clubsTitle}>정보대학 동아리</h2>
            <p className={styles.clubsSubtitle}>
              정보대학에는 다양한 분야의 학생 동아리들이 있습니다.
              <br />
              정보대학 동아리연합회에 등록된 8개 동아리를 소개해드립니다.
            </p>
          </div>

          <div className={styles.clubsRow}>
            <button
              className={styles.weekNavigationButton}
              aria-label="이전"
              onClick={() => {
                const track = document.querySelector(`.${styles.clubsTrack}`);
                if (!track) return;
                const step = getClubsPageWidth();
                const pagesLength = Math.ceil(
                  clubsItems.length / clubsItemsPerPage
                );
                const current = Number(track.getAttribute("data-index") || "1");
                const next = current - 1;
                track.style.transition = "transform 0.4s ease";
                track.style.transform = `translateX(${-next * step}px)`;
                track.setAttribute("data-index", String(next));
                if (next === 0) {
                  track.addEventListener(
                    "transitionend",
                    () => {
                      track.style.transition = "none";
                      track.style.transform = `translateX(${-pagesLength * step}px)`;
                      track.setAttribute("data-index", String(pagesLength));
                      void track.offsetHeight;
                      track.style.transition = "";
                    },
                    { once: true }
                  );
                }
              }}
            >
              <svg
                width="10"
                height="20"
                viewBox="0 0 10 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2L2 10L10 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className={styles.clubsViewport}>
              <div className={styles.clubsTrack} data-index="1">
                {extendedClubsItems.map((c, i) => (
                  <div className={styles.clubCard} key={i}>
                    <GlassContainer className={styles.clubGlass} radius={50}>
                      <div className={styles.logoBox}>
                        <Image
                          src={c.logo}
                          alt=""
                          width={180}
                          height={140}
                          className={styles.logoImg}
                        />
                      </div>
                    </GlassContainer>
                    <div className={styles.clubName}>{c.name}</div>
                    <div className={styles.clubDesc}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={styles.weekNavigationButton}
              aria-label="다음"
              onClick={() => {
                const track = document.querySelector(`.${styles.clubsTrack}`);
                if (!track) return;
                const step = getClubsPageWidth();
                const pagesLength = Math.ceil(
                  clubsItems.length / clubsItemsPerPage
                );
                const current = Number(track.getAttribute("data-index") || "1");
                const next = current + 1;
                track.style.transition = "transform 0.4s ease";
                track.style.transform = `translateX(${-next * step}px)`;
                track.setAttribute("data-index", String(next));
                if (next === pagesLength + 1) {
                  track.addEventListener(
                    "transitionend",
                    () => {
                      track.style.transition = "none";
                      track.style.transform = `translateX(${-step}px)`;
                      track.setAttribute("data-index", "1");
                      void track.offsetHeight;
                      track.style.transition = "";
                    },
                    { once: true }
                  );
                }
              }}
            >
              <svg
                width="10"
                height="20"
                viewBox="0 0 10 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 18L8 10L0 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          {/* -----페이지 완성 이후 추가 예정 ------- */}
          {/* <button className={styles.carouselCta} type="button">LEARN MORE</button> */}
        </section>

        {/* Section 3: Visit title and footer snapped */}
        <section
          className={`${styles.snapSection} ${styles.snapSectionLast}`}
          aria-label="Visit"
        >
          <h2 className={styles.visitTitle}>오시는 길</h2>
          <Footer />
        </section>
      </main>
    </>
  );
}
