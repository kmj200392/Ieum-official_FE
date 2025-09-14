"use client";

import React from "react";
import styles from "./LockerLegend.module.css";
import { LockerState } from "./LockerGrid";

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
                        <svg width="29.2" height="29.6" viewBox="0 0 30 30" fill="none">
                            <path
                                d="M0.4 0.2L29.6 29.8"
                                stroke="#737272"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M29.6 0.2L0.4 29.8"
                                stroke="#737272"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>
                <span className={styles.legendText}>선택 불가능</span>
            </div>
        </div>
    );
} 