"use client";

import React, { useState } from "react";
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
    const [hoveredSlot, setHoveredSlot] = useState(null);

    // 예약 상태 확인 함수
    const getReservationState = (dayIndex, hourIndex) => {
        return reservations[dayIndex]?.[hourIndex] || RESERVATION_STATES.AVAILABLE;
    };

    // 슬롯이 선택되었는지 확인
    const isSlotSelected = (dayIndex, hourIndex) => {
        return selectedSlots.has(`${dayIndex}:${hourIndex}`);
    };

    // 위치별 position 결정
    const getPosition = (hourIndex) => {
        if (hourIndex === 0) return "first";
        if (hourIndex === 23) return "last";
        return "middle";
    };

    // 마우스 엔터 핸들러
    const handleMouseEnter = (dayIndex, hourIndex) => {
        setHoveredSlot(`${dayIndex}:${hourIndex}`);
        onSlotMouseEnter?.(dayIndex, hourIndex);
    };

    // 마우스 리브 핸들러
    const handleMouseLeave = () => {
        setHoveredSlot(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.boardWrapper} onMouseLeave={handleMouseLeave}>
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
                    <div className={styles.timeSlotsGrid} onMouseLeave={handleMouseLeave}>
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                            <div key={dayIndex} className={styles.dayColumn}>
                                {Array.from({ length: 24 }, (_, hourIndex) => {
                                    const reservationState = getReservationState(dayIndex, hourIndex);
                                    const isSelected = isSlotSelected(dayIndex, hourIndex);
                                    const slotKey = `${dayIndex}:${hourIndex}`;
                                    const isHovered = hoveredSlot === slotKey;

                                    const stateForBox = isSelected
                                        ? HourState.SELECTED
                                        : reservationState === RESERVATION_STATES.PENDING
                                            ? HourState.PENDING
                                            : reservationState === RESERVATION_STATES.CONFIRMED
                                                ? HourState.CONFIRMED
                                                : reservationState === RESERVATION_STATES.DISABLED
                                                    ? HourState.DISABLED
                                                    : HourState.AVAILABLE;

                                    return (
                                        <HourBox
                                            key={hourIndex}
                                            state={stateForBox}
                                            position={getPosition(hourIndex)}
                                            isHovered={isHovered}
                                            onMouseDown={() => onSlotMouseDown?.(dayIndex, hourIndex)}
                                            onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
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