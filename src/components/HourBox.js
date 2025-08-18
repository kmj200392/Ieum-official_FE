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

export default function HourBox({ state = HourState.AVAILABLE, children, onMouseDown, onMouseEnter, onMouseUp }) {
    return (
        <div
            className={`${styles.box} ${styles[state]}`}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseUp={onMouseUp}
        >
            {children}
        </div>
    );
} 