"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import simpleStyles from "./Header.module.css";
import onboardingStyles from "./OnboardingHeader.module.css";

export default function Header({ variant, showMyReservation = false }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const useOnboarding = variant === "onboarding" || (!variant && isHome);
  const useSimple = variant === "simple" || (!variant && !isHome);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (useOnboarding) {
    return (
      <header className={onboardingStyles.header}>
        <div className={onboardingStyles.leftGroup}>
          <Image
            src="/header-logo.png"
            alt="고려대학교 로고"
            width={48}
            height={63}
            priority
          />
          <div className={onboardingStyles.brandText}>
            <span>고려대학교</span>
            <span>정보대학 학생회</span>
          </div>
        </div>

        <nav className={onboardingStyles.nav} aria-label="주요 메뉴">
          {!isMobile && (
            <>
              {/* 일시적으로 숨김 - 추후 활성화 예정 */}
              {/* <a href="/student-council" className={onboardingStyles.navLink}>학생회 소개</a>
                    <a href="/clubs" className={onboardingStyles.navLink}>동아리 소개</a>
                    <a href="/notices" className={onboardingStyles.navLink}>공지사항</a>
                    <a href="/suggestions" className={onboardingStyles.navLink}>건의함</a> */}
              <a
                href="https://info.korea.ac.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className={onboardingStyles.navLink}
              >
                정보대학 홈페이지
              </a>
            </>
          )}

          <Sidebar isMobile={isMobile} />
        </nav>
      </header>
    );
  }

  if (useSimple) {
    return (
      <header className={simpleStyles.header}>
        <div className={simpleStyles.logo}>
          <Link href="/">
            <Image
              src="/header-logo.png"
              alt="고려대학교 로고"
              width={48}
              height={63}
              priority
            />
          </Link>
        </div>
        <div className={simpleStyles.headerRight}>
          {showMyReservation && (
            <span className={simpleStyles.myReservation}>내 예약 현황</span>
          )}
          <Sidebar isMobile={isMobile} />
        </div>
      </header>
    );
  }

  return null;
}
