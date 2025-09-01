import Header from "../components/Header";
import Footer from "../components/OnboardingFooter";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.canvas}>
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
      </main>
      <Footer />
    </>
  );
}
