"use client";

import React from "react";
import styles from "./LockerLegend.module.css";

export default function LockerLegend() {
    return (
        <div className={styles.legendContainer}>
            <div className={styles.legendItem}>
                <div className={`${styles.sampleLocker} ${styles.available}`}>
                    {/* Available locker sample */}
                </div>
                <span className={styles.legendText}>선택 가능</span>
            </div>

            <div className={styles.legendItem}>
                <div className={`${styles.sampleLocker} ${styles.disabled}`}>
                    <div className={styles.disabledIcon}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M5 5 L95 95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                            <path d="M95 5 L5 95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>
                </div>
                <span className={styles.legendText}>선택 불가능</span>
            </div>
        </div>
    );
} 