"use client";

import React from "react";
import styles from "./BookingBoard.module.css";
import DateHeader from "./DateHeader";
import HourBox, { HourState } from "./HourBox";

export default function BookingBoard({
    weekDates = [],
    selectedDayIndex = 0,
    onPrevWeek,
    onNextWeek,
    onSelectDay,
    reservations = {},
    selectedSlots = new Set(),
    onSlotMouseDown,
    onSlotMouseEnter,
    onSlotMouseUp,
    RESERVATION_STATES = {}
}) {
    
    // 예약 상태 확인 함수
    const getReservationState = (dayIndex, hourIndex) => {
        return reservations[dayIndex]?.[hourIndex] || RESERVATION_STATES.AVAILABLE;
    };

    // 슬롯이 선택되었는지 확인
    const isSlotSelected = (dayIndex, hourIndex) => {
        return selectedSlots.has(`${dayIndex}:${hourIndex}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.boardWrapper}>
                <div className={styles.timeColumn}>
                    {/* 시간 표시 */}
                    {Array.from({ length: 24 }, (_, i) => (
                        <div key={i} className={styles.timeLabel}>
                            {i === 0 ? "12AM" : i === 12 ? "12PM" : i > 12 ? `${i - 12}PM` : `${i}AM`}
                        </div>
                    ))}
                </div>

                <div className={styles.gridSection}>
                    <DateHeader
                        weekDates={weekDates}
                        selectedDayIndex={selectedDayIndex}
                        onPrev={onPrevWeek}
                        onNext={onNextWeek}
                        onSelectDay={onSelectDay}
                    />

                    {/* 7일 x 24시간 그리드 */}
                    <div className={styles.timeSlotsGrid}>
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                            <div key={dayIndex} className={styles.dayColumn}>
                                {Array.from({ length: 24 }, (_, hourIndex) => {
                                    const reservationState = getReservationState(dayIndex, hourIndex);
                                    const isSelected = isSlotSelected(dayIndex, hourIndex);
                                    const stateForBox = isSelected
                                        ? HourState.SELECTED
                                        : reservationState === RESERVATION_STATES.PENDING
                                            ? HourState.PENDING
                                            : reservationState === RESERVATION_STATES.CONFIRMED
                                                ? HourState.CONFIRMED
                                                : HourState.AVAILABLE;

                                    return (
                                        <HourBox
                                            key={hourIndex}
                                            state={stateForBox}
                                            onMouseDown={() => onSlotMouseDown?.(dayIndex, hourIndex)}
                                            onMouseEnter={() => onSlotMouseEnter?.(dayIndex, hourIndex)}
                                            onMouseUp={onSlotMouseUp}
                                        >
                                            {reservationState === RESERVATION_STATES.CONFIRMED && (
                                                <span className={styles.purpose}>[대관 목적]</span>
                                            )}
                                        </HourBox>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 