"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./layout.module.css";
import { getRefreshToken, clearTokens } from "@/utils/auth";

export default function AdminDashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const refresh = getRefreshToken();
            await fetch("/api/admin/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh }),
            });
        } catch { }
        // Clear client tokens too
        clearTokens();
        router.replace("/");
    };

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <a href="/" className={styles.logoLink} aria-label="메인으로">
                        <Image
                            src="/방패 로고.png"
                            alt="고려대학교 정보대학 로고"
                            width={40}
                            height={40}
                            className={styles.logoImage}
                        />
                    </a>
                </div>
                <nav className={styles.nav}>
                    <a href="/admin/accounts" className={`${styles.navItem} ${pathname === "/admin/accounts" ? styles.active : ""}`}>계정관리</a>
                    <a href="/admin/bookings" className={`${styles.navItem} ${pathname === "/admin/bookings" ? styles.active : ""}`}>학생회실 대관</a>
                    <a href="/admin/lockers" className={`${styles.navItem} ${pathname === "/admin/lockers" ? styles.active : ""}`}>사물함 관리</a>
                    <a href="/admin/contents" className={`${styles.navItem} ${pathname === "/admin/contents" ? styles.active : ""}`}>컨텐츠 관리</a>
                    <a href="/admin/equipments" className={`${styles.navItem} ${pathname === "/admin/equipments" ? styles.active : ""}`}>물품대여 관리</a>
                    <a href="/admin/certificates" className={`${styles.navItem} ${pathname === "/admin/certificates" ? styles.active : ""}`}>활동증명서 관리</a>
                    <button className={styles.logoutButton} type="button" onClick={handleLogout}>로그아웃</button>
                </nav>
            </aside>
            <main className={styles.content}>{children}</main>
        </div>
    );
} 