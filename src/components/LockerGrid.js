"use client";

import React from "react";
import styles from "./LockerGrid.module.css";

const LockerState = {
    AVAILABLE: 'available',    // 선택 가능
    DISABLED: 'disabled',      // 선택 불가능
    ASSIGNED: 'assigned',      // 배정됨
    SELECTED: 'selected'       // 선택됨
};

export default function LockerGrid({
    lockers = [],
    onLockerSelect,
    selectedLocker = null
}) {
    const handleLockerClick = (lockerId, state) => {
        if (state === LockerState.AVAILABLE) {
            onLockerSelect?.(lockerId);
        }
    };

    return (
        <div className={styles.gridContainer}>
            {lockers.map((locker) => (
                <div
                    key={locker.id}
                    className={`${styles.locker} ${styles[locker.state]} ${selectedLocker === locker.id ? styles.selected : ''
                        }`}
                    onClick={() => handleLockerClick(locker.id, locker.state)}
                    title={`사물함 ${locker.number} - ${getStateText(locker.state)}`}
                >
                    <span className={styles.lockerNumber}>{locker.number}</span>
                    {locker.state === LockerState.DISABLED && (
                        <div className={styles.disabledIcon}>
                            <svg width="29.2" height="29.6" viewBox="0 0 30 30" fill="none">
                                <path
                                    d="M0.4 0.2L29.6 29.8"
                                    stroke="#737272"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function getStateText(state) {
    switch (state) {
        case LockerState.AVAILABLE:
            return '선택 가능';
        case LockerState.DISABLED:
            return '선택 불가능';
        case LockerState.ASSIGNED:
            return '배정됨';
        case LockerState.SELECTED:
            return '선택됨';
        default:
            return '';
    }
}

export { LockerState }; 