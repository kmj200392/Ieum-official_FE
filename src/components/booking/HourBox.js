"use client";

import React from "react";
import styles from "./HourBox.module.css";

export const HourState = {
    AVAILABLE: "available",
    HOVER: "hover",
    SELECTED: "selected",
    DISABLED: "disabled",
    PENDING: "pending",
    CONFIRMED: "confirmed",
};

export default function HourBox({
    state = HourState.AVAILABLE,
    children,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    position = "middle", // "first", "last", "middle"
    isHovered = false
}) {
    const getPositionClass = () => {
        switch (position) {
            case "first":
                return styles.firstInColumn;
            case "last":
                return styles.lastInColumn;
            default:
                return styles.middleInColumn;
        }
    };

    const currentState = isHovered && state === HourState.AVAILABLE ? HourState.HOVER : state;

    return (
        <div
            className={`${styles.box} ${styles[currentState]} ${getPositionClass()}`}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseUp={onMouseUp}
        >
            {children}
        </div>
    );
} 