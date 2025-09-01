"use client";

import React, { useState } from "react";
import styles from "./BookingBoard.module.css";
import DateHeader from "./DateHeader";
import HourBox, { HourState } from "./HourBox";

export default function BookingBoard({
    weekDates = [],
    selectedDayIndex = 0,
    onSelectDay,
    reservations = {},
    reservationDetails = {},
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

    // 예약 상세 정보 확인 함수
    const getReservationDetails = (dayIndex, hourIndex) => {
        return reservationDetails[dayIndex]?.[hourIndex] || null;
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
                <div className={styles.gridSection}>
                    <DateHeader
                        weekDates={weekDates}
                        selectedDayIndex={selectedDayIndex}
                        onSelectDay={onSelectDay}
                    />

                    {/* 7일 x 24시간 그리드 */}
                    <div className={styles.timeSlotsGrid} onMouseLeave={handleMouseLeave}>
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                            <div key={dayIndex} className={styles.dayColumn}>
                                {Array.from({ length: 24 }, (_, hourIndex) => {
                                    const reservationState = getReservationState(dayIndex, hourIndex);
                                    const reservationDetail = getReservationDetails(dayIndex, hourIndex);
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
                                            purpose={reservationDetail?.purpose}
                                            showPurpose={reservationState === RESERVATION_STATES.CONFIRMED}
                                            onMouseDown={() => onSlotMouseDown?.(dayIndex, hourIndex)}
                                            onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                                            onMouseUp={onSlotMouseUp}
                                        />
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