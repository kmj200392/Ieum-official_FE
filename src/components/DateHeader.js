"use client";

import React from "react";
import styles from "./DateHeader.module.css";

export default function DateHeader({ weekDates = [], selectedDayIndex = 0, onSelectDay }) {
    const dayNames = ["SUN", "MON", "TUES", "WED", "THURS", "FRI", "SAT"];

    // 오늘 날짜 확인
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    return (
        <div className={styles.container}>
            {/* 요일 행 */}
            <div className={styles.weekDays}>
                {dayNames.map((dayName) => (
                    <div key={dayName} className={styles.dayItem}>
                        {dayName}
                    </div>
                ))}
            </div>

            {/* 날짜 행 */}
            <div className={styles.weekDates}>
                {weekDates.map((date, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`${styles.dateItem} ${index === selectedDayIndex ? styles.selected : ""}`}
                        onClick={() => onSelectDay?.(index)}
                    >
                        <div className={`${styles.dateCircle} ${isToday(date) ? styles.today : ""}`}>
                            {date.getDate()}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
} 