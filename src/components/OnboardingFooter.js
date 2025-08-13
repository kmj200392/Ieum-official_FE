import Image from "next/image";
import styles from "./OnboardingFooter.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.topRow}>
                <div className={styles.leftGroup}>
                    <div className={styles.logoBox}>
                        <Image
                            src="/footer-logo.svg"
                            alt="고려대학교 정보대학 로고"
                            width={50}
                            height={66.81}
                            className={styles.logoImg}
                            priority
                        />
                    </div>
                    <p className={styles.addressText}>
                        서울특별시 성북구 안암로 145,
                        <br />
                        고려대학교 송현스퀘어 애기능학생회관 302호 정보대학 학생회
                    </p>
                </div>

                <div className={styles.rightGroup}>
                    <a
                        href="https://www.instagram.com/kuci_ieum/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.iconBox}
                        aria-label="Instagram"
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="5" width="30" height="30" rx="8" stroke="#FFFFFF" strokeWidth="3.5" />
                            <circle cx="20" cy="20" r="7" stroke="#FFFFFF" strokeWidth="3.5" />
                            <circle cx="28" cy="12" r="2.5" fill="#FFFFFF" />
                        </svg>
                    </a>

                    <a href="mailto:kuci.students@gmail.com" className={styles.iconBox} aria-label="메일 보내기">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="5" width="30" height="30" rx="6" stroke="#FFFFFF" strokeWidth="3.5" />
                            <path d="M8 12L20 22L32 12" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 28H28" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                        </svg>
                    </a>

                    <span className={styles.pipe}>|</span>

                    <a href="/admin" className={styles.adminButton}>관리자모드</a>
                </div>
            </div>

            {/* SVG dashed divider with 2 2 pattern, width 1154 */}
            <svg width="1154" height="1" viewBox="0 0 1154 1" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="0" y1="0.5" x2="1154" y2="0.5" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
            </svg>

            <div className={styles.bottomRow}>
                <p className={styles.copyright}>copyright @ Korea University College of Informatics. All Rights Reserved.</p>
            </div>
        </footer>
    );
} 