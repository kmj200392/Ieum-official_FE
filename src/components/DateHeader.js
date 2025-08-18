"use client";

import React from "react";
import styles from "./DateHeader.module.css";

export default function DateHeader({ weekDates = [], selectedDayIndex = 0, onPrev, onNext, onSelectDay }) {
    return (
        <div className={styles.container}>
            <div className={styles.navLeft}>
                <button className={styles.navButton} onClick={onPrev} aria-label="이전 주">&lt;</button>
            </div>
            <div className={styles.headerMain}>
                <div className={styles.weekDays}>
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                        <div key={d} className={styles.weekDay}>{d}</div>
                    ))}
                </div>
                <div className={styles.weekDates}>
                    {weekDates.map((date, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`${styles.datePill} ${index === selectedDayIndex ? styles.active : ""}`}
                            onClick={() => onSelectDay?.(index)}
                        >
                            <span className={styles.dateText}>{date.getDate()}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.navRight}>
                <button className={styles.navButton} onClick={onNext} aria-label="다음 주">&gt;</button>
            </div>
        </div>
    );
} 