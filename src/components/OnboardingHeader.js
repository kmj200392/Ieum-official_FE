import Image from "next/image";
import Sidebar from "./Sidebar";
import styles from "./OnboardingHeader.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.leftGroup}>
                <Image
                    src="/header-logo.png"
                    alt="고려대학교 로고"
                    width={48}
                    height={63}
                    priority
                />
                <div className={styles.brandText}>
                    <span>고려대학교</span>
                    <span>정보대학 학생회</span>
                </div>
            </div>

            <nav className={styles.nav} aria-label="주요 메뉴">
                <a href="/student-council" className={styles.navLink}>학생회 소개</a>
                <a href="/clubs" className={styles.navLink}>동아리 소개</a>
                <a href="/notices" className={styles.navLink}>공지사항</a>
                <a href="/suggestions" className={styles.navLink}>건의함</a>

                <a
                    href="https://www.instagram.com/kuci_ieum/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.iconBox}
                    aria-label="Instagram"
                >
                    <svg
                        className={styles.instagramIcon}
                        width="26.67"
                        height="26.67"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="5" stroke="#1E1E1E" strokeWidth="3" />
                        <circle cx="12" cy="12" r="4" stroke="#1E1E1E" strokeWidth="3" />
                        <circle cx="17.5" cy="6.5" r="1.5" fill="#1E1E1E" />
                    </svg>
                </a>

                {/* Sidebar trigger with wireframe icon */}
                <Sidebar />
            </nav>
        </header>
    );
} 