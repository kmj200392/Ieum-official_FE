"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [portalEl, setPortalEl] = useState(null);

    useEffect(() => {
        setPortalEl(document.getElementById("portal-root"));
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    useEffect(() => {
        if (typeof document === "undefined") return;
        if (isSidebarOpen) {
            document.body.classList.add("sidebar-open");
        } else {
            document.body.classList.remove("sidebar-open");
        }
        return () => document.body.classList.remove("sidebar-open");
    }, [isSidebarOpen]);

    return (
        <>
            <button className={styles.sidebarButton} onClick={toggleSidebar} aria-label="메뉴 열기" type="button">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="4" y1="8" x2="28" y2="8" stroke="#1E1E1E" strokeWidth="3" />
                    <line x1="4" y1="16" x2="28" y2="16" stroke="#1E1E1E" strokeWidth="3" />
                    <line x1="4" y1="24" x2="28" y2="24" stroke="#1E1E1E" strokeWidth="3" />
                </svg>
            </button>

            {portalEl && createPortal(
                <>
                    <div
                        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.active : ""}`}
                        onClick={closeSidebar}
                        aria-hidden={!isSidebarOpen}
                    />

                    <div className={`${styles.sidebar} ${isSidebarOpen ? styles.active : ""}`} role="dialog" aria-modal="true">
                        <div className={styles.panel} />
                        <button className={styles.sidebarCloseButton} onClick={closeSidebar} aria-label="메뉴 닫기" type="button">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L14 14M14 2L2 14" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                        <div className={styles.sidebarContent}>
                            <a href="/booking" className={styles.sidebarMenuItem}>학생회실 대관</a>
                            <a href="/lockers" className={styles.sidebarMenuItem}>사물함</a>
                            {/* 일시적으로 숨김 - 추후 활성화 예정 */}
                            {/* <a href="/equipment" className={styles.sidebarMenuItem}>물품 대여</a>
                            <a href="/certificate" className={styles.sidebarMenuItem}>활동증명서 신청</a> */}
                        </div>
                    </div>
                </>, portalEl)}
        </>
    );
} 