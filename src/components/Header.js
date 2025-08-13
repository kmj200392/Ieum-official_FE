import Image from "next/image";
import Sidebar from "./Sidebar";
import styles from "./Header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <a href="/">
                    <Image
                        src="/header-logo.png"
                        alt="고려대학교 로고"
                        width={48}
                        height={63}
                        priority
                    />
                </a>
            </div>
            <Sidebar />
        </header>
    );
} 