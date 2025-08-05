"use client";
import { useState } from "react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <>
            {/* 사이드바 토글 버튼 */}
            <button className={styles.sidebarButton} onClick={toggleSidebar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
            </button>

            {/* 사이드바 오버레이 */}
            <div
                className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.active : ''}`}
                onClick={closeSidebar}
            />

            {/* 사이드바 */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.active : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div></div>
                    <button className={styles.sidebarCloseButton} onClick={closeSidebar}>
                        X
                    </button>
                </div>
                <div className={styles.sidebarContent}>
                    <a href="/booking" className={styles.sidebarMenuItem}>학생회실 대관</a>
                    <a href="/lockers" className={styles.sidebarMenuItem}>사물함</a>
                    <a href="/equipment" className={styles.sidebarMenuItem}>물품 대여</a>
                    <a href="/certificate" className={styles.sidebarMenuItem}>활동증명서 신청</a>
                </div>
            </div>
        </>
    );
} 