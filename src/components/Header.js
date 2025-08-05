import Image from "next/image";
import Sidebar from "./Sidebar";
import styles from "./Header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                {/* 로고 */}
                <div className={styles.logo}>
                    <a href="/">
                        <Image
                            src="/방패 로고.png"
                            alt="고려대학교 정보대학 로고"
                            width={60}
                            height={60}
                            priority
                        />
                    </a>
                </div>

                {/* 사이드바 버튼 */}
                <Sidebar />
            </div>
        </header>
    );
} 