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
            {/* 사이드바 토글 버튼 (Figma wireframe icon) */}
            <button className={styles.sidebarButton} onClick={toggleSidebar} aria-label="메뉴 열기" type="button">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="4" y1="8" x2="28" y2="8" stroke="#1E1E1E" strokeWidth="3" />
                    <line x1="4" y1="16" x2="28" y2="16" stroke="#1E1E1E" strokeWidth="3" />
                    <line x1="4" y1="24" x2="28" y2="24" stroke="#1E1E1E" strokeWidth="3" />
                </svg>
            </button>

            {/* 사이드바 오버레이 */}
            <div
                className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.active : ""}`}
                onClick={closeSidebar}
                aria-hidden={!isSidebarOpen}
            />

            {/* 사이드바 */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.active : ""}`} role="dialog" aria-modal="true">
                <div className={styles.sidebarHeader}>
                    <div />
                    <button className={styles.sidebarCloseButton} onClick={closeSidebar} aria-label="메뉴 닫기" type="button">
                        ×
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