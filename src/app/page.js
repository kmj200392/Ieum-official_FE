import Header from "../components/OnboardingHeader";
import Footer from "../components/OnboardingFooter";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Header />

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            고려대학교 정보대학 학생회
          </h1>
          <p className={styles.subtitle}>
            정보대학 학생들의 더 나은 캠퍼스 생활을 위해
          </p>
          <div className={styles.heroButtons}>
            <a href="/student-council" className={styles.primaryButton}>
              학생회 소개
            </a>
            <a href="/notices" className={styles.secondaryButton}>
              공지사항 보기
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <section className={styles.quickLinks}>
          <h2 className={styles.sectionTitle}>빠른 메뉴</h2>
          <div className={styles.linksGrid}>
            <a href="/booking" className={styles.linkCard}>
              <div className={styles.linkIcon}>📅</div>
              <h3>학생회실 대관</h3>
              <p>학생회실 예약 및 관리</p>
            </a>
            <a href="/lockers" className={styles.linkCard}>
              <div className={styles.linkIcon}>🔒</div>
              <h3>사물함 신청</h3>
              <p>사물함 배정 및 관리</p>
            </a>
            <a href="/clubs" className={styles.linkCard}>
              <div className={styles.linkIcon}>🎯</div>
              <h3>동아리 소개</h3>
              <p>정보대학 동아리 정보</p>
            </a>
            <a href="/suggestions" className={styles.linkCard}>
              <div className={styles.linkIcon}>💬</div>
              <h3>건의함</h3>
              <p>학생들의 의견을 들려주세요</p>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
